package models

// Cargo representa a tabela de cargos no banco de dados
type Cargo struct {
	IDCargo   int    `json:"id_cargo"`   // ID do cargo
	NomeCargo string `json:"nome_cargo"` // Nome do cargo
}

// UsuarioCargo representa a relação entre usuários e cargos
type UsuarioCargo struct {
	IDUsuario string `json:"id_usuario"` // ID do usuário (UUID)
	IDCargo   int    `json:"id_cargo"`   // ID do cargo
}
