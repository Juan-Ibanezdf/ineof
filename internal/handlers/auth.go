package handlers

import (
	"api/internal/models"
	"context"
	"encoding/json"
	"net/http"
	"os"
	"regexp"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

// Definição do segredo JWT a partir das variáveis de ambiente
var JwtSecret = []byte(os.Getenv("JWT_SECRET"))

// Compilando a expressão regular para validação de senha
var passwordRegex = regexp.MustCompile(`.{8,}`) // Simplificado para 8 caracteres mínimos

// Função para gerar o token JWT
func generateAccessToken(idUsuario, nivelPermissao, nomeDeUsuario, email, perfilImagem string) (string, error) {
	claims := jwt.MapClaims{
		"idUsuario":      idUsuario,
		"nivelPermissao": nivelPermissao,
		"nomeDeUsuario":  nomeDeUsuario,
		"email":          email,
		"perfilImagem":   perfilImagem,
		"exp":            time.Now().Add(4 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(JwtSecret)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// Função para gerar o CSRF token
func generateCSRFToken() string {
	return uuid.New().String()
}

// Função para gerar o Refresh Token
func generateRefreshToken(idUsuario string) (string, error) {
	claims := jwt.MapClaims{
		"idUsuario": idUsuario,
		"exp":       time.Now().Add(30 * 24 * time.Hour).Unix(), // 30 dias
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(JwtSecret)
}

// Função para logar o usuário e gerar tokens de autenticação e CSRF
func LoginUser(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Decodificar as credenciais do usuário
		var creds struct {
			NomeDeUsuario   string `json:"nomeDeUsuario"`
			Senha           string `json:"senha"`
			Email           string `json:"email"`
			ManterConectado bool   `json:"manterConectado"`
		}
		if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		// Buscar usuário no banco de dados
		var usuario models.Usuario
		err := db.QueryRow(context.Background(), `
			SELECT id_usuario, nome_de_usuario, senha, email, nivel_permissao, COALESCE(perfil_imagem, ''), refresh_token
			FROM usuarios 
			WHERE nome_de_usuario=$1 OR email=$2`, creds.NomeDeUsuario, creds.Email).
			Scan(&usuario.ID, &usuario.NomeDeUsuario, &usuario.Senha, &usuario.Email, &usuario.NivelPermissao, &usuario.PerfilImagem, &usuario.RefreshToken)
		if err != nil || bcrypt.CompareHashAndPassword([]byte(usuario.Senha), []byte(creds.Senha)) != nil {
			http.Error(w, "Nome de usuário ou senha inválidos", http.StatusUnauthorized)
			return
		}

		// Gerar tokens
		accessToken, err := generateAccessToken(usuario.ID, usuario.NivelPermissao, usuario.NomeDeUsuario, usuario.Email, *usuario.PerfilImagem)
		if err != nil {
			http.Error(w, "Falha ao gerar token de acesso", http.StatusInternalServerError)
			return
		}
		var refreshToken string
		if creds.ManterConectado {
			refreshToken, err = generateRefreshToken(usuario.ID)
			if err != nil {
				http.Error(w, "Falha ao gerar refresh token", http.StatusInternalServerError)
				return
			}
			_, err = db.Exec(context.Background(), `UPDATE usuarios SET refresh_token = $1 WHERE id_usuario = $2`, refreshToken, usuario.ID)
			if err != nil {
				http.Error(w, "Falha ao salvar refresh token", http.StatusInternalServerError)
				return
			}
		}

		// Definir cookies de autenticação
		http.SetCookie(w, &http.Cookie{
			Name:     "token",
			Value:    accessToken,
			Expires:  time.Now().Add(4 * time.Hour),
			HttpOnly: true,
			Secure:   os.Getenv("NODE_ENV") == "production",
			Path:     "/",
			SameSite: http.SameSiteLaxMode,
		})
		if creds.ManterConectado {
			http.SetCookie(w, &http.Cookie{
				Name:     "refresh_token",
				Value:    refreshToken,
				Expires:  time.Now().Add(30 * 24 * time.Hour),
				HttpOnly: true,
				Secure:   os.Getenv("NODE_ENV") == "production",
				Path:     "/",
				SameSite: http.SameSiteLaxMode,
			})
		}

		// Gerar e definir o cookie de CSRF token
		setCSRFCookie(w)

		// Responder com o token de acesso, refresh token (se houver), e dados do usuário
		w.Header().Set("Content-Type", "application/json")
		response := map[string]interface{}{
			"message": "Login bem-sucedido",
			"token":   accessToken,
			"usuario": map[string]interface{}{
				"idUsuario":      usuario.ID,
				"nomeDeUsuario":  usuario.NomeDeUsuario,
				"email":          usuario.Email,
				"perfilImagem":   usuario.PerfilImagem,
				"nivelPermissao": usuario.NivelPermissao,
			},
		}
		if creds.ManterConectado {
			response["refreshToken"] = refreshToken
		}
		json.NewEncoder(w).Encode(response)
	}
}

// Função para gerar e definir o cookie de CSRF token
func setCSRFCookie(w http.ResponseWriter) {
	csrfToken := generateCSRFToken()
	http.SetCookie(w, &http.Cookie{
		Name:     "csrf_token",
		Value:    csrfToken,
		Expires:  time.Now().Add(4 * time.Hour),
		HttpOnly: false, // Não precisa ser HttpOnly pois será acessado pelo frontend
		Secure:   os.Getenv("NODE_ENV") == "production",
		Path:     "/",
		SameSite: http.SameSiteLaxMode,
	})
}

// RegisterUser registra um novo usuário e associa o cargo "Nenhum"
func RegisterUser(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var usuario models.Usuario
		if err := json.NewDecoder(r.Body).Decode(&usuario); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		// Verificar se o usuário ou email já existem
		var existingID string
		err := db.QueryRow(context.Background(), `
            SELECT id_usuario FROM usuarios WHERE nome_de_usuario=$1 OR email=$2`, usuario.NomeDeUsuario, usuario.Email).Scan(&existingID)

		if err == nil && existingID != "" {
			http.Error(w, "Usuário ou E-mail já cadastrado", http.StatusConflict)
			return
		}

		// Validar a senha
		if !passwordRegex.MatchString(usuario.Senha) {
			http.Error(w, "A senha deve conter pelo menos 8 caracteres.", http.StatusBadRequest)
			return
		}

		// Hash da senha
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(usuario.Senha), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "Erro ao criptografar senha", http.StatusInternalServerError)
			return
		}
		usuario.Senha = string(hashedPassword)

		// Definir o nível de permissão como "leitor" por padrão
		if usuario.NivelPermissao == "" {
			usuario.NivelPermissao = "leitor"
		}

		// Inserir usuário no banco de dados e recuperar o ID gerado
		err = db.QueryRow(context.Background(), `
            INSERT INTO usuarios (nome_de_usuario, senha, email, nivel_permissao, termos_de_uso, status_ativacao, email_verificado) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_usuario`,
			usuario.NomeDeUsuario, usuario.Senha, usuario.Email, usuario.NivelPermissao, usuario.TermosDeUso, usuario.StatusAtivacao, usuario.EmailVerificado).Scan(&usuario.ID)
		if err != nil {
			http.Error(w, "Erro ao registrar usuário", http.StatusInternalServerError)
			return
		}

		// Associar o cargo "Nenhum" (ID 13) ao novo usuário
		_, err = db.Exec(context.Background(), `
            INSERT INTO Usuario_Cargo (id_usuario, id_cargo) VALUES ($1, 13)`, usuario.ID)
		if err != nil {
			http.Error(w, "Erro ao associar cargo ao usuário", http.StatusInternalServerError)
			return
		}

		// Responder com sucesso
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "Usuário registrado com sucesso",
			"usuario": usuario,
		})
	}
}

