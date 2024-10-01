"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // Correto para pegar os parâmetros dinâmicos no App Router
import { getAPIClient } from "@/services/axios";
import Header from "@/app/partials/Header";
import Footer from "@/app/partials/Footer";


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

const PublicacaoPage: React.FC = () => {
  const [publicacao, setPublicacao] = useState<Publicacao | null>(null);
  const { identifier, slug } = useParams(); // Usando useParams para pegar os parâmetros da URL

  useEffect(() => {
    const fetchPublicacao = async () => {
      try {
        const api = getAPIClient();
        const response = await api.get<Publicacao>(
          `/api/publicacoes/${identifier}/${slug}`
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
        <p>Autores: {publicacao.autores.join(", ")}</p> {/* Mostrando autores como string */}
        {/* Adicione mais informações da publicação, se necessário */}
      </div>
      <Footer />
    </>
  );
};

export default PublicacaoPage;
