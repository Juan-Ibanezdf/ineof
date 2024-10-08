package handlers

import (
	"api/internal/models"
	"context"
	"encoding/json"
	"fmt"
	"log"
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

// Função para definir o cookie de CSRF token
func setCSRFCookie(w http.ResponseWriter) {
	csrfToken := generateCSRFToken()
	http.SetCookie(w, &http.Cookie{
		Name:     "csrf_token",
		Value:    csrfToken,
		Expires:  time.Now().Add(4 * time.Hour),
		HttpOnly: false, // O frontend precisa acessar este cookie
		Secure:   false,
		Path:     "/",
		SameSite: http.SameSiteLaxMode,
	})
}

// Função para logar o usuário e gerar tokens de autenticação e CSRF
func LoginUser(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var creds struct {
			NomeDeUsuario   string `json:"nomeDeUsuario"`
			Senha           string `json:"senha"`
			Email           string `json:"email"`
			ManterConectado bool   `json:"manterConectado"`
		}

		// Decodifica as credenciais enviadas na requisição
		if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		// Busca o usuário no banco de dados
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

		// Gera o access token (JWT)
		accessToken, err := generateAccessToken(usuario.ID, usuario.NivelPermissao, usuario.NomeDeUsuario, usuario.Email, *usuario.PerfilImagem)
		if err != nil {
			http.Error(w, "Falha ao gerar token de acesso", http.StatusInternalServerError)
			return
		}

		// Gera o refresh token, se 'ManterConectado' for true
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

		// Captura o IP do último login
		ip := r.RemoteAddr
		// Captura a hora atual para o último login
		now := time.Now()

		// Atualiza as colunas de último login e IP no banco de dados
		_, err = db.Exec(context.Background(), `UPDATE usuarios SET ultimo_login = $1, ip_ultimo_login = $2 WHERE id_usuario = $3`, now, ip, usuario.ID)
		if err != nil {
			http.Error(w, "Falha ao atualizar informações de login", http.StatusInternalServerError)
			return
		}

		// Define os cookies de autenticação (sem 'secure' para localhost)
		http.SetCookie(w, &http.Cookie{
			Name:     "token",
			Value:    accessToken,
			Expires:  time.Now().Add(4 * time.Hour),
			HttpOnly: false, // Proteger contra JavaScript
			Secure:   false, // SEM secure em desenvolvimento
			Path:     "/",
			SameSite: http.SameSiteLaxMode, // Lax em desenvolvimento
		})

		if creds.ManterConectado {
			http.SetCookie(w, &http.Cookie{
				Name:     "refresh_token",
				Value:    refreshToken,
				Expires:  time.Now().Add(30 * 24 * time.Hour), // 30 dias
				HttpOnly: true,                                // Proteger contra JavaScript
				Secure:   false,                               // SEM secure em desenvolvimento
				Path:     "/",
				SameSite: http.SameSiteLaxMode, // Lax em desenvolvimento
			})
		}

		// Define o cookie de CSRF token (também sem 'secure' em localhost)
		setCSRFCookie(w)

		// Envia a resposta com o token de acesso e dados do usuário
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
			"refreshToken": refreshToken, // Retorna o refreshToken, se gerado
		}
		json.NewEncoder(w).Encode(response)
	}
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
	// Tenta obter o token dos cookies
	cookie, err := r.Cookie("token")
	if err != nil {
		http.Error(w, "Token não encontrado", http.StatusUnauthorized)
		return
	}

	// Extrai as claims do token JWT
	claims := &jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(cookie.Value, claims, func(token *jwt.Token) (interface{}, error) {
		// Verifica se o método de assinatura é HS256
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			// Retorna o erro corretamente
			return nil, fmt.Errorf("método de assinatura inesperado: %v", token.Header["alg"])
		}
		return JwtSecret, nil
	})

	if err != nil {
		// Logando o erro para entender melhor o problema
		log.Println("Erro ao validar o token:", err)
		http.Error(w, "Token inválido ou expirado", http.StatusUnauthorized)
		return
	}

	if !token.Valid {
		log.Println("Token inválido:", token)
		http.Error(w, "Token inválido", http.StatusUnauthorized)
		return
	}

	// Se o token é válido, retorna as claims
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(claims)
}

// Função para validar o token JWT
func ValidateToken(w http.ResponseWriter, r *http.Request) {
	// Obtenha o token do cabeçalho Authorization
	tokenString := r.Header.Get("Authorization")
	if tokenString == "" {
		http.Error(w, "Token não fornecido", http.StatusUnauthorized)
		return
	}

	// Remove o "Bearer " do início do token, se necessário
	if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
		tokenString = tokenString[7:]
	}

	// Valida o token
	claims := jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		// Verifica se o método de assinatura é HS256
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de assinatura inesperado: %v", token.Header["alg"])
		}
		return JwtSecret, nil
	})

	if err != nil || !token.Valid {
		log.Println("Erro ao validar o token:", err)
		http.Error(w, "Token inválido ou expirado", http.StatusUnauthorized)
		return
	}

	// Se o token for válido, retorna uma resposta de sucesso
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"message": "Token válido"}`))
}
