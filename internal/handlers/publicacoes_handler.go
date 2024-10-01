package handlers

import (
	"api/internal/configs"
	"api/internal/models"
	"api/internal/utils"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// PublicacoesRouter configura as rotas para os handlers de Publicacoes
func PublicacoesRouter(db *pgxpool.Pool) *chi.Mux {
	r := chi.NewRouter()
	r.Post("/", CreatePublicacao(db))
	r.Get("/{identifier}/{slug}", GetPublicacaoByIdentifierESlug(db)) // Atualizado
	r.Get("/", GetPublicacoesComFiltro(db))                           // Nova rota para busca com filtro
	r.Put("/{id}", UpdatePublicacao(db))
	r.Delete("/{id}", DeletePublicacao(db))
	r.Get("/usuario", GetPublicacoesByUsuario(db))
	r.Get("/usuario/{identifier}/{slug}", GetPublicacaoByIdentifierESlugDoUsuario(db))
	return r
}

// CreatePublicacao cria uma nova publicacao
func CreatePublicacao(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var publicacao models.Publicacao
		// Tenta decodificar a requisição JSON para a struct Publicacao
		if err := json.NewDecoder(r.Body).Decode(&publicacao); err != nil {
			log.Println("Erro ao decodificar a publicação:", err) // Log do erro
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		// Extrai o token do cookie
		cookie, err := r.Cookie("token")
		if err != nil {
			log.Println("Token não encontrado:", err) // Log do erro
			http.Error(w, "Token não encontrado", http.StatusUnauthorized)
			return
		}

		// Valida e decodifica o token JWT usando o segredo JWT importado de configs
		claims := &jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(cookie.Value, claims, func(token *jwt.Token) (interface{}, error) {
			return configs.JwtSecret, nil
		})
		if err != nil || !token.Valid {
			log.Println("Token inválido:", err) // Log do erro
			http.Error(w, "Token inválido: "+err.Error(), http.StatusUnauthorized)
			return
		}

		// Obtém o idUsuario a partir das reivindicações do token
		idUsuario, ok := (*claims)["idUsuario"].(string)
		if !ok || idUsuario == "" {
			log.Println("ID de usuário não encontrado no token") // Log do erro
			http.Error(w, "User ID not found in token", http.StatusUnauthorized)
			return
		}

		// Atribui o idUsuario ao objeto de publicação
		publicacao.IDUsuario = idUsuario

		// Gera automaticamente o slug usando o título da publicação
		slug := utils.Slugify(publicacao.Titulo)
		publicacao.Slug = slug

		// Gera automaticamente um identifier único
		identifier := utils.MakeID(10)
		publicacao.Identifier = identifier

		// Insere a nova publicação no banco de dados
		_, err = db.Exec(context.Background(), `
			INSERT INTO Publicacoes (
				id_publicacao, titulo, subtitulo, palavras_chave, banner, resumo, nome_de_usuario, categoria, autores, 
				publicacoes, data_criacao, data_modificacao, link, visualizacoes, revisado_por, slug, 
				identifier, visibilidade, notas, id_usuario) 
			VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), $10, $11, $12, $13, $14, $15, $16, $17)`,
			publicacao.Titulo,
			publicacao.Subtitulo,
			publicacao.PalavrasChave,
			publicacao.Banner,
			publicacao.Resumo,
			publicacao.NomeDeUsuario,
			publicacao.Categoria,
			publicacao.Autores,
			publicacao.Publicacoes,
			publicacao.Link,
			publicacao.Visualizacoes,
			publicacao.RevisadoPor,
			publicacao.Slug,
			publicacao.Identifier,
			publicacao.Visibilidade,
			publicacao.Notas,
			publicacao.IDUsuario,
		)
		if err != nil {
			log.Println("Falha ao criar publicação no banco de dados:", err) // Log do erro
			http.Error(w, "Failed to create publicacao: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		log.Println("Publicação criada com sucesso:", publicacao.Titulo) // Log de sucesso
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
			publicacoes = $9, data_modificacao = NOW(), link = $10, visualizacoes = $11, revisado_por = $12, 
			slug = $13, identifier = $14, visibilidade = $15, notas = $16, id_usuario = $17 
			WHERE id_publicacao = $18`,
			publicacao.Titulo, publicacao.Subtitulo, publicacao.PalavrasChave, publicacao.Banner, publicacao.Resumo, publicacao.NomeDeUsuario,
			publicacao.Categoria, publicacao.Autores, publicacao.Publicacoes, publicacao.Link, publicacao.Visualizacoes, publicacao.RevisadoPor,
			publicacao.Slug, publicacao.Identifier, publicacao.Visibilidade, publicacao.Notas, publicacao.IDUsuario, id)
		if err != nil {
			http.Error(w, "Failed to update publicacao", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

// GetPublicacoesComFiltro retorna todas as publicacoes com filtros opcionais de titulo, categoria, autores, palavras-chave e tags, além de paginação
func GetPublicacoesComFiltro(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Obtendo os parâmetros de busca
		titulo := r.URL.Query().Get("titulo")
		categoria := r.URL.Query().Get("categoria")
		autores := r.URL.Query().Get("autores")
		palavrasChave := r.URL.Query().Get("palavras_chave")
		tags := r.URL.Query().Get("tags")
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
			SELECT id_publicacao, titulo, subtitulo, palavras_chave, banner, resumo, nome_de_usuario, categoria, autores, 
			publicacoes, data_criacao, data_modificacao, link, visualizacoes, revisado_por, slug, 
			identifier, visibilidade, notas, id_usuario 
			FROM Publicacoes
			WHERE 1=1`

		params := []interface{}{}
		paramIndex := 1

		// Verifica se o parâmetro título foi passado e ajusta a query
		if titulo != "" {
			query += ` AND titulo ILIKE '%' || $` + strconv.Itoa(paramIndex) + ` || '%'`
			params = append(params, titulo)
			paramIndex++
		}

		// Verifica se o parâmetro categoria foi passado e ajusta a query
		if categoria != "" {
			query += ` AND categoria ILIKE '%' || $` + strconv.Itoa(paramIndex) + ` || '%'`
			params = append(params, categoria)
			paramIndex++
		}

		// Verifica se o parâmetro autores foi passado e ajusta a query
		if autores != "" {
			query += ` AND $` + strconv.Itoa(paramIndex) + ` = ANY (autores)`
			params = append(params, autores)
			paramIndex++
		}

		// Verifica se o parâmetro palavras_chave foi passado e ajusta a query
		if palavrasChave != "" {
			query += ` AND $` + strconv.Itoa(paramIndex) + ` = ANY (palavras_chave)`
			params = append(params, palavrasChave)
			paramIndex++
		}

		// Verifica se o parâmetro tags foi passado e ajusta a query
		if tags != "" {
			query += ` AND $` + strconv.Itoa(paramIndex) + ` = ANY (palavras_chave)`
			params = append(params, tags)
			paramIndex++
		}

		// Se nenhum filtro for passado, retorna as publicações mais recentes
		query += ` ORDER BY data_criacao DESC LIMIT $` + strconv.Itoa(paramIndex) + ` OFFSET $` + strconv.Itoa(paramIndex+1)
		params = append(params, itensPorPagina, offset)

		// Executar a consulta
		rows, err := db.Query(context.Background(), query, params...)
		if err != nil {
			http.Error(w, "Failed to query publicacoes", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		// Preencher a lista de publicações com os resultados da query
		var publicacoes []models.Publicacao
		for rows.Next() {
			var publicacao models.Publicacao
			err := rows.Scan(
				&publicacao.ID, &publicacao.Titulo, &publicacao.Subtitulo, &publicacao.PalavrasChave, &publicacao.Banner,
				&publicacao.Resumo, &publicacao.NomeDeUsuario, &publicacao.Categoria, &publicacao.Autores,
				&publicacao.Publicacoes, &publicacao.DataCriacao, &publicacao.DataModificacao, &publicacao.Link,
				&publicacao.Visualizacoes, &publicacao.RevisadoPor, &publicacao.Slug, &publicacao.Identifier,
				&publicacao.Visibilidade, &publicacao.Notas, &publicacao.IDUsuario)
			if err != nil {
				http.Error(w, "Failed to scan publicacao", http.StatusInternalServerError)
				return
			}
			publicacoes = append(publicacoes, publicacao)
		}

		// Retorna as publicações em formato JSON
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(publicacoes)
	}
}

// GetPublicacaoByIdentifierESlug retorna uma publicacao pelo identifier e slug e incrementa as visualizações
func GetPublicacaoByIdentifierESlug(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		identifier := chi.URLParam(r, "identifier")
		slug := chi.URLParam(r, "slug")

		// Inicia uma transação para garantir que a leitura e a atualização ocorram juntas
		tx, err := db.Begin(context.Background())
		if err != nil {
			http.Error(w, "Failed to begin transaction", http.StatusInternalServerError)
			return
		}
		defer tx.Rollback(context.Background())

		var publicacao models.Publicacao
		err = tx.QueryRow(context.Background(), `
			SELECT id_publicacao, titulo, subtitulo, palavras_chave, banner, resumo, nome_de_usuario, categoria, autores, 
			publicacoes, data_criacao, data_modificacao, link, visualizacoes, revisado_por, slug, 
			identifier, visibilidade, notas, id_usuario 
			FROM Publicacoes WHERE identifier = $1 AND slug = $2`, identifier, slug).Scan(
			&publicacao.ID, &publicacao.Titulo, &publicacao.Subtitulo, &publicacao.PalavrasChave, &publicacao.Banner,
			&publicacao.Resumo, &publicacao.NomeDeUsuario, &publicacao.Categoria, &publicacao.Autores,
			&publicacao.Publicacoes, &publicacao.DataCriacao, &publicacao.DataModificacao, &publicacao.Link,
			&publicacao.Visualizacoes, &publicacao.RevisadoPor, &publicacao.Slug, &publicacao.Identifier,
			&publicacao.Visibilidade, &publicacao.Notas, &publicacao.IDUsuario)
		if err != nil {
			http.Error(w, "Publicacao not found", http.StatusNotFound)
			return
		}

		// Incrementa o número de visualizações
		_, err = tx.Exec(context.Background(), `UPDATE Publicacoes SET visualizacoes = visualizacoes + 1 WHERE identifier = $1 AND slug = $2`, identifier, slug)
		if err != nil {
			http.Error(w, "Failed to update visualizacoes", http.StatusInternalServerError)
			return
		}

		// Confirma a transação
		err = tx.Commit(context.Background())
		if err != nil {
			http.Error(w, "Failed to commit transaction", http.StatusInternalServerError)
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

// GetPublicacoesByUsuario retorna as publicacoes do usuario autenticado com suporte a paginacao e filtros opcionais
func GetPublicacoesByUsuario(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Extrai o token do cookie
		cookie, err := r.Cookie("token")
		if err != nil {
			http.Error(w, "Token não encontrado", http.StatusUnauthorized)
			return
		}

		// Valida e decodifica o token JWT usando o segredo JWT importado de configs
		claims := &jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(cookie.Value, claims, func(token *jwt.Token) (interface{}, error) {
			return configs.JwtSecret, nil
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

		// Certifique-se de que idUsuario é um UUID válido antes de executar a consulta
		if _, err := uuid.Parse(idUsuario); err != nil {
			http.Error(w, "User ID inválido", http.StatusBadRequest)
			return
		}

		// Log para depuração
		log.Printf("idUsuario extraído do token: %s", idUsuario)

		// Obtenção dos parâmetros de busca e paginação
		titulo := r.URL.Query().Get("titulo")
		categoria := r.URL.Query().Get("categoria")
		autores := r.URL.Query().Get("autores")
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

		// Construção da query SQL com filtros opcionais
		query := `
            SELECT id_publicacao, titulo, subtitulo, palavras_chave, banner, resumo, nome_de_usuario, categoria, autores, 
            publicacoes, data_criacao, data_modificacao, link, visualizacoes, revisado_por, slug, 
            identifier, visibilidade, notas, id_usuario 
            FROM Publicacoes
            WHERE id_usuario = $1`

		params := []interface{}{idUsuario}
		paramIndex := 2

		// Aplicação de filtros opcionais
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
		if autores != "" {
			query += ` AND $` + strconv.Itoa(paramIndex) + ` = ANY (autores)`
			params = append(params, autores)
			paramIndex++
		}

		// Ordenação e paginação
		query += ` ORDER BY data_criacao DESC LIMIT $` + strconv.Itoa(paramIndex) + ` OFFSET $` + strconv.Itoa(paramIndex+1)
		params = append(params, itensPorPagina, offset)

		// Execução da consulta
		rows, err := db.Query(context.Background(), query, params...)
		if err != nil {
			http.Error(w, "Failed to query publicacoes", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		// Preenchimento da lista de publicações com os resultados da query
		var publicacoes []models.Publicacao
		for rows.Next() {
			var publicacao models.Publicacao
			err := rows.Scan(
				&publicacao.ID, &publicacao.Titulo, &publicacao.Subtitulo, &publicacao.PalavrasChave, &publicacao.Banner,
				&publicacao.Resumo, &publicacao.NomeDeUsuario, &publicacao.Categoria, &publicacao.Autores,
				&publicacao.Publicacoes, &publicacao.DataCriacao, &publicacao.DataModificacao, &publicacao.Link,
				&publicacao.Visualizacoes, &publicacao.RevisadoPor, &publicacao.Slug, &publicacao.Identifier,
				&publicacao.Visibilidade, &publicacao.Notas, &publicacao.IDUsuario)
			if err != nil {
				http.Error(w, "Failed to scan publicacao", http.StatusInternalServerError)
				return
			}
			publicacoes = append(publicacoes, publicacao)
		}

		// Retorna as publicações em formato JSON
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(publicacoes)
	}
}

// GetPublicacaoByIdentifierESlugDoUsuario retorna uma publicacao pelo identifier e slug se pertencer ao usuario autenticado
func GetPublicacaoByIdentifierESlugDoUsuario(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		identifier := chi.URLParam(r, "identifier")
		slug := chi.URLParam(r, "slug")

		// Extrai o token do cookie
		cookie, err := r.Cookie("token")
		if err != nil {
			http.Error(w, "Token não encontrado", http.StatusUnauthorized)
			return
		}

		// Valida e decodifica o token JWT usando o segredo JWT
		claims := &jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(cookie.Value, claims, func(token *jwt.Token) (interface{}, error) {
			return configs.JwtSecret, nil
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

		// Inicia uma transação para garantir que a leitura e a atualização ocorram juntas
		tx, err := db.Begin(context.Background())
		if err != nil {
			http.Error(w, "Failed to begin transaction", http.StatusInternalServerError)
			return
		}
		defer tx.Rollback(context.Background())

		var publicacao models.Publicacao
		err = tx.QueryRow(context.Background(), `
            SELECT id_publicacao, titulo, subtitulo, palavras_chave, banner, resumo, nome_de_usuario, categoria, autores, 
            publicacoes, data_criacao, data_modificacao, link, visualizacoes, revisado_por, slug, 
            identifier, visibilidade, notas, id_usuario 
            FROM Publicacoes 
            WHERE identifier = $1 AND slug = $2 AND id_usuario = $3`, identifier, slug, idUsuario).Scan(
			&publicacao.ID, &publicacao.Titulo, &publicacao.Subtitulo, &publicacao.PalavrasChave, &publicacao.Banner,
			&publicacao.Resumo, &publicacao.NomeDeUsuario, &publicacao.Categoria, &publicacao.Autores,
			&publicacao.Publicacoes, &publicacao.DataCriacao, &publicacao.DataModificacao, &publicacao.Link,
			&publicacao.Visualizacoes, &publicacao.RevisadoPor, &publicacao.Slug, &publicacao.Identifier,
			&publicacao.Visibilidade, &publicacao.Notas, &publicacao.IDUsuario)
		if err != nil {
			http.Error(w, "Publicacao not found or does not belong to user", http.StatusNotFound)
			return
		}

		// Incrementa o número de visualizações
		_, err = tx.Exec(context.Background(), `UPDATE Publicacoes SET visualizacoes = visualizacoes + 1 WHERE identifier = $1 AND slug = $2`, identifier, slug)
		if err != nil {
			http.Error(w, "Failed to update visualizacoes", http.StatusInternalServerError)
			return
		}

		// Confirma a transação
		err = tx.Commit(context.Background())
		if err != nil {
			http.Error(w, "Failed to commit transaction", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(publicacao)
	}
}
