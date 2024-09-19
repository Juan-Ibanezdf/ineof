"use client";  

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

import Footer from "../../../partials/Footer";
import Header from "../../../partials/Header";
import { getAPIClient } from "../../../../services/axios";


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
  // Adicione mais propriedades, se necessário
}

const PublicacaoPage: React.FC = () => {
  const [publicacao, setPublicacao] = useState<Publicacao | null>(null);
  const router = useRouter();
  const { identifier, slug } = router.query;

  useEffect(() => {
    const fetchPublicacao = async () => {
      try {
        const api = getAPIClient();
        const response = await api.get<Publicacao>(
          `/api/publications/${identifier}/${slug}`
        );
        setPublicacao(response.data);
      } catch (error) {
        console.error("Erro ao obter a publicação", error);
      }
    };

    if (identifier && slug) {
      fetchPublicacao();
    }
  }, [identifier, slug]);

  if (!publicacao) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Header />
      <div className="bg-green-500 p-5">
        <h2>{publicacao.titulo}</h2>
        <p>{publicacao.resumo}</p>
        <p>Categoria: {publicacao.categoria}</p>
        <p>Autores: {publicacao.autores}</p>
        {/* Adicione mais informações da publicação, se necessário */}
      </div>
      <Footer />
    </>
  );
};

export default PublicacaoPage;
