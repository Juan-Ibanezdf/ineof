package handlers

import (
	"api/internal/models"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v4"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

// Regex para validação de senha (exemplo: pelo menos 8 caracteres)
var PasswordRegex = regexp.MustCompile(`.{8,}`)

// UsuariosRouter configura as rotas para os handlers de Usuarios
func UsuariosRouter(db *pgxpool.Pool) http.Handler {
	r := chi.NewRouter()
	r.Post("/", createUsuario(db))
	r.Get("/", getAllUsuarios(db))
	r.Get("/{id}", GetUsuarioByID(db))
	r.Get("/", GetPerfilUsuarioByID(db))
	r.Put("/{id}", UpdatePerfilUsuario(db))
	r.Put("/{id}", updateUsuario(db))
	r.Delete("/{id}", deleteUsuario(db))
	return r
}

// createUsuario cria um novo usuario
func createUsuario(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var usuario models.Usuario
		if err := json.NewDecoder(r.Body).Decode(&usuario); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		// Verificar se o usuário ou email já existem
		var existingID string
		err := db.QueryRow(context.Background(), `
			SELECT id_usuario FROM usuarios WHERE nome_de_usuario=$1 OR email=$2`, usuario.NomeDeUsuario, usuario.Email).Scan(&existingID)

		if err == nil && existingID != "" {
			http.Error(w, "Usuário ou E-mail já cadastrado", http.StatusConflict)
			return
		}

		// Validar a senha (regras de senha)
		if !PasswordRegex.MatchString(usuario.Senha) {
			http.Error(w, "A senha deve conter pelo menos 8 caracteres.", http.StatusBadRequest)
			return
		}

		// Hash da senha
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(usuario.Senha), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "Erro ao criptografar senha", http.StatusInternalServerError)
			return
		}
		usuario.Senha = string(hashedPassword)

		// Inserir usuário no banco de dados e retornar o ID gerado
		err = db.QueryRow(context.Background(), `
			INSERT INTO usuarios (id_usuario, nome_de_usuario, senha, email, nivel_acesso, nome_completo, perfil_imagem, 
				data_criacao, data_atualizacao, curriculo_lattes, telefone, ocupacao, termos_de_uso, 
				descricao, data_desativacao, status_ativacao, email_verificado, ultimo_login, ip_ultimo_login,
				pais, estado, cidade, matricula, instituicao) 
			VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23) RETURNING id_usuario`,
			usuario.NomeDeUsuario, usuario.Senha, usuario.Email, usuario.NivelAcesso, usuario.NomeCompleto, usuario.PerfilImagem,
			usuario.DataCriacao, usuario.DataAtualizacao, usuario.CurriculoLattes, usuario.Telefone, usuario.Ocupacao, usuario.TermosDeUso,
			usuario.Descricao, usuario.DataDesativacao, usuario.StatusAtivacao, usuario.EmailVerificado, usuario.UltimoLogin, usuario.IpUltimoLogin,
			usuario.Pais, usuario.Estado, usuario.Cidade, usuario.Matricula, usuario.Instituicao).Scan(&usuario.ID)
		if err != nil {
			http.Error(w, "Erro ao registrar usuário: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Respondendo com o usuário registrado, incluindo o ID gerado
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "Usuário registrado com sucesso",
			"usuario": usuario,
		})
	}
}

