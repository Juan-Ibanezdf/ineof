// import React, { useEffect, useState, useCallback } from "react";
// import { FaBookmark } from "react-icons/fa";
// import { getAPIClient } from "@/services/axios";

// interface FavoriteButtonProps {
//   idPublicacao: string; // O ID da publicação a ser favoritada
//   userId: string | null; // ID do usuário atual
// }

// const FavoriteButton: React.FC<FavoriteButtonProps> = ({ idPublicacao, userId }) => {
//   const [isFavorito, setIsFavorito] = useState(false);
//   const [idFavorito, setIdFavorito] = useState<string | null>(null);

//   const fetchFavoritoStatus = useCallback(async () => {
//     if (!userId) return; // Verifica se o usuário está logado

//     try {
//       const api = getAPIClient();
//       const response = await api.get("/api/favoritos");

//       const favorito = response.data.find((fav: any) => fav.id_publicacao === idPublicacao);

//       if (favorito) {
//         setIsFavorito(true);
//         setIdFavorito(favorito.id_favoritos); // Armazena o ID do favorito para remoção
//       }
//     } catch (error) {
//       console.error("Erro ao verificar status de favorito", error);
//     }
//   }, [idPublicacao, userId]);

//   useEffect(() => {
//     fetchFavoritoStatus();
//   }, [fetchFavoritoStatus]);

//   const handleSaveFavorite = async () => {
//     try {
//       const api = getAPIClient();
//       const response = await api.post("/api/favoritos", { id_publicacao: idPublicacao });

//       setIsFavorito(true);
//       setIdFavorito(response.data.id_favoritos); // Armazena o ID do favorito salvo
//       alert("Publicação salva como favorita!");
//     } catch (error) {
//       console.error("Erro ao salvar como favorito", error);
//       alert("Erro ao salvar como favorito.");
//     }
//   };

//   const handleRemoveFavorite = async () => {
//     if (!idFavorito) return;

//     try {
//       const api = getAPIClient();
//       await api.delete(`/api/favoritos/${idFavorito}`);

//       setIsFavorito(false);
//       setIdFavorito(null);
//       alert("Publicação removida dos favoritos!");
//     } catch (error) {
//       console.error("Erro ao remover favorito", error);
//       alert("Erro ao remover dos favoritos.");
//     }
//   };

//   return (
//     <>
//       {isFavorito ? (
//         <button onClick={handleRemoveFavorite} className="text-green-ineof hover:text-green-900">
//           <FaBookmark size={20} />
//         </button>
//       ) : (
//         <button onClick={handleSaveFavorite} className="text-gray-600 hover:text-blue-500">
//           <FaBookmark size={20} />
//         </button>
//       )}
//     </>
//   );
// };

// export default FavoriteButton;
import React, { useEffect, useState, useCallback } from "react";
import { FaBookmark, FaTrash } from "react-icons/fa";
import { getAPIClient } from "@/services/axios";

interface FavoriteButtonProps {
  idPublicacao: string; // O ID da publicação a ser favoritada
  userId: string | null; // ID do usuário atual
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  idPublicacao,
  userId,
}) => {
  const [isFavorito, setIsFavorito] = useState(false);
  const [idFavorito, setIdFavorito] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false); // Estado para controlar o modal de confirmação

  const fetchFavoritoStatus = useCallback(async () => {
    if (!userId) return; // Verifica se o usuário está logado

    try {
      const api = getAPIClient();
      const response = await api.get("/api/favoritos");

      const favorito = response.data.find(
        (fav: any) => fav.id_publicacao === idPublicacao
      );

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
      const response = await api.post("/api/favoritos", {
        id_publicacao: idPublicacao,
      });

      setIsFavorito(true);
      setIdFavorito(response.data.id_favoritos); // Armazena o ID do favorito salvo
      // alert("Publicação salva como favorita!");
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
      setShowModal(false); // Fecha o modal após a remoção
      // alert("Publicação removida dos favoritos!");
    } catch (error) {
      console.error("Erro ao remover favorito", error);
      // alert("Erro ao remover dos favoritos.");
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
            className="text-green-ineof hover:text-green-900"
          >
            <FaBookmark size={20} />
          </button>

          {showModal && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded shadow-lg text-center">
                <h3 className="text-lg mb-4">
                  Tem certeza que deseja remover dos seus favoritos?
                </h3>
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
          className="text-gray-600 hover:text-blue-500"
        >
          <FaBookmark size={20} />
        </button>
      )}
    </>
  );
};

export default FavoriteButton;
