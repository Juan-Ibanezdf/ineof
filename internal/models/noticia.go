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
	NomeAutor      *string    `json:"nome_autor,omitempty"`     // Nome do autor, opcional
	ImagemNoticia  *string    `json:"imagem_noticia,omitempty"` // URL da imagem, opcional
	Lead           *string    `json:"lead,omitempty"`           // Introdução ou resumo, opcional
	Categoria      *string    `json:"categoria,omitempty"`      // Categoria, opcional
	DataRevisao    *time.Time `json:"data_revisao,omitempty"`   // Data de revisão, opcional
	NomeRevisor    *string    `json:"nome_revisor,omitempty"`   // Nome do revisor, opcional
	Slug           string     `json:"slug"`                     // Slug gerado a partir do título, obrigatório
	Identifier     string     `json:"identifier"`               // Identificador único adicional
}
