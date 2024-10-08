"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAPIClient } from "../../../../../../../services/axios";
import { parseCookies } from "nookies";
import Header from "@/app/partials/Header";
import Footer from "@/app/partials/Footer";

interface Publicacao {
  idPublicacao: string;
  titulo: string;
  subtitulo: string;
  resumo: string;
  categoria: string;
  banner: string;
  palavrasChave: string; // Agora é string, não array
  autores: string; // Agora é string, não array
  publicacoes: string;
  revisadoPor: string;
  slug: string;
  visibilidade: boolean;
  link: string | null;
  dataCriacao: Date;
  dataModificacao: Date;
  visualizacoes: number;
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

        setPublicacao({
          idPublicacao: data.id_publicacao,
          titulo: data.titulo,
          subtitulo: data.subtitulo,
          resumo: data.resumo,
          categoria: data.categoria,
          banner: data.banner,
          palavrasChave: data.palavras_chave || "", // Agora string
          autores: data.autores || "", // Agora string
          publicacoes: data.publicacoes,
          revisadoPor: data.revisado_por,
          slug: data.slug,
          visibilidade: data.visibilidade,
          link: data.link,
          dataCriacao: new Date(data.data_criacao),
          dataModificacao: new Date(data.data_modificacao),
          visualizacoes: data.visualizacoes,
        });

        setFormData({
          titulo: data.titulo,
          subtitulo: data.subtitulo,
          resumo: data.resumo,
          categoria: data.categoria,
          banner: data.banner,
          palavrasChave: data.palavras_chave || "", // Agora string
          autores: data.autores || "", // Agora string
          publicacoes: data.publicacoes,
          link: data.link,
        });
      } catch (error) {
        console.error("Erro ao obter a publicação", error);
      }
    };

    if (identifier && slug) {
      fetchPublicacao();
    }
  }, [identifier, slug]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData(publicacao || {});
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "palavrasChave" || name === "autores"
          ? value // Mantém como string
          : value,
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

      if (!publicacao?.idPublicacao) {
        throw new Error("ID da publicação inválido.");
      }

      let updatedSlug = publicacao.slug;
      if (publicacao.titulo !== formData.titulo) {
        updatedSlug = formData.titulo
          ? formData.titulo.toLowerCase().replace(/\s+/g, "-")
          : publicacao.slug;
      }

      const updatedFormData = {
        ...formData,
        slug: updatedSlug,
        dataModificacao: new Date().toISOString(),
      };

      await api.put(
        `/api/publicacoes/${publicacao.idPublicacao}`,
        updatedFormData,
        {
          headers: {
            "X-CSRF-Token": csrfToken,
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      alert("Publicação atualizada com sucesso!");
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao atualizar a publicação", error);
      alert(
        "Falha ao atualizar a publicação. Verifique o console para mais detalhes."
      );
    }
  };

  const handleBackToPublicacoes = () => {
    router.push("/perfil/publicacoes/minhas-publicacoes");
  };

  if (!publicacao) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Header />
      <div className="bg-green-500 p-5">
        <h2>{isEditing ? "Editar Publicação" : publicacao.titulo}</h2>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div>
              <label>Título:</label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo || ""}
                onChange={handleInputChange}
                className="border p-2 w-full"
              />
            </div>

            <div>
              <label>Subtítulo:</label>
              <input
                type="text"
                name="subtitulo"
                value={formData.subtitulo || ""}
                onChange={handleInputChange}
                className="border p-2 w-full"
              />
            </div>

            <div>
              <label>Resumo:</label>
              <textarea
                name="resumo"
                value={formData.resumo || ""}
                onChange={handleInputChange}
                className="border p-2 w-full"
              />
            </div>

            <div>
              <label>Categoria:</label>
              <input
                type="text"
                name="categoria"
                value={formData.categoria || ""}
                onChange={handleInputChange}
                className="border p-2 w-full"
              />
            </div>

            <div>
              <label>Banner (URL):</label>
              <input
                type="text"
                name="banner"
                value={formData.banner || ""}
                onChange={handleInputChange}
                className="border p-2 w-full"
              />
            </div>

            <div>
              <label>Autores:</label>
              <input
                type="text"
                name="autores"
                value={formData.autores || ""}
                onChange={handleInputChange}
                className="border p-2 w-full"
              />
            </div>

            <div>
              <label>Palavras-Chave:</label>
              <input
                type="text"
                name="palavrasChave"
                value={formData.palavrasChave || ""}
                onChange={handleInputChange}
                className="border p-2 w-full"
              />
            </div>

            <div>
              <label>Link:</label>
              <input
                type="text"
                name="link"
                value={formData.link || ""}
                onChange={handleInputChange}
                className="border p-2 w-full"
              />
            </div>

            <div className="flex justify-between mt-4">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Salvar Alterações
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancelar Edição
              </button>
            </div>
          </form>
        ) : (
          <div>
            <p>
              <strong>Resumo:</strong> {publicacao.resumo}
            </p>
            <p>
              <strong>Subtítulo:</strong> {publicacao.subtitulo}
            </p>
            <p>
              <strong>Categoria:</strong> {publicacao.categoria}
            </p>
            <p>
              <strong>Banner:</strong> {publicacao.banner}
            </p>
            <p>
              <strong>Palavras-Chave:</strong>{" "}
              {publicacao.palavrasChave || "Não disponível"}
            </p>
            <p>
              <strong>Autores:</strong> {publicacao.autores || "Não disponível"}
            </p>
            <p>
              <strong>Link:</strong> {publicacao.link || "Não disponível"}
            </p>
            <p>
              <strong>Data de Criação:</strong>{" "}
              {new Date(publicacao.dataCriacao).toLocaleString()}
            </p>
            <p>
              <strong>Última Modificação:</strong>{" "}
              {new Date(publicacao.dataModificacao).toLocaleString()}
            </p>
            <p>
              <strong>Visualizações:</strong> {publicacao.visualizacoes}
            </p>
            <p>
              <strong>Revisado Por:</strong>{" "}
              {publicacao.revisadoPor || "Não disponível"}
            </p>
            <p>
              <strong>Visibilidade:</strong>{" "}
              {publicacao.visibilidade ? "Público" : "Privado"}
            </p>

            <button
              onClick={handleEdit}
              className="bg-indigo-500 text-white px-4 py-2 rounded"
            >
              Editar Publicação
            </button>
            <button
              onClick={handleBackToPublicacoes}
              className="bg-gray-500 text-white px-4 py-2 rounded ml-4"
            >
              Voltar para Minhas Publicações
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default PublicacaoPage;
