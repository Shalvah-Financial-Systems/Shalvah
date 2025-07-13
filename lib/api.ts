import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Interceptador para incluir token nas requisições
api.interceptors.request.use((config) => {
  return config;
});

// Flag para evitar múltiplos logouts simultâneos
let isLoggingOut = false;

// Interceptador para tratar respostas de erro
api.interceptors.response.use(
  (response) => response,
  async (error) => {    
    if (error.response?.status === 401) {
      // Não processar logout se:
      // 1. Já estamos fazendo logout
      // 2. Estamos fazendo login
      // 3. Já estamos na página de login
      // 4. Já existe um processo de logout em andamento
      // 5. É uma requisição de profile em rota pública (inicialização)
      const isLogoutRequest = error.config?.url?.includes('/auth/logout');
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      const isOnLoginPage = window.location.pathname === '/login';
      const isAuthRoute = error.config?.url?.includes('/auth/');
      const isProfileRequest = error.config?.url?.includes('/auth/profile');
      const isPublicRoute = ['/', '/login', '/cadastro', '/forgot-password', '/reset-password'].includes(window.location.pathname);
      
      if (isLogoutRequest || isLoginRequest || isOnLoginPage || isLoggingOut || 
          (isProfileRequest && isPublicRoute)) {
        return Promise.reject(error);
      }
      
      // Marcar que estamos fazendo logout para evitar múltiplas tentativas
      isLoggingOut = true;
      
      try {
        // Pequeno delay para evitar race conditions
        await new Promise(resolve => setTimeout(resolve, 100));
        await api.post('/auth/logout');
      } catch (logoutError) {
        console.error("Erro ao fazer logout:", logoutError);
      }
      
      // Reset do flag antes de redirecionar
      setTimeout(() => {
        isLoggingOut = false;
      }, 1000);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
