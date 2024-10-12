package models

import (
	"time"
)

// Noticia representa a tabela de notícias no banco de dados
type Noticia struct {
	IDNoticia      string     `json:"id_noticia"`               // UUID da notícia
	Titulo         string     `json:"titulo"`                   // Título da notícia
	Subtitulo      *string    `json:"subtitulo,omitempty"`      // Subtítulo opcional
	DataPublicacao time.Time  `json:"data_publicacao"`          // Data de publicação da notícia
	Autores        []string   `json:"autores,omitempty"`        // Lista de autores da notícia (obrigatório)
	NomeDeUsuario  string     `json:"nome_de_usuario"`          // Nome do usuário que criou a notícia
	ImagemNoticia  *string    `json:"imagem_noticia,omitempty"` // URL da imagem, opcional
	Lead           *string    `json:"lead,omitempty"`           // Introdução ou resumo, opcional
	Categoria      *string    `json:"categoria,omitempty"`      // Categoria, opcional
	Tags           []string   `json:"tags,omitempty"`           // Array de tags (palavras-chave)
	DataRevisao    *time.Time `json:"data_revisao,omitempty"`   // Data de revisão, opcional
	NomeRevisor    *string    `json:"nome_revisor,omitempty"`   // Nome do revisor, opcional
	Slug           string     `json:"slug"`                     // Slug gerado a partir do título, obrigatório
	Identifier     string     `json:"identifier"`               // Identificador único adicional, gerado automaticamente
	Status         string     `json:"status"`                   // Status da notícia (ex: 'publicada', 'rascunho')
	Visualizacoes  int        `json:"visualizacoes"`            // Contagem de visualizações
	Conteudo       *string    `json:"conteudo,omitempty"`       // Conteúdo completo da notícia, opcional
	CreatedAt      time.Time  `json:"created_at"`               // Data de criação do registro
	UpdatedAt      time.Time  `json:"updated_at"`               // Data de última atualização do registro
	Visibilidade   bool       `json:"visibilidade"`             // Visibilidade da notícia
	IDUsuario      string     `json:"id_usuario"`               // ID do usuário que criou a notícia (chave estrangeira)
}
