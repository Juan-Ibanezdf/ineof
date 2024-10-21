"use client";

import React, { useContext } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { getAPIClient } from "@/services/axios";
import Layout from "../../../../components/Layout";
import { AuthContext } from "@/contexts/AuthContext";
import FavoriteButtonPublicacoes from "../../../../components/FavoriteButtonPublicacoes"; // Importa o componente de favoritos com botão

// Função para buscar dados
const fetcher = (url: string) =>
  getAPIClient()
    .get(url)
    .then((res) => res.data);

const PublicacaoPage: React.FC = () => {
  const { user } = useContext(AuthContext); // Verifica se o usuário está logado
  const { identifier, slug } = useParams();

  // useSWR faz a requisição de forma otimizada e com cache
  const { data: publicacao, error } = useSWR(
    identifier && slug ? `/api/publicacoes/${identifier}/${slug}` : null,
    fetcher,
    { revalidateOnFocus: true, refreshInterval: 15000 } // Atualiza a cada 15 segundos
  );

  // Tratamento de erro
  if (error) return <div>Erro ao carregar a publicação</div>;

  // Estado de carregamento
  if (!publicacao) return <div>Carregando...</div>;

  return (
    <>
      <Layout>
        <div className="p-8 max-w-screen-lg mx-auto my-20">
          {publicacao.banner && (
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
            <strong>Usuário:</strong>{" "}
            {publicacao.nome_de_usuario || "Não disponível"} |{" "}
            <strong>Visibilidade:</strong>{" "}
            {publicacao.visibilidade ? "Público" : "Privado"} |{" "}
            <strong>Revisado Por:</strong>{" "}
            {publicacao.revisadoPor || "Não disponível"}
          </p>

          <p className="text-sm text-gray-500 mb-4">
            <strong>Criado em:</strong>{" "}
            {new Date(publicacao.data_criacao).toLocaleString()} |{" "}
            <strong>Última Modificação:</strong>{" "}
            {new Date(publicacao.data_modificacao).toLocaleString()} |{" "}
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
              onClick={() => history.back()}
              className="bg-gray-500 hover:bg-gray-800 text-white px-6 py-3 rounded-lg mr-4"
            >
              Voltar
            </button>

            {user && (
              <FavoriteButtonPublicacoes
                idPublicacao={publicacao.id_publicacao}
                userId={user.idUsuario}
              />
            )}

          </div>
        </div>
      </Layout>
    </>
  );
};

export default PublicacaoPage;
