import axios from 'axios';
import { parseCookies } from 'nookies';

export function getAPIClient(ctx?: any) {
  // Recupera o token e o csrf_token dos cookies
  const { token, csrf_token } = parseCookies(ctx);

  const api = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true, // Garante que os cookies são enviados com as solicitações
  });

  // Se o token estiver presente, adiciona o cabeçalho de autorização
  if (token) {
    api.defaults.headers['Authorization'] = `Bearer ${token}`;
  }

  // Se o CSRF token estiver presente, adiciona o cabeçalho X-CSRF-Token
  if (csrf_token) {
    api.defaults.headers['X-CSRF-Token'] = csrf_token;
  }

  return api;
}
