package models

import (
	"time"
)

// NotificacaoUsuario representa a tabela de controle de leitura de notificações no banco de dados
type NotificacaoUsuario struct {
	ID            string     `json:"id"`             // Alterado para string para UUID
	IDNotificacao string     `json:"id_notificacao"` // Alterado para string para UUID
	IDUsuario     string     `json:"id_usuario"`     // Alterado para string para UUID
	Lida          bool       `json:"lida"`
	DataLeitura   *time.Time `json:"data_leitura,omitempty"`
	Oculta        bool       `json:"oculta"` // Indica se a notificação foi oculta pelo usuário
}
