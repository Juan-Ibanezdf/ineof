package models

import (
	"time"
)

// Publicacao representa uma publicação
type Publicacao struct {
	ID              string    `json:"id_publicacao"`             // Alterado para string para UUID
	Titulo          string    `json:"titulo"`                    // Título da publicação
	Subtitulo       *string   `json:"subtitulo,omitempty"`       // Subtítulo opcional
	PalavrasChave   *[]string `json:"palavras_chave,omitempty"`  // Palavras-chave como array de strings
	Banner          *string   `json:"banner,omitempty"`          // URL do banner opcional
	Resumo          *string   `json:"resumo,omitempty"`          // Resumo opcional
	NomeDeUsuario   *string   `json:"nome_de_usuario,omitempty"` // Nome do usuário que criou a publicação
	Categoria       *string   `json:"categoria,omitempty"`       // Categoria opcional
	Autores         *[]string `json:"autores,omitempty"`         // Autores como array de strings
	Publicacoes     *string   `json:"publicacoes,omitempty"`     // Conteúdo da publicação opcional
	DataCriacao     time.Time `json:"data_criacao"`              // Data de criação da publicação
	DataModificacao time.Time `json:"data_modificacao"`          // Data de modificação da publicação
	Link            *string   `json:"link,omitempty"`            // Link para a publicação opcional
	Visualizacoes   int       `json:"visualizacoes"`             // Contagem de visualizações
	RevisadoPor     *string   `json:"revisado_por,omitempty"`    // Nome do revisor da publicação opcional
	Slug            string    `json:"slug"`                      // Slug gerado a partir do título, é uma string única
	Identifier      string    `json:"identifier"`                // Identificador único adicional, gerado automaticamente
	Visibilidade    bool      `json:"visibilidade"`              // Define se a publicação está visível
	Notas           *string   `json:"notas,omitempty"`           // Notas adicionais sobre a publicação
	IDUsuario       string    `json:"id_usuario"`                // ID do usuário que criou a publicação
}
