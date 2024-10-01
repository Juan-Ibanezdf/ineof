"use client";  

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { getAPIClient } from '../../../../../../services/axios';
import Header from '../../../../../partials/Header';
import Footer from '../../../../../partials/Footer';

interface Publicacao {
  idPublicacao: string;
  titulo: string;
  resumo: string;
  categoria: string;
  banner: string;
  palavrasChave: string;
  autores: string;
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

const PublicacaoDetalhes: React.FC = () => {
  const router = useRouter();
  const { identifier, slug } = router.query;  // Obtendo `identifier` e `slug` da URL
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Publicacao>();
  const [publicacao, setPublicacao] = useState<Publicacao | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Buscar os detalhes da publicação assim que `identifier` e `slug` estiverem disponíveis
  useEffect(() => {
    if (!identifier || !slug) return;

    const fetchPublicacaoDetails = async () => {
      const api = getAPIClient();
      try {
        const response = await api.get(`/api/publicacoes/usuario/${identifier}/${slug}`); // Atualizei a URL de acordo com a nova rota
        const publicacaoData = response.data;
        setPublicacao(publicacaoData);
        Object.keys(publicacaoData).forEach(field => setValue(field as keyof Publicacao, publicacaoData[field]));
      } catch (error) {
        console.error('Erro ao buscar detalhes da publicação', error);
      }
    };

    fetchPublicacaoDetails();
  }, [identifier, slug, setValue]);

  // Função de submissão de formulário para editar a publicação
  const onSubmit = async (formData: Publicacao) => {
    const api = getAPIClient();
    try {
      await api.put(`/api/publicacoes/usuario/${identifier}/${slug}`, formData);  // Atualizei a URL para a nova rota PUT
      alert('Publicação atualizada com sucesso!');
      router.push('/perfil/publicacoes/minhas-publicacoes');
    } catch (error) {
      console.error('Erro ao atualizar publicação', error);
    }
  };

  // Função de deleção da publicação
  const handleDelete = async () => {
    const api = getAPIClient();
    try {
      await api.delete(`/api/publicacoes/usuario/${identifier}/${slug}`);  // Atualizei a URL para a nova rota DELETE
      alert('Publicação deletada com sucesso!');
      router.push('/perfil/publicacoes/minhas-publicacoes');
    } catch (error) {
      console.error('Erro ao deletar publicação', error);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Mostra um loader enquanto a publicação é buscada
  if (!publicacao) {
    return <div>Carregando...</div>;
  }

  // Renderiza a página de detalhes ou formulário de edição com base no estado `isEditing`
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Detalhes da Publicação</h1>
        {!isEditing ? (
          <div>
            <div className="grid grid-cols-1 gap-6">
              {Object.entries(publicacao).map(([key, value]) => (
                <div key={key}>
                  <span className="block text-sm font-medium text-gray-700">{key}:</span>
                  <p>{value?.toString()}</p>
                </div>
              ))}
            </div>
            <button
              onClick={handleEditClick}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-4"
            >
              Editar
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mt-4 ml-4"
            >
              Excluir
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">Título</label>
              <input {...register('titulo')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
              {errors.titulo && <span className="text-red-500">Campo obrigatório</span>}
            </div>
            <div>
              <label htmlFor="resumo" className="block text-sm font-medium text-gray-700">Resumo</label>
              <textarea {...register('resumo')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
              {errors.resumo && <span className="text-red-500">Campo obrigatório</span>}
            </div>
            {/* Adicione mais campos de formulário conforme necessário */}
            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Salvar Alterações
            </button>
          </form>
        )}
        <Link href="/perfil/publicacoes/minhas-publicacoes">
          <span className="mt-4 inline-block text-indigo-600 hover:text-indigo-500">Voltar para Minhas Publicações</span>
        </Link>
      </main>
      <Footer />
    </>
  );
};

export default PublicacaoDetalhes;
