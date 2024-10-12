package handlers

import (
	"api/internal/configs"
	"api/internal/models"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v4"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// FavoritosRouter configura as rotas para os handlers de Favoritos
func FavoritosRouter(db *pgxpool.Pool) http.Handler {
	r := chi.NewRouter()
	r.Post("/", CreateFavorito(db))
	r.Get("/", GetAllFavoritos(db))                                 // Busca com filtros e paginação
	r.Get("/{identifier}/{slug}", GetFavoritoByIdentifierESlug(db)) // Busca por identifier e slug
	r.Delete("/{id_favoritos}", DeleteFavorito(db))                 // Deletar por identifier e slug
	return r
}

func CreateFavorito(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Variável para receber os dados do corpo da requisição
		var payload struct {
			IDPublicacao string `json:"id_publicacao"`
		}

		// Decodifica o JSON do corpo da requisição para a estrutura de payload
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		// Verifica se o ID da publicação foi fornecido
		if payload.IDPublicacao == "" {
			http.Error(w, "ID da publicação é obrigatório", http.StatusBadRequest)
			return
		}

		// Extrai o token do cookie
		cookie, err := r.Cookie("token")
		if err != nil {
			http.Error(w, "Token não encontrado", http.StatusUnauthorized)
			return
		}

		// Valida e decodifica o token JWT
		claims := &jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(cookie.Value, claims, func(token *jwt.Token) (interface{}, error) {
			return configs.JwtSecret, nil
		})
		if err != nil || !token.Valid {
			http.Error(w, "Token inválido: "+err.Error(), http.StatusUnauthorized)
			return
		}

		// Obtém o ID do usuário a partir das reivindicações do token
		idUsuario, ok := (*claims)["idUsuario"].(string)
		if !ok || idUsuario == "" {
			http.Error(w, "ID do usuário não encontrado no token", http.StatusUnauthorized)
			return
		}

		// Define o ID do usuário e a data do favorito
		favorito := models.Favorito{
			IDUsuario:    idUsuario,
			IDPublicacao: payload.IDPublicacao,
			DataFavorito: time.Now(),
		}

		// Verifica se o favorito já existe para evitar duplicidade
		var existingID string
		err = db.QueryRow(context.Background(), `
			SELECT id_usuario FROM Favoritos WHERE id_usuario = $1 AND id_publicacao = $2`,
			favorito.IDUsuario, favorito.IDPublicacao).Scan(&existingID)

		if err == nil && existingID != "" {
			http.Error(w, "Favorito já existe", http.StatusConflict)
			return
		}

		// Insere o novo favorito no banco de dados
		_, err = db.Exec(context.Background(), `
			INSERT INTO Favoritos (id_favoritos, id_usuario, id_publicacao, data_favorito) 
			VALUES (gen_random_uuid(), $1, $2, $3)`,
			favorito.IDUsuario, favorito.IDPublicacao, favorito.DataFavorito)

		if err != nil {
			http.Error(w, "Falha ao criar favorito: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Responde com sucesso
		w.WriteHeader(http.StatusCreated)
	}
}

func GetAllFavoritos(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Extrai o ID do usuário a partir do token
		userID, err := extractUserIDFromToken(r)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Obtendo os parâmetros de paginação
		paginaStr := r.URL.Query().Get("pagina")
		itensPorPaginaStr := r.URL.Query().Get("itens_por_pagina")

		// Valores padrão para paginação
		pagina := 1
		itensPorPagina := 10
		if paginaStr != "" {
			pagina, _ = strconv.Atoi(paginaStr)
		}
		if itensPorPaginaStr != "" {
			itensPorPagina, _ = strconv.Atoi(itensPorPaginaStr)
		}

		offset := (pagina - 1) * itensPorPagina

		// Consulta para obter os favoritos do usuário com paginação
		query := `
			SELECT f.id_favoritos, f.id_usuario, f.id_publicacao, f.data_favorito, p.titulo, p.slug, p.identifier
			FROM Favoritos f
			JOIN Publicacoes p ON f.id_publicacao = p.id_publicacao
			WHERE f.id_usuario = $1
			ORDER BY f.data_favorito DESC LIMIT $2 OFFSET $3`
		params := []interface{}{userID, itensPorPagina, offset}

		// Executando a query
		rows, err := db.Query(context.Background(), query, params...)
		if err != nil {
			http.Error(w, "Failed to query favoritos", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		// Estrutura para armazenar os resultados
		var favoritos []struct {
			IDFavoritos  string    `json:"id_favoritos"` // Novo campo adicionado
			IDUsuario    string    `json:"id_usuario"`
			IDPublicacao string    `json:"id_publicacao"`
			DataFavorito time.Time `json:"data_favorito"`
			Titulo       string    `json:"titulo"`
			Slug         string    `json:"slug"`
			Identifier   string    `json:"identifier"`
		}

		for rows.Next() {
			var favorito struct {
				IDFavoritos  string    `json:"id_favoritos"`
				IDUsuario    string    `json:"id_usuario"`
				IDPublicacao string    `json:"id_publicacao"`
				DataFavorito time.Time `json:"data_favorito"`
				Titulo       string    `json:"titulo"`
				Slug         string    `json:"slug"`
				Identifier   string    `json:"identifier"`
			}

			err := rows.Scan(&favorito.IDFavoritos, &favorito.IDUsuario, &favorito.IDPublicacao, &favorito.DataFavorito, &favorito.Titulo, &favorito.Slug, &favorito.Identifier)
			if err != nil {
				http.Error(w, "Failed to scan favorito", http.StatusInternalServerError)
				return
			}

			favoritos = append(favoritos, favorito)
		}

		// Retornar os favoritos em formato JSON
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(favoritos)
	}
}

// GetFavoritoByIdentifierESlug retorna um favorito pelo identifier e slug, se pertence ao usuário autenticado
func GetFavoritoByIdentifierESlug(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Obtém os parâmetros da URL
		identifier := chi.URLParam(r, "identifier")
		slug := chi.URLParam(r, "slug")

		// Verifica se os parâmetros foram fornecidos
		if identifier == "" || slug == "" {
			http.Error(w, "Identifier ou Slug não fornecido", http.StatusBadRequest)
			return
		}

		// Extrai o ID do usuário a partir do token
		userID, err := extractUserIDFromToken(r)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Estrutura que vai armazenar o resultado
		var favorito struct {
			IDFavoritos  string    `json:"id_favoritos"` // UUID do favorito
			IDUsuario    string    `json:"id_usuario"`
			IDPublicacao string    `json:"id_publicacao"`
			DataFavorito time.Time `json:"data_favorito"`
			Titulo       string    `json:"titulo"`
			Slug         string    `json:"slug"`
			Identifier   string    `json:"identifier"`
		}

		// Executa a consulta para buscar o favorito com base no identifier, slug e id_usuario
		err = db.QueryRow(context.Background(), `
			SELECT f.id_favoritos, f.id_usuario, f.id_publicacao, f.data_favorito, p.titulo, p.slug, p.identifier
			FROM Favoritos f
			JOIN Publicacoes p ON f.id_publicacao = p.id_publicacao
			WHERE p.identifier = $1 AND p.slug = $2 AND f.id_usuario = $3`,
			identifier, slug, userID).Scan(
			&favorito.IDFavoritos, &favorito.IDUsuario, &favorito.IDPublicacao, &favorito.DataFavorito, &favorito.Titulo, &favorito.Slug, &favorito.Identifier)

		// Verifica se houve algum erro ao buscar o favorito
		if err != nil {
			if err == pgx.ErrNoRows {
				http.Error(w, "Favorito não encontrado", http.StatusNotFound)
			} else {
				http.Error(w, "Erro ao buscar o favorito: "+err.Error(), http.StatusInternalServerError)
			}
			return
		}

		// Retorna o favorito em formato JSON
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(favorito)
	}
}

// DeleteFavorito deleta um favorito pelo id_favoritos, se pertence ao usuário autenticado
func DeleteFavorito(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Obtém o id_favoritos da URL
		idFavoritos := chi.URLParam(r, "id_favoritos")

		// Valida se o id_favoritos foi fornecido
		if idFavoritos == "" {
			http.Error(w, "ID do favorito não fornecido", http.StatusBadRequest)
			return
		}

		// Extrai o ID do usuário a partir do token
		userID, err := extractUserIDFromToken(r)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Deleta o favorito com base no id_favoritos e no id_usuario
		_, err = db.Exec(context.Background(), `
			DELETE FROM Favoritos
			WHERE id_favoritos = $1 AND id_usuario = $2`, idFavoritos, userID)

		if err != nil {
			http.Error(w, "Falha ao deletar favorito", http.StatusInternalServerError)
			return
		}

		// Retorna uma resposta de sucesso
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
