package models

import "time"

// Favorito representa a tabela de favoritos no banco de dados
type Favorito struct {
	IDFavorito   string    `json:"id_favorito"`   // Alterado para string para UUID
	IDUsuario    string    `json:"id_usuario"`    // Alterado para string para UUID
	IDPublicacao string    `json:"id_publicacao"` // Alterado para string para UUID
	DataFavorito time.Time `json:"data_favorito"`
}
