import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getAPIClient } from "../../services/axios";
import Layout from "./Layout";
import Link from "next/link";
import Image from "next/image";

// Definição dos tipos
interface User {
  nomeDeUsuario: string;
  email: string;
  nomeCompleto?: string;
  perfilImagem?: string;
  pais?: string;
  estado?: string;
  cidade?: string;
  ocupacao?: string;
  descricao?: string;
  telefone?: string;
  instituicao?: string;
  curriculoLattes?: string;
  matricula?: number;
  termosDeUso?: boolean;
  statusAtivacao?: boolean;
  emailVerificado?: boolean;
  novaSenha?: string;
  confirmarNovaSenha?: string;
  dataCriacao?: string;
  dataAtualizacao?: string;
  ultimoLogin?: string;
  ipUltimoLogin?: string;
}

interface EditarUsuarioProps {
  id: string;
}

const EditarUsuarioPerfil: React.FC<EditarUsuarioProps> = ({ id }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<User>();
  
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const novaSenha = watch("novaSenha");

  useEffect(() => {
    if (!id) return;

    const fetchUserDetails = async () => {
      const api = getAPIClient();
      try {
        const response = await api.get(`/api/auth/profile/`); // Chama a API passando o ID do usuário
        setUser(response.data);
        Object.keys(response.data).forEach((field) =>
          setValue(field as keyof User, response.data[field])
        );
      } catch (error) {
        setErrorMessage("Erro ao carregar detalhes do usuário.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id, setValue]);

  const onSubmit = async (formData: User) => {
    const api = getAPIClient();
    try {
      await api.put(`/api/auth/profile/`, formData);
      setSuccessMessage("Usuário atualizado com sucesso!");
      setIsEditing(false);
    } catch (error) {
      setErrorMessage("Erro ao atualizar os dados do usuário.");
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (errorMessage) {
    return <div>{errorMessage}</div>;
  }

  if (!user) {
    return <div>Usuário não encontrado.</div>;
  }

  return (
    <>
      <Layout>
        <main className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold mb-6">Editar Usuário</h1>
          {successMessage && (
            <div className="text-green-600 mb-4">{successMessage}</div>
          )}

          {!isEditing ? (
            <div>
              {/* Exibição dos dados do usuário */}
              <div className="grid grid-cols-1 gap-6">
                {/* Imagem de perfil */}
                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Imagem de Perfil:
                  </span>
                  <Image
                    src={user.perfilImagem || "/default-avatar.png"}
                    alt="Imagem de Perfil"
                    className="w-24 h-24 rounded-full"
                  />


                </div>

                {/* Nome de Usuário */}
                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Nome de Usuário:
                  </span>
                  <p>{user.nomeDeUsuario}</p>
                </div>

                {/* Outros campos */}
                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Nome Completo:
                  </span>
                  <p>{user.nomeCompleto}</p>
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Email:
                  </span>
                  <p>{user.email}</p>
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    País:
                  </span>
                  <p>{user.pais}</p>
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Estado:
                  </span>
                  <p>{user.estado}</p>
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Cidade:
                  </span>
                  <p>{user.cidade}</p>
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Ocupação:
                  </span>
                  <p>{user.ocupacao}</p>
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Descrição:
                  </span>
                  <p>{user.descricao}</p>
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Telefone:
                  </span>
                  <p>{user.telefone}</p>
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Instituição:
                  </span>
                  <p>{user.instituicao}</p>
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Currículo Lattes:
                  </span>
                  <p>{user.curriculoLattes}</p>
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Matrícula:
                  </span>
                  <p>{user.matricula}</p>
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Termos de Uso:
                  </span>
                  <p>{user.termosDeUso ? "Aceito" : "Não aceito"}</p>
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Status de Ativação:
                  </span>
                  <p>{user.statusAtivacao ? "Ativo" : "Inativo"}</p>
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Email Verificado:
                  </span>
                  <p>{user.emailVerificado ? "Verificado" : "Não verificado"}</p>
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Último Login:
                  </span>
                  <p>{user.ultimoLogin}</p>
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    IP do Último Login:
                  </span>
                  <p>{user.ipUltimoLogin}</p>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-4"
              >
                Editar
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 gap-6"
            >
              {/* Formulário de edição */}
              {/* Campos como `nomeDeUsuario`, `email`, etc. */}
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Salvar Alterações
              </button>
            </form>
          )}
          <Link href="/adm/usuarios">
            <span className="mt-4 inline-block text-indigo-600 hover:text-indigo-500">
              Voltar para a lista de usuários
            </span>
          </Link>
        </main>
      </Layout>
    </>
  );
};

export default EditarUsuarioPerfil;
