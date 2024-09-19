package handlers

import (
	"api/internal/configs"
	"api/internal/models"
	"context"
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v4"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// NotificationsRouter configura as rotas para os handlers de notificações
func NotificationsRouter(db *pgxpool.Pool) http.Handler {
	r := chi.NewRouter()
	r.Post("/", CreateNotification(db))
	r.Get("/", GetAllNotifications(db))
	r.Get("/{id}", GetNotificationByID(db))
	r.Put("/{id}", UpdateNotification(db))
	r.Delete("/{id}", DeleteNotification(db))
	return r
}

// getUserRole obtém o nível de acesso e ID do usuário a partir dos claims do JWT
func getUserRole(r *http.Request) (string, string, error) {
	cookie, err := r.Cookie("token")
	if err != nil {
		log.Println("Erro ao obter cookie de token:", err)
		return "", "", err
	}

	tokenString := cookie.Value
	claims := &jwt.MapClaims{}

	// Use o segredo JWT de configs para verificar o token
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return configs.JwtSecret, nil
	})

	if err != nil {
		log.Println("Erro ao analisar token JWT:", err)
		return "", "", err
	}

	if !token.Valid {
		log.Println("Token JWT inválido")
		return "", "", err
	}

	// Extraindo o nível de acesso do usuário e o ID
	userLevel, ok := (*claims)["nivelAcesso"].(string)
	if !ok {
		log.Println("Erro ao extrair 'nivelAcesso' do token JWT")
		return "", "", nil
	}

	userID, ok := (*claims)["idUsuario"].(string)
	if !ok {
		log.Println("Erro ao extrair 'idUsuario' do token JWT")
		return "", "", nil
	}

	return userLevel, userID, nil
}

