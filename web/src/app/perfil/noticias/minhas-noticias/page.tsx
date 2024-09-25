"use client";  

import React, { useEffect, useState } from "react";
import Link from "next/link";

import PublicacaoCardMe from "../../../components/PublicacaoCardMe";
import { getAPIClient } from "../../../../services/axios";
import Header from "../../../partials/Header";
import Footer from "../../../partials/Footer";


interface Publicacao {
  idPublicacao: string;
  titulo: string;
  resumo: string;
  categoria: string;
  banner: string;
  palavrasChave: string;
  autores: string;
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

const MinhasPublicacoesPage: React.FC = () => {
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicacoes = async () => {
      try {
        const api = getAPIClient();
        const response = await api.get<Publicacao[]>("/api/user/minhas-publicacoes");
        setPublicacoes(response.data);
      } catch (error) {
        console.error("Erro ao obter as minhas publicações", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicacoes();
  }, []);

  const renderPublicacaoCards = () => {
    const cardsPerRow = 4;
    const rows = Math.ceil(publicacoes.length / cardsPerRow);

    const publicacoesRows: JSX.Element[] = [];

    for (let i = 0; i < rows; i++) {
      const start = i * cardsPerRow;
      const end = start + cardsPerRow;
      const publicacaoRow = publicacoes.slice(start, end);

      publicacoesRows.push(
        <div key={i} className="flex bg-green-600">
          {publicacaoRow.map((publicacao) => (
            <div key={publicacao.idPublicacao} className="w-1/4 p-4">
              <PublicacaoCardMe publicacao={publicacao} />
            </div>
          ))}
        </div>
      );
    }

    return publicacoesRows;
  };

  const renderContent = () => {
    if (loading) {
      return <div>Carregando...</div>;
    }

    if (publicacoes.length === 0) {
      return (
        <div className="bg-green-500">
          <p>Sem artigos disponíveis.</p>
          <Link href="/" className="text-blue-500 hover:underline">
            Voltar ao índice
          </Link>
        </div>
      );
    }

    return renderPublicacaoCards();
  };

  return (
    <>
      <Header />
      <div className="bg-green-500">
        <h2 className="p-5">Minhas Publicações</h2>
        {renderContent()}
        <div className="p-5">
          <Link href="/perfil/publicacoes/nova-publicacao"
            className="bg-blue-500 text-white rounded py-2 px-4">Nova Publicação
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MinhasPublicacoesPage;
