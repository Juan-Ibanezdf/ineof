"use client";

import React, { useEffect, useState, useContext, useCallback } from "react";
import Link from "next/link";
import { FaUser, FaTrashAlt, FaEdit, FaKey, FaBorderAll, FaTrash, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { getAPIClient } from "@/services/axios";
import Layout from "../../../components/Layout";
import { AuthContext } from "@/contexts/AuthContext";

interface Noticia {
  idNoticia: string;
  titulo: string;
  subtitulo?: string;
  categoria?: string;
  identifier: string;
  slug: string;
  dataPublicacao: Date;
  visualizacoes: number;
  tags?: string;
  resumo?: string;
  nomeAutor?: string;
  imagemNoticia?: string;
  status: string;
}

const NoticiasPage: React.FC = () => {
  const { user, loading } = useContext(AuthContext);
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [totalNoticias, setTotalNoticias] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todos");
  const [filtroAnoInicio, setFiltroAnoInicio] = useState("");
  const [filtroAnoFim, setFiltroAnoFim] = useState("");
  const [filtroTags, setFiltroTags] = useState("Todos");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false); // Estado do modal de confirmação
  const itensPorPagina = 8;

  const getAnos = () => {
    const currentYear = new Date().getFullYear();
    const anos = [];
    for (let year = 2000; year <= currentYear; year++) {
      anos.push(year);
    }
    return anos;
  };

  const getTags = () => {
    return [
      "Tags",
      "IA",
      "Energia Solar",
      "Ondas",
      "Vento",
      "Hidrogênio",
      "Baterias",
    ];
  };

  const fetchNoticias = useCallback(async () => {
    try {
      const api = getAPIClient();
      const response = await api.get("/api/noticias/usuario/filtro", {
        params: {
          pagina: paginaAtual,
          itens_por_pagina: itensPorPagina,
          searchTerm,
          categoria: filtroCategoria !== "Todos" ? filtroCategoria : undefined,
          ano_inicio: filtroAnoInicio,
          ano_fim: filtroAnoFim,
          tags: filtroTags !== "Todos" ? filtroTags : undefined,
        },
      });
  
      // Mapeando as notícias retornadas
      const noticiasMapeadas = response.data.noticias.map((noticia: any) => ({
        idNoticia: noticia.id_noticia,
        titulo: noticia.titulo,
        subtitulo: noticia.subtitulo,
        categoria: noticia.categoria,
        identifier: noticia.identifier,
        slug: noticia.slug,
        dataPublicacao: new Date(noticia.data_publicacao),
        visualizacoes: noticia.visualizacoes,
        tags: noticia.tags?.join(", "),
        resumo:
          noticia.lead && noticia.lead.length > 70
            ? noticia.lead.substring(0, 70) + "..."
            : noticia.lead,
        nomeAutor: noticia.nome_de_usuario,
        imagemNoticia: noticia.imagem_noticia,
        status: noticia.status,
      }));
  
      setNoticias(noticiasMapeadas);
      setTotalNoticias(response.data.total);
    } catch (error) {
      console.error("Erro ao obter as notícias", error);
    }
  }, [
    paginaAtual,
    filtroCategoria,
    filtroAnoInicio,
    filtroAnoFim,
    filtroTags,
    searchTerm,
  ]);
  

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
    setFiltroTags("Todos");
    setPaginaAtual(1);
    fetchNoticias();
  };

  const abrirModalExcluir = (idNoticia: string) => {
    setConfirmDeleteId(idNoticia);
    setShowModal(true); // Mostra o modal de confirmação
  };

  const confirmarExcluir = async () => {
    if (confirmDeleteId) {
      try {
        const api = getAPIClient();
        await api.delete(`/api/noticias/${confirmDeleteId}`);
        fetchNoticias();
        setConfirmDeleteId(null);
        setShowModal(false); // Fecha o modal após a exclusão
      } catch (error) {
        console.error("Erro ao excluir notícia", error);
      }
    }
  };

  const cancelarExcluir = () => {
    setConfirmDeleteId(null);
    setShowModal(false); // Fecha o modal sem excluir
  };

  const totalPaginas = Math.ceil(totalNoticias / itensPorPagina);

  const renderNoticias = () => {
    if (loading) {
      return <div>Carregando notícias...</div>;
    }

    if (totalNoticias === 0) {
      return <div>Sem notícias encontradas</div>;
    }

    return noticias.map((noticia) => (
      <div
        key={noticia.idNoticia}
        className=" border-b flex justify-between items-center my-1"
      >
        <div>
          <h3 className="text-lg font-semibold text-blue-ineof">
            {noticia.titulo}
          </h3>

          {noticia.subtitulo && (
            <div className="text-sm text-gray-600">{noticia.subtitulo}</div>
          )}

          <div className="flex items-center mt-2">
            <FaUser className="text-gray-600 mr-2" />
            <p className="text-sm text-gray-600">{noticia.nomeAutor}</p>
          </div>

          <div className="flex items-center mt-1">
            <FaKey className="text-gray-600 mr-2" />
            <p className="text-sm text-gray-600">{noticia.tags}</p>
          </div>

          <div className="mt-1 text-sm text-gray-600">
            <strong>Resumo: </strong> {noticia.resumo}
          </div>

          <div className="flex items-center mt-1 text-sm text-gray-600">
            <span>
              <strong>Data de publicação:</strong>{" "}
              {noticia.dataPublicacao.toLocaleDateString()}
            </span>
            <span className="ml-4">
              <strong>Visualizações:</strong> {noticia.visualizacoes}
            </span>
            <span className="ml-4">
              <strong>Status:</strong> {noticia.status}
            </span>
          </div>

          <Link
            href={`/perfil/noticias/minhas-noticias/noticia/${noticia.identifier}/${noticia.slug}`}
          >
            <span className="inline-block mt-4 text-lg text-blue-500 hover:text-blue-900 flex items-center">
              Editar notícia
              <FaEdit className="ml-2 text-lg" />
            </span>
          </Link>
        </div>

        {user && (
          <>
            <button
              onClick={() => abrirModalExcluir(noticia.idNoticia)}
              className=" ml-4 text-gray-600 hover:text-red-500"
            >
              <FaTrash size={20} />
            </button>
          </>
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
          className={`px-3 py-1 mx-1 rounded ${
            i === paginaAtual ? "bg-blue-500 hover:bg-blue-800 text-white" : "bg-gray-200 hover:bg-gray-500 hover:text-white"
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-start mt-4">
        {paginaAtual > 1 && (
          <button
            onClick={() => setPaginaAtual(paginaAtual - 1)}
            className="px-3 py-1 mx-1 rounded bg-gray-200 hover:bg-gray-500 hover:text-white"
          >
            <FaArrowLeft />
          </button>
        )}
        {paginas}
        {paginaAtual < totalPaginas && (
          <button
            onClick={() => setPaginaAtual(paginaAtual + 1)}
            className="px-3 py-1 mx-1 rounded bg-gray-200 hover:bg-gray-500 hover:text-white"
          >
            <FaArrowRight />
          </button>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="p-8 bg-gray-100 px-52">
        <h2 className="text-3xl font-bold mb-6">Minhas Notícias</h2>

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

          {/* Filtro por Tags */}
          <select
            value={filtroTags}
            onChange={(e) => setFiltroTags(e.target.value)}
            className="p-2 border border-gray-300 rounded mr-4"
          >
            {getTags().map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          <button
            onClick={limparFiltros}
            className="bg-gray-400 hover:bg-gray-800 text-white p-2 rounded "
          >
            Limpar Filtros
          </button>

          <button
            onClick={filtrarNoticias}
            className="bg-green-ineof hover:bg-green-800 text-white p-2 rounded ml-4"
          >
            Buscar
          </button>
       
        </div>

        {/* Lista de notícias */}
        <div className="bg-white rounded shadow p-6 w-full lg:w-3/5">
          {renderNoticias()}
        </div>

        {/* Paginação */}
        {renderPaginacao()}

        {/* Botão para Nova Notícia */}
        <div className="mt-8 flex justify-start space-x-4">
          <Link href="/perfil/noticia/nova-noticia">
            <button className="bg-green-ineof hover:bg-green-800 text-white px-4 py-2 rounded">
              Nova Notícia
            </button>
          </Link>
        </div>

        {/* Modal de confirmação de exclusão */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg text-center">
              <h3 className="text-lg mb-4">Tem certeza que deseja excluir a notícia?</h3>
              <div className="flex justify-center space-x-4">
                <button onClick={confirmarExcluir} className="bg-red-600 text-white px-4 py-2 rounded   hover:bg-red-800 ">
                <div className="flex items-center">
                  <FaTrash size={15} className="text-gray-white mr-2"/>
                  Excluir
                </div>
                </button>
                <button onClick={cancelarExcluir} className="bg-gray-400 hover:bg-gray-800 text-white px-4 py-2 rounded">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NoticiasPage;
