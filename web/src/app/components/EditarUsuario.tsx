"use client";  

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { getAPIClient } from '../../services/axios';
import Header from '../partials/Header';
import Link from 'next/link';

interface User {
  nomeDeUsuario: string;
  email: string;
  nomeCompleto?: string;
  perfilImagem?: string;
  pais?: string;
  estado?: string;
  cidade?: string;
  ocupacao?: string;
  descricao?: string;
  telefone?: string;
  instituicao?: string;
  curriculoLattes?: string;
  matricula?: number;
  termosDeUso?: boolean;
  statusAtivacao?: boolean;
  emailVerificado?: boolean;
  novaSenha?: string;
  confirmarNovaSenha?: string;
}

const EditarUsuario: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<User>();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const novaSenha = watch("novaSenha");
  console.log('ID:', id);
  useEffect(() => {
    if (!id) return;


    const fetchUserDetails = async () => {
      const api = getAPIClient();
      try {
        const response = await api.get(`/users/profile/${id}`);
        console.log('API Response:', response.data);
        const userData = response.data;
        setUser(userData);
        Object.keys(userData).forEach((field) => setValue(field as keyof User, userData[field]));
      } catch (error) {
        console.error('Erro ao buscar detalhes do usuário', error);
      }
    };

    fetchUserDetails();
  }, [id, setValue]);

  const onSubmit = async (formData: User) => {
    const api = getAPIClient();
    try {
      await api.put(`/users/profile/${id}`, formData);
      alert('Usuário atualizado com sucesso!');
      setIsEditing(false);
      router.push('/');
    } catch (error) {
      console.error('Erro ao atualizar usuário', error);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  console.log('User:', user);

  if (!id || !user) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Editar Usuário</h1>
        {!isEditing ? (
          <div>
            <div className="grid grid-cols-1 gap-6">
              {Object.entries(user).map(([key, value]) => (
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
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="nomeDeUsuario" className="block text-sm font-medium text-gray-700">Nome de Usuário</label>
              <input {...register('nomeDeUsuario')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
              {errors.nomeDeUsuario && <span className="text-red-500"></span>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
              <input {...register('email')} type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
              {errors.email && <span className="text-red-500"></span>}
            </div>
            <div>
              <label htmlFor="nomeCompleto" className="block text-sm font-medium text-gray-700">Nome Completo</label>
              <input {...register('nomeCompleto')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="perfilImagem" className="block text-sm font-medium text-gray-700">Imagem de Perfil (URL)</label>
              <input {...register('perfilImagem')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="pais" className="block text-sm font-medium text-gray-700">País</label>
              <input {...register('pais')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700">Estado</label>
              <input {...register('estado')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="cidade" className="block text-sm font-medium text-gray-700">Cidade</label>
              <input {...register('cidade')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="ocupacao" className="block text-sm font-medium text-gray-700">Ocupação</label>
              <input {...register('ocupacao')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">Descrição</label>
              <textarea {...register('descricao')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">Telefone</label>
              <input
                type="tel"
                {...register('telefone')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                pattern="\d*"
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '');
                }}
                placeholder="123456789"
              />
              <span className="text-xs text-gray-500">Apenas números são permitidos.</span>
            </div>
            <div>
              <label htmlFor="instituicao" className="block text-sm font-medium text-gray-700">Instituição</label>
              <input {...register('instituicao')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="curriculoLattes" className="block text-sm font-medium text-gray-700">Currículo Lattes (URL)</label>
              <input {...register('curriculoLattes')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="matricula" className="block text-sm font-medium text-gray-700">Matrícula</label>
              <input type="number" {...register('matricula')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="novaSenha" className="block text-sm font-medium text-gray-700">Nova Senha (opcional):</label>
              <input
                {...register("novaSenha", {
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
                    message: "A senha deve conter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial."
                  }
                })}
                type="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.novaSenha && <p className="text-red-500 text-xs italic"></p>}
            </div>
            <div>
              <label htmlFor="confirmarNovaSenha" className="block text-sm font-medium text-gray-700">Confirmar Nova Senha:</label>
              <input
                {...register("confirmarNovaSenha", {
                  validate: value =>
                    value === novaSenha || "As senhas não correspondem"
                })}
                type="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.confirmarNovaSenha && <p className="text-red-500 text-xs italic"></p>}
            </div>
            <div><span>OBS: Algumas atualizações como Nome de Usuário e Imagem de Perfil são só refletidas quando é feito o login novamente.</span></div>
            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salvar Alterações</button>
          </form>
        )}
        <Link href="/"><span className="mt-4 inline-block text-indigo-600 hover:text-indigo-500">Voltar para o Home</span></Link>
      </main>
    </>
  );
};

export default EditarUsuario;
