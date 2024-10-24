"use client";

import { useRouter } from "next/navigation"; // Certifique-se de usar 'next/navigation' para App Router
import React from "react";

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

interface PublicacaoCardProps {
  publicacao: Publicacao;
}

const PublicacaoCard: React.FC<PublicacaoCardProps> = ({ publicacao }) => {
  const router = useRouter(); // Certifique-se de que isso está correto

  const redirectToPublicacao = () => {
    router.push(`/publicacoes/publicacao/${publicacao.identifier}/${publicacao.slug}`);
  };

  return (
    <div className="bg-white p-4 shadow-md mb-4">
      <h3 className="text-lg font-bold text-gray-500">{publicacao.titulo}</h3>
      <p className="text-gray-500">
        {publicacao.resumo.length > 50
          ? `${publicacao.resumo.substring(0, 50)}...`
          : publicacao.resumo}
      </p>
      <button onClick={redirectToPublicacao} className="bg-green-500 text-white p-1 mt-2">
        Ver Artigo
      </button>
    </div>
  );
};

export default PublicacaoCard;
