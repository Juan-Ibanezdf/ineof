package models

import (
	"time"
)

// Noticia representa a tabela de notícias no banco de dados
type Noticia struct {
	IDNoticia      *string    `json:"id_noticia"` // Usando *string para UUID
	Titulo         string     `json:"titulo"`
	Subtitulo      *string    `json:"subtitulo,omitempty"`
	DataPublicacao time.Time  `json:"data_publicacao"`
	NomeAutor      *string    `json:"nome_autor,omitempty"`
	ImagemNoticia  *string    `json:"imagem_noticia,omitempty"`
	Lead           *string    `json:"lead,omitempty"`
	Categoria      *string    `json:"categoria,omitempty"`
	DataRevisao    *time.Time `json:"data_revisao,omitempty"`
	NomeRevisor    *string    `json:"nome_revisor,omitempty"`
	Slug           *string    `json:"slug,omitempty"`       // Novo campo slug
	Identifier     *string    `json:"identifier,omitempty"` // Novo campo identifier
}
