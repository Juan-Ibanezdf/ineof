package models

import "time"

// Favorito representa a tabela de favoritos no banco de dados
type Favorito struct {
	IDUsuario    string    `json:"id_usuario"`    // UUID do usuário que favoritou a publicação
	IDPublicacao string    `json:"id_publicacao"` // UUID da publicação favoritada
	DataFavorito time.Time `json:"data_favorito"` // Data em que a publicação foi favoritada
}
