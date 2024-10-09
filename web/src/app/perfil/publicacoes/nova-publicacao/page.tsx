"use client"; // Adicionando a diretiva para garantir que o componente seja do lado do cliente

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Certifique-se de que o Next.js trate como client-side
import { getAPIClient } from '../../../../services/axios';
import { parseCookies } from 'nookies';
import Layout from '../../../components/Layout';

const NewPublicationPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [palavrasChave, setPalavrasChave] = useState('');
  const [banner, setBanner] = useState('');
  const [summary, setSummary] = useState('');
  const [categoria, setCategoria] = useState('');
  const [autores, setAutores] = useState('');
  const [link, setLink] = useState('');
  const [notas, setNotas] = useState('');
  const [successMessage, setSuccessMessage] = useState(false);

  const router = useRouter();

  const api = getAPIClient();

  // Transformar campos de array de strings como 'palavrasChave' e 'autores' em arrays separados por vírgula
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const cookies = parseCookies();
      const csrfToken = cookies['csrf_token'];

      // Convertendo 'palavrasChave' e 'autores' em arrays, separados por vírgula
      const palavrasChaveArray = palavrasChave.split(',').map((item) => item.trim());
      const autoresArray = autores.split(',').map((item) => item.trim());

      const response = await api.post('/api/publicacoes', {
        titulo: title,
        subtitulo: subtitle || null,
        palavras_chave: palavrasChaveArray, // Agora enviamos um array
        banner: banner || null,
        resumo: summary || null,
        categoria: categoria || null,
        autores: autoresArray, // Agora enviamos um array
        link: link || null,
        visibilidade: true,
        notas: notas || null,
        visualizacoes: 0,
        data_criacao: new Date().toISOString(),
        data_modificacao: new Date().toISOString(),
      }, {
        headers: {
          'X-CSRF-Token': csrfToken,
        },
        withCredentials: true,
      });

      console.log('Publicação criada com sucesso:', response.data);
      setSuccessMessage(true); // Exibe a mensagem de sucesso
    } catch (error: any) {
      if (error.response) {
        console.error('Erro ao criar publicação:', error.response.data); 
      } else {
        console.error('Erro desconhecido:', error.message);
      }
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleCreateAnother = () => {
    setTitle('');
    setSubtitle('');
    setPalavrasChave('');
    setBanner('');
    setSummary('');
    setCategoria('');
    setAutores('');
    setLink('');
    setNotas('');
    setSuccessMessage(false); // Esconde a mensagem de sucesso para criar outra publicação
  };

  const handleBackToPublicacoes = () => {
    router.push("/perfil/publicacoes/minhas-publicacoes");
  };

  return (
    <>
      <Layout>
        <div className="bg-gray-100 my-10 py-10 px-4 max-w-screen-lg mx-auto">
          <h2 className="text-4xl text-indigo-900 font-bold mb-6 text-center">
            Criar Nova Publicação
          </h2>

          {!successMessage ? (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
              <div className="mb-4">
                <label className="block text-gray-700 text-lg font-semibold">Título:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border border-gray-300 rounded py-2 px-3 w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-lg font-semibold">Subtítulo:</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="border border-gray-300 rounded py-2 px-3 w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-lg font-semibold">Resumo:</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="border border-gray-300 rounded py-2 px-3 w-full h-24"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-lg font-semibold">Palavras-Chave:</label>
                <textarea
                  value={palavrasChave}
                  onChange={(e) => setPalavrasChave(e.target.value)}
                  className="border border-gray-300 rounded py-2 px-3 w-full h-16"
                  placeholder="Separe por vírgulas"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-lg font-semibold">Banner (URL):</label>
                <input
                  type="text"
                  value={banner}
                  onChange={(e) => setBanner(e.target.value)}
                  className="border border-gray-300 rounded py-2 px-3 w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-lg font-semibold">Categoria:</label>
                <input
                  type="text"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="border border-gray-300 rounded py-2 px-3 w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-lg font-semibold">Autores:</label>
                <input
                  type="text"
                  value={autores}
                  onChange={(e) => setAutores(e.target.value)}
                  className="border border-gray-300 rounded py-2 px-3 w-full"
                  placeholder="Separe por vírgulas"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-lg font-semibold">Link:</label>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="border border-gray-300 rounded py-2 px-3 w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-lg font-semibold">Notas:</label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="border border-gray-300 rounded py-2 px-3 w-full h-16"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Criar Publicação
              </button>
              <button
                onClick={handleBackToPublicacoes}
                className="bg-gray-500 text-white px-4 py-2 rounded ml-4 hover:bg-gray-600"
              >
                Voltar
              </button>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-lg text-green-600 font-bold mb-6">Publicação criada com sucesso!</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleCreateAnother}
                  className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                >
                  Criar outra publicação
                </button>
                <button
                  onClick={handleBackToPublicacoes}
                  className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                >
                  Voltar para Publicações
                </button>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
};

export default NewPublicationPage;
