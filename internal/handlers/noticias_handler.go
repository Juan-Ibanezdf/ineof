package handlers

import (
	"api/internal/models"
	"api/internal/utils"
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// NoticiasRouter configura as rotas para os handlers de notícias
func NoticiasRouter(db *pgxpool.Pool) http.Handler {
	r := chi.NewRouter()
	r.Post("/", CreateNoticia(db))
	r.Get("/", GetAllNoticiasComFiltro(db)) // Nova rota para busca com filtros
	r.Get("/{id}", GetNoticiaByID(db))
	r.Put("/{id}", UpdateNoticia(db))
	r.Delete("/{id}", DeleteNoticia(db))
	return r
}

// CreateNoticia cria uma nova notícia
func CreateNoticia(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var noticia models.Noticia
		if err := json.NewDecoder(r.Body).Decode(&noticia); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		// Gerar automaticamente o slug usando o título da notícia
		slug := utils.Slugify(noticia.Titulo)
		noticia.Slug = slug

		// Geração automática de identifier
		identifier := utils.MakeID(10)
		noticia.Identifier = identifier

		_, err := db.Exec(context.Background(), `
			INSERT INTO Noticias (id_noticia, titulo, subtitulo, data_publicacao, nome_autor, imagem_noticia, lead, categoria, data_revisao, nome_revisor, slug, identifier) 
			VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
			noticia.Titulo, noticia.Subtitulo, noticia.DataPublicacao, noticia.NomeAutor, noticia.ImagemNoticia,
			noticia.Lead, noticia.Categoria, noticia.DataRevisao, noticia.NomeRevisor, noticia.Slug, noticia.Identifier)
		if err != nil {
			http.Error(w, "Failed to create noticia: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
	}
}

// GetAllNoticiasComFiltro retorna todas as notícias com filtros opcionais de título, categoria, autores e tags, além de paginação
func GetAllNoticiasComFiltro(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		titulo := r.URL.Query().Get("titulo")
		categoria := r.URL.Query().Get("categoria")
		autor := r.URL.Query().Get("autor")
		tags := r.URL.Query().Get("tags") // Assumindo que tags podem ser uma parte de palavras-chave
		paginaStr := r.URL.Query().Get("pagina")
		itensPorPaginaStr := r.URL.Query().Get("itens_por_pagina")

		// Valores padrão para paginação
		pagina := 1
		itensPorPagina := 12
		if paginaStr != "" {
			pagina, _ = strconv.Atoi(paginaStr)
		}
		if itensPorPaginaStr != "" {
			itensPorPagina, _ = strconv.Atoi(itensPorPaginaStr)
		}

		offset := (pagina - 1) * itensPorPagina

		// Construir a consulta SQL dinamicamente com base nos parâmetros
		query := `
			SELECT id_noticia, titulo, subtitulo, data_publicacao, nome_autor, imagem_noticia, lead, categoria, data_revisao, nome_revisor, slug, identifier
			FROM Noticias
			WHERE 1=1`

		params := []interface{}{}
		paramIndex := 1

		if titulo != "" {
			query += ` AND titulo ILIKE '%' || $` + strconv.Itoa(paramIndex) + ` || '%'`
			params = append(params, titulo)
			paramIndex++
		}

		if categoria != "" {
			query += ` AND categoria ILIKE '%' || $` + strconv.Itoa(paramIndex) + ` || '%'`
			params = append(params, categoria)
			paramIndex++
		}

		if autor != "" {
			query += ` AND nome_autor ILIKE '%' || $` + strconv.Itoa(paramIndex) + ` || '%'`
			params = append(params, autor)
			paramIndex++
		}

		if tags != "" {
			query += ` AND $` + strconv.Itoa(paramIndex) + ` = ANY (tags)` // Assumindo que tags é um array
			params = append(params, tags)
			paramIndex++
		}

		// Se nenhum filtro for passado, retorna as notícias mais recentes
		query += ` ORDER BY data_publicacao DESC LIMIT $` + strconv.Itoa(paramIndex) + ` OFFSET $` + strconv.Itoa(paramIndex+1)
		params = append(params, itensPorPagina, offset)

		// Executar a consulta
		rows, err := db.Query(context.Background(), query, params...)
		if err != nil {
			http.Error(w, "Failed to query noticias", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var noticias []models.Noticia
		for rows.Next() {
			var noticia models.Noticia
			err := rows.Scan(
				&noticia.IDNoticia, &noticia.Titulo, &noticia.Subtitulo, &noticia.DataPublicacao, &noticia.NomeAutor,
				&noticia.ImagemNoticia, &noticia.Lead, &noticia.Categoria, &noticia.DataRevisao, &noticia.NomeRevisor,
				&noticia.Slug, &noticia.Identifier)
			if err != nil {
				http.Error(w, "Failed to scan noticia", http.StatusInternalServerError)
				return
			}
			noticias = append(noticias, noticia)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(noticias)
	}
}

// GetNoticiaByID retorna uma notícia pelo ID
func GetNoticiaByID(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")

		var noticia models.Noticia
		err := db.QueryRow(context.Background(), `
			SELECT id_noticia, titulo, subtitulo, data_publicacao, nome_autor, imagem_noticia, lead, categoria, data_revisao, nome_revisor, slug, identifier
			FROM Noticias
			WHERE id_noticia = $1`, id).Scan(
			&noticia.IDNoticia, &noticia.Titulo, &noticia.Subtitulo, &noticia.DataPublicacao, &noticia.NomeAutor,
			&noticia.ImagemNoticia, &noticia.Lead, &noticia.Categoria, &noticia.DataRevisao, &noticia.NomeRevisor,
			&noticia.Slug, &noticia.Identifier)

		if err != nil {
			http.Error(w, "Noticia not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(noticia)
	}
}

// UpdateNoticia atualiza uma notícia existente
func UpdateNoticia(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")

		var noticia models.Noticia
		if err := json.NewDecoder(r.Body).Decode(&noticia); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		_, err := db.Exec(context.Background(), `
			UPDATE Noticias SET 
				titulo = $1, subtitulo = $2, data_publicacao = $3, nome_autor = $4, imagem_noticia = $5,
				lead = $6, categoria = $7, data_revisao = $8, nome_revisor = $9, slug = $10, identifier = $11
			WHERE id_noticia = $12`,
			noticia.Titulo, noticia.Subtitulo, noticia.DataPublicacao, noticia.NomeAutor, noticia.ImagemNoticia,
			noticia.Lead, noticia.Categoria, noticia.DataRevisao, noticia.NomeRevisor, noticia.Slug, noticia.Identifier, id)
		if err != nil {
			http.Error(w, "Failed to update noticia: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}

// DeleteNoticia remove uma notícia existente
func DeleteNoticia(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")

		_, err := db.Exec(context.Background(), `DELETE FROM Noticias WHERE id_noticia = $1`, id)
		if err != nil {
			http.Error(w, "Failed to delete noticia: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}
