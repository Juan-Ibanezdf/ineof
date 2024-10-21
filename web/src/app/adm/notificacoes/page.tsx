"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { getAPIClient } from "@/services/axios";

interface NotificationForm {
  titulo: string;
  mensagem: string;
  enviadoParaTodos: boolean;
  idUsuario?: string;
}

const EnviarNotificacaoPage: React.FC = () => {
  const { register, handleSubmit, watch } = useForm<NotificationForm>();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const enviadoParaTodos = watch("enviadoParaTodos");

  const onSubmit = async (data: NotificationForm) => {
    try {
      const api = getAPIClient();
      await api.post("/api/notificacoes", data);
      setSuccessMessage("Notificação enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
      alert("Erro ao enviar notificação.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Enviar Notificação</h1>
      {successMessage && (
        <div className="mb-4 p-4 bg-green-200 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Título
          </label>
          <input
            {...register("titulo", { required: true })}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Mensagem
          </label>
          <textarea
            {...register("mensagem", { required: true })}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Enviar para Todos?
          </label>
          <input
            type="checkbox"
            {...register("enviadoParaTodos")}
            className="mt-1"
          />
        </div>

        {!enviadoParaTodos && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              ID do Usuário
            </label>
            <input
              {...register("idUsuario")}
              placeholder="ID do Usuário"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
            />
          </div>
        )}

        <button
          type="submit"
          className="py-2 px-4 bg-blue-500 text-white rounded-md"
        >
          Enviar Notificação
        </button>
      </form>
    </div>
  );
};

export default EnviarNotificacaoPage;
