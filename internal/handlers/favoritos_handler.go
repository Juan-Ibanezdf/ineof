package handlers

import (
	"api/internal/models"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v4"
	"github.com/jackc/pgx/v5/pgxpool"
)

// FavoritosRouter configura as rotas para os handlers de Favoritos
func FavoritosRouter(db *pgxpool.Pool) http.Handler {
	r := chi.NewRouter()
	r.Post("/", createFavorito(db))
	r.Get("/", getAllFavoritos(db))
	r.Get("/{id}", getFavoritoByID(db))
	r.Delete("/{id}", deleteFavorito(db))
	return r
}

// createFavorito cria um novo favorito
func createFavorito(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var favorito models.Favorito
		if err := json.NewDecoder(r.Body).Decode(&favorito); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		userID, err := extractUserIDFromToken(r)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Define o ID do usuário e a data do favorito
		favorito.IDUsuario = userID
		favorito.DataFavorito = time.Now()

		// Verificar se já existe o favorito para evitar duplicidade
		var existingID string
		err = db.QueryRow(context.Background(), `
			SELECT id_usuario FROM Favoritos WHERE id_usuario = $1 AND id_publicacao = $2`,
			favorito.IDUsuario, favorito.IDPublicacao).Scan(&existingID)

		if err == nil && existingID != "" {
			http.Error(w, "Favorito já existe", http.StatusConflict)
			return
		}

		// Inserir o novo favorito
		_, err = db.Exec(context.Background(), `
			INSERT INTO Favoritos (id_usuario, id_publicacao, data_favorito) 
			VALUES ($1, $2, $3)`,
			favorito.IDUsuario, favorito.IDPublicacao, favorito.DataFavorito)
		if err != nil {
			http.Error(w, "Failed to create favorito: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
	}
}

// getAllFavoritos retorna todos os favoritos do usuário autenticado
func getAllFavoritos(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, err := extractUserIDFromToken(r)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		rows, err := db.Query(context.Background(), `
			SELECT id_usuario, id_publicacao, data_favorito 
			FROM Favoritos 
			WHERE id_usuario = $1`, userID)
		if err != nil {
			http.Error(w, "Failed to query favoritos", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var favoritos []models.Favorito
		for rows.Next() {
			var favorito models.Favorito
			err := rows.Scan(&favorito.IDUsuario, &favorito.IDPublicacao, &favorito.DataFavorito)
			if err != nil {
				http.Error(w, "Failed to scan favorito", http.StatusInternalServerError)
				return
			}
			favoritos = append(favoritos, favorito)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(favoritos)
	}
}

// getFavoritoByID retorna um favorito pelo ID da publicação se pertence ao usuário autenticado
func getFavoritoByID(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idPublicacao := chi.URLParam(r, "id")

		userID, err := extractUserIDFromToken(r)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var favorito models.Favorito
		err = db.QueryRow(context.Background(), `
			SELECT id_usuario, id_publicacao, data_favorito 
			FROM Favoritos 
			WHERE id_publicacao = $1 AND id_usuario = $2`, idPublicacao, userID).Scan(
			&favorito.IDUsuario, &favorito.IDPublicacao, &favorito.DataFavorito)
		if err != nil {
			http.Error(w, "Favorito not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(favorito)
	}
}

// deleteFavorito deleta um favorito pela publicação, apenas se pertence ao usuário autenticado
func deleteFavorito(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idPublicacao := chi.URLParam(r, "id")

		userID, err := extractUserIDFromToken(r)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		_, err = db.Exec(context.Background(), `
			DELETE FROM Favoritos 
			WHERE id_publicacao = $1 AND id_usuario = $2`, idPublicacao, userID)
		if err != nil {
			http.Error(w, "Failed to delete favorito", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

// Função auxiliar para extrair o ID do usuário do token JWT
func extractUserIDFromToken(r *http.Request) (string, error) {
	cookie, err := r.Cookie("token")
	if err != nil {
		return "", errors.New("token not found")
	}

	claims := &jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(cookie.Value, claims, func(token *jwt.Token) (interface{}, error) {
		return JwtSecret, nil // Diretamente utilizando JwtSecret definido no mesmo pacote
	})

	if err != nil || !token.Valid {
		return "", errors.New("invalid token")
	}

	userID, ok := (*claims)["idUsuario"].(string)
	if !ok {
		return "", errors.New("user ID not found in token")
	}

	return userID, nil
}
