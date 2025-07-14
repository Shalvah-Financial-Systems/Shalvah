import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_API_URL || '/api'
    : '/api',
  withCredentials: true,
  timeout: 10000, // 10 segundos de timeout
});

// Interceptador para incluir token nas requisições
api.interceptors.request.use((config) => {
  // Em produção, garantir que o baseURL está correto
  if (process.env.NODE_ENV === 'production' && !config.baseURL?.startsWith('http')) {
    config.baseURL = process.env.NEXT_PUBLIC_API_URL || window.location.origin + '/api';
  }
  return config;
});

// Flag para evitar múltiplos logouts simultâneos
let isLoggingOut = false;

// Interceptador para tratar respostas de erro
api.interceptors.response.use(
  (response) => response,
  async (error) => {    
    if (error.response?.status === 401) {
      const isLogoutRequest = error.config?.url?.includes('/auth/logout');
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      const isOnLoginPage = window.location.pathname === '/login';
      const isProfileRequest = error.config?.url?.includes('/auth/profile');
      const isPublicRoute = ['/', '/login', '/cadastro', '/forgot-password', '/reset-password'].includes(window.location.pathname);
      
      if (isLogoutRequest || isLoginRequest || isOnLoginPage || isLoggingOut || 
          (isProfileRequest && isPublicRoute)) {
        return Promise.reject(error);
      }
      
      isLoggingOut = true;
      
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        await api.post('/auth/logout');
      } catch (logoutError) {
        console.error("Erro ao fazer logout:", logoutError);
      }
      
      // Reset do flag antes de redirecionar
      setTimeout(() => {
        isLoggingOut = false;
      }, 1000);
      
      // Usar window.location em produção
      if (process.env.NODE_ENV === 'production') {
        window.location.href = '/login';
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
