package middleware

import (
	"log"
	"net/http"
	"os"

	"github.com/golang-jwt/jwt/v4"
)

var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

// AuthorizationMiddleware verifica o nível de acesso do usuário
func AuthorizationMiddleware(requiredAccessLevel string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Obter o token do cookie
			cookie, err := r.Cookie("token")
			if err != nil {
				http.Error(w, "Token não encontrado", http.StatusUnauthorized)
				return
			}

			// Validar o token JWT
			token, err := jwt.Parse(cookie.Value, func(token *jwt.Token) (interface{}, error) {
				return jwtSecret, nil
			})
			if err != nil || !token.Valid {
				http.Error(w, "Token inválido", http.StatusUnauthorized)
				return
			}

			// Extrair as claims do token
			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				http.Error(w, "Token inválido", http.StatusUnauthorized)
				return
			}

			// Obter o nível de acesso do token
			userAccessLevel, ok := claims["nivelPermissao"].(string)
			if !ok {
				http.Error(w, "Nível de acesso não encontrado", http.StatusUnauthorized)
				return
			}

			// Verificar se o nível de acesso é suficiente
			if !isAccessLevelSufficient(userAccessLevel, requiredAccessLevel) {
				http.Error(w, "Você não tem permissão para acessar este perfil", http.StatusForbidden)
				return
			}

			// Continuar para o próximo handler se o acesso for permitido
			next.ServeHTTP(w, r)
		})
	}
}

// Função para verificar se o nível de acesso é suficiente
func isAccessLevelSufficient(userLevel, requiredLevel string) bool {
	levels := map[string]int{
		"leitor":                     1,
		"colaborador":                2,
		"gestor_conteudo":            3,
		"administrador_equipamentos": 4,
		"administrador_campanhas":    5,
		"superusuario":               6,
	}

	return levels[userLevel] >= levels[requiredLevel]
}

// ValidateCSRFToken verifica se o CSRF token está presente e válido
func ValidateCSRFToken(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		csrfToken := r.Header.Get("X-CSRF-Token")
		csrfCookie, err := r.Cookie("csrf_token")

		if err != nil {
			log.Println("CSRF token cookie não encontrado:", err)
			http.Error(w, "CSRF token missing", http.StatusForbidden)
			return
		}

		if csrfToken == "" {
			log.Println("CSRF token ausente no cabeçalho")
			http.Error(w, "CSRF token ausente", http.StatusForbidden)
			return
		}

		log.Printf("CSRF token do cabeçalho: %s\n", csrfToken)
		log.Printf("CSRF token do cookie: %s\n", csrfCookie.Value)

		if csrfToken != csrfCookie.Value {
			log.Println("CSRF token inválido")
			http.Error(w, "CSRF token inválido", http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	})
}
