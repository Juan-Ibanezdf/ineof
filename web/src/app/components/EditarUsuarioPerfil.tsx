// EditarUsuarioPerfil.tsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getAPIClient } from "../../services/axios";
import Header from "../partials/Header";
import Link from "next/link";
import Layout from "./Layout";

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
        const response = await api.get(`/api/auth/profile`);
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
      await api.put(`/api/auth/profile/${id}`, formData);
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
        {" "}
        <main className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold mb-6">Editar Usuário</h1>
          {successMessage && (
            <div className="text-green-600 mb-4">{successMessage}</div>
          )}
          {!isEditing ? (
            <div>
              <div className="grid grid-cols-1 gap-6">
                {Object.entries(user).map(([key, value]) => (
                  <div key={key}>
                    <span className="block text-sm font-medium text-gray-700">
                      {key}:
                    </span>
                    <p>{value?.toString()}</p>
                  </div>
                ))}
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
              {/* Campos do formulário */}
              {/* ... */}
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
