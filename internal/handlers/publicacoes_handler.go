package handlers

import (
	"api/internal/configs"
	"api/internal/models"
	"api/internal/utils"
	"context"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt"
	"github.com/jackc/pgx/v5/pgxpool"
)

// PublicacoesRouter configura as rotas para os handlers de Publicacoes
func PublicacoesRouter(db *pgxpool.Pool) *chi.Mux {
	r := chi.NewRouter()
	r.Post("/", CreatePublicacao(db))
	r.Get("/", GetAllPublicacoes(db))
	r.Get("/{id}", GetPublicacaoByID(db))
	r.Put("/{id}", UpdatePublicacao(db))
	r.Delete("/{id}", DeletePublicacao(db))
	return r
}

// CreatePublicacao cria uma nova publicacao
func CreatePublicacao(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var publicacao models.Publicacao
		if err := json.NewDecoder(r.Body).Decode(&publicacao); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		// Extrai o token do cookie
		cookie, err := r.Cookie("token")
		if err != nil {
			http.Error(w, "Token não encontrado", http.StatusUnauthorized)
			return
		}

		// Valida e decodifica o token JWT usando o segredo JWT importado de configs
		claims := &jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(cookie.Value, claims, func(token *jwt.Token) (interface{}, error) {
			return configs.JwtSecret, nil // Use o JwtSecret importado de configs
		})

		if err != nil || !token.Valid {
			http.Error(w, "Token inválido: "+err.Error(), http.StatusUnauthorized)
			return
		}

		// Obtém o idUsuario a partir das reivindicações do token
		idUsuario, ok := (*claims)["idUsuario"].(string)
		if !ok || idUsuario == "" {
			http.Error(w, "User ID not found in token", http.StatusUnauthorized)
			return
		}

		// Atribui o idUsuario ao objeto de publicação
		publicacao.IDUsuario = &idUsuario

		// Gera automaticamente o slug usando o título da publicação
		slug := utils.Slugify(publicacao.Titulo)
		publicacao.Slug = &slug

		// Gera automaticamente um identifier único
		identifier := utils.MakeID(10)
		publicacao.Identifier = &identifier

		// Insere a nova publicação no banco de dados
		_, err = db.Exec(context.Background(), `
			INSERT INTO Publicacoes (
				id_publicacao, titulo, subtitulo, palavras_chave, banner, resumo, nome_de_usuario, categoria, autores, 
				publicacoes, data_criacao, data_modificacao, pdf, link, visualizacoes, revisado_por, slug, 
				identifier, visibilidade, notas, id_usuario) 
			VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
			publicacao.Titulo, publicacao.Subtitulo, publicacao.PalavrasChave, publicacao.Banner, publicacao.Resumo, publicacao.NomeDeUsuario,
			publicacao.Categoria, publicacao.Autores, publicacao.Publicacoes, publicacao.DataCriacao, publicacao.DataModificacao,
			publicacao.PDF, publicacao.Link, publicacao.Visualizacoes, publicacao.RevisadoPor, publicacao.Slug, publicacao.Identifier,
			publicacao.Visibilidade, publicacao.Notas, publicacao.IDUsuario,
		)
		if err != nil {
			http.Error(w, "Failed to create publicacao: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Retorna um status 201 Created
		w.WriteHeader(http.StatusCreated)
	}
}

// UpdatePublicacao atualiza uma publicacao
func UpdatePublicacao(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		var publicacao models.Publicacao
		if err := json.NewDecoder(r.Body).Decode(&publicacao); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		_, err := db.Exec(context.Background(), `
			UPDATE Publicacoes 
			SET titulo = $1, subtitulo = $2, palavras_chave = $3, banner = $4, resumo = $5, nome_de_usuario = $6, categoria = $7, autores = $8, 
			publicacoes = $9, data_criacao = $10, data_modificacao = $11, pdf = $12, link = $13, visualizacoes = $14, revisado_por = $15, 
			slug = $16, identifier = $17, visibilidade = $18, notas = $19, id_usuario = $20 
			WHERE id_publicacao = $21`,
			publicacao.Titulo, publicacao.Subtitulo, publicacao.PalavrasChave, publicacao.Banner, publicacao.Resumo, publicacao.NomeDeUsuario,
			publicacao.Categoria, publicacao.Autores, publicacao.Publicacoes, publicacao.DataCriacao, publicacao.DataModificacao,
			publicacao.PDF, publicacao.Link, publicacao.Visualizacoes, publicacao.RevisadoPor, publicacao.Slug, publicacao.Identifier,
			publicacao.Visibilidade, publicacao.Notas, publicacao.IDUsuario, id)
		if err != nil {
			http.Error(w, "Failed to update publicacao", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

// GetAllPublicacoes retorna todas as publicacoes
func GetAllPublicacoes(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Especifica todas as colunas explicitamente na consulta
		query := `
			SELECT id_publicacao, titulo, subtitulo, palavras_chave, banner, resumo, nome_de_usuario, categoria, autores, 
			publicacoes, data_criacao, data_modificacao, pdf, link, visualizacoes, revisado_por, slug, 
			identifier, visibilidade, notas, id_usuario 
			FROM Publicacoes
		`

		rows, err := db.Query(context.Background(), query)
		if err != nil {
			http.Error(w, "Failed to query publicacoes", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var publicacoes []models.Publicacao
		for rows.Next() {
			var publicacao models.Publicacao
			err := rows.Scan(
				&publicacao.ID, &publicacao.Titulo, &publicacao.Subtitulo, &publicacao.PalavrasChave, &publicacao.Banner,
				&publicacao.Resumo, &publicacao.NomeDeUsuario, &publicacao.Categoria, &publicacao.Autores,
				&publicacao.Publicacoes, &publicacao.DataCriacao, &publicacao.DataModificacao, &publicacao.PDF,
				&publicacao.Link, &publicacao.Visualizacoes, &publicacao.RevisadoPor, &publicacao.Slug, &publicacao.Identifier,
				&publicacao.Visibilidade, &publicacao.Notas, &publicacao.IDUsuario)
			if err != nil {
				http.Error(w, "Failed to scan publicacao", http.StatusInternalServerError)
				return
			}
			publicacoes = append(publicacoes, publicacao)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(publicacoes)
	}
}

// GetPublicacaoByID retorna uma publicacao pelo ID
func GetPublicacaoByID(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		var publicacao models.Publicacao
		err := db.QueryRow(context.Background(), "SELECT * FROM Publicacoes WHERE id_publicacao = $1", id).Scan(
			&publicacao.ID, &publicacao.Titulo, &publicacao.Subtitulo, &publicacao.PalavrasChave, &publicacao.Banner,
			&publicacao.Resumo, &publicacao.NomeDeUsuario, &publicacao.Categoria, &publicacao.Autores,
			&publicacao.Publicacoes, &publicacao.DataCriacao, &publicacao.DataModificacao, &publicacao.PDF,
			&publicacao.Link, &publicacao.Visualizacoes, &publicacao.RevisadoPor, &publicacao.Slug, &publicacao.Identifier,
			&publicacao.Visibilidade, &publicacao.Notas, &publicacao.IDUsuario)
		if err != nil {
			http.Error(w, "Publicacao not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(publicacao)
	}
}

// DeletePublicacao deleta uma publicacao
func DeletePublicacao(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		_, err := db.Exec(context.Background(), "DELETE FROM Publicacoes WHERE id_publicacao = $1", id)
		if err != nil {
			http.Error(w, "Failed to delete publicacao", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}
