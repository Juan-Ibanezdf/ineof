"use client"; // Adicionando a diretiva para garantir que o componente seja do lado do cliente

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Certifique-se de que o Next.js trate como client-side
import { getAPIClient } from '../../../../services/axios';
import { parseCookies } from 'nookies';
import Layout from '../../../components/Layout';

const NewNoticiaPage: React.FC = () => {
  const [titulo, setTitulo] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [autores, setAutores] = useState('');
  const [imagemNoticia, setImagemNoticia] = useState('');
  const [lead, setLead] = useState('');
  const [categoria, setCategoria] = useState('');
  const [tags, setTags] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [notas, setNotas] = useState('');
  const [successMessage, setSuccessMessage] = useState(false);

  const router = useRouter();

  const api = getAPIClient();

  // Transformar campos de array de strings como 'tags' e 'autores' em arrays separados por vírgula
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const cookies = parseCookies();
      const csrfToken = cookies['csrf_token'];

      // Convertendo 'tags' e 'autores' em arrays, separados por vírgula
      const tagsArray = tags.split(',').map((item) => item.trim());
      const autoresArray = autores.split(',').map((item) => item.trim());

      const response = await api.post('/api/noticias', {
        titulo: titulo,
        subtitulo: subtitulo || null,
        autores: autoresArray, // Agora enviamos um array
        imagem_noticia: imagemNoticia || null,
        lead: lead || null,
        categoria: categoria || null,
        tags: tagsArray, // Agora enviamos um array
        conteudo: conteudo || null,
        visibilidade: true,
        notas: notas || null,
        visualizacoes: 0,
        data_publicacao: new Date().toISOString(),
      }, {
        headers: {
          'X-CSRF-Token': csrfToken,
        },
        withCredentials: true,
      });

      console.log('Notícia criada com sucesso:', response.data);
      setSuccessMessage(true); // Exibe a mensagem de sucesso
    } catch (error: any) {
      if (error.response) {
        console.error('Erro ao criar notícia:', error.response.data); 
      } else {
        console.error('Erro desconhecido:', error.message);
      }
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleCreateAnother = () => {
    setTitulo('');
    setSubtitulo('');
    setAutores('');
    setImagemNoticia('');
    setLead('');
    setCategoria('');
    setTags('');
    setConteudo('');
    setNotas('');
    setSuccessMessage(false); // Esconde a mensagem de sucesso para criar outra notícia
  };

  const handleBackToNoticias = () => {
    router.push("/perfil/noticias/minhas-noticias");
  };

  return (
    <>
      <Layout>
        <div className="bg-gray-100 my-10 py-10 px-4 max-w-screen-lg mx-auto">
          <h2 className="text-4xl text-indigo-900 font-bold mb-6 text-center">
            Criar Nova Notícia
          </h2>

          {!successMessage ? (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
              <div className="mb-4">
                <label className="block text-gray-700 text-lg font-semibold">Título:</label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="border border-gray-300 rounded py-2 px-3 w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-lg font-semibold">Subtítulo:</label>
                <input
                  type="text"
                  value={subtitulo}
                  onChange={(e) => setSubtitulo(e.target.value)}
                  className="border border-gray-300 rounded py-2 px-3 w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-lg font-semibold">Lead:</label>
                <textarea
                  value={lead}
                  onChange={(e) => setLead(e.target.value)}
                  className="border border-gray-300 rounded py-2 px-3 w-full h-24"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-lg font-semibold">Tags:</label>
                <textarea
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="border border-gray-300 rounded py-2 px-3 w-full h-16"
                  placeholder="Separe por vírgulas"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-lg font-semibold">Imagem (URL):</label>
                <input
                  type="text"
                  value={imagemNoticia}
                  onChange={(e) => setImagemNoticia(e.target.value)}
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
                <label className="block text-gray-700 text-lg font-semibold">Conteúdo:</label>
                <textarea
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  className="border border-gray-300 rounded py-2 px-3 w-full h-24"
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
                Criar Notícia
              </button>
              <button
                onClick={handleBackToNoticias}
                className="bg-gray-500 text-white px-4 py-2 rounded ml-4 hover:bg-gray-600"
              >
                Voltar
              </button>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-lg text-green-600 font-bold mb-6">Notícia criada com sucesso!</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleCreateAnother}
                  className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                >
                  Criar outra notícia
                </button>
                <button
                  onClick={handleBackToNoticias}
                  className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                >
                  Voltar para Notícias
                </button>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
};

export default NewNoticiaPage;
