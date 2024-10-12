"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { FaUser, FaBorderAll } from "react-icons/fa";
import { getAPIClient } from "@/services/axios";
import Layout from "../components/Layout";

interface Noticia {
  id_noticia: string;
  titulo: string;
  subtitulo?: string;
  data_publicacao: string;
  autores: string[];
  nome_de_usuario: string;
  imagem_noticia?: string;
  lead?: string;
  categoria?: string;
  tags: string[];
  slug: string;
  identifier: string;
  visualizacoes: number;
  conteudo?: string;
}

const NoticiasPage: React.FC = () => {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [totalNoticias, setTotalNoticias] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todos");
  const [filtroAnoInicio, setFiltroAnoInicio] = useState("");
  const [filtroAnoFim, setFiltroAnoFim] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 8;

  const getAnos = () => {
    const currentYear = new Date().getFullYear();
    const anos = [];
    for (let year = 2000; year <= currentYear; year++) {
      anos.push(year);
    }
    return anos;
  };

  const fetchNoticias = useCallback(async () => {
    try {
      const api = getAPIClient();
      const response = await api.get("/api/noticias/", {
        params: {
          pagina: paginaAtual,
          itens_por_pagina: itensPorPagina,
          searchTerm,
          categoria: filtroCategoria !== "Todos" ? filtroCategoria : undefined,
          ano_inicio: filtroAnoInicio,
          ano_fim: filtroAnoFim,
        },
      });

      const noticiasMapeadas = response.data.noticias.map((noticia: Noticia) => ({
        id_noticia: noticia.id_noticia,
        titulo: noticia.titulo,
        subtitulo: noticia.subtitulo,
        autores: noticia.autores || ["Autor desconhecido"],
        nome_de_usuario: noticia.nome_de_usuario,
        categoria: noticia.categoria || "Categoria não informada",
        tags: noticia.tags || [],
        slug: noticia.slug,
        identifier: noticia.identifier,
        data_publicacao: noticia.data_publicacao,
        visualizacoes: noticia.visualizacoes,
        lead: noticia.lead || "Sem resumo disponível",
        imagem_noticia: noticia.imagem_noticia,
      }));

      setNoticias(noticiasMapeadas);
      setTotalNoticias(response.data.total);
    } catch (error) {
      console.error("Erro ao obter as notícias", error);
    }
  }, [paginaAtual, filtroCategoria, filtroAnoInicio, filtroAnoFim, searchTerm]);

  useEffect(() => {
    fetchNoticias();
  }, [fetchNoticias]);

  const filtrarNoticias = () => {
    setPaginaAtual(1);
    fetchNoticias();
  };

  const limparFiltros = () => {
    setSearchTerm("");
    setFiltroCategoria("Todos");
    setFiltroAnoInicio("");
    setFiltroAnoFim("");
    setPaginaAtual(1);
    fetchNoticias();
  };

  const totalPaginas = Math.ceil(totalNoticias / itensPorPagina);

  const renderNoticias = () => {
    if (totalNoticias === 0) {
      return <div>Sem notícias encontradas</div>;
    }

    return noticias.map((noticia) => (
      <div key={noticia.id_noticia} className="py-4 border-b flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-blue-900 hover:text-blue-700">
            {noticia.titulo}
          </h3>

          <div className="flex items-center mt-2">
            <FaUser className="text-gray-600 mr-2" />
            <p className="text-sm text-gray-600">{noticia.nome_de_usuario}</p>
          </div>

          <div className="flex items-center mt-1">
            <FaBorderAll className="text-gray-600 mr-2" />
            <p className="text-sm text-gray-600">{noticia.categoria}</p>
          </div>

          <div className="mt-1 text-sm text-gray-600">
            <strong>Resumo: </strong> {noticia.lead}
          </div>

          <div className="flex items-center mt-1 text-sm text-gray-600">
            <span>
              <strong>Data de publicação:</strong> {new Date(noticia.data_publicacao).toLocaleDateString()}
            </span>
            <span className="ml-4">
              <strong>Visualizações:</strong> {noticia.visualizacoes}
            </span>
          </div>

          <Link href={`/noticias/noticia/${noticia.identifier}/${noticia.slug}`}>
            <span className="inline-block mt-4 text-blue-500 hover:text-blue-700">Saiba mais</span>
          </Link>
        </div>
      </div>
    ));
  };

  const renderPaginacao = () => {
    if (totalPaginas <= 1) {
      return null;
    }

    const paginas = [];
    for (let i = 1; i <= totalPaginas; i++) {
      paginas.push(
        <button
          key={i}
          onClick={() => setPaginaAtual(i)}
          className={`px-3 py-1 mx-1 rounded ${i === paginaAtual ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-start mt-4">
        {paginaAtual > 1 && (
          <button onClick={() => setPaginaAtual(paginaAtual - 1)} className="px-3 py-1 mx-1 rounded bg-gray-200">
            &lt;
          </button>
        )}
        {paginas}
        {paginaAtual < totalPaginas && (
          <button onClick={() => setPaginaAtual(paginaAtual + 1)} className="px-3 py-1 mx-1 rounded bg-gray-200">
            &gt;
          </button>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="p-8 bg-gray-100 px-52">
        <h2 className="text-3xl font-bold mb-6">Últimas Notícias</h2>

        {/* Filtros */}
        <div className="flex items-center mb-6">
          <input
            type="text"
            placeholder="Pesquisar por assunto"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded w-1/3 mr-4"
          />

          {/* Filtro por Categoria */}
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="p-2 border border-gray-300 rounded mr-4"
          >
            <option value="Todos">Categoria</option>
            <option value="Notícia">Notícia</option>
            <option value="Blog">Blog</option>
            <option value="Anúncio">Anúncio</option>
          </select>

          {/* Filtro por Período (Ano de Início e Ano de Fim) */}
          <select
            value={filtroAnoInicio}
            onChange={(e) => setFiltroAnoInicio(e.target.value)}
            className="p-2 border border-gray-300 rounded mr-4"
          >
            <option value="">Ano Início</option>
            {getAnos().map((ano) => (
              <option key={ano} value={ano}>
                {ano}
              </option>
            ))}
          </select>

          <select
            value={filtroAnoFim}
            onChange={(e) => setFiltroAnoFim(e.target.value)}
            className="p-2 border border-gray-300 rounded mr-4"
          >
            <option value="">Ano Fim</option>
            {getAnos().map((ano) => (
              <option key={ano} value={ano}>
                {ano}
              </option>
            ))}
          </select>

          <button onClick={filtrarNoticias} className="bg-blue-500 text-white p-2 rounded">
            Buscar
          </button>
          <button onClick={limparFiltros} className="bg-gray-400 text-white p-2 rounded ml-4">
            Limpar Filtros
          </button>
        </div>

        {/* Lista de notícias */}
        <div className="bg-white rounded shadow p-6 w-full lg:w-3/5">{renderNoticias()}</div>

        {/* Paginação */}
        {renderPaginacao()}
      </div>
    </Layout>
  );
};

export default NoticiasPage;
