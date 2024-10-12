"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAPIClient } from "../../../../../../../services/axios";
import { parseCookies } from "nookies";
import Layout from "../../../../../../components/Layout";

interface Noticia {
  idNoticia: string;
  titulo: string;
  subtitulo: string;
  lead: string; // Lead substitui "resumo"
  categoria: string;
  imagemNoticia: string; // Substitui banner
  tags: string;
  autores: string;
  revisadoPor: string;
  slug: string;
  visibilidade: boolean;
  link: string | null;
  dataPublicacao: Date;
  dataRevisao: Date;
  visualizacoes: number;
  conteudo: string;
  nomeAutor: string; // Autor da notícia
}

const NoticiaPage: React.FC = () => {
  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Noticia>>({});
  const { identifier, slug } = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchNoticia = async () => {
      try {
        const api = getAPIClient();
        const response = await api.get(
          `/api/noticias/usuario/${identifier}/${slug}`
        );

        const data = response.data;

        // Configura a notícia com dados do backend
        setNoticia({
          idNoticia: data.id_noticia,
          titulo: data.titulo,
          subtitulo: data.subtitulo,
          lead: data.lead,
          categoria: data.categoria,
          imagemNoticia: data.imagem_noticia,
          tags: data.tags.join(", "),
          autores: data.autores.join(", "),
          revisadoPor: data.revisado_por,
          slug: data.slug,
          visibilidade: data.visibilidade,
          link: data.link,
          dataPublicacao: new Date(data.data_publicacao),
          dataRevisao: new Date(data.data_revisao),
          visualizacoes: data.visualizacoes,
          conteudo: data.conteudo || "",
          nomeAutor: data.nome_autor || "Autor desconhecido"
        });

        setFormData({
          titulo: data.titulo,
          subtitulo: data.subtitulo,
          lead: data.lead,
          categoria: data.categoria,
          imagemNoticia: data.imagem_noticia,
          tags: data.tags.join(", "),
          autores: data.autores.join(", "),
          link: data.link,
          conteudo: data.conteudo || "",
        });
      } catch (error) {
        console.error("Erro ao obter a notícia", error);
      }
    };

    if (identifier && slug) {
      fetchNoticia();
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

      const tagsArray = formData.tags
        ? formData.tags.split(",").map((item) => item.trim())
        : [];
      const autoresArray = formData.autores
        ? formData.autores.split(",").map((item) => item.trim())
        : [];

      const updatedFormData = {
        titulo: formData.titulo,
        subtitulo: formData.subtitulo,
        tags: tagsArray,
        imagem_noticia: formData.imagemNoticia,
        lead: formData.lead,
        categoria: formData.categoria,
        autores: autoresArray,
        link: formData.link,
        conteudo: formData.conteudo,
      };

      await api.put(
        `/api/noticias/${noticia?.idNoticia}`,
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
      router.push("/perfil/noticias/minhas-noticias"); // Redirecionar após salvar
    } catch (error) {
      console.error("Erro ao atualizar a notícia", error);
      alert("Falha ao atualizar a notícia. Verifique o console.");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData(noticia || {});
  };

  const handleBackToNoticias = () => {
    router.push("/perfil/noticias/minhas-noticias");
  };

  if (!noticia) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Layout>
        <div className="p-8 max-w-screen-lg mx-auto my-20">
          {noticia?.imagemNoticia && (
            <p className="text-lg mb-4">
              <strong>Imagem (URL):</strong> {noticia.imagemNoticia}
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
                <label className="block text-lg font-semibold mb-2">Lead:</label>
                <textarea
                  name="lead"
                  value={formData.lead || ""}
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
                <label className="block text-lg font-semibold mb-2">Imagem (URL):</label>
                <input
                  type="text"
                  name="imagemNoticia"
                  value={formData.imagemNoticia || ""}
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
                <label className="block text-lg font-semibold mb-2">Tags:</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags || ""}
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
                <label className="block text-lg font-semibold mb-2">Conteúdo:</label>
                <textarea
                  name="conteudo"
                  value={formData.conteudo || ""}
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
                {noticia.titulo}
              </h2>

              <p className="text-xl text-center text-gray-600 mb-4">
                {noticia.subtitulo}
              </p>

              <p className="text-sm text-gray-500 mb-2">
                <strong>Autor:</strong> {noticia.nomeAutor || "Não disponível"} |{" "}
                <strong>Visibilidade:</strong>{" "}
                {noticia.visibilidade ? "Público" : "Privado"} |{" "}
                <strong>Revisado Por:</strong>{" "}
                {noticia.revisadoPor || "Não disponível"}
              </p>

              <p className="text-sm text-gray-500 mb-4">
                <strong>Publicado em:</strong>{" "}
                {new Date(noticia.dataPublicacao).toLocaleString()} |{" "}
                <strong>Última Revisão:</strong>{" "}
                {new Date(noticia.dataRevisao).toLocaleString()} |{" "}
                <strong>Visualizações:</strong> {noticia.visualizacoes}
              </p>

              <p className="text-lg mb-2">
                <strong>Autores:</strong> {noticia.autores || "Não disponível"}
              </p>

              <p className="text-lg mb-4">
                <strong>Tags:</strong> {noticia.tags || "Não disponível"}
              </p>

              <p className="text-lg mb-4">
                <strong>Categoria:</strong>{" "}
                {noticia.categoria || "Não disponível"}
              </p>

              <p className="text-md mb-6">
                <strong>Lead:</strong> {noticia.lead}
              </p>

              {noticia.link && (
                <p className="text-md mb-6">
                  <strong>Link:</strong>{" "}
                  <a
                    href={noticia.link}
                    className="text-blue-500 hover:underline"
                  >
                    {noticia.link}
                  </a>
                </p>
              )}

              {noticia.conteudo && (
                <p className="text-md mb-6">
                  <strong>Conteúdo:</strong>{" "}
                  {noticia.conteudo || "Não disponível"}
                </p>
              )}

              <div className="flex mt-4">
                <button
                  onClick={handleEdit}
                  className="bg-indigo-500 text-white px-6 py-3 rounded-lg"
                >
                  Editar Notícia
                </button>
                <button
                  onClick={handleBackToNoticias}
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
  );
};

export default NoticiaPage;