// CreateNotification cria uma nova notificação (apenas para Admin e superiores)
func CreateNotification(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var notificacao models.Notificacao
		if err := json.NewDecoder(r.Body).Decode(&notificacao); err != nil {
			http.Error(w, "Entrada inválida", http.StatusBadRequest)
			return
		}

		// Verifica se o ID do usuário está presente para notificações específicas
		if !notificacao.EnviadoParaTodos && notificacao.IDUsuario == nil {
			http.Error(w, "ID do usuário necessário para notificações específicas", http.StatusBadRequest)
			return
		}

		// Usar um contexto separado para a transação
		ctx := context.Background()
		tx, err := db.Begin(ctx)
		if err != nil {
			http.Error(w, "Falha ao iniciar transação: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer func() {
			if err != nil {
				_ = tx.Rollback(ctx)
			} else {
				_ = tx.Commit(ctx)
			}
		}()

		// Inserir a notificação na tabela Notificacoes
		err = tx.QueryRow(ctx, `
			INSERT INTO Notificacoes (titulo, mensagem, data_envio, id_noticia, tipo, id_usuario, enviado_para_todos) 
			VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_notificacao`,
			notificacao.Titulo, notificacao.Mensagem, notificacao.DataEnvio, notificacao.IDNoticia, notificacao.Tipo, notificacao.IDUsuario, notificacao.EnviadoParaTodos).Scan(&notificacao.IDNotificacao)
		if err != nil {
			http.Error(w, "Falha ao criar notificação: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Inserir na tabela NotificacoesUsuarios
		if notificacao.EnviadoParaTodos {
			// Buscar todos os IDs de usuários para inserir a notificação
			rows, err := tx.Query(ctx, "SELECT id_usuario FROM Usuarios")
			if err != nil {
				http.Error(w, "Falha ao buscar usuários: "+err.Error(), http.StatusInternalServerError)
				return
			}
			defer rows.Close()

			// Armazenar todos os IDs de usuários em uma lista
			var userIDs []string
			for rows.Next() {
				var userID string
				if err := rows.Scan(&userID); err != nil {
					http.Error(w, "Falha ao ler usuário: "+err.Error(), http.StatusInternalServerError)
					return
				}
				userIDs = append(userIDs, userID)
			}

			// Enviar a notificação para cada usuário na lista
			for _, userID := range userIDs {
				_, err := tx.Exec(ctx, `
					INSERT INTO NotificacoesUsuarios (id_notificacao, id_usuario, lida, oculta) 
					VALUES ($1, $2, false, false)`, notificacao.IDNotificacao, userID)
				if err != nil {
					http.Error(w, "Falha ao inserir notificação para usuário: "+err.Error(), http.StatusInternalServerError)
					return
				}
			}
		} else {
			// Inserir apenas para o usuário específico
			_, err := tx.Exec(ctx, `
				INSERT INTO NotificacoesUsuarios (id_notificacao, id_usuario, lida, oculta) 
				VALUES ($1, $2, false, false)`, notificacao.IDNotificacao, *notificacao.IDUsuario)
			if err != nil {
				http.Error(w, "Falha ao inserir notificação específica para o usuário: "+err.Error(), http.StatusInternalServerError)
				return
			}
		}

		w.WriteHeader(http.StatusCreated)
	}
}

// GetAllNotifications retorna todas as notificações ou as notificações do usuário dependendo do nível de acesso
func GetAllNotifications(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userLevel, userID, err := getUserRole(r)
		if err != nil {
			http.Error(w, "Erro ao obter nível de acesso", http.StatusUnauthorized)
			return
		}

		ctx := context.Background()
		var rows pgx.Rows
		if userLevel == "admin" || userLevel == "superadmin" {
			// Admin e Superadmin podem ver todas as notificações
			rows, err = db.Query(ctx, "SELECT * FROM Notificacoes")
		} else {
			// Outros usuários só podem ver notificações enviadas especificamente para eles ou globais
			rows, err = db.Query(ctx, "SELECT * FROM Notificacoes WHERE enviado_para_todos = true OR id_usuario = $1", userID)
		}

		if err != nil {
			http.Error(w, "Falha ao consultar notificações", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var notificacoes []models.Notificacao
		for rows.Next() {
			var notificacao models.Notificacao
			err := rows.Scan(&notificacao.IDNotificacao, &notificacao.Titulo, &notificacao.Mensagem, &notificacao.DataEnvio, &notificacao.IDNoticia, &notificacao.Tipo, &notificacao.IDUsuario, &notificacao.EnviadoParaTodos)
			if err != nil {
				http.Error(w, "Falha ao ler notificação", http.StatusInternalServerError)
				return
			}
			notificacoes = append(notificacoes, notificacao)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(notificacoes)
	}
}

// GetNotificationByID retorna uma notificação por ID, respeitando o nível de acesso do usuário
func GetNotificationByID(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")

		userLevel, userID, err := getUserRole(r)
		if err != nil {
			http.Error(w, "Erro ao obter nível de acesso", http.StatusUnauthorized)
			return
		}

		var notificacao models.Notificacao

		if userLevel == "admin" || userLevel == "superadmin" {
			// Admin e Superadmin podem visualizar qualquer notificação
			err = db.QueryRow(context.Background(), "SELECT * FROM Notificacoes WHERE id_notificacao = $1", id).Scan(
				&notificacao.IDNotificacao, &notificacao.Titulo, &notificacao.Mensagem, &notificacao.DataEnvio, &notificacao.IDNoticia, &notificacao.Tipo, &notificacao.IDUsuario, &notificacao.EnviadoParaTodos)
		} else {
			// Outros usuários só podem visualizar notificações que são para eles ou globais
			err = db.QueryRow(context.Background(), "SELECT * FROM Notificacoes WHERE id_notificacao = $1 AND (enviado_para_todos = true OR id_usuario = $2)", id, userID).Scan(
				&notificacao.IDNotificacao, &notificacao.Titulo, &notificacao.Mensagem, &notificacao.DataEnvio, &notificacao.IDNoticia, &notificacao.Tipo, &notificacao.IDUsuario, &notificacao.EnviadoParaTodos)
		}

		if err != nil {
			if err == pgx.ErrNoRows {
				http.Error(w, "Notificação não encontrada", http.StatusNotFound)
			} else {
				http.Error(w, "Falha ao consultar notificação", http.StatusInternalServerError)
			}
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(notificacao)
	}
}

// UpdateNotification atualiza uma notificação existente (apenas para Admin e superiores)
func UpdateNotification(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")

		var notificacao models.Notificacao
		if err := json.NewDecoder(r.Body).Decode(&notificacao); err != nil {
			http.Error(w, "Entrada inválida", http.StatusBadRequest)
			return
		}

		// Verifica se o ID do usuário está presente para notificações específicas
		if !notificacao.EnviadoParaTodos && notificacao.IDUsuario == nil {
			http.Error(w, "ID do usuário necessário para notificações específicas", http.StatusBadRequest)
			return
		}

		_, err := db.Exec(context.Background(), `
			UPDATE Notificacoes 
			SET titulo = $1, mensagem = $2, data_envio = $3, id_noticia = $4, tipo = $5, id_usuario = $6, enviado_para_todos = $7
			WHERE id_notificacao = $8`,
			notificacao.Titulo, notificacao.Mensagem, notificacao.DataEnvio, notificacao.IDNoticia, notificacao.Tipo, notificacao.IDUsuario, notificacao.EnviadoParaTodos, id)
		if err != nil {
			http.Error(w, "Falha ao atualizar notificação: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

// DeleteNotification deleta uma notificação, ou marca como oculta dependendo do nível de acesso
func DeleteNotification(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")

		userLevel, userID, err := getUserRole(r)
		if err != nil {
			http.Error(w, "Erro ao obter nível de acesso", http.StatusUnauthorized)
			return
		}

		if userLevel == "admin" || userLevel == "superadmin" {
			// Admin e Superadmin podem deletar notificações completamente
			_, err = db.Exec(context.Background(), "DELETE FROM Notificacoes WHERE id_notificacao = $1", id)
			if err != nil {
				http.Error(w, "Falha ao deletar notificação", http.StatusInternalServerError)
				return
			}
		} else {
			// Usuários normais apenas ocultam a notificação para eles
			_, err = db.Exec(context.Background(), "UPDATE NotificacoesUsuarios SET oculta = true WHERE id_notificacao = $1 AND id_usuario = $2", id, userID)
			if err != nil {
				http.Error(w, "Falha ao ocultar notificação", http.StatusInternalServerError)
				return
			}
		}

		w.WriteHeader(http.StatusOK)
	}
}
