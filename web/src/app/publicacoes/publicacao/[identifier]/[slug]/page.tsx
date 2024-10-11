"use client";

import React, { useEffect, useState, useContext } from "react";
import { FaBookmark } from "react-icons/fa";
import { useParams } from "next/navigation";
import { getAPIClient } from "@/services/axios";
import Layout from "../../../../components/Layout";
import { AuthContext } from "@/contexts/AuthContext";


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
  nomeUsuario: string;
}

const PublicacaoPage: React.FC = () => {
  const { user } = useContext(AuthContext); // Verifica se o usuário está logado
  const [publicacao, setPublicacao] = useState<Publicacao | null>(null);
  const { identifier, slug } = useParams();

  useEffect(() => {
    const fetchPublicacao = async () => {
      try {
        const api = getAPIClient();
        const response = await api.get(
          `/api/publicacoes/${identifier}/${slug}`
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
          nomeUsuario: data.nome_de_usuario || "Usuário desconhecido",
        });
      } catch (error) {
        console.error("Erro ao obter a publicação", error);
      }
    };

    if (identifier && slug) {
      fetchPublicacao();
    }
  }, [identifier, slug]);

  const handleSaveFavorite = async () => {
    try {
      const api = getAPIClient();
      await api.post(`/api/favoritos`, {
        idPublicacao: publicacao?.idPublicacao,
      });
      alert("Publicação salva como favorito!");
    } catch (error) {
      console.error("Erro ao salvar como favorito", error);
      alert("Erro ao salvar como favorito.");
    }
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


          <p className="text-lg mb-4">
            <strong>Categoria:</strong>{" "}
            {publicacao.categoria || "Não disponível"}
          </p>
          
          <p className="text-md mb-6">
            <strong>Resumo:</strong> {publicacao.resumo}
          </p>

          {publicacao.link && (
            <p className="text-md mb-6">
              <strong>Link:</strong>{" "}
              <a href={publicacao.link} className="text-blue-500 hover:underline">
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
              onClick={() => history.back()}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg"
            >
              Voltar
            </button>

            {/* Verifica se o usuário está logado antes de exibir o botão de favoritar */}
            {user && (
              <button
                onClick={handleSaveFavorite}
                className="bg-green-500 text-white px-6 py-3 rounded-lg ml-4 flex items-center"
              >
                <FaBookmark className="mr-2" />
                Salvar como favorito
              </button>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default PublicacaoPage;
