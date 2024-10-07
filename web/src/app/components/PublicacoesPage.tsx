"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAPIClient } from "../../services/axios";

interface Publicacao {
  idPublicacao: string;
  titulo: string;
  resumo: string;
  categoria: string;
  banner: string;
  palavrasChave: string[];
  autores: string[];
  publicacoes: string;
  revisadoPor: string;
  slug: string;
  visibilidade: boolean;
  user: string;
  identifier: string;
  pdf: Buffer | null;
  link: string | null;
  dataCriacao: Date;
  dataModificacao: Date;
  visualizacoes: number;
}

const PublicacoesPage: React.FC = () => {
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 3; // Número de publicações exibidas por vez

  useEffect(() => {
    const fetchPublicacoes = async () => {
      try {
        const api = getAPIClient();
        const response = await api.get("/api/publicacoes");
        const publicacoesMapeadas = response.data.publicacoes.map((publicacao: any) => ({
          idPublicacao: publicacao.id_publicacao,
          titulo: publicacao.titulo,
          resumo: publicacao.resumo,
          categoria: publicacao.categoria,
          banner: publicacao.banner,
          palavrasChave: publicacao.palavras_chave,
          autores: publicacao.autores,
          publicacoes: publicacao.publicacoes,
          revisadoPor: publicacao.revisado_por,
          slug: publicacao.slug,
          visibilidade: publicacao.visibilidade,
          user: publicacao.nome_de_usuario,
          identifier: publicacao.identifier,
          pdf: publicacao.pdf,
          link: publicacao.link,
          dataCriacao: new Date(publicacao.data_criacao),
          dataModificacao: new Date(publicacao.data_modificacao),
          visualizacoes: publicacao.visualizacoes,
        }));
        setPublicacoes(publicacoesMapeadas);
      } catch (error) {
        console.error("Erro ao obter as publicações", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicacoes();
  }, []);

  const nextPublication = () => {
    setCurrent((prev) => (prev + 1) % publicacoes.length);
  };

  const prevPublication = () => {
    setCurrent((prev) => (prev - 1 + publicacoes.length) % publicacoes.length);
  };

  if (loading) {
    return <div>Carregando publicações...</div>;
  }

  // Cálculo para selecionar as publicações da página atual
  const currentPublicacoes = publicacoes.slice(current, current + itemsPerPage);

  return (
    <div className="w-full p-10 bg-blue-ineof text-white py-12">
      <div className="relative flex items-center justify-between">
        {/* Botão de navegação à esquerda */}
        <button onClick={prevPublication} className="text-green-500 text-2xl absolute left-4 z-10">&#10094;</button>

        {/* Contêiner do carrossel com cards */}
        <div className="flex overflow-hidden w-[90%] mx-auto justify-center">
          {/* Meio card à esquerda */}
          {current > 0 && (
            <div className="flex-none w-1/4 mx-2 p-4 rounded-lg bg-white text-black shadow-lg transform scale-90 opacity-50">
              <h3 className="text-lg font-semibold">{publicacoes[current - 1].titulo}</h3>
              <p>{publicacoes[current - 1].autores.join(", ")}</p>
            </div>
          )}
          
          {/* Cards atuais */}
          {currentPublicacoes.map((pub, index) => (
            <div key={index} className="flex-none w-72 mx-2 p-4 rounded-lg bg-white text-black shadow-lg transition duration-300 ease-in-out transform scale-100">
              <h3 className="text-lg font-semibold">{pub.titulo}</h3>
              <p>{pub.autores.join(", ")}</p>
              <p>{pub.categoria}</p>
              <p className="mb-4">{pub.resumo}</p>
              <Link href={`/publicacoes/publicacao/${pub.identifier}/${pub.slug}`}>
                <span className="inline-block bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">Ver detalhes</span>
              </Link>
            </div>
          ))}

          {/* Card para "Ver mais publicações" */}
          <div className="flex-none w-72 mx-2 p-4 rounded-lg bg-white text-black shadow-lg cursor-pointer">
            <Link href="/publicacoes">
              <span className="text-lg font-semibold text-center block mb-5">Ver mais publicações</span>
              <button className="text-center rounded-lg bg-green-ineof text-white">Clique aqui para ver todas as publicações disponíveis.</button>
            </Link>
          </div>

          {/* Meio card à direita */}
          {current < publicacoes.length - itemsPerPage && (
            <div className="flex-none w-1/4 mx-2 p-4 rounded-lg bg-white text-black shadow-lg transform scale-90 opacity-50">
              <h3 className="text-lg font-semibold">{publicacoes[current + itemsPerPage].titulo}</h3>
              <p>{publicacoes[current + itemsPerPage].autores.join(", ")}</p>
            </div>
          )}
        </div>

        {/* Botão de navegação à direita */}
        <button onClick={nextPublication} className="text-green-500 text-2xl absolute right-4 z-10">&#10095;</button>
      </div>
    </div>
  );
};

export default PublicacoesPage;
