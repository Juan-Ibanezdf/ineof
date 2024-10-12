package handlers

import (
	"api/internal/configs"
	"api/internal/models"
	"api/internal/utils"
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v4"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lib/pq"
)

// NoticiasRouter configura as rotas para os handlers de notícias
func NoticiasRouter(db *pgxpool.Pool) http.Handler {
	r := chi.NewRouter()
	r.Post("/", CreateNoticia(db))
	r.Get("/", GetNoticiasComFiltro(db))
	r.Get("/{identifier}/{slug}", GetNoticiaByIdentifierESlug(db))
	r.Put("/{id}", UpdateNoticia(db))
	r.Delete("/{id}", DeleteNoticia(db))

	r.Get("/usuario/filtro", GetNoticiasByUsuario(db))
	r.Get("/usuario/{identifier}/{slug}", GetNoticiaByIdentifierESlugDoUsuario(db))
	return r
}

// CreateNoticia cria uma nova notícia
func CreateNoticia(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var noticia models.Noticia
		// Tenta decodificar a requisição JSON para a struct Noticia
		if err := json.NewDecoder(r.Body).Decode(&noticia); err != nil {
			log.Println("Erro ao decodificar a notícia:", err) // Log do erro
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		// Inicializa arrays vazios se tags e autores não estiverem definidos
		if noticia.Tags == nil {
			noticia.Tags = []string{}
		}
		if noticia.Autores == nil {
			noticia.Autores = []string{}
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

		// Obtém o nome do usuário a partir das reivindicações do token
		nomeDeUsuario, ok := (*claims)["nomeDeUsuario"].(string)
		if !ok || nomeDeUsuario == "" {
			log.Println("Nome de usuário não encontrado no token") // Log do erro
			http.Error(w, "User name not found in token", http.StatusUnauthorized)
			return
		}

		// Atribui o idUsuario e o nomeDeUsuario ao objeto de notícia
		noticia.IDUsuario = idUsuario
		noticia.NomeDeUsuario = nomeDeUsuario

		// Gera automaticamente o slug usando o título da notícia
		slug := utils.Slugify(noticia.Titulo)
		noticia.Slug = slug

		// Gera automaticamente um identifier único
		identifier := utils.MakeID(10)
		noticia.Identifier = identifier

		// Insere a nova notícia no banco de dados
		_, err = db.Exec(context.Background(), `
			INSERT INTO Noticias (
				id_noticia, titulo, subtitulo, autores, nome_de_usuario, imagem_noticia, lead, categoria, 
				tags, data_publicacao, data_revisao, nome_revisor, slug, identifier, status, visualizacoes, 
				conteudo, created_at, updated_at, visibilidade, id_usuario) 
			VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10, $11, $12, $13, $14, $15, NOW(), NOW(), $16, $17)`,
			noticia.Titulo,
			noticia.Subtitulo,
			noticia.Autores, // Agora um array []string
			noticia.NomeDeUsuario,
			noticia.ImagemNoticia,
			noticia.Lead,
			noticia.Categoria,
			noticia.Tags, // Também um array []string
			noticia.DataRevisao,
			noticia.NomeRevisor,
			noticia.Slug,
			noticia.Identifier,
			noticia.Status,
			noticia.Visualizacoes,
			noticia.Conteudo,
			noticia.Visibilidade,
			noticia.IDUsuario, // O ID do usuário deve ser o último valor, conforme a ordem das colunas
		)
		if err != nil {
			log.Println("Falha ao criar notícia no banco de dados:", err) // Log do erro
			http.Error(w, "Failed to create noticia: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		log.Println("Notícia criada com sucesso:", noticia.Titulo) // Log de sucesso
	}
}

// UpdateNoticia atualiza uma notícia existente
func UpdateNoticia(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")

		log.Println("Recebendo requisição de atualização para a notícia com ID:", id)

		if id == "" {
			log.Println("Erro: ID da notícia não foi fornecido.")
			http.Error(w, "ID da notícia não pode ser vazio", http.StatusBadRequest)
			return
		}

		// Extrai o token do cookie
		cookie, err := r.Cookie("token")
		if err != nil {
			log.Println("Erro: Token não encontrado.", err)
			http.Error(w, "Token não encontrado", http.StatusUnauthorized)
			return
		}

		log.Println("Token recebido do cookie.")

		// Valida e decodifica o token JWT
		claims := &jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(cookie.Value, claims, func(token *jwt.Token) (interface{}, error) {
			return configs.JwtSecret, nil
		})
		if err != nil || !token.Valid {
			log.Println("Erro: Token inválido.", err)
			http.Error(w, "Token inválido", http.StatusUnauthorized)
			return
		}

		log.Println("Token JWT validado com sucesso.")

		// Obtém o idUsuario a partir do token JWT
		idUsuario, ok := (*claims)["idUsuario"].(string)
		if !ok || idUsuario == "" {
			log.Println("Erro: ID de usuário não encontrado no token.")
			http.Error(w, "ID de usuário não encontrado no token", http.StatusUnauthorized)
			return
		}

		log.Println("ID do usuário autenticado:", idUsuario)

		// Lê o corpo da requisição
		body, err := io.ReadAll(r.Body)
		if err != nil {
			log.Println("Erro ao ler o corpo da requisição.", err)
			http.Error(w, "Erro ao ler o corpo da requisição", http.StatusInternalServerError)
			return
		}

		log.Println("Corpo da requisição recebido:", string(body))

		// Decodifica o JSON para a struct Noticia
		var noticia models.Noticia
		if err := json.Unmarshal(body, &noticia); err != nil {
			log.Println("Erro ao decodificar o corpo da requisição.", err)
			http.Error(w, "Erro ao decodificar o corpo da requisição", http.StatusBadRequest)
			return
		}

		log.Println("Dados de notícia decodificados:", noticia)

		// Verifica se o título mudou, para gerar um novo slug se necessário
		var novoSlug string
		var tituloAntigo string

		// Busca o título atual da notícia no banco de dados
		err = db.QueryRow(context.Background(), "SELECT titulo FROM Noticias WHERE id_noticia = $1", id).Scan(&tituloAntigo)
		if err != nil {
			log.Println("Erro ao buscar o título antigo da notícia:", err)
			http.Error(w, "Erro ao buscar a notícia", http.StatusInternalServerError)
			return
		}

		// Se o título mudou, gera um novo slug
		if noticia.Titulo != tituloAntigo {
			novoSlug = utils.Slugify(noticia.Titulo)
			noticia.Slug = novoSlug
			log.Println("Título mudou. Novo slug gerado:", novoSlug)
		} else {
			novoSlug = noticia.Slug // Mantém o slug existente
			log.Println("Título não mudou. Mantendo o slug atual:", novoSlug)
		}

		// Atualiza apenas os campos permitidos, evitando campos imutáveis
		query := `
            UPDATE Noticias 
            SET 
                titulo = COALESCE(NULLIF($1, ''), titulo),
                subtitulo = COALESCE(NULLIF($2, ''), subtitulo),
                autores = $3::text[],  -- Atualiza diretamente o array
                nome_de_usuario = COALESCE(NULLIF($4, ''), nome_de_usuario),
                imagem_noticia = COALESCE(NULLIF($5, ''), imagem_noticia),
                lead = COALESCE(NULLIF($6, ''), lead),
                categoria = COALESCE(NULLIF($7, ''), categoria),
                tags = $8::text[],  -- Atualiza diretamente o array
                data_revisao = $9,
                nome_revisor = COALESCE(NULLIF($10, ''), nome_revisor),
                slug = COALESCE(NULLIF($11, ''), slug),
                status = COALESCE(NULLIF($12, ''), status),
                visualizacoes = $13,
                conteudo = COALESCE(NULLIF($14, ''), conteudo),
                data_modificacao = NOW(),  -- Atualiza automaticamente a data de modificação
                visibilidade = $15
            WHERE id_noticia = $16 AND id_usuario = $17
        `

		log.Println("Query de atualização preparada.")

		// Executar a query de atualização
		_, err = db.Exec(context.Background(),
			query,
			noticia.Titulo,
			noticia.Subtitulo,
			pq.Array(noticia.Autores), // Salva os autores como array
			noticia.NomeDeUsuario,
			noticia.ImagemNoticia,
			noticia.Lead,
			noticia.Categoria,
			pq.Array(noticia.Tags), // Salva as tags como array
			noticia.DataRevisao,
			noticia.NomeRevisor,
			novoSlug, // Usa o novo slug gerado, se o título mudou
			noticia.Status,
			noticia.Visualizacoes,
			noticia.Conteudo,
			noticia.Visibilidade,
			id,        // ID da notícia
			idUsuario, // ID do usuário que criou a notícia (pego do token)
		)

		if err != nil {
			log.Println("Falha ao atualizar a notícia no banco de dados.", err)
			http.Error(w, "Falha ao atualizar a notícia", http.StatusInternalServerError)
			return
		}

		log.Println("Notícia com ID", id, "atualizada com sucesso.")

		// Retornar sucesso
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Notícia atualizada com sucesso"))
	}
}

// GetNoticiasComFiltro busca notícias gerais com filtros e paginação
func GetNoticiasComFiltro(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Obtenção dos parâmetros de busca e paginação
		searchTerm := r.URL.Query().Get("searchTerm")
		categoria := r.URL.Query().Get("categoria")
		tags := r.URL.Query().Get("tags")
		autores := r.URL.Query().Get("autores")
		anoInicio := r.URL.Query().Get("ano_inicio")
		anoFim := r.URL.Query().Get("ano_fim")
		paginaStr := r.URL.Query().Get("pagina")
		itensPorPaginaStr := r.URL.Query().Get("itens_por_pagina")

		// Valores padrão para paginação
		pagina := 1
		itensPorPagina := 8
		if paginaStr != "" {
			pagina, _ = strconv.Atoi(paginaStr)
		}
		if itensPorPaginaStr != "" {
			itensPorPagina, _ = strconv.Atoi(itensPorPaginaStr)
		}

		offset := (pagina - 1) * itensPorPagina

		// Construir a consulta SQL dinamicamente com base nos parâmetros para contagem total
		queryCount := `
            SELECT COUNT(*)
            FROM Noticias
            WHERE 1=1`

		paramsCount := []interface{}{} // Parâmetros para contagem

		// Consulta base para as notícias com paginação
		query := `
            SELECT id_noticia, titulo, subtitulo, autores, nome_de_usuario, imagem_noticia, lead, categoria, 
            tags, data_publicacao, data_revisao, nome_revisor, slug, identifier, status, visualizacoes, 
            conteudo, created_at, updated_at, visibilidade, id_usuario 
            FROM Noticias
            WHERE 1=1`

		params := []interface{}{} // Parâmetros para busca
		paramIndex := 1

		// Filtros opcionais
		if searchTerm != "" {
			query += ` AND (titulo ILIKE '%' || $` + strconv.Itoa(paramIndex) + ` || '%' OR categoria ILIKE '%' || $` + strconv.Itoa(paramIndex) + ` || '%')`
			queryCount += ` AND (titulo ILIKE '%' || $` + strconv.Itoa(paramIndex) + ` || '%' OR categoria ILIKE '%' || $` + strconv.Itoa(paramIndex) + ` || '%')`
			params = append(params, searchTerm)
			paramsCount = append(paramsCount, searchTerm)
			paramIndex++
		}

		if categoria != "" {
			query += ` AND categoria ILIKE '%' || $` + strconv.Itoa(paramIndex) + ` || '%'`
			queryCount += ` AND categoria ILIKE '%' || $` + strconv.Itoa(paramIndex) + ` || '%'`
			params = append(params, categoria)
			paramsCount = append(paramsCount, categoria)
			paramIndex++
		}

		// Filtro por tags (usando unnest)
		if tags != "" {
			query += ` AND EXISTS (SELECT 1 FROM unnest(tags) AS tag WHERE tag ILIKE '%' || $` + strconv.Itoa(paramIndex) + ` || '%')`
			params = append(params, tags)
			paramIndex++
		}

		// Filtro por autores (usando unnest)
		if autores != "" {
			query += ` AND EXISTS (SELECT 1 FROM unnest(autores) AS autor WHERE autor ILIKE '%' || $` + strconv.Itoa(paramIndex) + ` || '%')`
			params = append(params, autores)
			paramIndex++
		}

		// Filtro por intervalo de datas (Ano Início e Ano Fim)
		if anoInicio != "" && anoFim != "" {
			query += ` AND EXTRACT(YEAR FROM data_publicacao) BETWEEN $` + strconv.Itoa(paramIndex) + ` AND $` + strconv.Itoa(paramIndex+1)
			queryCount += ` AND EXTRACT(YEAR FROM data_publicacao) BETWEEN $` + strconv.Itoa(paramIndex) + ` AND $` + strconv.Itoa(paramIndex+1)
			params = append(params, anoInicio, anoFim)
			paramsCount = append(paramsCount, anoInicio, anoFim)
			paramIndex += 2
		}

		// Adicionar ordenação e paginação à query
		query += ` ORDER BY data_publicacao DESC LIMIT $` + strconv.Itoa(paramIndex) + ` OFFSET $` + strconv.Itoa(paramIndex+1)
		params = append(params, itensPorPagina, offset)

		// Executar a consulta para contar o total de notícias
		var totalNoticias int
		err := db.QueryRow(context.Background(), queryCount, paramsCount...).Scan(&totalNoticias)
		if err != nil {
			http.Error(w, "Erro ao contar notícias", http.StatusInternalServerError)
			log.Println("Erro ao contar notícias:", err)
			return
		}

		// Executar a consulta para buscar as notícias com filtros e paginação
		rows, err := db.Query(context.Background(), query, params...)
		if err != nil {
			http.Error(w, "Erro ao buscar notícias", http.StatusInternalServerError)
			log.Println("Erro ao buscar notícias:", err)
			return
		}
		defer rows.Close()

		// Preencher a lista de notícias com os resultados da query
		var noticias []models.Noticia
		for rows.Next() {
			var noticia models.Noticia
			err := rows.Scan(
				&noticia.IDNoticia, &noticia.Titulo, &noticia.Subtitulo, &noticia.Autores, &noticia.NomeDeUsuario,
				&noticia.ImagemNoticia, &noticia.Lead, &noticia.Categoria, &noticia.Tags, &noticia.DataPublicacao,
				&noticia.DataRevisao, &noticia.NomeRevisor, &noticia.Slug, &noticia.Identifier, &noticia.Status,
				&noticia.Visualizacoes, &noticia.Conteudo, &noticia.CreatedAt, &noticia.UpdatedAt,
				&noticia.Visibilidade, &noticia.IDUsuario)
			if err != nil {
				http.Error(w, "Erro ao escanear notícias", http.StatusInternalServerError)
				log.Println("Erro ao escanear notícia:", err)
				return
			}
			noticias = append(noticias, noticia)
		}

		// Retorna as notícias e o total em formato JSON
		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"total":    totalNoticias,
			"noticias": noticias,
		})
		if err != nil {
			http.Error(w, "Erro ao codificar resposta JSON", http.StatusInternalServerError)
			log.Println("Erro ao codificar resposta JSON:", err)
		}
	}
}

