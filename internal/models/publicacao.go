package models

import (
	"time"
)

// Publicacao representa uma publicação
type Publicacao struct {
	ID              string    `json:"id_publicacao"` // Alterado para string para UUID
	Titulo          string    `json:"titulo"`
	Subtitulo       *string   `json:"subtitulo"` // Novo campo Subtitulo
	PalavrasChave   *string   `json:"palavras_chave"`
	Banner          *string   `json:"banner"`
	Resumo          *string   `json:"resumo"`
	NomeDeUsuario   *string   `json:"nome_de_usuario"`
	Categoria       *string   `json:"categoria"`
	Autores         *string   `json:"autores"`
	Publicacoes     *string   `json:"publicacoes"`
	DataCriacao     time.Time `json:"data_criacao"`
	DataModificacao time.Time `json:"data_modificacao"`
	PDF             *[]byte   `json:"pdf"`
	Link            *string   `json:"link"`
	Visualizacoes   int       `json:"visualizacoes"`
	RevisadoPor     *string   `json:"revisado_por"`
	Slug            *string   `json:"slug"`       // Alterado para *string para UUID
	Identifier      *string   `json:"identifier"` // Alterado para *string para UUID
	Visibilidade    bool      `json:"visibilidade"`
	Notas           *string   `json:"notas"`
	IDUsuario       *string   `json:"id_usuario"` // Alterado para *string para UUID
}
