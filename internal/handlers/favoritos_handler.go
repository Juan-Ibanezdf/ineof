package handlers

import (
	"api/internal/models"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

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
			http.Error(w, "invalid input", http.StatusBadRequest)
			return
		}

		userID, err := extractUserIDFromToken(r)
		if err != nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		favorito.IDUsuario = userID

		_, err = db.Exec(context.Background(), `
			INSERT INTO Favoritos (id_usuario, id_publicacao, data_favorito) 
			VALUES ($1, $2, $3)`,
			favorito.IDUsuario, favorito.IDPublicacao, favorito.DataFavorito)
		if err != nil {
			http.Error(w, "failed to create favorito: "+err.Error(), http.StatusInternalServerError)
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
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		rows, err := db.Query(context.Background(), "SELECT * FROM Favoritos WHERE id_usuario = $1", userID)
		if err != nil {
			http.Error(w, "failed to query favoritos", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var favoritos []models.Favorito
		for rows.Next() {
			var favorito models.Favorito
			err := rows.Scan(&favorito.IDFavorito, &favorito.IDUsuario, &favorito.IDPublicacao, &favorito.DataFavorito)
			if err != nil {
				http.Error(w, "failed to scan favorito", http.StatusInternalServerError)
				return
			}
			favoritos = append(favoritos, favorito)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(favoritos)
	}
}

// getFavoritoByID retorna um favorito pelo ID, apenas se pertence ao usuário autenticado
func getFavoritoByID(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "invalid favorito ID", http.StatusBadRequest)
			return
		}

		userID, err := extractUserIDFromToken(r)
		if err != nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		var favorito models.Favorito
		err = db.QueryRow(context.Background(), "SELECT * FROM Favoritos WHERE id_favorito = $1 AND id_usuario = $2", id, userID).Scan(
			&favorito.IDFavorito, &favorito.IDUsuario, &favorito.IDPublicacao, &favorito.DataFavorito)
		if err != nil {
			http.Error(w, "favorito not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(favorito)
	}
}

// deleteFavorito deleta um favorito, apenas se pertence ao usuário autenticado
func deleteFavorito(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			http.Error(w, "invalid favorito ID", http.StatusBadRequest)
			return
		}

		userID, err := extractUserIDFromToken(r)
		if err != nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		_, err = db.Exec(context.Background(), "DELETE FROM Favoritos WHERE id_favorito = $1 AND id_usuario = $2", id, userID)
		if err != nil {
			http.Error(w, "failed to delete favorito", http.StatusInternalServerError)
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
