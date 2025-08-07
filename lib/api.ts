import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_API_URL 
    : 'http://localhost:3000',
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// // Flag para controlar requisições em andamento
// const requestsInProgress = new Set<string>();

// // Interceptador para incluir token nas requisições
// api.interceptors.request.use((config) => {
//   const requestKey = `${config.method}:${config.url}`;
  
//   // Se é uma requisição de login e já há uma em andamento, bloquear
//   if (config.url?.includes('/auth/login') && requestsInProgress.has(requestKey)) {
//     return Promise.reject(new Error('Requisição duplicada'));
//   }
  
//   if (config.url?.includes('/auth/login')) {
//     requestsInProgress.add(requestKey);
//   }
  
//   return config;
// });

// // Flag para evitar múltiplos logouts simultâneos
// let isLoggingOut = false;

// Interceptador para tratar respostas
api.interceptors.response.use(
  (response) => {
    const requestKey = `${response.config.method}:${response.config.url}`;
    
    // Remover da lista de requisições em andamento
    // if (response.config.url?.includes('/auth/login')) {
    //   requestsInProgress.delete(requestKey);
    // }
    
    return response;
  },
  async (error) => {
    const requestKey = `${error.config?.method}:${error.config?.url}`;
    
    // Remover da lista de requisições em andamento mesmo em caso de erro
    // if (error.config?.url?.includes('/auth/login')) {
    //   requestsInProgress.delete(requestKey);
    // }
    
    // CRÍTICO: Não fazer logout automático se acabamos de fazer login com sucesso
    if (error.response?.status === 401 && 
        !error.config?.url?.includes('/auth/login') && 
        !error.config?.url?.includes('/auth/logout')) {
      
      // const isOnLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';
      // const isProfileRequest = error.config?.url?.includes('/auth/profile');
      // const isPublicRoute = typeof window !== 'undefined' && 
      //   ['/', '/login', '/cadastro', '/forgot-password', '/reset-password'].includes(window.location.pathname);
      

      await api.post('/auth/logout');

      window.location.href = '/login';

      // Se estamos em uma rota pública, não fazer logout automático
      // if (isOnLoginPage || isLoggingOut || (isProfileRequest && isPublicRoute)) {
      //   return Promise.reject(error);
      // }
      
      // Delay antes de fazer logout para evitar conflito com login
      // setTimeout(() => {
      //   if (!isLoggingOut) {
      //     isLoggingOut = true;
          
      //     api.post('/auth/logout').catch(() => {
      //       // Erro silencioso no logout automático
      //     }).finally(() => {
      //       setTimeout(() => {
      //         isLoggingOut = false;
      //         if (typeof window !== 'undefined') {
      //           window.location.replace('/login');
      //         }
      //       }, 500);
      //     });
      //   }
      // }, 2000); // Delay de 2 segundos
    }
    return Promise.reject(error);
  }
);

export default api;
