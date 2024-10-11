"use client";

import React, { useEffect, useState, useContext, useCallback } from "react";
import Link from "next/link";
import { FaUser, FaKey, FaBookmark, FaBorderAll } from "react-icons/fa";
import { getAPIClient } from "@/services/axios";
import Layout from "../components/Layout";
import { AuthContext } from "../../contexts/AuthContext";

interface Publicacao {
  idPublicacao: string;
  titulo: string;
  autores: string[];
  palavrasChave: string[];
  categoria: string;
  identifier: string;
  slug: string;
  dataCriacao: Date;
  dataModificacao: Date;
  visualizacoes: number;
  resumo: string;
}

const PublicacoesPage: React.FC = () => {
  const { user, loading } = useContext(AuthContext);
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [totalPublicacoes, setTotalPublicacoes] = useState(0); 
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todos");
  const [filtroAnoInicio, setFiltroAnoInicio] = useState("");
  const [filtroAnoFim, setFiltroAnoFim] = useState("");
  const [filtroPalavrasChave, setFiltroPalavrasChave] = useState("Todos");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 8;

  // Função para gerar os anos disponíveis no filtro de período
  const getAnos = () => {
    const currentYear = new Date().getFullYear();
    const anos = [];
    for (let year = 2000; year <= currentYear; year++) {
      anos.push(year);
    }
    return anos;
  };

  const getPalavrasChave = () => {
    return ["Palavras-chave", "IA", "Energia Solar", "Ondas", "Vento", "Hidrogênio", "Baterias"];
  };

  const fetchPublicacoes = useCallback(async () => {
    try {
      const api = getAPIClient();
      const response = await api.get("/api/publicacoes/filtro", {
        params: {
          pagina: paginaAtual,
          itens_por_pagina: itensPorPagina,
          searchTerm,
          categoria: filtroCategoria !== "Todos" ? filtroCategoria : undefined,
          ano_inicio: filtroAnoInicio,
          ano_fim: filtroAnoFim,
          palavras_chave: filtroPalavrasChave !== "Todos" ? filtroPalavrasChave : undefined,
        },
      });

      const publicacoesMapeadas = response.data.publicacoes.map((publicacao: any) => ({
        idPublicacao: publicacao.id_publicacao,
        titulo: publicacao.titulo,
        autores: publicacao.autores,
        palavrasChave: publicacao.palavras_chave,
        categoria: publicacao.categoria,
        identifier: publicacao.identifier,
        slug: publicacao.slug,
        dataCriacao: new Date(publicacao.data_criacao),
        dataModificacao: new Date(publicacao.data_modificacao),
        visualizacoes: publicacao.visualizacoes,
        resumo: publicacao.resumo,
      }));

      setPublicacoes(publicacoesMapeadas);
      setTotalPublicacoes(response.data.total);
    } catch (error) {
      console.error("Erro ao obter as publicações", error);
    }
  }, [paginaAtual, filtroCategoria, filtroAnoInicio, filtroAnoFim, filtroPalavrasChave, searchTerm]);

  useEffect(() => {
    fetchPublicacoes();
  }, [fetchPublicacoes]);

  const filtrarPublicacoes = () => {
    setPaginaAtual(1);
    fetchPublicacoes();
  };

  const limparFiltros = () => {
    setSearchTerm("");
    setFiltroCategoria("Todos");
    setFiltroAnoInicio("");
    setFiltroAnoFim("");
    setFiltroPalavrasChave("Todos");
    setPaginaAtual(1);
    fetchPublicacoes();
  };

  const totalPaginas = Math.ceil(totalPublicacoes / itensPorPagina);

  const renderPublicacoes = () => {
    if (loading) {
      return <div>Carregando publicações...</div>;
    }

    if (totalPublicacoes === 0) {
      // Aqui garantimos que a mensagem será exibida quando não houver publicações
      return <div>Sem publicações encontradas</div>;
    }

    return publicacoes.map((pub) => (
      <div key={pub.idPublicacao} className="py-4 border-b flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-blue-900 hover:text-blue-700">
            {pub.titulo}
          </h3>

          <div className="flex items-center mt-2">
            <FaUser className="text-gray-600 mr-2" />
            <p className="text-sm text-gray-600">{pub.autores.join("; ")}</p>
          </div>

          <div className="flex items-center mt-1">
            <FaKey className="text-gray-600 mr-2" />
            <p className="text-sm text-gray-600">{pub.palavrasChave.join(", ")}</p>
          </div>
          <div className="flex items-center mt-1">
            <FaBorderAll className="text-gray-600 mr-2" />
            <p className="text-sm text-gray-600">{pub.categoria}</p>{" "}
            {/* Agora com vírgula */}
          </div>
          

          <div className="mt-1 text-sm text-gray-600">
            <strong>Resumo: </strong> {pub.resumo}
          </div>

          <div className="flex items-center mt-1 text-sm text-gray-600">
            <span>
              <strong>Data de criação:</strong> {pub.dataCriacao.toLocaleDateString()}
            </span>
            <span className="ml-4">
              <strong>Última modificação:</strong> {pub.dataModificacao.toLocaleDateString()}
            </span>
            <span className="ml-4">
              <strong>Visualizações:</strong> {pub.visualizacoes}
            </span>
          </div>

          <Link href={`/publicacoes/publicacao/${pub.identifier}/${pub.slug}`}>
            <span className="inline-block mt-4 text-blue-500 hover:text-blue-700">Saiba mais</span>
          </Link>
        </div>

        {/* Verificação se o usuário está logado antes de exibir o botão de favoritar */}
        {user && (
          <button className="text-gray-600 hover:text-blue-500">
            <FaBookmark size={20} />
          </button>
        )}
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
        <h2 className="text-3xl font-bold mb-6">Publicações</h2>

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
            <option value="Categoria">Categoria</option>
            <option value="Tese">Tese</option>
            <option value="Dissertação">Dissertação</option>
            <option value="Congresso">Congresso</option>
            <option value="Periódico">Periódico</option>
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

          {/* Filtro por Palavras-chave */}
          <select
            value={filtroPalavrasChave}
            onChange={(e) => setFiltroPalavrasChave(e.target.value)}
            className="p-2 border border-gray-300 rounded mr-4"
          >
            {getPalavrasChave().map((palavra) => (
              <option key={palavra} value={palavra}>
                {palavra}
              </option>
            ))}
          </select>

          <button onClick={filtrarPublicacoes} className="bg-blue-500 text-white p-2 rounded">
            Buscar
          </button>
          <button onClick={limparFiltros} className="bg-gray-400 text-white p-2 rounded ml-4">
            Limpar Filtros
          </button>
        </div>

        {/* Lista de publicações */}
        <div className="bg-white rounded shadow p-6 w-full lg:w-3/5">{renderPublicacoes()}</div>

        {/* Paginação */}
        {renderPaginacao()}
      </div>
    </Layout>
  );
};

export default PublicacoesPage;
