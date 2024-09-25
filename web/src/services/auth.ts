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
    const csrfToken = cookies['csrf_token']; // Obtém o CSRF token dos cookies

    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      senha,
      nomeDeUsuario,
      manterConectado,
    }, {
      withCredentials: true,
      headers: {
        'X-CSRF-Token': csrfToken, // Envia o CSRF token no cabeçalho
      }
    });

    const { token, refreshToken, usuario, csrfToken: newCsrfToken } = response.data;

    // Definir cookies após login (SEM secure em localhost)
    setCookie(undefined, 'token', token, {
      maxAge: 4 * 60 * 60, // 4 horas
      path: '/',
      secure: false, // SEM secure em localhost
      sameSite: 'lax', // SameSite Lax para desenvolvimento
    });

    // Atualiza o CSRF token nos cookies se um novo token for retornado
    if (newCsrfToken) {
      setCookie(undefined, 'csrf_token', newCsrfToken, {
        path: '/', // Disponível em toda a aplicação
        secure: false, // SEM secure em localhost
        sameSite: 'lax',
      });
    }

    // Se "manter conectado", define o refresh token
    if (manterConectado && refreshToken) {
      setCookie(undefined, 'refresh_token', refreshToken, {
        maxAge: 30 * 24 * 60 * 60, // 30 dias
        path: '/',
        secure: false, // SEM secure em localhost
        sameSite: 'lax', // SameSite Lax para desenvolvimento
      });
    }

    return {
      token,
      refreshToken,
      csrfToken: newCsrfToken, // Retorna o CSRF token, se houver
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

// Função auxiliar para decodificar o JWT
function parseJwt(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`).join(''));

  return JSON.parse(jsonPayload);
}

// Função para recuperar informações do usuário a partir do token via backend
export async function recoverUserInformation(token: string): Promise<UserInfo | null> {
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
    destroyCookie(undefined, 'token', { path: '/' });
    destroyCookie(undefined, 'refresh_token', { path: '/' });
    destroyCookie(undefined, 'csrf_token', { path: '/' }); // Remove o CSRF token também
    throw new Error('Token inválido ou corrompido.');
  }

  // Valida o token no backend para garantir que ele é válido
  try {
    await axios.get(`${API_URL}/api/auth/validate-token`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      withCredentials: true,
    });

    // Retorna as informações do usuário obtidas do token decodificado
    return {
      usuario: {
        idUsuario: decodedToken.idUsuario,
        nomeDeUsuario: decodedToken.nomeDeUsuario,
        email: decodedToken.email,
        perfilImagem: decodedToken.perfilImagem,
        nivelPermissao: decodedToken.nivelPermissao,
        token: token, // Retorna o próprio token já que ele ainda é válido
      }
    };
  } catch (error) {
    console.error('Erro ao validar o token no backend:', error);
    destroyCookie(undefined, 'token', { path: '/' });
    destroyCookie(undefined, 'refresh_token', { path: '/' });
    destroyCookie(undefined, 'csrf_token', { path: '/' }); // Remove o CSRF token também
    throw new Error('Token inválido ou expirado.');
  }
}
