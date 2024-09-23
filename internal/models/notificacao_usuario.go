package models

import (
	"time"
)

// NotificacaoUsuario representa a tabela de controle de leitura de notificações no banco de dados
type NotificacaoUsuario struct {
	ID            string     `json:"id"`                     // UUID do registro de notificação-usuário
	IDNotificacao string     `json:"id_notificacao"`         // UUID da notificação
	IDUsuario     string     `json:"id_usuario"`             // UUID do usuário
	Lida          bool       `json:"lida"`                   // Indica se a notificação foi lida
	DataLeitura   *time.Time `json:"data_leitura,omitempty"` // Data de leitura, opcional
	Oculta        bool       `json:"oculta"`                 // Indica se a notificação foi oculta pelo usuário
}
