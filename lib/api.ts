import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

// Interceptador para incluir token nas requisições
api.interceptors.request.use((config) => {
  // O token será enviado automaticamente nos cookies
  return config;
});

// Interceptador para tratar respostas de erro
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
