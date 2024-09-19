// models/notificacao.go

package models

import (
	"time"
)

// Notificacao representa a tabela de notificações no banco de dados
type Notificacao struct {
	IDNotificacao    string    `json:"id_notificacao"`       // UUID da notificação
	Titulo           string    `json:"titulo"`               // Título da notificação
	Mensagem         string    `json:"mensagem"`             // Mensagem da notificação
	DataEnvio        time.Time `json:"data_envio"`           // Data de envio da notificação
	IDNoticia        *string   `json:"id_noticia,omitempty"` // UUID da notícia associada, se houver
	Tipo             string    `json:"tipo"`                 // Tipo de notificação
	IDUsuario        *string   `json:"id_usuario,omitempty"` // UUID do usuário, se a notificação for específica
	EnviadoParaTodos bool      `json:"enviado_para_todos"`   // Indica se a notificação foi enviada para todos os usuários
}
