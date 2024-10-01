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
  const [revisadoPor, setRevisadoPor] = useState('');
  const [notas, setNotas] = useState('');
  const [publicacoes, setPublicacoes] = useState(''); // Campo 'publicacoes' adicionado

  const router = useRouter();
  const [showButtons, setShowButtons] = useState(false);

  const api = getAPIClient();

  // Transformar campos de array de strings como 'palavrasChave' e 'autores' em arrays no envio
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const cookies = parseCookies();
    const csrfToken = cookies['csrf_token'];

    const response = await api.post('/api/publicacoes', {
      titulo: title,
      subtitulo: subtitle || null,
      palavras_chave: palavrasChave.split(',').map(item => item.trim()), // Converter string para array
      banner: banner || null,
      resumo: summary || null,
      categoria: categoria || null,
      autores: autores.split(',').map(item => item.trim()), // Converter string para array
      link: link || null,
      revisado_por: revisadoPor || null,
      visibilidade: true,
      notas: notas || null,
      publicacoes: publicacoes || null,
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
    setShowButtons(true);
  } catch (error: any) {
    // Exibir o erro detalhado no console
    if (error.response) {
      console.error('Erro ao criar publicação:', error.response.data); // Detalhes da resposta do servidor
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
    setRevisadoPor('');
    setNotas('');
    setPublicacoes('');
    setShowButtons(false);
  };

  return (
    <>
      <Layout>
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
                Subtítulo:
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
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
                Banner (URL):
                <input
                  type="text"
                  value={banner}
                  onChange={(e) => setBanner(e.target.value)}
                  className="border border-gray-300 rounded py-2 px-3 w-full text-gray-700 bg-gray-100"
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
              <label className="block text-gray-700 mb-4">
                Link:
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="border border-gray-300 rounded py-2 px-3 w-full text-gray-700 bg-gray-100"
                />
              </label>
              <label className="block text-gray-700 mb-4">
                Revisado Por:
                <input
                  type="text"
                  value={revisadoPor}
                  onChange={(e) => setRevisadoPor(e.target.value)}
                  className="border border-gray-300 rounded py-2 px-3 w-full text-gray-700 bg-gray-100"
                />
              </label>
              <label className="block text-gray-700 mb-4">
                Publicações:
                <input
                  type="text"
                  value={publicacoes}
                  onChange={(e) => setPublicacoes(e.target.value)}
                  className="border border-gray-300 rounded py-2 px-3 w-full text-gray-700 bg-gray-100"
                />
              </label>
              <label className="block text-gray-700 mb-4">
                Notas:
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="border border-gray-300 rounded py-2 px-3 w-full h-16 text-gray-700 bg-gray-100"
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
        </div>
      </Layout>
    </>
  );
};

export default NewPublicationPage;
