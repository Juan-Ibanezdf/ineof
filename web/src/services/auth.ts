import { setCookie } from 'nookies';
import axios from 'axios';
import { parseCookies } from 'nookies';

const API_URL = 'http://localhost:8080';

// Defina um tipo para os parâmetros de login
interface SignInRequestData {
  email: string;
  senha: string;
  nomeDeUsuario: string;
  manterConectado: boolean; // Adiciona o campo "manter conectado"
}

export async function signInRequest({ email, senha, nomeDeUsuario, manterConectado }: SignInRequestData) {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      senha,
      nomeDeUsuario,
      manterConectado, // Envia o campo "manter conectado" para o backend
    }, {
      withCredentials: true, // Garante que os cookies CSRF sejam enviados e recebidos
    });

    const { token, refreshToken, usuario } = response.data;

    // Armazenar o access token em um cookie (com 4 horas de validade)
    setCookie(undefined, 'token', token, {
      maxAge: 4 * 60 * 60, // 4 horas
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    // Armazenar o refresh token, se o "manter conectado" foi selecionado
    if (manterConectado && refreshToken) {
      setCookie(undefined, 'refresh_token', refreshToken, {
        maxAge: 30 * 24 * 60 * 60, // 30 dias
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      });
    }

    console.log(usuario);

    return {
      token,
      usuario: {
        idUsuario: usuario.idUsuario,
        email: usuario.email,
        nomeDeUsuario: usuario.nomeDeUsuario,
        perfilImagem: usuario.perfilImagem, // Se disponível
        nivelDeAcesso: usuario.nivelDeAcesso,
      },
    };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
}

type UserInfo = {
  usuario: {
    idUsuario: string;
    nomeDeUsuario: string;
    email: string;
    perfilImagem: string;
    nivelDeAcesso: string;
    token: string;
  };
};

// Recupera as informações do usuário com base no token armazenado
export function recoverUserInformation(): Promise<UserInfo | null> {
  return new Promise((resolve, reject) => {
    const { token } = parseCookies();

    if (!token) {
      console.log("Token não encontrado nos cookies.");
      reject(new Error('Token não encontrado'));
      return;
    }

    try {
      const decodedToken = parseJwt(token);

      const usuario = {
        idUsuario: decodedToken.idUsuario,
        nomeDeUsuario: decodedToken.nomeDeUsuario,
        email: decodedToken.email,
        perfilImagem: decodedToken.perfilImagem,
        nivelDeAcesso: decodedToken.nivelAcesso,
        token: token,
      };

      resolve({ usuario });
    } catch (error) {
      console.error('Erro ao decodificar o token:', error);
      reject(error);
    }
  });
}

// Função para criar instâncias de axios com o token automaticamente configurado
export function getAPIClient(ctx?: any) {
  const { token, csrf_token } = parseCookies(ctx);

  const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Garante que os cookies sejam enviados
  });

  if (token) {
    api.defaults.headers['Authorization'] = `Bearer ${token}`;
  }

  if (csrf_token) {
    api.defaults.headers['X-CSRF-Token'] = csrf_token; // Adiciona o CSRF token
  }

  return api;
}

// Função auxiliar para decodificar o JWT
function parseJwt(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`).join(''));

  return JSON.parse(jsonPayload);
}
