"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { FaArrowLeft, FaArrowRight, FaBookmark, FaExternalLinkAlt, FaTrash } from "react-icons/fa";
import { getAPIClient } from "@/services/axios";
import Layout from "../../components/Layout";

interface Favorito {
  id_favoritos: string;
  id_usuario: string;
  id_publicacao: string;
  titulo: string;
  slug: string;
  identifier: string;
  data_favorito: string;
}

const FavoritosPage: React.FC = () => {
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [totalFavoritos, setTotalFavoritos] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [idFavoritoExcluir, setIdFavoritoExcluir] = useState<string | null>(null); // ID do favorito a ser excluído
  const [showModal, setShowModal] = useState(false); // Estado do modal
  const itensPorPagina = 8;

  const fetchFavoritos = useCallback(async () => {
    try {
      const api = getAPIClient();
      const response = await api.get("/api/favoritos/", {
        params: {
          pagina: paginaAtual,
          itens_por_pagina: itensPorPagina,
          searchTerm,
        },
      });

      const favoritosMapeados = response.data.map((favorito: any) => ({
        id_favoritos: favorito.id_favoritos,
        id_usuario: favorito.id_usuario,
        id_publicacao: favorito.id_publicacao,
        titulo: favorito.titulo,
        slug: favorito.slug,
        identifier: favorito.identifier,
        data_favorito: favorito.data_favorito,
      }));

      setFavoritos(favoritosMapeados);
      setTotalFavoritos(response.data.length);
    } catch (error) {
      console.error("Erro ao obter os favoritos", error);
    }
  }, [paginaAtual, searchTerm]);

  useEffect(() => {
    fetchFavoritos();
  }, [fetchFavoritos]);

  const removerFavorito = async (idFavoritos: string) => {
    if (!idFavoritos) {
      console.error("ID do favorito não definido");
      return;
    }

    try {
      const api = getAPIClient();
      await api.delete(`/api/favoritos/${idFavoritos}`);

      // Remove o favorito do estado local imediatamente
      setFavoritos((prevFavoritos) =>
        prevFavoritos.filter((fav) => fav.id_favoritos !== idFavoritos)
      );

      alert("Publicação removida dos favoritos!");
    } catch (error) {
      console.error("Erro ao remover favorito", error);
      alert("Erro ao remover dos favoritos.");
    }
  };

  const abrirModalExcluir = (idFavoritos: string) => {
    setIdFavoritoExcluir(idFavoritos);
    setShowModal(true);
  };

  const confirmarExcluir = () => {
    if (idFavoritoExcluir) {
      removerFavorito(idFavoritoExcluir);
    }
    setShowModal(false); // Fecha o modal após a exclusão
  };

  const cancelarExcluir = () => {
    setIdFavoritoExcluir(null);
    setShowModal(false); // Fecha o modal sem excluir
  };

  const filtrarFavoritos = () => {
    setPaginaAtual(1);
    fetchFavoritos();
  };

  const limparFiltros = () => {
    setSearchTerm("");
    setPaginaAtual(1);
    fetchFavoritos();
  };

  const totalPaginas = Math.ceil(totalFavoritos / itensPorPagina);

  const renderFavoritos = () => {
    if (totalFavoritos === 0) {
      return <div className="">Sem favoritos encontrados</div>;
    }

    return favoritos.map((favorito) => (
      <div key={favorito.id_favoritos} className="py-4 border-b flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-blue-ineof">
            {favorito.titulo}
          </h3>

          <div className="flex items-center mt-2">
            <FaBookmark className="text-blue-ineof mr-2" />
            <p className="text-sm text-gray-600">
              Adicionado em {new Date(favorito.data_favorito).toLocaleDateString()}
            </p>
          </div>

          <Link href={`/publicacoes/publicacao/${favorito.identifier}/${favorito.slug}`}>
            <span className="inline-block mt-4 text-blue-500 hover:text-blue-800 flex items-center gap-1">Ver publicação  <FaExternalLinkAlt /></span>
          </Link>
        </div>

        <button
          onClick={() => abrirModalExcluir(favorito.id_favoritos)}
          className="text-red-600 hover:text-red-500"
        >
          <FaTrash size={20} className="text-gray-500 hover:text-red-500"/>
        </button>
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
            i === paginaAtual
              ? "bg-blue-500 hover:bg-blue-800 text-white"
              : "bg-gray-200 hover:bg-gray-500 hover:text-white"
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
        <h2 className="text-3xl font-bold mb-6 text-blue-ineof">Minhas Publicações Favoritas</h2>

        {/* Filtros */}
        <div className="flex items-center mb-6">
          <input
            type="text"
            placeholder="Pesquisar por título"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded w-1/3 mr-4"
          />
 <button onClick={limparFiltros} className="bg-gray-400 hover:bg-gray-800 text-white p-2 rounded">
            Limpar Filtros
          </button>
          <button onClick={filtrarFavoritos} className="bg-green-ineof hover:bg-green-800 text-white p-2 rounded  ml-4">
            Buscar
          </button>
         
        </div>

        {/* Lista de favoritos */}
        <div className="bg-white rounded shadow p-6 w-full lg:w-3/5">{renderFavoritos()}</div>

        {/* Paginação */}
        {renderPaginacao()}

        {/* Modal de confirmação de exclusão */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg text-center">
              <h3 className="text-lg mb-4">Tem certeza que deseja remover dos seus favoritos?</h3>
              <div className="flex justify-center space-x-4">
                <button onClick={confirmarExcluir} className="bg-red-600 text-white px-4 py-2 rounded  hover:bg-red-800">
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

export default FavoritosPage;
