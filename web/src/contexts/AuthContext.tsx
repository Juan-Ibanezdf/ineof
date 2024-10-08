"use client";

import { setCookie, parseCookies, destroyCookie } from 'nookies';
import axios from 'axios';
import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { signInRequest, recoverUserInformation } from '../services/auth';

const API_URL = 'http://localhost:8080';

type User = {
  idUsuario: string;
  email: string;
  perfilImagem: string;
  nomeDeUsuario: string;
  nivelPermissao: string;
  token: string;
};

type SignInData = {
  email: string;
  senha: string;
  nomeDeUsuario: string;
  manterConectado: boolean;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => void;
  isAdministrator: boolean;
  loading: boolean;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdministrator, setIsAdministrator] = useState(false);
  const router = useRouter();
  const isAuthenticated = !!user;

  const handleSignOut = useCallback(async () => {
    try {
      const cookies = parseCookies();
      const csrfToken = cookies['csrf_token'];

      await axios.post(`${API_URL}/api/auth/logout`, {}, {
        withCredentials: true,
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      const cookieOptions = {
        path: '/',
        secure: false,
        sameSite: 'lax',
      };
      destroyCookie(undefined, 'token', cookieOptions);
      destroyCookie(undefined, 'refresh_token', cookieOptions);
      destroyCookie(undefined, 'csrf_token', cookieOptions);
      setUser(null);
      setIsAdministrator(false);
      router.push('/auth/login');
    }
  }, [router]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cookies = parseCookies();
        const token = cookies['token']; // Agora pegamos somente dos cookies

        if (token) {
          const userInfo = await recoverUserInformation(token);

          if (userInfo && userInfo.usuario) {
            setUser({
              idUsuario: userInfo.usuario.idUsuario,
              nomeDeUsuario: userInfo.usuario.nomeDeUsuario,
              email: userInfo.usuario.email,
              perfilImagem: userInfo.usuario.perfilImagem,
              nivelPermissao: userInfo.usuario.nivelPermissao,
              token: userInfo.usuario.token,
            });
            setIsAdministrator(userInfo.usuario.nivelPermissao === 'superusuario');
          }
        } else {
          console.log('Nenhum token encontrado. Carregamento interrompido...');
        }
      } catch (error) {
        console.error('Erro ao recuperar as informações do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [handleSignOut]);

  async function signIn({ email, senha, nomeDeUsuario, manterConectado }: SignInData) {
    setLoading(true);
    try {
      const response = await signInRequest({ email, senha, nomeDeUsuario, manterConectado });

      const isUserAdmin = response.usuario.nivelPermissao === 'superusuario';
      setIsAdministrator(isUserAdmin);
      setUser({
        idUsuario: response.usuario.idUsuario,
        email: response.usuario.email,
        perfilImagem: response.usuario.perfilImagem,
        nomeDeUsuario: response.usuario.nomeDeUsuario,
        nivelPermissao: response.usuario.nivelPermissao,
        token: response.token,
      });

      // Certificando que o cookie `token` é corretamente configurado
      setCookie(undefined, 'token', response.token, {
        maxAge: 4 * 60 * 60, // 4 horas
        path: '/',
        secure: false, // Altere para `true` se usar HTTPS em produção
        sameSite: 'lax', // 'lax' é o padrão, pode ser ajustado para 'none' ou 'strict'
      });

      if (manterConectado && response.refreshToken) {
        setCookie(undefined, 'refresh_token', response.refreshToken, {
          maxAge: 30 * 24 * 60 * 60, // 30 dias
          path: '/',
          secure: false, // Altere para `true` se usar HTTPS em produção
          sameSite: 'lax',
        });
      }

      if (response.csrfToken) {
        setCookie(undefined, 'csrf_token', response.csrfToken, {
          path: '/',
          secure: false,
          sameSite: 'lax',
        });
      }

      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, signIn, signOut: handleSignOut, isAdministrator, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