// Função para realizar logout
func LogoutUser(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Lógica de logout
		http.SetCookie(w, &http.Cookie{
			Name:     "token",
			Value:    "",
			Expires:  time.Now().Add(-1 * time.Hour), // Expira imediatamente
			HttpOnly: true,
			Secure:   os.Getenv("NODE_ENV") == "production",
			Path:     "/",
		})

		http.SetCookie(w, &http.Cookie{
			Name:     "refresh_token",
			Value:    "",
			Expires:  time.Now().Add(-1 * time.Hour),
			HttpOnly: true,
			Secure:   os.Getenv("NODE_ENV") == "production",
			Path:     "/",
		})

		w.Header().Set("Content-Type", "application/json")
		response := map[string]interface{}{
			"message": "Logout bem-sucedido",
		}
		json.NewEncoder(w).Encode(response)
	}
}

// Função para gerar um novo token de acesso usando o refresh token
func RefreshToken(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		refreshTokenCookie, err := r.Cookie("refresh_token")
		if err != nil || refreshTokenCookie == nil {
			http.Error(w, "Refresh token não encontrado", http.StatusUnauthorized)
			return
		}

		refreshToken := refreshTokenCookie.Value
		claims := jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(refreshToken, claims, func(token *jwt.Token) (interface{}, error) {
			return JwtSecret, nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Token inválido", http.StatusUnauthorized)
			return
		}

		idUsuario := claims["idUsuario"].(string)
		var usuario models.Usuario
		err = db.QueryRow(context.Background(), `
            SELECT nome_de_usuario, email, nivel_permissao, COALESCE(perfil_imagem, '') 
            FROM usuarios WHERE id_usuario=$1`, idUsuario).Scan(&usuario.NomeDeUsuario, &usuario.Email, &usuario.NivelPermissao, &usuario.PerfilImagem)

		if err != nil {
			http.Error(w, "Usuário não encontrado", http.StatusUnauthorized)
			return
		}

		// Tratar corretamente possíveis ponteiros nulos para PerfilImagem
		perfilImagem := ""
		if usuario.PerfilImagem != nil {
			perfilImagem = *usuario.PerfilImagem
		}

		// Gerar token JWT (Access Token)
		accessToken, err := generateAccessToken(usuario.ID, usuario.NivelPermissao, usuario.NomeDeUsuario, usuario.Email, perfilImagem)
		if err != nil {
			http.Error(w, "Falha ao gerar token de acesso", http.StatusInternalServerError)
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name:     "token",
			Value:    accessToken,
			Expires:  time.Now().Add(4 * time.Hour),
			HttpOnly: true,
			Secure:   os.Getenv("NODE_ENV") == "production",
			Path:     "/",
		})

		// Responder com o novo token de acesso
		w.Header().Set("Content-Type", "application/json")
		response := map[string]interface{}{
			"message": "Refresh token bem-sucedido",
			"token":   accessToken,
		}
		json.NewEncoder(w).Encode(response)
	}
}

// Função para obter o usuário autenticado
func Me(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("token")
	if err != nil {
		http.Error(w, "Token não encontrado", http.StatusUnauthorized)
		return
	}

	claims := &jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(cookie.Value, claims, func(token *jwt.Token) (interface{}, error) {
		return JwtSecret, nil
	})

	if err != nil || !token.Valid {
		http.Error(w, "Token inválido", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(claims)
}
