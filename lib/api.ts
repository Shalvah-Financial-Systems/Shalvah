import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_API_URL 
    : '/api',
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
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
    production: process.env.NODE_ENV === 'production',
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
      
      console.log('Login realizado com sucesso:', {
        status: response.status,
        hasData: !!response.data,
        hasUser: !!response.data?.user,
        cookies: document.cookie.includes('access_token') ? 'Cookies presentes' : 'Sem cookies'
      });
    }
    
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
      data: error.response?.data,
    });
    
    // CRÍTICO: Não fazer logout automático se acabamos de fazer login com sucesso
    if (error.response?.status === 401 && 
        !error.config?.url?.includes('/auth/login') && 
        !error.config?.url?.includes('/auth/logout')) {
      
      const isOnLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';
      const isProfileRequest = error.config?.url?.includes('/auth/profile');
      const isPublicRoute = typeof window !== 'undefined' && 
        ['/', '/login', '/cadastro', '/forgot-password', '/reset-password'].includes(window.location.pathname);
      
      // Se estamos em uma rota pública, não fazer logout automático
      if (isOnLoginPage || isLoggingOut || (isProfileRequest && isPublicRoute)) {
        return Promise.reject(error);
      }
      
      // Delay antes de fazer logout para evitar conflito com login
      setTimeout(() => {
        if (!isLoggingOut) {
          isLoggingOut = true;
          console.log('Fazendo logout automático devido a 401 (após delay)');
          
          api.post('/auth/logout').catch(() => {
            console.log('Erro ao fazer logout automático');
          }).finally(() => {
            setTimeout(() => {
              isLoggingOut = false;
              if (typeof window !== 'undefined') {
                console.log('Redirecionando para /login');
                window.location.replace('/login');
              }
            }, 500);
          });
        }
      }, 2000); // Delay de 2 segundos
    }
    return Promise.reject(error);
  }
);

export default api;
