"use client";

import React from "react";
import { useParams } from "next/navigation";
import useSWR from 'swr';
import { getAPIClient } from "@/services/axios";
import Layout from "../../../../components/Layout";

// Função para buscar dados
const fetcher = (url: string) => getAPIClient().get(url).then(res => res.data);


const NoticiaPage: React.FC = () => {
  const { identifier, slug } = useParams();

  // useSWR faz a requisição de forma otimizada e com cache, com revalidação a cada 15 segundos
  const { data: noticia, error } = useSWR(
    identifier && slug ? `/api/noticias/${identifier}/${slug}` : null,
    fetcher,
    { revalidateOnFocus: true, refreshInterval: 15000 } // Atualiza a cada 15 segundos
  );

  // Tratamento de erro
  if (error) return <div>Erro ao carregar a notícia</div>;

  // Estado de carregamento
  if (!noticia) return <div>Carregando...</div>;

  return (
    <>
      <Layout>
        <div className="p-8 max-w-screen-lg mx-auto my-20">
          {noticia.imagem_noticia && (
            <p className="text-lg mb-4">
              <strong>Imagem da Notícia (URL):</strong> {noticia.imagem_noticia}
            </p>
          )}

          <h2 className="text-4xl font-bold mb-6 text-center text-indigo-900">
            {noticia.titulo}
          </h2>

          {noticia.subtitulo && (
            <p className="text-xl text-center text-gray-600 mb-4">
              {noticia.subtitulo}
            </p>
          )}

          <p className="text-sm text-gray-500 mb-2">
            <strong>Autor:</strong> {noticia.nome_de_usuario || "Não disponível"} |{" "}
            <strong>Revisado por:</strong> {noticia.nome_revisor || "Não disponível"} |{" "}
            <strong>Publicada em:</strong> {new Date(noticia.data_publicacao).toLocaleString()}
          </p>

          {noticia.data_revisao && (
            <p className="text-sm text-gray-500 mb-2">
              <strong>Revisada em:</strong>{" "}
              {new Date(noticia.data_revisao).toLocaleString()}
            </p>
          )}

          <p className="text-sm text-gray-500 mb-4">
            <strong>Categoria:</strong> {noticia.categoria || "Não disponível"}{" "}
            | <strong>Visualizações:</strong> {noticia.visualizacoes}
          </p>

          {noticia.lead && (
            <p className="text-lg mb-4">
              <strong>Lead:</strong> {noticia.lead}
            </p>
          )}

          <p className="text-lg mb-4">
            <strong>Tags:</strong>{" "}
            {noticia.tags.length > 0 ? noticia.tags.join(", ") : "Nenhuma tag disponível"}
          </p>

          <p className="text-md mb-6">
            <strong>Conteúdo:</strong> {noticia.conteudo}
          </p>

          <div className="flex mt-4">
            <button
              onClick={() => history.back()}
              className="bg-gray-500 hover:bg-gray-800 text-white px-6 py-3 rounded-lg"
            >
              Voltar
            </button>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default NoticiaPage;
