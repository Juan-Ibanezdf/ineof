import { setCookie, parseCookies, destroyCookie } from 'nookies';
import axios from 'axios';

const API_URL = 'http://localhost:8080';

type UserInfo = {
  usuario: {
    idUsuario: string;
    nomeDeUsuario: string;
    email: string;
    perfilImagem: string;
    nivelPermissao: string;
    token: string;
  };
};

interface SignInRequestData {
  email: string;
  senha: string;
  nomeDeUsuario: string;
  manterConectado: boolean;
}

export async function signInRequest({ email, senha, nomeDeUsuario, manterConectado }: SignInRequestData) {
  try {
    const cookies = parseCookies();
    const csrfToken = cookies['csrf_token'];

    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      senha,
      nomeDeUsuario,
      manterConectado,
    }, {
      withCredentials: true,
      headers: {
        'X-CSRF-Token': csrfToken,
      }
    });

    const { token, refreshToken, usuario } = response.data;

    setCookie(undefined, 'token', token, {
      maxAge: 4 * 60 * 60, // 4 horas
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    if (manterConectado && refreshToken) {
      setCookie(undefined, 'refresh_token', refreshToken, {
        maxAge: 30 * 24 * 60 * 60, // 30 dias
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      });
    }

    return {
      token,
      refreshToken, // Corrige a estrutura para incluir refreshToken, se existir
      usuario: {
        idUsuario: usuario.idUsuario,
        email: usuario.email,
        nomeDeUsuario: usuario.nomeDeUsuario,
        perfilImagem: usuario.perfilImagem,
        nivelPermissao: usuario.nivelPermissao,
      },
    };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
}

// Função para recuperar informações do usuário a partir do token
export function recoverUserInformation(): Promise<UserInfo | null> {
  return new Promise((resolve, reject) => {
    const cookies = parseCookies();
    const token = cookies['token'];

    if (!token) {
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
        nivelPermissao: decodedToken.nivelPermissao,
        token: token,
      };

      resolve({ usuario });
    } catch (error) {
      reject(error);
    }
  });
}

// Função auxiliar para decodificar o JWT
function parseJwt(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`).join(''));

  return JSON.parse(jsonPayload);
}
