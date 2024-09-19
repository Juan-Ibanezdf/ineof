"use client"; // Marcar como Client Component

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { setCookie, destroyCookie } from 'nookies';
import { useRouter } from 'next/navigation'; 
import { recoverUserInformation, signInRequest } from "../services/auth";
import axios from 'axios';

// Definição dos tipos para o contexto
type User = {
  idUsuario: string;
  email: string;
  perfilImagem: string;
  nomeDeUsuario: string;
  nivelDeAcesso: string;
  token: string;
};

type SignInData = {
  email: string;
  senha: string;
  nomeDeUsuario: string;
  manterConectado: boolean; // Adiciona o campo "manter conectado"
};

// Atualize para incluir `refreshToken` como opcional
type SignInResponse = {
  token: string;
  refreshToken?: string;
  usuario: {
    idUsuario: string;
    email: string;
    nomeDeUsuario: string;
    perfilImagem: string;
    nivelDeAcesso: string;
  };
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => void;
  isAdministrator: boolean; 
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextType);

// Provedor do contexto
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdministrator, setIsAdministrator] = useState(false);
  const isAuthenticated = !!user;
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    recoverUserInformation()
      .then(userInfo => {
        if (userInfo && userInfo.usuario) {
          setUser({
            idUsuario: userInfo.usuario.idUsuario,
            nomeDeUsuario: userInfo.usuario.nomeDeUsuario,
            email: userInfo.usuario.email,
            perfilImagem: userInfo.usuario.perfilImagem,
            nivelDeAcesso: userInfo.usuario.nivelDeAcesso,
            token: userInfo.usuario.token,
          });
          const isUserAdmin = userInfo.usuario.nivelDeAcesso === 'administrador';
          setIsAdministrator(isUserAdmin);
        } else {
          setUser(null);
          setIsAdministrator(false);
        }
      })
      .catch(() => {
        setUser(null);
        setIsAdministrator(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function signIn({ email, senha, nomeDeUsuario, manterConectado }: SignInData) {
    const response: SignInResponse = await signInRequest({ email, senha, nomeDeUsuario, manterConectado });
    const isUserAdmin = response.usuario.nivelDeAcesso === 'administrador';
    setIsAdministrator(isUserAdmin);
    setUser({
      idUsuario: response.usuario.idUsuario,
      email: response.usuario.email,
      perfilImagem: response.usuario.perfilImagem,
      nomeDeUsuario: response.usuario.nomeDeUsuario,
      nivelDeAcesso: response.usuario.nivelDeAcesso,
      token: response.token,
    });

    setCookie(undefined, 'token', response.token, {
      maxAge: 4 * 60 * 60, // 4 horas
      path: '/',
    });

    if (manterConectado && response.refreshToken) {
      setCookie(undefined, 'refresh_token', response.refreshToken, {
        maxAge: 30 * 24 * 60 * 60, // 30 dias
        path: '/',
      });
    }

    router.push('/');
  }

  async function signOut() {
    try {
      await axios.post('http://localhost:8080/api/auth/logout', {}, {
        withCredentials: true, // Enviar cookies de CSRF
      });
      destroyCookie(undefined, 'token');
      destroyCookie(undefined, 'refresh_token');
      destroyCookie(undefined, 'csrf_token'); // Remover o cookie CSRF
      setUser(null);
      setIsAdministrator(false);
      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  return (
    <AuthContext.Provider value={{ isAdministrator, user, isAuthenticated, signIn, signOut, setUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