// GetNoticiaByIdentifierESlug retorna uma notícia pelo identifier e slug e incrementa as visualizações
func GetNoticiaByIdentifierESlug(db *pgxpool.Pool) http.HandlerFunc {
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

		var noticia models.Noticia
		err = tx.QueryRow(context.Background(), `
			SELECT id_noticia, titulo, subtitulo, autores, nome_de_usuario, imagem_noticia, lead, categoria, 
			tags, data_publicacao, data_revisao, nome_revisor, slug, identifier, status, visualizacoes, 
			conteudo, created_at, updated_at, visibilidade, id_usuario 
			FROM Noticias 
			WHERE identifier = $1 AND slug = $2`, identifier, slug).Scan(
			&noticia.IDNoticia, &noticia.Titulo, &noticia.Subtitulo, &noticia.Autores, &noticia.NomeDeUsuario,
			&noticia.ImagemNoticia, &noticia.Lead, &noticia.Categoria, &noticia.Tags, &noticia.DataPublicacao,
			&noticia.DataRevisao, &noticia.NomeRevisor, &noticia.Slug, &noticia.Identifier, &noticia.Status,
			&noticia.Visualizacoes, &noticia.Conteudo, &noticia.CreatedAt, &noticia.UpdatedAt,
			&noticia.Visibilidade, &noticia.IDUsuario)
		if err != nil {
			http.Error(w, "Notícia não encontrada", http.StatusNotFound)
			return
		}

		// Incrementa o número de visualizações
		_, err = tx.Exec(context.Background(), `
			UPDATE Noticias 
			SET visualizacoes = visualizacoes + 1 
			WHERE identifier = $1 AND slug = $2`, identifier, slug)
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
		json.NewEncoder(w).Encode(noticia)
	}
}

