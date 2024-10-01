"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import PublicacaoCardMe from "../../../components/PublicacaoCardMe";
import { getAPIClient } from "../../../../services/axios";
import Layout from "../../../components/Layout";


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
  identifier: string;
  link: string | null;
  dataCriacao: Date;
  dataModificacao: Date;
  visualizacoes: number;
}

const MinhasPublicacoesPage: React.FC = () => {
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [itensPorPagina] = useState(10);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [autores, setAutores] = useState("");

  const fetchPublicacoes = useCallback(async () => {
    setLoading(true);
    try {
      const api = getAPIClient();
      const query = new URLSearchParams();

      if (titulo) query.append("titulo", titulo);
      if (categoria) query.append("categoria", categoria);
      if (autores) query.append("autores", autores);
      query.append("pagina", pagina.toString());
      query.append("itens_por_pagina", itensPorPagina.toString());

      // Faz a requisição para a rota correta no backend
      const response = await api.get<Publicacao[]>(
        `/publicacoes/usuario?${query.toString()}`
      );
      setPublicacoes(response.data);

      const totalPublicacoes = parseInt(response.headers["x-total-count"] || "0", 10);
      setTotalPaginas(Math.ceil(totalPublicacoes / itensPorPagina));
    } catch (error) {
      console.error("Erro ao obter as publicações", error);
    } finally {
      setLoading(false);
    }
  }, [titulo, categoria, autores, pagina, itensPorPagina]);

  useEffect(() => {
    fetchPublicacoes();
  }, [fetchPublicacoes]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagina(1);
    fetchPublicacoes();
  };

  const handlePaginaAnterior = () => {
    if (pagina > 1) {
      setPagina(pagina - 1);
    }
  };

  const handleProximaPagina = () => {
    if (pagina < totalPaginas) {
      setPagina(pagina + 1);
    }
  };

  const renderPublicacaoCards = () => {
    return publicacoes.length ? (
      publicacoes.map((publicacao) => (
        <div key={publicacao.idPublicacao} className="w-1/4 p-4">
          <PublicacaoCardMe publicacao={publicacao} />
        </div>
      ))
    ) : (
      <div>Sem publicações</div>
    );
  };

  const renderContent = () => {
    if (loading) return <div>Carregando...</div>;

    return (
      <>
        <div className="grid grid-cols-4 gap-4 bg-green-600">{renderPublicacaoCards()}</div>
        <div className="flex justify-between items-center p-5">
          <button
            disabled={pagina === 1}
            onClick={handlePaginaAnterior}
            className="bg-gray-500 text-white rounded py-2 px-4"
          >
            Página Anterior
          </button>
          <span>Página {pagina} de {totalPaginas}</span>
          <button
            disabled={pagina === totalPaginas}
            onClick={handleProximaPagina}
            className="bg-gray-500 text-white rounded py-2 px-4"
          >
            Próxima Página
          </button>
        </div>
      </>
    );
  };

  return (
    <Layout>
      <div className="bg-green-500">
        <h2 className="p-5">Minhas Publicações</h2>

        <form onSubmit={handleSearch} className="p-5">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Título"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Autores"
              value={autores}
              onChange={(e) => setAutores(e.target.value)}
              className="p-2 border border-gray-300 rounded"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white rounded py-2 px-4"
            >
              Pesquisar
            </button>
          </div>
        </form>

        {renderContent()}

        <div className="p-5 flex gap-4">
          <Link href="/perfil/publicacoes/nova-publicacao">
            <span className="bg-blue-500 text-white rounded py-2 px-4">Nova Publicação</span>
          </Link>
          <Link href="/perfil/favoritos">
            <span className="bg-yellow-500 text-white rounded py-2 px-4">Favoritos</span>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default MinhasPublicacoesPage;
