"use client";  

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Footer from '../../../partials/Footer';
import { getAPIClient } from '../../../../services/axios';

const NewPublicationPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [palavrasChave, setPalavrasChave] = useState('');
  const [categoria, setCategoria] = useState('');
  const [autores, setAutores] = useState('');

  const router = useRouter();
  const [showButtons, setShowButtons] = useState(false);

  const api = getAPIClient(); // Obtém a instância do Axios

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post('/api/user/create-publicacao', { // Usa a instância do Axios
        titulo: title,
        resumo: summary,
        palavrasChave: palavrasChave,
        categoria: categoria,
        autores: autores,
        // Outros campos necessários
      });

      setShowButtons(true);
    } catch (error) {
      console.error('Erro ao criar publicação:', error);
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleCreateAnother = () => {
    setTitle('');
    setSummary('');
    setPalavrasChave('');
    setCategoria('');
    setAutores('');
    setShowButtons(false);
  };

  return (
    <div className="bg-green-500 py-8">
      <div className="container mx-auto px-4 mb-8">
        <h2 className="text-2xl text-white mb-4">Criar Nova Publicação</h2>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded">
          <label className="block text-gray-700 mb-4">
            Título:
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-gray-300 rounded py-2 px-3 w-full text-gray-700 bg-gray-100"
            />
          </label>
          <label className="block text-gray-700 mb-4">
            Resumo:
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="border border-gray-300 rounded py-2 px-3 w-full h-24 text-gray-700 bg-gray-100"
            />
          </label>
          <label className="block text-gray-700 mb-4">
            Palavras-Chave:
            <textarea
              value={palavrasChave}
              onChange={(e) => setPalavrasChave(e.target.value)}
              className="border border-gray-300 rounded py-2 px-3 w-full h-16 text-gray-700 bg-gray-100"
            />
          </label>
          <label className="block text-gray-700 mb-4">
            Categoria:
            <input
              type="text"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="border border-gray-300 rounded py-2 px-3 w-full text-gray-700 bg-gray-100"
            />
          </label>
          <label className="block text-gray-700 mb-4">
            Autores:
            <input
              type="text"
              value={autores}
              onChange={(e) => setAutores(e.target.value)}
              className="border border-gray-300 rounded py-2 px-3 w-full text-gray-700 bg-gray-100"
            />
          </label>
          <button type="submit" className="bg-green-500 text-white rounded py-2 px-4 mt-4">
            Criar Publicação
          </button>
        </form>

        {showButtons && (
          <div className="mt-4">
            <button
              onClick={handleGoHome}
              className="bg-blue-500 text-white rounded py-2 px-4 mr-2"
            >
              Voltar para a página inicial
            </button>
            <button
              onClick={handleCreateAnother}
              className="bg-white text-green-500 rounded py-2 px-4"
            >
              Criar outra publicação
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default NewPublicationPage;
