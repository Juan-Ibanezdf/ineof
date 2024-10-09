"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAPIClient } from "../../../../../../../services/axios";
import { parseCookies } from "nookies";
import Layout from "../../../../../../components/Layout";

interface Publicacao {
  idPublicacao: string;
  titulo: string;
  subtitulo: string;
  resumo: string;
  categoria: string;
  banner: string;
  palavrasChave: string;
  autores: string;
  publicacoes: string;
  revisadoPor: string;
  slug: string;
  visibilidade: boolean;
  link: string | null;
  dataCriacao: Date;
  dataModificacao: Date;
  visualizacoes: number;
  notas: string;
  nomeUsuario:string;
}

const PublicacaoPage: React.FC = () => {
  const [publicacao, setPublicacao] = useState<Publicacao | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Publicacao>>({});
  const { identifier, slug } = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchPublicacao = async () => {
      try {
        const api = getAPIClient();
        const response = await api.get(
          `/api/publicacoes/usuario/${identifier}/${slug}`
        );

        const data = response.data;

        // Configura a publicação com dados do backend
        setPublicacao({
          idPublicacao: data.id_publicacao,
          titulo: data.titulo,
          subtitulo: data.subtitulo,
          resumo: data.resumo,
          categoria: data.categoria,
          banner: data.banner,
          palavrasChave: data.palavras_chave.join(", "),
          autores: data.autores.join(", "),
          publicacoes: data.publicacoes,
          revisadoPor: data.revisado_por,
          slug: data.slug,
          visibilidade: data.visibilidade,
          link: data.link,
          dataCriacao: new Date(data.data_criacao),
          dataModificacao: new Date(data.data_modificacao),
          visualizacoes: data.visualizacoes,
          notas: data.notas || "",
          nomeUsuario: data.nome_de_usuario || "Usuário desconhecido" // Adicionando nome do usuário
        });

        setFormData({
          titulo: data.titulo,
          subtitulo: data.subtitulo,
          resumo: data.resumo,
          categoria: data.categoria,
          banner: data.banner,
          palavrasChave: data.palavras_chave.join(", "),
          autores: data.autores.join(", "),
          publicacoes: data.publicacoes,
          link: data.link,
          notas: data.notas || "",
        });
      } catch (error) {
        console.error("Erro ao obter a publicação", error);
      }
    };

    if (identifier && slug) {
      fetchPublicacao();
    }
  }, [identifier, slug]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const api = getAPIClient();
      const cookies = parseCookies();
      const csrfToken = cookies["csrf_token"];
      const token = cookies["token"];

      if (!csrfToken || !token) {
        console.error("CSRF ou JWT token ausente!");
        return;
      }

      const palavrasChaveArray = formData.palavrasChave
        ? formData.palavrasChave.split(",").map((item) => item.trim())
        : [];
      const autoresArray = formData.autores
        ? formData.autores.split(",").map((item) => item.trim())
        : [];

      const updatedFormData = {
        titulo: formData.titulo,
        subtitulo: formData.subtitulo,
        palavras_chave: palavrasChaveArray,
        banner: formData.banner,
        resumo: formData.resumo,
        categoria: formData.categoria,
        autores: autoresArray,
        publicacoes: formData.publicacoes,
        link: formData.link,
        notas: formData.notas,
      };

      await api.put(
        `/api/publicacoes/${publicacao?.idPublicacao}`,
        updatedFormData,
        {
          headers: {
            "X-CSRF-Token": csrfToken,
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      alert("Modificações salvas");
      router.push("/perfil/publicacoes/minhas-publicacoes"); // Redirecionar após salvar
    } catch (error) {
      console.error("Erro ao atualizar a publicação", error);
      alert("Falha ao atualizar a publicação. Verifique o console.");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData(publicacao || {});
  };

  const handleBackToPublicacoes = () => {
    router.push("/perfil/publicacoes/minhas-publicacoes");
  };

  if (!publicacao) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Layout>
      <div className="p-8 max-w-screen-lg mx-auto my-20">
        {publicacao?.banner && (
          <p className="text-lg mb-4">
            <strong>Banner (URL):</strong> {publicacao.banner}
          </p>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-lg font-semibold mb-2">Título:</label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo || ""}
                onChange={handleInputChange}
                className="border border-gray-300 p-3 w-full rounded-lg"
              />
            </div>

            <div className="mb-4">
              <label className="block text-lg font-semibold mb-2">Subtítulo:</label>
              <input
                type="text"
                name="subtitulo"
                value={formData.subtitulo || ""}
                onChange={handleInputChange}
                className="border border-gray-300 p-3 w-full rounded-lg"
              />
            </div>

            <div className="mb-4">
              <label className="block text-lg font-semibold mb-2">Resumo:</label>
              <textarea
                name="resumo"
                value={formData.resumo || ""}
                onChange={handleInputChange}
                className="border border-gray-300 p-3 w-full rounded-lg"
              />
            </div>

            <div className="mb-4">
              <label className="block text-lg font-semibold mb-2">Categoria:</label>
              <input
                type="text"
                name="categoria"
                value={formData.categoria || ""}
                onChange={handleInputChange}
                className="border border-gray-300 p-3 w-full rounded-lg"
              />
            </div>

            <div className="mb-4">
              <label className="block text-lg font-semibold mb-2">Banner (URL):</label>
              <input
                type="text"
                name="banner"
                value={formData.banner || ""}
                onChange={handleInputChange}
                className="border border-gray-300 p-3 w-full rounded-lg"
              />
            </div>

            <div className="mb-4">
              <label className="block text-lg font-semibold mb-2">Autores:</label>
              <input
                type="text"
                name="autores"
                value={formData.autores || ""}
                onChange={handleInputChange}
                className="border border-gray-300 p-3 w-full rounded-lg"
                placeholder="Separe por vírgulas"
              />
            </div>

            <div className="mb-4">
              <label className="block text-lg font-semibold mb-2">Palavras-Chave:</label>
              <input
                type="text"
                name="palavrasChave"
                value={formData.palavrasChave || ""}
                onChange={handleInputChange}
                className="border border-gray-300 p-3 w-full rounded-lg"
                placeholder="Separe por vírgulas"
              />
            </div>

            <div className="mb-4">
              <label className="block text-lg font-semibold mb-2">Link:</label>
              <input
                type="text"
                name="link"
                value={formData.link || ""}
                onChange={handleInputChange}
                className="border border-gray-300 p-3 w-full rounded-lg"
              />
            </div>

            <div className="mb-4">
              <label className="block text-lg font-semibold mb-2">Notas:</label>
              <textarea
                name="notas"
                value={formData.notas || ""}
                onChange={handleInputChange}
                className="border border-gray-300 p-3 w-full rounded-lg"
              />
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-3 rounded-lg"
              >
                Salvar Alterações
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div>
            <h2 className="text-4xl font-bold mb-6 text-center text-indigo-900">
              {publicacao.titulo}
            </h2>

            <p className="text-xl text-center text-gray-600 mb-4">
              {publicacao.subtitulo}
            </p>

            <p className="text-sm text-gray-500 mb-2">
              <strong>Usuário:</strong> {publicacao.nomeUsuario || "Não disponível"}{" "}
              | <strong>Visibilidade:</strong>{" "}
              {publicacao.visibilidade ? "Público" : "Privado"} |{" "}
              <strong>Revisado Por:</strong>{" "}
              {publicacao.revisadoPor || "Não disponível"}
            </p>

            <p className="text-sm text-gray-500 mb-4">
              <strong>Criado em:</strong>{" "}
              {new Date(publicacao.dataCriacao).toLocaleString()} |{" "}
              <strong>Última Modificação:</strong>{" "}
              {new Date(publicacao.dataModificacao).toLocaleString()} |{" "}
              <strong>Visualizações:</strong> {publicacao.visualizacoes}
            </p>

            <p className="text-lg mb-2">
              <strong>Autores:</strong> {publicacao.autores || "Não disponível"}
            </p>

            <p className="text-lg mb-4">
              <strong>Palavras-Chave:</strong>{" "}
              {publicacao.palavrasChave || "Não disponível"}
            </p>

            <p className="text-md mb-6">
              <strong>Resumo:</strong> {publicacao.resumo}
            </p>

            {publicacao.link && (
              <p className="text-md mb-6">
                <strong>Link:</strong>{" "}
                <a
                  href={publicacao.link}
                  className="text-blue-500 hover:underline"
                >
                  {publicacao.link}
                </a>
              </p>
            )}

            {publicacao.notas && (
              <p className="text-md mb-6">
                <strong>Notas:</strong> {publicacao.notas || "Não disponível"}
              </p>
            )}

            <div className="flex mt-4">
              <button
                onClick={handleEdit}
                className="bg-indigo-500 text-white px-6 py-3 rounded-lg"
              >
                Editar Publicação
              </button>
              <button
                onClick={handleBackToPublicacoes}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg ml-4"
              >
                Voltar
              </button>
            </div>
          </div>
        )}
      </div>
      </Layout>
    </>
  )
};

export default PublicacaoPage;
