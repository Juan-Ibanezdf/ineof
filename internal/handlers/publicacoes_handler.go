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
	"github.com/golang-jwt/jwt"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lib/pq"
)

// PublicacoesRouter configura as rotas para os handlers de Publicacoes
func PublicacoesRouter(db *pgxpool.Pool) *chi.Mux {
	r := chi.NewRouter()
	r.Post("/", CreatePublicacao(db))
	r.Get("/{identifier}/{slug}", GetPublicacaoByIdentifierESlug(db)) // Atualizado
	r.Get("/filtro", GetPublicacoesComFiltro(db))                     // Nova rota para busca com filtro
	r.Put("/{id}", UpdatePublicacao(db))
	r.Delete("/{id}", DeletePublicacao(db))
	r.Get("/usuario", GetPublicacoesByUsuario(db))
	r.Get("/usuario/{identifier}/{slug}", GetPublicacaoByIdentifierESlugDoUsuario(db))
	// r.Get("/", GetPublicacoesSemFiltro(db))

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

		// Inicializa arrays vazios se palavras_chave e autores não estiverem definidos
		if publicacao.PalavrasChave == nil {
			publicacao.PalavrasChave = []string{}
		}
		if publicacao.Autores == nil {
			publicacao.Autores = []string{}
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

		// Atribui o idUsuario e o nomeDeUsuario ao objeto de publicação
		publicacao.IDUsuario = idUsuario
		publicacao.NomeDeUsuario = &nomeDeUsuario

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
			publicacao.PalavrasChave, // Agora um array []string
			publicacao.Banner,
			publicacao.Resumo,
			publicacao.NomeDeUsuario,
			publicacao.Categoria,
			publicacao.Autores, // Também um array []string
			publicacao.Publicacoes,
			publicacao.Link,
			publicacao.Visualizacoes,
			publicacao.RevisadoPor,
			publicacao.Slug,
			publicacao.Identifier,
			publicacao.Visibilidade,
			publicacao.Notas,
			publicacao.IDUsuario, // O ID do usuário deve ser o último valor, conforme a ordem das colunas
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

func UpdatePublicacao(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")

		log.Println("Recebendo requisição de atualização para a publicação com ID:", id)

		if id == "" {
			log.Println("Erro: ID da publicação não foi fornecido.")
			http.Error(w, "ID da publicação não pode ser vazio", http.StatusBadRequest)
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

		// Decodifica o JSON para a struct Publicacao
		var publicacao models.Publicacao
		if err := json.Unmarshal(body, &publicacao); err != nil {
			log.Println("Erro ao decodificar o corpo da requisição.", err)
			http.Error(w, "Erro ao decodificar o corpo da requisição", http.StatusBadRequest)
			return
		}

		log.Println("Dados de publicação decodificados:", publicacao)

		// Verifica se o título mudou, para gerar um novo slug se necessário
		var novoSlug string
		var tituloAntigo string

		// Busca o título atual da publicação no banco de dados
		err = db.QueryRow(context.Background(), "SELECT titulo FROM Publicacoes WHERE id_publicacao = $1", id).Scan(&tituloAntigo)
		if err != nil {
			log.Println("Erro ao buscar o título antigo da publicação:", err)
			http.Error(w, "Erro ao buscar a publicação", http.StatusInternalServerError)
			return
		}

		// Se o título mudou, gera um novo slug
		if publicacao.Titulo != tituloAntigo {
			novoSlug = utils.Slugify(publicacao.Titulo)
			publicacao.Slug = novoSlug
			log.Println("Título mudou. Novo slug gerado:", novoSlug)
		} else {
			novoSlug = publicacao.Slug // Mantém o slug existente
			log.Println("Título não mudou. Mantendo o slug atual:", novoSlug)
		}

		// Atualiza apenas os campos permitidos, evitando campos imutáveis
		query := `
            UPDATE Publicacoes 
            SET 
                titulo = COALESCE(NULLIF($1, ''), titulo),
                subtitulo = COALESCE(NULLIF($2, ''), subtitulo),
                palavras_chave = $3::text[],  -- Atualiza diretamente o array
                banner = COALESCE(NULLIF($4, ''), banner),
                resumo = COALESCE(NULLIF($5, ''), resumo),
                nome_de_usuario = COALESCE(NULLIF($6, ''), nome_de_usuario),
                categoria = COALESCE(NULLIF($7, ''), categoria),
                autores = $8::text[],  -- Atualiza diretamente o array
                publicacoes = COALESCE(NULLIF($9, ''), publicacoes),
                link = COALESCE(NULLIF($10, ''), link),
                visualizacoes = $11,
                slug = COALESCE(NULLIF($12, ''), slug),
                notas = COALESCE(NULLIF($13, ''), notas),
                data_modificacao = NOW()  -- Atualiza automaticamente a data de modificação
            WHERE id_publicacao = $14 AND id_usuario = $15
        `

		log.Println("Query de atualização preparada.")

		// Executar a query de atualização
		_, err = db.Exec(context.Background(),
			query,
			publicacao.Titulo,
			publicacao.Subtitulo,
			pq.Array(publicacao.PalavrasChave), // Salva as palavras-chave como array
			publicacao.Banner,
			publicacao.Resumo,
			publicacao.NomeDeUsuario,
			publicacao.Categoria,
			pq.Array(publicacao.Autores), // Salva os autores como array
			publicacao.Publicacoes,
			publicacao.Link,
			publicacao.Visualizacoes,
			novoSlug, // Usa o novo slug gerado, se o título mudou
			publicacao.Notas,
			id,        // ID da publicação
			idUsuario, // ID do usuário que criou a publicação (pego do token)
		)

		if err != nil {
			log.Println("Falha ao atualizar a publicação no banco de dados.", err)
			http.Error(w, "Falha ao atualizar a publicação", http.StatusInternalServerError)
			return
		}

		log.Println("Publicação com ID", id, "atualizada com sucesso.")

		// Retornar sucesso
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Publicação atualizada com sucesso"))
	}
}

// GetPublicacoesComFiltro busca publicações gerais com filtros e paginação
func GetPublicacoesComFiltro(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Obtenção dos parâmetros de busca e paginação
		searchTerm := r.URL.Query().Get("searchTerm")
		categoria := r.URL.Query().Get("categoria")
		palavrasChave := r.URL.Query().Get("palavras_chave")
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
            FROM Publicacoes
            WHERE 1=1`

		paramsCount := []interface{}{} // Parâmetros para contagem

		// Consulta base para as publicações com paginação
		query := `
            SELECT id_publicacao, titulo, subtitulo, palavras_chave, banner, resumo, nome_de_usuario, categoria, autores, 
            publicacoes, data_criacao, data_modificacao, link, visualizacoes, revisado_por, slug, 
            identifier, visibilidade, notas, id_usuario 
            FROM Publicacoes
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

		// Filtro por palavras-chave (usando unnest)
		if palavrasChave != "" {
			query += ` AND EXISTS (SELECT 1 FROM unnest(palavras_chave) AS pk WHERE pk ILIKE '%' || $` + strconv.Itoa(paramIndex) + ` || '%')`
			params = append(params, palavrasChave)
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
			query += ` AND EXTRACT(YEAR FROM data_criacao) BETWEEN $` + strconv.Itoa(paramIndex) + ` AND $` + strconv.Itoa(paramIndex+1)
			queryCount += ` AND EXTRACT(YEAR FROM data_criacao) BETWEEN $` + strconv.Itoa(paramIndex) + ` AND $` + strconv.Itoa(paramIndex+1)
			params = append(params, anoInicio, anoFim)
			paramsCount = append(paramsCount, anoInicio, anoFim)
			paramIndex += 2
		}

		// Adicionar ordenação e paginação à query
		query += ` ORDER BY data_criacao DESC LIMIT $` + strconv.Itoa(paramIndex) + ` OFFSET $` + strconv.Itoa(paramIndex+1)
		params = append(params, itensPorPagina, offset)

		// Executar a consulta para contar o total de publicações
		var totalPublicacoes int
		err := db.QueryRow(context.Background(), queryCount, paramsCount...).Scan(&totalPublicacoes)
		if err != nil {
			http.Error(w, "Erro ao contar publicações", http.StatusInternalServerError)
			log.Println("Erro ao contar publicações:", err)
			return
		}

		// Executar a consulta para buscar as publicações com filtros e paginação
		rows, err := db.Query(context.Background(), query, params...)
		if err != nil {
			http.Error(w, "Erro ao buscar publicações", http.StatusInternalServerError)
			log.Println("Erro ao buscar publicações:", err)
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
				http.Error(w, "Erro ao escanear publicações", http.StatusInternalServerError)
				log.Println("Erro ao escanear publicação:", err)
				return
			}
			publicacoes = append(publicacoes, publicacao)
		}

		// Retorna as publicações e o total em formato JSON
		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"total":       totalPublicacoes,
			"publicacoes": publicacoes,
		})
		if err != nil {
			http.Error(w, "Erro ao codificar resposta JSON", http.StatusInternalServerError)
			log.Println("Erro ao codificar resposta JSON:", err)
		}
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
			FROM Publicacoes 
			WHERE identifier = $1 AND slug = $2`, identifier, slug).Scan(
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
		_, err = tx.Exec(context.Background(), `
			UPDATE Publicacoes 
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

