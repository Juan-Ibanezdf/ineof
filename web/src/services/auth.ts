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

    const { token, refreshToken, usuario, csrfToken: newCsrfToken } = response.data;

    // Armazena o token apenas nos cookies
    setCookie(undefined, 'token', token, {
      maxAge: 4 * 60 * 60, // Persistente por 4 horas
      path: '/',
      secure: false,
      sameSite: 'lax',
    });

    if (newCsrfToken) {
      setCookie(undefined, 'csrf_token', newCsrfToken, {
        path: '/',
        secure: false,
        sameSite: 'lax',
      });
    }

    if (manterConectado && refreshToken) {
      setCookie(undefined, 'refresh_token', refreshToken, {
        maxAge: 30 * 24 * 60 * 60, // 30 dias
        path: '/',
        secure: false,
        sameSite: 'lax',
      });
    }

    return {
      token,
      refreshToken,
      csrfToken: newCsrfToken,
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

// Função para recuperar informações do usuário a partir do token via backend
export async function recoverUserInformation(token?: string): Promise<UserInfo | null> {
  const cookies = parseCookies();

  // Se o token não for passado, pega dos cookies
  token = token ?? cookies['token'];

  if (!token) {
    console.log('Nenhum token encontrado.');
    return null;
  }

  // Decodifica o token JWT para obter os dados do usuário
  let decodedToken;
  try {
    decodedToken = parseJwt(token);
  } catch (error) {
    console.error('Erro ao decodificar o token JWT:', error);
    return null; // Retorna null em vez de destruir o cookie se o token for inválido
  }

  // Valida o token no backend para garantir que ele é válido
  try {
    await axios.get(`${API_URL}/api/auth/validate-token`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      withCredentials: true,
    });

    return {
      usuario: {
        idUsuario: decodedToken.idUsuario,
        nomeDeUsuario: decodedToken.nomeDeUsuario,
        email: decodedToken.email,
        perfilImagem: decodedToken.perfilImagem,
        nivelPermissao: decodedToken.nivelPermissao,
        token: token,
      }
    };
  } catch (error) {
    console.error('Erro ao validar o token no backend:', error);
    return null; // Apenas retorna null e não destrói o cookie se houver um problema no backend
  }
}

// Função auxiliar para decodificar o JWT
function parseJwt(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`).join(''));

  return JSON.parse(jsonPayload);
}
