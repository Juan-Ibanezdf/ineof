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
      const csrfToken = cookies['csrf_token']; // Obtém o CSRF token dos cookies
  
      await axios.post(`${API_URL}/api/auth/logout`, {}, {
        withCredentials: true,
        headers: {
          'X-CSRF-Token': csrfToken, // Envia o CSRF token no cabeçalho
        },
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      const cookieOptions = {
        path: '/',
        secure: false, // SEM secure em localhost
        sameSite: 'lax',
      };
      destroyCookie(undefined, 'token', cookieOptions);
      destroyCookie(undefined, 'refresh_token', cookieOptions);
      destroyCookie(undefined, 'csrf_token', cookieOptions); // Remove o CSRF token
      setUser(null);
      setIsAdministrator(false);
      
      // Use caminho absoluto para garantir redirecionamento correto
      router.push('/auth/login'); // Caminho absoluto que sempre irá para a rota de login
    }
  }, [router]);

  // useEffect para verificar o token e recuperar as informações do usuário
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const getTokenFromCookies = () => {
          const cookies = document.cookie.split('; ').reduce((acc, current) => {
            const [name, value] = current.split('=');
            acc[name] = value;
            return acc;
          }, {} as { [key: string]: string });
          return cookies['token']; // Retorna o valor do cookie `token`
        };

        const token = getTokenFromCookies(); // Lê o token dos cookies manualmente
        console.log("Todos os cookies disponíveis:", document.cookie); // Depuração dos cookies
        console.log("Token obtido dos cookies:", token); // Depuração do token

        if (token) {
          const userInfo = await recoverUserInformation(token); // Recupera as informações do usuário usando o token
          
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
          } else {
            // Se o token for inválido, faça o logout
            handleSignOut();
          }
        } else {
          console.log('Nenhum token encontrado. Encerrando carregamento...');
          setLoading(false); // Se não houver token, o carregamento termina
        }
      } catch (error) {
        console.error('Erro ao recuperar as informações do usuário:', error);
        setLoading(false); // Evita a exclusão automática dos cookies
      } finally {
        setLoading(false);
      }
    };

    fetchUserData(); // Executa a função ao montar o componente
  }, [handleSignOut]);

  // Função de login
  async function signIn({ email, senha, nomeDeUsuario, manterConectado }: SignInData) {
    setLoading(true); // Definir estado de carregamento enquanto faz o login
    try {
      const response = await signInRequest({ email, senha, nomeDeUsuario, manterConectado });

      console.log('Resposta do servidor ao fazer login:', response);

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

      // Definir cookies após login (SEM secure em localhost)
      setCookie(undefined, 'token', response.token, {
        maxAge: 4 * 60 * 60, // 4 horas
        path: '/',
        secure: false, // SEM secure em localhost
        sameSite: 'lax', // SameSite Lax para desenvolvimento
      });

      if (manterConectado && response.refreshToken) {
        setCookie(undefined, 'refresh_token', response.refreshToken, {
          maxAge: 30 * 24 * 60 * 60, // 30 dias
          path: '/',
          secure: false, // SEM secure em localhost
          sameSite: 'lax', // SameSite Lax para desenvolvimento
        });
      }

      // Armazena o CSRF token
      if (response.csrfToken) {
        setCookie(undefined, 'csrf_token', response.csrfToken, {
          path: '/', // Disponível em toda a aplicação
          secure: false, // SEM secure em localhost
          sameSite: 'lax',
        });
      }

      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    } finally {
      setLoading(false); // Remover estado de carregamento após login
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, signIn, signOut: handleSignOut, isAdministrator, loading }}>
      {!loading && children} {/* Garante que o conteúdo só seja exibido após o carregamento */}
    </AuthContext.Provider>
  );
}
