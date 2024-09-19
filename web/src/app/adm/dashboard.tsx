"use client";  

// export default Dashboard;
import React, { useContext, useEffect, useState } from 'react';
import Router from 'next/router';
import Link from 'next/link'; // Importando Link

import { getAPIClient } from '../../services/axios'

import Relogio from '../components/Relogio';
import Header from '../partials/Header';
import { AuthContext } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { user, isAuthenticated, isAdministrator } = useContext(AuthContext); // Adicionado isAdministrator
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      Router.push('/auth/login');
    } else if (!isAdministrator) { // Verifica se o usuário é um administrador
      Router.push('/nao-autorizado'); // Redireciona para uma página de "Não autorizado" ou similar
    } else {
      const api = getAPIClient();
      api.get('/me')
        .then(response => {
          setUserInfo(response.data.user);
        })
        .catch(error => {
          console.error('Erro ao buscar informações do usuário', error);
        });
    }
  }, [isAuthenticated, user, isAdministrator]); // Adicionado isAdministrator como dependência


  return (
    <>
      
      <Header />
      {isAdministrator && ( // Renderiza o conteúdo somente se for administrador

        <div className="max-w-4xl mx-auto px-4 py-8">

          <div>

            <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
            {userInfo && (
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <p className="font-semibold">Olá, seja bem-vindo: <span className="font-normal">{/*userInfo.nomeDeUsuario*/}</span></p>
                <p className="font-semibold">Seu nível de Acesso é: <span className="font-normal">{/*userInfo.nivelAcesso*/}</span></p>
                {/* Outras informações do usuário */}
                <Relogio />
              </div>
            )}

            <div className="mb-8">
            </div>

            <Link href="/adm/usuarios/">
              <span className="flex items-center justify-between p-4 bg-white rounded-lg shadow-lg hover:bg-gray-100">
                <div>
                  <h2 className="text-xl font-semibold">Usuários &rarr;</h2>
                  <p className="mt-2 text-gray-600">Veja e modifique as informações dos usuários.</p>
                </div>
              </span>
            </Link>
          </div>

        </div>
      )
      }
    </>
  );
};

export default Dashboard;