// getAllUsuarios retorna todos os usuarios
func getAllUsuarios(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query(context.Background(), "SELECT * FROM usuarios")
		if err != nil {
			http.Error(w, "Failed to query usuarios: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var usuarios []models.Usuario
		for rows.Next() {
			var usuario models.Usuario
			err := rows.Scan(
				&usuario.ID, &usuario.NomeDeUsuario, &usuario.Senha, &usuario.Email, &usuario.NivelAcesso,
				&usuario.NomeCompleto, &usuario.PerfilImagem, &usuario.DataCriacao, &usuario.DataAtualizacao,
				&usuario.CurriculoLattes, &usuario.Telefone, &usuario.Ocupacao, &usuario.TermosDeUso,
				&usuario.Descricao, &usuario.DataDesativacao, &usuario.StatusAtivacao, &usuario.EmailVerificado,
				&usuario.UltimoLogin, &usuario.IpUltimoLogin, &usuario.Pais, &usuario.Estado,
				&usuario.Cidade, &usuario.Matricula, &usuario.Instituicao, &usuario.RefreshToken,
			)
			if err != nil {
				http.Error(w, "Failed to scan usuario: "+err.Error(), http.StatusInternalServerError)
				return
			}
			usuarios = append(usuarios, usuario)
		}

		// Verificar se houve erro ao iterar as linhas
		if err = rows.Err(); err != nil {
			http.Error(w, "Error iterating rows: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(usuarios); err != nil {
			http.Error(w, "Failed to encode usuarios to JSON: "+err.Error(), http.StatusInternalServerError)
		}
	}
}

// GetPerfilUsuarioByID retorna um usuário autenticado pelo ID do token
func GetPerfilUsuarioByID(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Obtém o cookie do token JWT
		cookie, err := r.Cookie("token")
		if err != nil {
			http.Error(w, "Token não encontrado", http.StatusUnauthorized)
			return
		}

		// Parseia o token e extrai as claims
		claims := &jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(cookie.Value, claims, func(token *jwt.Token) (interface{}, error) {
			return JwtSecret, nil
		})
		if err != nil || !token.Valid {
			http.Error(w, "Token inválido", http.StatusUnauthorized)
			return
		}

		// Extrai o ID do usuário das claims do token
		idFromToken, ok := (*claims)["idUsuario"].(string)
		if !ok {
			http.Error(w, "ID de usuário inválido no token", http.StatusUnauthorized)
			return
		}

		// Adiciona log para verificar o ID extraído
		fmt.Printf("ID do usuário extraído do token: %s\n", idFromToken)

		// Busca o usuário no banco de dados usando o ID do token
		var usuario models.Usuario
		err = db.QueryRow(context.Background(), "SELECT * FROM usuarios WHERE id_usuario = $1", idFromToken).Scan(
			&usuario.ID, &usuario.NomeDeUsuario, &usuario.Senha, &usuario.Email, &usuario.NivelAcesso,
			&usuario.NomeCompleto, &usuario.PerfilImagem, &usuario.DataCriacao, &usuario.DataAtualizacao,
			&usuario.CurriculoLattes, &usuario.Telefone, &usuario.Ocupacao, &usuario.TermosDeUso,
			&usuario.Descricao, &usuario.DataDesativacao, &usuario.StatusAtivacao, &usuario.EmailVerificado,
			&usuario.UltimoLogin, &usuario.IpUltimoLogin, &usuario.Pais, &usuario.Estado,
			&usuario.Cidade, &usuario.Matricula, &usuario.Instituicao, &usuario.RefreshToken)

		if err != nil {
			// Adiciona log para verificar o erro ao buscar o usuário
			fmt.Printf("Erro ao buscar usuário: %v\n", err)
			http.Error(w, "Usuário não encontrado", http.StatusNotFound)
			return
		}

		// Retorna os dados do usuário como JSON
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(usuario)
	}
}

// getUsuarioByID retorna um usuario pelo ID
func GetUsuarioByID(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		var usuario models.Usuario
		err := db.QueryRow(context.Background(), "SELECT * FROM usuarios WHERE id_usuario = $1", id).Scan(
			&usuario.ID, &usuario.NomeDeUsuario, &usuario.Senha, &usuario.Email, &usuario.NivelAcesso,
			&usuario.NomeCompleto, &usuario.PerfilImagem, &usuario.DataCriacao, &usuario.DataAtualizacao,
			&usuario.CurriculoLattes, &usuario.Telefone, &usuario.Ocupacao, &usuario.TermosDeUso,
			&usuario.Descricao, &usuario.DataDesativacao, &usuario.StatusAtivacao, &usuario.EmailVerificado,
			&usuario.UltimoLogin, &usuario.IpUltimoLogin, &usuario.Pais, &usuario.Estado,
			&usuario.Cidade, &usuario.Matricula, &usuario.Instituicao, &usuario.RefreshToken)
		if err != nil {
			http.Error(w, "Usuario not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(usuario)
	}
}

// updateUsuario atualiza um usuario
func updateUsuario(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		var usuario models.Usuario
		if err := json.NewDecoder(r.Body).Decode(&usuario); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		_, err := db.Exec(context.Background(), `
			UPDATE usuarios 
			SET nome_de_usuario = $1, senha = $2, email = $3, nivel_acesso = $4, nome_completo = $5, perfil_imagem = $6, 
			data_criacao = $7, data_atualizacao = $8, curriculo_lattes = $9, telefone = $10, ocupacao = $11, termos_de_uso = $12, 
			descricao = $13, data_desativacao = $14, status_ativacao = $15, email_verificado = $16, ultimo_login = $17, 
			ip_ultimo_login = $18, pais = $19, estado = $20, cidade = $21, matricula = $22, instituicao = $23 
			WHERE id_usuario = $24`,
			usuario.NomeDeUsuario, usuario.Senha, usuario.Email, usuario.NivelAcesso, usuario.NomeCompleto, usuario.PerfilImagem,
			usuario.DataCriacao, usuario.DataAtualizacao, usuario.CurriculoLattes, usuario.Telefone, usuario.Ocupacao, usuario.TermosDeUso,
			usuario.Descricao, usuario.DataDesativacao, usuario.StatusAtivacao, usuario.EmailVerificado, usuario.UltimoLogin, usuario.IpUltimoLogin,
			usuario.Pais, usuario.Estado, usuario.Cidade, usuario.Matricula, usuario.Instituicao, id)
		if err != nil {
			http.Error(w, "Failed to update usuario: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Usuario updated successfully"))
	}
}

// updateUsuario atualiza um usuario
func UpdatePerfilUsuario(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		var usuario models.Usuario
		if err := json.NewDecoder(r.Body).Decode(&usuario); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		_, err := db.Exec(context.Background(), `
			UPDATE usuarios 
			SET nome_de_usuario = $1, senha = $2, email = $3, nivel_acesso = $4, nome_completo = $5, perfil_imagem = $6, 
			data_criacao = $7, data_atualizacao = $8, curriculo_lattes = $9, telefone = $10, ocupacao = $11, termos_de_uso = $12, 
			descricao = $13, data_desativacao = $14, status_ativacao = $15, email_verificado = $16, ultimo_login = $17, 
			ip_ultimo_login = $18, pais = $19, estado = $20, cidade = $21, matricula = $22, instituicao = $23 
			WHERE id_usuario = $24`,
			usuario.NomeDeUsuario, usuario.Senha, usuario.Email, usuario.NivelAcesso, usuario.NomeCompleto, usuario.PerfilImagem,
			usuario.DataCriacao, usuario.DataAtualizacao, usuario.CurriculoLattes, usuario.Telefone, usuario.Ocupacao, usuario.TermosDeUso,
			usuario.Descricao, usuario.DataDesativacao, usuario.StatusAtivacao, usuario.EmailVerificado, usuario.UltimoLogin, usuario.IpUltimoLogin,
			usuario.Pais, usuario.Estado, usuario.Cidade, usuario.Matricula, usuario.Instituicao, id)
		if err != nil {
			http.Error(w, "Failed to update usuario: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Usuario updated successfully"))
	}
}

// deleteUsuario exclui um usuario
func deleteUsuario(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		_, err := db.Exec(context.Background(), "DELETE FROM usuarios WHERE id_usuario = $1", id)
		if err != nil {
			http.Error(w, "Failed to delete usuario: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Usuario deleted successfully"))
	}
}