// DeleteNoticia deleta uma notícia
func DeleteNoticia(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		_, err := db.Exec(context.Background(), "DELETE FROM Noticias WHERE id_noticia = $1", id)
		if err != nil {
			http.Error(w, "Failed to delete noticia", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

// GetNoticiasByUsuario busca notícias de um usuário com filtros e paginação
func GetNoticiasByUsuario(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Extrai o token do cookie
		cookie, err := r.Cookie("token")
		if err != nil {
			http.Error(w, "Token não encontrado", http.StatusUnauthorized)
			log.Println("Token não encontrado:", err)
			return
		}

		// Valida e decodifica o token JWT usando o segredo JWT
		claims := &jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(cookie.Value, claims, func(token *jwt.Token) (interface{}, error) {
			return configs.JwtSecret, nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Token inválido: "+err.Error(), http.StatusUnauthorized)
			log.Println("Token inválido:", err)
			return
		}

		// Verificação do nomeDeUsuario no token
		nomeDeUsuario, ok := (*claims)["nomeDeUsuario"].(string)
		if !ok || nomeDeUsuario == "" {
			log.Println("Nome de usuário não encontrado no token:", claims)
			http.Error(w, "Nome de usuário não encontrado no token", http.StatusUnauthorized)
			return
		}
		log.Println("Nome de usuário extraído do token:", nomeDeUsuario)

		// Obtenção dos parâmetros de busca e paginação
		searchTerm := r.URL.Query().Get("searchTerm")
		categoria := r.URL.Query().Get("categoria")
		tags := r.URL.Query().Get("tags")
		autores := r.URL.Query().Get("autores")
		anoInicio := r.URL.Query().Get("ano_inicio")
		anoFim := r.URL.Query().Get("ano_fim")
		paginaStr := r.URL.Query().Get("pagina")
		itensPorPaginaStr := r.URL.Query().Get("itens_por_pagina")

		// Valores padrão para paginação
		pagina := 1
		itensPorPagina := 8
		if paginaStr != "" {
			pagina, _ = strconv.Atoi(paginaStr)
		}
		if itensPorPaginaStr != "" {
			itensPorPagina, _ = strconv.Atoi(itensPorPaginaStr)
		}

		offset := (pagina - 1) * itensPorPagina

		// Construir a consulta SQL dinamicamente com base nos parâmetros para contagem total
		queryCount := `
            SELECT COUNT(*)
            FROM Noticias
            WHERE nome_de_usuario = $1`

		paramsCount := []interface{}{nomeDeUsuario} // Parâmetro para contagem

		// Consulta base para as notícias com paginação
		query := `
            SELECT id_noticia, titulo, subtitulo, autores, nome_de_usuario, imagem_noticia, lead, categoria, 
            tags, data_publicacao, data_revisao, nome_revisor, slug, identifier, status, visualizacoes, 
            conteudo, created_at, updated_at, visibilidade, id_usuario 
            FROM Noticias
            WHERE nome_de_usuario = $1`

		params := []interface{}{nomeDeUsuario} // Parâmetro para busca
		paramIndex := 2

		// Filtros opcionais
		if searchTerm != "" {
			query += ` AND (titulo ILIKE '%' || $` + strconv.Itoa(paramIndex) + ` || '%' OR categoria ILIKE '%' || $` + strconv.Itoa(paramIndex) + ` || '%')`
			queryCount += ` AND (titulo ILIKE '%' || $` + strconv.Itoa(paramIndex) + ` || '%' OR categoria ILIKE '%' || $` + strconv.Itoa(paramIndex) + ` || '%')`
			params = append(params, searchTerm)
			paramsCount = append(paramsCount, searchTerm)
			paramIndex++
		}

		if categoria != "" {
			query += ` AND categoria ILIKE '%' || $` + strconv.Itoa(paramIndex) + ` || '%'`
			queryCount += ` AND categoria ILIKE '%' || $` + strconv.Itoa(paramIndex) + ` || '%'`
			params = append(params, categoria)
			paramsCount = append(paramsCount, categoria)
			paramIndex++
		}

		// Filtro por tags (usando unnest)
		if tags != "" {
			query += ` AND EXISTS (SELECT 1 FROM unnest(tags) AS tag WHERE tag ILIKE '%' || $` + strconv.Itoa(paramIndex) + ` || '%')`
			params = append(params, tags)
			paramIndex++
		}

		// Filtro por autores (usando unnest)
		if autores != "" {
			query += ` AND EXISTS (SELECT 1 FROM unnest(autores) AS autor WHERE autor ILIKE '%' || $` + strconv.Itoa(paramIndex) + ` || '%')`
			params = append(params, autores)
			paramIndex++
		}

		// Filtro por intervalo de datas (Ano Início e Ano Fim)
		if anoInicio != "" && anoFim != "" {
			query += ` AND EXTRACT(YEAR FROM data_publicacao) BETWEEN $` + strconv.Itoa(paramIndex) + ` AND $` + strconv.Itoa(paramIndex+1)
			queryCount += ` AND EXTRACT(YEAR FROM data_publicacao) BETWEEN $` + strconv.Itoa(paramIndex) + ` AND $` + strconv.Itoa(paramIndex+1)
			params = append(params, anoInicio, anoFim)
			paramsCount = append(paramsCount, anoInicio, anoFim)
			paramIndex += 2
		}

		// Adicionar ordenação e paginação à query
		query += ` ORDER BY data_publicacao DESC LIMIT $` + strconv.Itoa(paramIndex) + ` OFFSET $` + strconv.Itoa(paramIndex+1)
		params = append(params, itensPorPagina, offset)

		// Executar a consulta para contar o total de notícias
		var totalNoticias int
		err = db.QueryRow(context.Background(), queryCount, paramsCount...).Scan(&totalNoticias)
		if err != nil {
			http.Error(w, "Erro ao contar notícias", http.StatusInternalServerError)
			log.Println("Erro ao contar notícias:", err)
			return
		}

		// Executar a consulta para buscar as notícias com filtros e paginação
		rows, err := db.Query(context.Background(), query, params...)
		if err != nil {
			http.Error(w, "Erro ao buscar notícias", http.StatusInternalServerError)
			log.Println("Erro ao buscar notícias:", err)
			return
		}
		defer rows.Close()

		// Preencher a lista de notícias com os resultados da query
		var noticias []models.Noticia
		for rows.Next() {
			var noticia models.Noticia
			err := rows.Scan(
				&noticia.IDNoticia, &noticia.Titulo, &noticia.Subtitulo, &noticia.Autores, &noticia.NomeDeUsuario,
				&noticia.ImagemNoticia, &noticia.Lead, &noticia.Categoria, &noticia.Tags, &noticia.DataPublicacao,
				&noticia.DataRevisao, &noticia.NomeRevisor, &noticia.Slug, &noticia.Identifier, &noticia.Status,
				&noticia.Visualizacoes, &noticia.Conteudo, &noticia.CreatedAt, &noticia.UpdatedAt,
				&noticia.Visibilidade, &noticia.IDUsuario)
			if err != nil {
				http.Error(w, "Erro ao escanear notícias", http.StatusInternalServerError)
				log.Println("Erro ao escanear notícia:", err)
				return
			}
			noticias = append(noticias, noticia)
		}

		// Retorna as notícias e o total em formato JSON
		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"total":    totalNoticias,
			"noticias": noticias,
		})
		if err != nil {
			http.Error(w, "Erro ao codificar resposta JSON", http.StatusInternalServerError)
			log.Println("Erro ao codificar resposta JSON:", err)
		}
	}
}

// GetNoticiaByIdentifierESlugDoUsuario retorna uma notícia pelo identifier e slug se pertencer ao usuário autenticado
func GetNoticiaByIdentifierESlugDoUsuario(db *pgxpool.Pool) http.HandlerFunc {
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
			http.Error(w, "ID de usuário não encontrado no token", http.StatusUnauthorized)
			return
		}

		// Busca a notícia que pertence ao usuário autenticado
		var noticia models.Noticia
		err = db.QueryRow(context.Background(), `
            SELECT id_noticia, titulo, subtitulo, autores, nome_de_usuario, imagem_noticia, lead, categoria, 
            tags, data_publicacao, data_revisao, nome_revisor, slug, identifier, status, visualizacoes, 
            conteudo, created_at, updated_at, visibilidade, id_usuario 
            FROM Noticias 
            WHERE identifier = $1 AND slug = $2 AND id_usuario = $3`, identifier, slug, idUsuario).Scan(
			&noticia.IDNoticia, &noticia.Titulo, &noticia.Subtitulo, &noticia.Autores, &noticia.NomeDeUsuario,
			&noticia.ImagemNoticia, &noticia.Lead, &noticia.Categoria, &noticia.Tags, &noticia.DataPublicacao,
			&noticia.DataRevisao, &noticia.NomeRevisor, &noticia.Slug, &noticia.Identifier, &noticia.Status,
			&noticia.Visualizacoes, &noticia.Conteudo, &noticia.CreatedAt, &noticia.UpdatedAt,
			&noticia.Visibilidade, &noticia.IDUsuario)
		if err != nil {
			http.Error(w, "Notícia não encontrada ou não pertence ao usuário", http.StatusNotFound)
			return
		}

		// Envia a notícia como resposta JSON
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(noticia)
	}
}
