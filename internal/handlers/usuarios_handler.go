package handlers

import (
	"api/internal/models"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"regexp"
	"strings"

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
	r.Get("/usuarios/cargo/{cargo_id}", GetUsuariosByCargo(db))
	r.Put("/{id}", UpdatePerfilUsuario(db))
	r.Put("/{id}", updateUsuario(db))
	r.Delete("/{id}", deleteUsuario(db))
	return r
}

// createUsuario cria um novo usuario e atribui o cargo "Nenhum" (ID 13) e o nível de permissão "leitor" por padrão

// createUsuario cria um novo usuário e atribui o cargo "Nenhum"
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

		// Validar a senha
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

		// Definir o nível de permissão como "leitor" por padrão
		if usuario.NivelPermissao == "" {
			usuario.NivelPermissao = "leitor"
		}

		// Inserir usuário no banco de dados e retornar o ID gerado
		err = db.QueryRow(context.Background(), `
            INSERT INTO usuarios (nome_de_usuario, senha, email, nivel_permissao, termos_de_uso, status_ativacao, email_verificado) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_usuario`,
			usuario.NomeDeUsuario, usuario.Senha, usuario.Email, usuario.NivelPermissao, usuario.TermosDeUso, usuario.StatusAtivacao, usuario.EmailVerificado).Scan(&usuario.ID)
		if err != nil {
			http.Error(w, "Erro ao registrar usuário", http.StatusInternalServerError)
			return
		}

		// Atribuir o cargo "Nenhum" (ID 13) ao novo usuário
		_, err = db.Exec(context.Background(), `
            INSERT INTO Usuario_Cargo (id_usuario, id_cargo) VALUES ($1, 13)`, usuario.ID)
		if err != nil {
			http.Error(w, "Erro ao atribuir cargo", http.StatusInternalServerError)
			return
		}

		// Responder com sucesso
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "Usuário criado com sucesso",
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
				&usuario.ID, &usuario.NomeDeUsuario, &usuario.Senha, &usuario.Email, &usuario.NivelPermissao,
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

// GetPerfilUsuarioByID retorna os dados do perfil do usuário autenticado
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

		// Extrai o ID do usuário das claims do token JWT
		idFromToken, ok := (*claims)["idUsuario"].(string)
		if !ok {
			http.Error(w, "ID de usuário inválido no token", http.StatusUnauthorized)
			return
		}

		// Busca os dados do perfil do usuário no banco de dados
		var usuario models.Usuario
		err = db.QueryRow(context.Background(), `
			SELECT id_usuario, nome_de_usuario, email, nivel_permissao, nome_completo, perfil_imagem, 
				curriculo_lattes, telefone, ocupacao, termos_de_uso, descricao, status_ativacao, 
				email_verificado, ultimo_login, ip_ultimo_login, pais, estado, cidade, matricula, instituicao 
			FROM usuarios WHERE id_usuario = $1`, idFromToken).Scan(
			&usuario.ID, &usuario.NomeDeUsuario, &usuario.Email, &usuario.NivelPermissao,
			&usuario.NomeCompleto, &usuario.PerfilImagem, &usuario.CurriculoLattes, &usuario.Telefone,
			&usuario.Ocupacao, &usuario.TermosDeUso, &usuario.Descricao, &usuario.StatusAtivacao,
			&usuario.EmailVerificado, &usuario.UltimoLogin, &usuario.IpUltimoLogin, &usuario.Pais,
			&usuario.Estado, &usuario.Cidade, &usuario.Matricula, &usuario.Instituicao)

		if err != nil {
			http.Error(w, "Usuário não encontrado", http.StatusNotFound)
			return
		}

		// Retorna os dados do perfil como JSON
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(usuario)
	}
}

func UpdatePerfilUsuario(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Verifica o token JWT
		cookie, err := r.Cookie("token")
		if err != nil {
			http.Error(w, "Token não encontrado", http.StatusUnauthorized)
			return
		}

		// Parseia o token JWT
		claims := &jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(cookie.Value, claims, func(token *jwt.Token) (interface{}, error) {
			return JwtSecret, nil
		})
		if err != nil || !token.Valid {
			http.Error(w, "Token inválido", http.StatusUnauthorized)
			return
		}

		// Extrai o ID do usuário do token
		idFromToken, ok := (*claims)["idUsuario"].(string)
		if !ok {
			http.Error(w, "ID de usuário inválido no token", http.StatusUnauthorized)
			return
		}

		// Decodifica o corpo da requisição
		var usuario models.Usuario
		if err := json.NewDecoder(r.Body).Decode(&usuario); err != nil {
			http.Error(w, "Invalid input: "+err.Error(), http.StatusBadRequest)
			return
		}

		// Log para verificar o corpo da requisição recebido
		log.Printf("Dados recebidos para atualização: %+v\n", usuario)

		// Se a senha for fornecida, criptografá-la antes de salvar
		if usuario.Senha != "" {
			if !passwordRegex.MatchString(usuario.Senha) {
				http.Error(w, "A senha deve conter pelo menos 8 caracteres.", http.StatusBadRequest)
				return
			}

			hashedPassword, err := bcrypt.GenerateFromPassword([]byte(usuario.Senha), bcrypt.DefaultCost)
			if err != nil {
				http.Error(w, "Erro ao criptografar senha", http.StatusInternalServerError)
				return
			}
			usuario.Senha = string(hashedPassword)
		} else {
			// Caso a senha não tenha sido enviada na requisição, manter a senha atual
			var currentPassword string
			err := db.QueryRow(context.Background(), "SELECT senha FROM usuarios WHERE id_usuario=$1", idFromToken).Scan(&currentPassword)
			if err != nil {
				http.Error(w, "Erro ao recuperar senha atual", http.StatusInternalServerError)
				return
			}
			usuario.Senha = currentPassword // Mantém a senha atual
		}

		// Atualiza os dados no banco de dados
		_, err = db.Exec(context.Background(), `
            UPDATE usuarios 
            SET nome_de_usuario = $1, senha = $2, email = $3, nome_completo = $4, perfil_imagem = $5, 
                curriculo_lattes = $6, telefone = $7, ocupacao = $8, descricao = $9, 
                pais = $10, estado = $11, cidade = $12, matricula = $13, instituicao = $14 
            WHERE id_usuario = $15`,
			usuario.NomeDeUsuario, usuario.Senha, usuario.Email, usuario.NomeCompleto, usuario.PerfilImagem,
			usuario.CurriculoLattes, usuario.Telefone, usuario.Ocupacao, usuario.Descricao,
			usuario.Pais, usuario.Estado, usuario.Cidade, usuario.Matricula, usuario.Instituicao, idFromToken)

		if err != nil {
			http.Error(w, "Failed to update perfil: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Perfil atualizado com sucesso"))
	}
}

