"use client";

import React, { useEffect, useState } from "react";
import { getAPIClient } from "@/services/axios";
import { useRouter } from "next/navigation";
import Layout from "../components/Layout";

interface Notificacao {
  id_notificacao: string;
  titulo: string;
  mensagem: string;
  data_envio: string;
  lida: boolean;
}

const NotificacoesPage = () => {
  const [notificacoes, setNotificacoes] = useState<Notificacao[] | null>(null); // Estado inicial como null
  const router = useRouter();

  useEffect(() => {
    // Função para buscar as notificações do usuário
    const fetchNotificacoes = async () => {
      try {
        const api = getAPIClient();
        const response = await api.get("/api/notificacoes");
        setNotificacoes(response.data);
      } catch (error) {
        console.error("Erro ao buscar notificações:", error);
        setNotificacoes([]); // Define como array vazio em caso de erro
      }
    };

    fetchNotificacoes();
  }, []);

  const handleMarcarComoVista = async (idNotificacao: string) => {
    try {
      const api = getAPIClient();
      await api.put(`/api/notificacoes/${idNotificacao}/marcar-como-vista`);
      setNotificacoes((prev) =>
        prev
          ? prev.map((notificacao) =>
              notificacao.id_notificacao === idNotificacao
                ? { ...notificacao, lida: true }
                : notificacao
            )
          : []
      );
    } catch (error) {
      console.error("Erro ao marcar notificação como vista:", error);
    }
  };

  if (!notificacoes) {
    return <div>Carregando notificações...</div>;
  }

  return (
    <>
    <Layout>

   
 <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Minhas Notificações</h1>

      {notificacoes.length === 0 ? (
        <div className="text-center">
          <p className="text-lg text-gray-500">Não existem notificações ainda.</p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
          >
            Voltar ao Home
          </button>
        </div>
      ) : (
        <ul className="space-y-4">
          {notificacoes.map((notificacao) => (
            <li
              key={notificacao.id_notificacao}
              className={`p-4 rounded-lg shadow-lg ${
                notificacao.lida ? "bg-gray-200" : "bg-white"
              }`}
            >
              <div className="flex justify-between">
                <h2 className="text-lg font-semibold">{notificacao.titulo}</h2>
                {!notificacao.lida && (
                  <button
                    className="bg-blue-500 text-white py-1 px-3 rounded"
                    onClick={() => handleMarcarComoVista(notificacao.id_notificacao)}
                  >
                    Marcar como Vista
                  </button>
                )}
              </div>
              <p>{notificacao.mensagem}</p>
              <small className="text-gray-500">
                Enviado em: {new Date(notificacao.data_envio).toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
    </Layout>
    </>
   
  );
};

export default NotificacoesPage;
