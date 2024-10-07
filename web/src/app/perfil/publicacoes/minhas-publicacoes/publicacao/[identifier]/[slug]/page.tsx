"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; // Usando useRouter para navegação
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
  const [isEditing, setIsEditing] = useState(false); // Estado para alternar entre visualização e edição
  const [formData, setFormData] = useState<Partial<Publicacao>>({});
  const { identifier, slug } = useParams(); // Usando useParams para pegar os parâmetros da URL
  const router = useRouter(); // Usando useRouter para navegação

  useEffect(() => {
    const fetchPublicacao = async () => {
      try {
        const api = getAPIClient();
        const response = await api.get<Publicacao>(
          `/api/publicacoes/${identifier}/${slug}`
        );
        setPublicacao(response.data);
        setFormData(response.data); // Preencher o formulário com os dados da publicação
      } catch (error) {
        console.error("Erro ao obter a publicação", error);
      }
    };

    if (identifier && slug) {
      fetchPublicacao();
    }
  }, [identifier, slug]);

  const handleEdit = () => {
    setIsEditing(true); // Ativa o modo de edição
  };

  const handleCancelEdit = () => {
    setIsEditing(false); // Desativa o modo de edição
    setFormData(publicacao || {}); // Reseta o formulário para os dados originais
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const api = getAPIClient();
      await api.put(`/api/publicacoes/${identifier}/${slug}`, formData);
      alert("Publicação atualizada com sucesso!");
      setIsEditing(false); // Voltar ao modo de visualização após salvar
    } catch (error) {
      console.error("Erro ao atualizar a publicação", error);
    }
  };

  const handleBackToPublicacoes = () => {
    router.push("/perfil/publicacoes/minhas-publicacoes");
  };

  if (!publicacao) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Header />
      <div className="bg-green-500 p-5">
        <h2>{isEditing ? "Editar Publicação" : publicacao.titulo}</h2>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div>
              <label>Título:</label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo || ""}
                onChange={handleInputChange}
                className="border p-2 w-full"
              />
            </div>

            <div>
              <label>Resumo:</label>
              <textarea
                name="resumo"
                value={formData.resumo || ""}
                onChange={handleInputChange}
                className="border p-2 w-full"
              />
            </div>

            <div>
              <label>Categoria:</label>
              <input
                type="text"
                name="categoria"
                value={formData.categoria || ""}
                onChange={handleInputChange}
                className="border p-2 w-full"
              />
            </div>

            <div>
              <label>Autores:</label>
              <input
                type="text"
                name="autores"
                value={formData.autores?.join(", ") || ""}
                onChange={handleInputChange}
                className="border p-2 w-full"
              />
            </div>

            <div className="flex justify-between mt-4">
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                Salvar Alterações
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancelar Edição
              </button>
            </div>
          </form>
        ) : (
          <div>
            <p>{publicacao.resumo}</p>
            <p>Categoria: {publicacao.categoria}</p>
            <p>Autores: {publicacao.autores.join(", ")}</p>
            <button onClick={handleEdit} className="bg-indigo-500 text-white px-4 py-2 rounded">
              Editar Publicação
            </button>
            <button
              onClick={handleBackToPublicacoes}
              className="bg-gray-500 text-white px-4 py-2 rounded ml-4"
            >
              Voltar para Minhas Publicações
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default PublicacaoPage;