// GetUsuarioByID retorna um usuario pelo ID
func GetUsuarioByID(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		var usuario models.Usuario
		err := db.QueryRow(context.Background(), "SELECT * FROM usuarios WHERE id_usuario = $1", id).Scan(
			&usuario.ID, &usuario.NomeDeUsuario, &usuario.Senha, &usuario.Email, &usuario.NivelPermissao,
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

// updateUsuario atualiza um usuário e seus cargos
func updateUsuario(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		var input struct {
			Usuario models.Usuario `json:"usuario"`
			Cargos  []int          `json:"cargos"`
		}

		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		usuario := input.Usuario
		cargos := input.Cargos

		// Atualizar os dados do usuário na tabela `usuarios`
		_, err := db.Exec(context.Background(), `
            UPDATE usuarios 
            SET nome_de_usuario = $1, senha = $2, email = $3, nivel_permissao = $4, nome_completo = $5, perfil_imagem = $6, 
                data_atualizacao = CURRENT_TIMESTAMP
            WHERE id_usuario = $7`,
			usuario.NomeDeUsuario, usuario.Senha, usuario.Email, usuario.NivelPermissao, usuario.NomeCompleto, usuario.PerfilImagem, id)
		if err != nil {
			http.Error(w, "Erro ao atualizar usuário", http.StatusInternalServerError)
			return
		}

		// Remover os cargos antigos do usuário
		_, err = db.Exec(context.Background(), `
            DELETE FROM Usuario_Cargo WHERE id_usuario = $1`, id)
		if err != nil {
			http.Error(w, "Erro ao remover cargos antigos", http.StatusInternalServerError)
			return
		}

		// Atribuir os novos cargos, se fornecidos
		if len(cargos) > 0 {
			for _, cargoID := range cargos {
				_, err := db.Exec(context.Background(), `
                    INSERT INTO Usuario_Cargo (id_usuario, id_cargo) VALUES ($1, $2)`, id, cargoID)
				if err != nil {
					http.Error(w, "Erro ao atribuir cargos", http.StatusInternalServerError)
					return
				}
			}
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Usuário atualizado com sucesso"))
	}
}

// GetUsuariosByCargo retorna todos os usuários com um ou mais cargos específicos
func GetUsuariosByCargo(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Obter os IDs de cargos passados na URL, separados por vírgula (exemplo: /usuarios/cargo/1,2,3)
		cargosParam := chi.URLParam(r, "cargo_ids")
		cargoIDs := strings.Split(cargosParam, ",")

		// Verificar se ao menos um cargo foi passado
		if len(cargoIDs) == 0 {
			http.Error(w, "Nenhum cargo fornecido", http.StatusBadRequest)
			return
		}

		// Montar a consulta SQL para selecionar usuários com os cargos fornecidos
		query := `
			SELECT u.id_usuario, u.nome_de_usuario, u.email, u.nome_completo, u.perfil_imagem, array_agg(c.nome_cargo)
			FROM usuarios u
			JOIN usuario_cargo uc ON u.id_usuario = uc.id_usuario
			JOIN cargos c ON uc.id_cargo = c.id_cargo
			WHERE uc.id_cargo = ANY($1::int[])
			GROUP BY u.id_usuario`

		// Executar a consulta passando os IDs de cargos
		rows, err := db.Query(context.Background(), query, cargoIDs)
		if err != nil {
			http.Error(w, "Failed to query usuarios: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		// Preparar a resposta com os usuários e seus cargos
		var usuarios []map[string]interface{}
		for rows.Next() {
			var usuarioID, nomeDeUsuario, email, nomeCompleto, perfilImagem string
			var cargos []string

			err := rows.Scan(&usuarioID, &nomeDeUsuario, &email, &nomeCompleto, &perfilImagem, &cargos)
			if err != nil {
				http.Error(w, "Failed to scan usuario: "+err.Error(), http.StatusInternalServerError)
				return
			}

			// Montar o objeto de resposta para o usuário
			usuario := map[string]interface{}{
				"id_usuario":      usuarioID,
				"nome_de_usuario": nomeDeUsuario,
				"email":           email,
				"nome_completo":   nomeCompleto,
				"perfil_imagem":   perfilImagem,
				"cargos":          cargos,
			}
			usuarios = append(usuarios, usuario)
		}

		// Verificar se houve erro ao iterar as linhas
		if err := rows.Err(); err != nil {
			http.Error(w, "Error iterating rows: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Retornar a lista de usuários e seus cargos como JSON
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(usuarios)
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
