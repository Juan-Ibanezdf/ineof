import React, { useEffect, useState, useCallback } from "react";
import { FaBookmark } from "react-icons/fa";
import { getAPIClient } from "@/services/axios";

interface FavoriteButtonProps {
  idPublicacao: string; // O ID da publicação a ser favoritada
  userId: string | null; // ID do usuário atual
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ idPublicacao, userId }) => {
  const [isFavorito, setIsFavorito] = useState(false);
  const [idFavorito, setIdFavorito] = useState<string | null>(null);

  const fetchFavoritoStatus = useCallback(async () => {
    if (!userId) return; // Verifica se o usuário está logado

    try {
      const api = getAPIClient();
      const response = await api.get("/api/favoritos");
      
      const favorito = response.data.find((fav: any) => fav.id_publicacao === idPublicacao);

      if (favorito) {
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

      setIsFavorito(true);
      setIdFavorito(response.data.id_favoritos); // Armazena o ID do favorito salvo
      alert("Publicação salva como favorita!");
    } catch (error) {
      console.error("Erro ao salvar como favorito", error);
      alert("Erro ao salvar como favorito.");
    }
  };

  const handleRemoveFavorite = async () => {
    if (!idFavorito) return;

    try {
      const api = getAPIClient();
      await api.delete(`/api/favoritos/${idFavorito}`);

      setIsFavorito(false);
      setIdFavorito(null);
      alert("Publicação removida dos favoritos!");
    } catch (error) {
      console.error("Erro ao remover favorito", error);
      alert("Erro ao remover dos favoritos.");
    }
  };

  return (
    <>
      {isFavorito ? (
        <button onClick={handleRemoveFavorite} className="text-green-ineof hover:text-green-900">
          <FaBookmark size={20} />
        </button>
      ) : (
        <button onClick={handleSaveFavorite} className="text-gray-600 hover:text-blue-500">
          <FaBookmark size={20} />
        </button>
      )}
    </>
  );
};

export default FavoriteButton;
