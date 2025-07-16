import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_API_URL || '/api'
    : '/api',
  withCredentials: true,
  timeout: 30000,
});

// Flag para controlar requisições em andamento
const requestsInProgress = new Set<string>();

// Interceptador para incluir token nas requisições
api.interceptors.request.use((config) => {
  const requestKey = `${config.method}:${config.url}`;
  
  // Se é uma requisição de login e já há uma em andamento, bloquear
  if (config.url?.includes('/auth/login') && requestsInProgress.has(requestKey)) {
    console.log('Bloqueando requisição duplicada de login');
    return Promise.reject(new Error('Requisição duplicada'));
  }
  
  if (config.url?.includes('/auth/login')) {
    requestsInProgress.add(requestKey);
  }
  
  console.log('API Request:', {
    url: config.url,
    method: config.method,
    baseURL: config.baseURL,
  });
  
  return config;
});

// Flag para evitar múltiplos logouts simultâneos
let isLoggingOut = false;

// Interceptador para tratar respostas
api.interceptors.response.use(
  (response) => {
    const requestKey = `${response.config.method}:${response.config.url}`;
    
    // Remover da lista de requisições em andamento
    if (response.config.url?.includes('/auth/login')) {
      requestsInProgress.delete(requestKey);
    }
    
    console.log('API Response Success:', {
      url: response.config.url,
      status: response.status,
    });
    
    return response;
  },
  async (error) => {
    const requestKey = `${error.config?.method}:${error.config?.url}`;
    
    // Remover da lista de requisições em andamento mesmo em caso de erro
    if (error.config?.url?.includes('/auth/login')) {
      requestsInProgress.delete(requestKey);
    }
    
    console.log('API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });
    
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      const isLogoutRequest = error.config?.url?.includes('/auth/logout');
      const isOnLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';
      const isProfileRequest = error.config?.url?.includes('/auth/profile');
      const isPublicRoute = typeof window !== 'undefined' && 
        ['/', '/login', '/cadastro', '/forgot-password', '/reset-password'].includes(window.location.pathname);
      
      if (isLogoutRequest || isOnLoginPage || isLoggingOut || 
          (isProfileRequest && isPublicRoute)) {
        return Promise.reject(error);
      }
      
      isLoggingOut = true;
      console.log('Fazendo logout automático devido a 401');
      
      try {
        await api.post('/auth/logout');
      } catch (logoutError) {
        console.log('Erro ao fazer logout:', logoutError);
      }
      
      setTimeout(() => {
        isLoggingOut = false;
        if (typeof window !== 'undefined') {
          console.log('Redirecionando para /login');
          window.location.replace('/login');
        }
      }, 500);
    }
    return Promise.reject(error);
  }
);

export default api;
