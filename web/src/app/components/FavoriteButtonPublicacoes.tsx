import React, { useEffect, useState, useCallback } from "react";
import { FaBookmark, FaTrash } from "react-icons/fa";
import { getAPIClient } from "@/services/axios";

interface FavoriteButtonProps {
  idPublicacao: string; // O ID da publicação a ser favoritada
  userId: string | null; // ID do usuário atual
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ idPublicacao, userId }) => {
  const [isFavorito, setIsFavorito] = useState(false);
  const [idFavorito, setIdFavorito] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false); // Estado para controlar o modal de confirmação

  const fetchFavoritoStatus = useCallback(async () => {
    if (!userId) return; // Verifica se o usuário está logado

    try {
      const api = getAPIClient();
      const response = await api.get("/api/favoritos");

      console.log("Favoritos recebidos:", response.data); // Log para verificar o retorno da API

      const favorito = response.data.find((fav: any) => fav.id_publicacao === idPublicacao);

      if (favorito) {
        console.log("Favorito encontrado:", favorito);
        setIsFavorito(true);
        setIdFavorito(favorito.id_favoritos); // Armazena o ID do favorito para remoção
      }
    } catch (error) {
      console.error("Erro ao verificar status de favorito", error);
    }
  }, [idPublicacao, userId]);

  useEffect(() => {
    fetchFavoritoStatus();
  }, [fetchFavoritoStatus]);

  const handleSaveFavorite = async () => {
    try {
      const api = getAPIClient();
      const response = await api.post("/api/favoritos", { id_publicacao: idPublicacao });

      console.log("Publicação salva como favorita:", response.data);
      setIsFavorito(true);
      setIdFavorito(response.data.id_favoritos); // Armazena o ID do favorito salvo
    } catch (error) {
      console.error("Erro ao salvar como favorito", error);
      alert("Erro ao salvar como favorito.");
    }
  };

  const handleRemoveFavorite = async () => {
    if (!idFavorito) {
      console.error("ID do favorito não encontrado. Não pode remover favorito.");
      return;
    }

    try {
      const api = getAPIClient();
      console.log(`Removendo favorito com ID: ${idFavorito}`); // Verificação do ID antes da remoção
      await api.delete(`/api/favoritos/${idFavorito}`);

      setIsFavorito(false);
      setIdFavorito(null);
      setShowModal(false); // Fecha o modal após a remoção
      console.log("Publicação removida dos favoritos.");
    } catch (error) {
      console.error("Erro ao remover favorito", error);
      alert("Erro ao remover dos favoritos.");
    }
  };

  const abrirModalExcluir = () => {
    setShowModal(true); // Mostra o modal de confirmação
  };

  const cancelarExcluir = () => {
    setShowModal(false); // Fecha o modal sem excluir
  };

  return (
    <>
      {isFavorito ? (
        <>
          <button
            onClick={abrirModalExcluir}
            className="bg-red-400 hover:bg-red-800 text-white px-4 py-2 rounded flex items-center gap-1"
          >Remover dos favoritos
            <FaBookmark size={20} />
          </button>

          {showModal && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded shadow-lg text-center">
                <h3 className="text-lg mb-4">Tem certeza que deseja remover dos seus favoritos?</h3>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleRemoveFavorite}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800"
                  >
                    <div className="flex items-center">
                      <FaTrash size={15} className="text-gray-white mr-2" />          Remover
                    </div>
                  </button>
                  <button
                    onClick={cancelarExcluir}
                    className="bg-gray-400 hover:bg-gray-800 text-white px-4 py-2 rounded"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <button
          onClick={handleSaveFavorite}
          className="bg-green-500 hover:bg-green-800 text-white px-6 py-3 rounded-lg flex gap-1 items-center"
        > Salvar
          <FaBookmark size={20} />
        </button>
      )}
    </>
  );
};

export default FavoriteButton;
