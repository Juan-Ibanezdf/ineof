package models

import (
	"time"
)

// Publicacao representa uma publicação
type Publicacao struct {
	ID              string    `json:"id_publicacao"`
	Titulo          string    `json:"titulo"`
	Subtitulo       *string   `json:"subtitulo,omitempty"`
	PalavrasChave   []string  `json:"palavras_chave,omitempty"` // Atualize para camelCase
	Banner          *string   `json:"banner,omitempty"`
	Resumo          *string   `json:"resumo,omitempty"`
	NomeDeUsuario   *string   `json:"nome_de_usuario,omitempty"`
	Categoria       *string   `json:"categoria,omitempty"`
	Autores         []string  `json:"autores,omitempty"`
	Publicacoes     *string   `json:"publicacoes,omitempty"`
	DataCriacao     time.Time `json:"data_criacao"`
	DataModificacao time.Time `json:"data_modificacao"`
	Link            *string   `json:"link,omitempty"`
	Visualizacoes   int       `json:"visualizacoes"`
	RevisadoPor     *string   `json:"revisado_por,omitempty"`
	Slug            string    `json:"slug"`
	Identifier      string    `json:"identifier"`
	Visibilidade    bool      `json:"visibilidade"`
	Notas           *string   `json:"notas,omitempty"`
	IDUsuario       string    `json:"id_usuario"`
}
