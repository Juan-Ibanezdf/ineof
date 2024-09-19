package models

import "time"

// Usuario representa a tabela de usuários no banco de dados
type Usuario struct {
	ID              string     `json:"id_usuario"` // Alterado para string para UUID
	NomeDeUsuario   string     `json:"nome_de_usuario"`
	Senha           string     `json:"senha"`
	Email           string     `json:"email"`
	NivelAcesso     string     `json:"nivel_acesso"`
	NomeCompleto    *string    `json:"nome_completo,omitempty"`
	PerfilImagem    *string    `json:"perfil_imagem,omitempty"`
	DataCriacao     time.Time  `json:"data_criacao"`
	DataAtualizacao time.Time  `json:"data_atualizacao"`
	CurriculoLattes *string    `json:"curriculo_lattes,omitempty"`
	Telefone        *string    `json:"telefone,omitempty"`
	Ocupacao        *string    `json:"ocupacao,omitempty"`
	TermosDeUso     bool       `json:"termos_de_uso"`
	Descricao       *string    `json:"descricao,omitempty"`
	DataDesativacao *time.Time `json:"data_desativacao,omitempty"`
	StatusAtivacao  bool       `json:"status_ativacao"`
	EmailVerificado bool       `json:"email_verificado"`
	UltimoLogin     *time.Time `json:"ultimo_login,omitempty"`
	IpUltimoLogin   *string    `json:"ip_ultimo_login,omitempty"`
	Pais            *string    `json:"pais,omitempty"`
	Estado          *string    `json:"estado,omitempty"`
	Cidade          *string    `json:"cidade,omitempty"`
	Matricula       *int       `json:"matricula,omitempty"`
	Instituicao     *string    `json:"instituicao,omitempty"`
	RefreshToken    *string    `json:"refresh_token,omitempty"`
}
