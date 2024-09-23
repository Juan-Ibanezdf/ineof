package models

import "time"

// Usuario representa a tabela de usuários no banco de dados
type Usuario struct {
	ID              string     `json:"id_usuario"`                 // Alterado para string para UUID
	NomeDeUsuario   string     `json:"nome_de_usuario"`            // Nome de usuário
	Senha           string     `json:"senha"`                      // Senha (armazenada em hash)
	Email           string     `json:"email"`                      // Email (deve ser único)
	NivelPermissao  string     `json:"nivel_permissao"`            // Nível de permissão
	NomeCompleto    *string    `json:"nome_completo,omitempty"`    // Nome completo (opcional)
	PerfilImagem    *string    `json:"perfil_imagem,omitempty"`    // URL da imagem de perfil (opcional)
	DataCriacao     time.Time  `json:"data_criacao"`               // Data de criação do usuário
	DataAtualizacao time.Time  `json:"data_atualizacao"`           // Data de atualização do usuário
	CurriculoLattes *string    `json:"curriculo_lattes,omitempty"` // URL do currículo Lattes (opcional)
	Telefone        *string    `json:"telefone,omitempty"`         // Número de telefone (opcional)
	Ocupacao        *string    `json:"ocupacao,omitempty"`         // Ocupação do usuário (opcional)
	TermosDeUso     bool       `json:"termos_de_uso"`              // Aceite dos termos de uso
	Descricao       *string    `json:"descricao,omitempty"`        // Descrição adicional (opcional)
	DataDesativacao *time.Time `json:"data_desativacao,omitempty"` // Data de desativação (opcional)
	StatusAtivacao  bool       `json:"status_ativacao"`            // Status de ativação
	EmailVerificado bool       `json:"email_verificado"`           // Status de verificação do email
	UltimoLogin     *time.Time `json:"ultimo_login,omitempty"`     // Data do último login (opcional)
	IpUltimoLogin   *string    `json:"ip_ultimo_login,omitempty"`  // IP do último login (opcional)
	Pais            *string    `json:"pais,omitempty"`             // País de residência (opcional)
	Estado          *string    `json:"estado,omitempty"`           // Estado de residência (opcional)
	Cidade          *string    `json:"cidade,omitempty"`           // Cidade de residência (opcional)
	Matricula       *int       `json:"matricula,omitempty"`        // Número de matrícula (opcional)
	Instituicao     *string    `json:"instituicao,omitempty"`      // Instituição de afiliação (opcional)
	RefreshToken    *string    `json:"refresh_token,omitempty"`    // Token de atualização (opcional)
}
