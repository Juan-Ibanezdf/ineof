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
func generateAccessToken(idUsuario, nivelAcesso, nomeDeUsuario, email, perfilImagem string) (string, error) {
	claims := jwt.MapClaims{
		"idUsuario":     idUsuario,
		"nivelAcesso":   nivelAcesso,
		"nomeDeUsuario": nomeDeUsuario,
		"email":         email,
		"perfilImagem":  perfilImagem,
		"exp":           time.Now().Add(4 * time.Hour).Unix(),
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
	// Gera um token CSRF único, por exemplo, usando UUID
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

// Função para gerar e definir o cookie de CSRF token
func setCSRFCookie(w http.ResponseWriter) {
	csrfToken := generateCSRFToken()
	http.SetCookie(w, &http.Cookie{
		Name:     "csrf_token",
		Value:    csrfToken,
		Expires:  time.Now().Add(4 * time.Hour),
		HttpOnly: true,
		Secure:   os.Getenv("NODE_ENV") == "production",
		Path:     "/",
	})
}

// Função para logar o usuário e gerar tokens de autenticação e CSRF
func LoginUser(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var creds struct {
			NomeDeUsuario   string `json:"nomeDeUsuario"`
			Senha           string `json:"senha"`
			Email           string `json:"email"`
			ManterConectado bool   `json:"manterConectado"` // Adiciona a opção de "manter conectado"
		}

		if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		// Buscar usuário no banco de dados
		var usuario models.Usuario
		err := db.QueryRow(context.Background(), `
			SELECT id_usuario, nome_de_usuario, senha, email, nivel_acesso, COALESCE(perfil_imagem, ''), refresh_token
			FROM usuarios 
			WHERE nome_de_usuario=$1 OR email=$2`, creds.NomeDeUsuario, creds.Email).
			Scan(&usuario.ID, &usuario.NomeDeUsuario, &usuario.Senha, &usuario.Email, &usuario.NivelAcesso, &usuario.PerfilImagem, &usuario.RefreshToken)

		if err != nil {
			http.Error(w, "Nome de usuário ou E-mail inválido", http.StatusUnauthorized)
			return
		}

		// Comparar a senha fornecida com a senha armazenada
		err = bcrypt.CompareHashAndPassword([]byte(usuario.Senha), []byte(creds.Senha))
		if err != nil {
			http.Error(w, "Senha inválida", http.StatusUnauthorized)
			return
		}

		// Tratar corretamente possíveis ponteiros nulos para PerfilImagem
		perfilImagem := ""
		if usuario.PerfilImagem != nil {
			perfilImagem = *usuario.PerfilImagem
		}

		// Gerar token JWT (Access Token)
		accessToken, err := generateAccessToken(usuario.ID, usuario.NivelAcesso, usuario.NomeDeUsuario, usuario.Email, perfilImagem)
		if err != nil {
			http.Error(w, "Falha ao gerar token de acesso", http.StatusInternalServerError)
			return
		}

		// Gerar Refresh Token se "manter conectado" foi selecionado
		var refreshToken string
		if creds.ManterConectado {
			refreshToken, err = generateRefreshToken(usuario.ID)
			if err != nil {
				http.Error(w, "Falha ao gerar refresh token", http.StatusInternalServerError)
				return
			}

			// Salvar o refresh token no banco de dados
			_, err = db.Exec(context.Background(), `
				UPDATE usuarios SET refresh_token = $1 WHERE id_usuario = $2`,
				refreshToken, usuario.ID)
			if err != nil {
				http.Error(w, "Falha ao salvar refresh token", http.StatusInternalServerError)
				return
			}

			// Definir cookie de refresh token (com longa duração)
			http.SetCookie(w, &http.Cookie{
				Name:     "refresh_token",
				Value:    refreshToken,
				Expires:  time.Now().Add(30 * 24 * time.Hour), // 30 dias
				HttpOnly: true,
				Secure:   os.Getenv("NODE_ENV") == "production",
				Path:     "/",
			})
		}

		// Definir cookie de autenticação (Access Token)
		http.SetCookie(w, &http.Cookie{
			Name:     "token",
			Value:    accessToken,
			Expires:  time.Now().Add(4 * time.Hour),
			HttpOnly: true,
			Secure:   os.Getenv("NODE_ENV") == "production",
			Path:     "/",
		})

		// Gerar e definir o cookie de CSRF token
		setCSRFCookie(w)

		// Responder com o token de acesso, refresh token (se houver), e dados do usuário
		w.Header().Set("Content-Type", "application/json")
		response := map[string]interface{}{
			"message": "Login bem-sucedido",
			"token":   accessToken,
			"usuario": map[string]interface{}{
				"idUsuario":     usuario.ID,
				"nomeDeUsuario": usuario.NomeDeUsuario,
				"email":         usuario.Email,
				"perfilImagem":  perfilImagem,
				"nivelAcesso":   usuario.NivelAcesso,
			},
		}

		if creds.ManterConectado {
			response["refreshToken"] = refreshToken
		}

		json.NewEncoder(w).Encode(response)
	}
}

// Função para registrar um novo usuário
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

		// Validar a senha (regras de senha)
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

		// Inserir usuário no banco de dados e recuperar o id_usuario gerado
		var userID string
		err = db.QueryRow(context.Background(), `
			INSERT INTO usuarios (nome_de_usuario, senha, email, termos_de_uso, status_ativacao, email_verificado) 
			VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_usuario`,
			usuario.NomeDeUsuario, usuario.Senha, usuario.Email, usuario.TermosDeUso, usuario.StatusAtivacao, usuario.EmailVerificado).Scan(&userID)
		if err != nil {
			http.Error(w, "Erro ao registrar usuário", http.StatusInternalServerError)
			return
		}

		// Adicionar o id_usuario ao struct do usuário
		usuario.ID = userID

		// Tratar corretamente possíveis ponteiros nulos para PerfilImagem
		perfilImagem := ""
		if usuario.PerfilImagem != nil {
			perfilImagem = *usuario.PerfilImagem
		}

		// Gerar token JWT (Access Token)
		accessToken, err := generateAccessToken(usuario.ID, usuario.NivelAcesso, usuario.NomeDeUsuario, usuario.Email, perfilImagem)
		if err != nil {
			http.Error(w, "Falha ao gerar token de acesso", http.StatusInternalServerError)
			return
		}

		// Definir cookie de autenticação (Access Token)
		http.SetCookie(w, &http.Cookie{
			Name:     "token",
			Value:    accessToken,
			Expires:  time.Now().Add(4 * time.Hour),
			HttpOnly: true,
			Secure:   os.Getenv("NODE_ENV") == "production",
			Path:     "/",
		})

		// Gerar e definir o cookie de CSRF token
		setCSRFCookie(w)

		// Responder com sucesso
		w.Header().Set("Content-Type", "application/json")
		response := map[string]interface{}{
			"message": "Registro bem-sucedido",
			"token":   accessToken,
			"usuario": usuario,
		}
		json.NewEncoder(w).Encode(response)
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
            SELECT nome_de_usuario, email, nivel_acesso, COALESCE(perfil_imagem, '') 
            FROM usuarios WHERE id_usuario=$1`, idUsuario).Scan(&usuario.NomeDeUsuario, &usuario.Email, &usuario.NivelAcesso, &usuario.PerfilImagem)

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
		accessToken, err := generateAccessToken(usuario.ID, usuario.NivelAcesso, usuario.NomeDeUsuario, usuario.Email, perfilImagem)
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