// GetPublicacoesByUsuario busca publicações de um usuário com filtros e paginação
func GetPublicacoesByUsuario(db *pgxpool.Pool) http.HandlerFunc {
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

		// Obtém o nome de usuário a partir das reivindicações do token
		nomeDeUsuario, ok := (*claims)["nomeDeUsuario"].(string)
		if !ok || nomeDeUsuario == "" {
			http.Error(w, "Nome de usuário não encontrado no token", http.StatusUnauthorized)
			log.Println("Nome de usuário não encontrado no token")
			return
		}

		// Obtenção dos parâmetros de busca e paginação
		searchTerm := r.URL.Query().Get("searchTerm")
		categoria := r.URL.Query().Get("categoria")
		palavrasChave := r.URL.Query().Get("palavras_chave")
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
            FROM Publicacoes
            WHERE nome_de_usuario = $1`

		paramsCount := []interface{}{nomeDeUsuario} // Parâmetro para contagem

		// Consulta base para as publicações com paginação
		query := `
            SELECT id_publicacao, titulo, subtitulo, palavras_chave, banner, resumo, nome_de_usuario, categoria, autores, 
            publicacoes, data_criacao, data_modificacao, link, visualizacoes, revisado_por, slug, 
            identifier, visibilidade, notas, id_usuario 
            FROM Publicacoes
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

		// Filtro por palavras-chave (usando unnest)
		if palavrasChave != "" {
			query += ` AND EXISTS (SELECT 1 FROM unnest(palavras_chave) AS pk WHERE pk ILIKE '%' || $` + strconv.Itoa(paramIndex) + ` || '%')`
			params = append(params, palavrasChave)
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
			query += ` AND EXTRACT(YEAR FROM data_criacao) BETWEEN $` + strconv.Itoa(paramIndex) + ` AND $` + strconv.Itoa(paramIndex+1)
			queryCount += ` AND EXTRACT(YEAR FROM data_criacao) BETWEEN $` + strconv.Itoa(paramIndex) + ` AND $` + strconv.Itoa(paramIndex+1)
			params = append(params, anoInicio, anoFim)
			paramsCount = append(paramsCount, anoInicio, anoFim)
			paramIndex += 2
		}

		// Adicionar ordenação e paginação à query
		query += ` ORDER BY data_criacao DESC LIMIT $` + strconv.Itoa(paramIndex) + ` OFFSET $` + strconv.Itoa(paramIndex+1)
		params = append(params, itensPorPagina, offset)

		// Executar a consulta para contar o total de publicações
		var totalPublicacoes int
		err = db.QueryRow(context.Background(), queryCount, paramsCount...).Scan(&totalPublicacoes)
		if err != nil {
			http.Error(w, "Erro ao contar publicações", http.StatusInternalServerError)
			log.Println("Erro ao contar publicações:", err)
			return
		}

		// Executar a consulta para buscar as publicações com filtros e paginação
		rows, err := db.Query(context.Background(), query, params...)
		if err != nil {
			http.Error(w, "Erro ao buscar publicações", http.StatusInternalServerError)
			log.Println("Erro ao buscar publicações:", err)
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
				http.Error(w, "Erro ao escanear publicações", http.StatusInternalServerError)
				log.Println("Erro ao escanear publicação:", err)
				return
			}
			publicacoes = append(publicacoes, publicacao)
		}

		// Retorna as publicações e o total em formato JSON
		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"total":       totalPublicacoes,
			"publicacoes": publicacoes,
		})
		if err != nil {
			http.Error(w, "Erro ao codificar resposta JSON", http.StatusInternalServerError)
			log.Println("Erro ao codificar resposta JSON:", err)
		}
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
			http.Error(w, "ID de usuário não encontrado no token", http.StatusUnauthorized)
			return
		}

		// Busca a publicação que pertence ao usuário autenticado
		var publicacao models.Publicacao
		err = db.QueryRow(context.Background(), `
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
			http.Error(w, "Publicacao não encontrada ou não pertence ao usuário", http.StatusNotFound)
			return
		}

		// Envia a publicação como resposta JSON
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(publicacao)
	}
}
