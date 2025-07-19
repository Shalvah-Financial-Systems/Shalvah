'use client';

import { useState, createContext, useContext, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, LoginCredentials, AuthResponse } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; user?: User }>;
  logout: () => void;
  clearAuth: () => void;
  revalidateUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Começar com true para evitar flash
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  // Verificar se há usuário autenticado ao carregar a página
  useEffect(() => {
    if (!initialized) {
      checkAuthStatus();
      setInitialized(true);
    }
  }, [initialized]);
  
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await api.get('/auth/profile');
      // Verificar se a resposta tem uma propriedade 'user' ou é o usuário direto
      const userData = response.data.user || response.data;
      setUser(userData);
    } catch (error: any) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    // Só tentar buscar perfil se estivermos em uma rota que indica autenticação
    const currentPath = window.location.pathname;
    const isAuthenticatedRoute = ['/dashboard', '/categorias', '/nova-transacao', '/configuracoes', '/admin', '/clientes', '/fornecedores', '/produtos-servicos'].some(
      route => currentPath.startsWith(route)
    );

    if (isAuthenticatedRoute) {
      await fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [fetchUserProfile]);  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; user?: User; redirectTo?: string }> => {
    if (loading) {
      console.log('Login já em andamento, ignorando chamada duplicada');
      return { success: false };
    }
    
    setLoading(true);
    try {
      console.log('Iniciando login para:', credentials.identifier);
      console.log('Ambiente:', process.env.NODE_ENV);
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      console.log('Resposta do login:', {
        success: !!response.data,
        user: response.data.user,
        hasToken: !!response.data.token,
      });
      
      // Verificar se já tem usuário setado para evitar duplicação
      if (user && user.id === response.data.user.id) {
        console.log('Usuário já está logado, evitando redefinição');
        return { success: true, user: response.data.user };
      }
      
      setUser(response.data.user);
      toast.success('Login realizado com sucesso!');
      
      const redirectPath = response.data.user?.type === 'ADMIN' ? '/admin/dashboard' : '/dashboard';
      
      console.log('Definindo redirecionamento para:', redirectPath);
      
      // Em produção, forçar redirecionamento mais direto
      if (process.env.NODE_ENV === 'production') {
        setTimeout(() => {
          console.log('Executando redirecionamento para:', redirectPath);
          window.location.href = redirectPath;
        }, 1000); // Aumentar delay para 1 segundo
      }
      
      return { 
        success: true, 
        user: response.data.user,
        redirectTo: redirectPath
      };
    } catch (error: unknown) {
      console.error('Erro no login:', error);
      
      // Log mais detalhado do erro
      if (error instanceof Error) {
        console.error('Detalhes do erro:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
      }
      
      const message = error instanceof Error ? error.message : 'Erro ao fazer login';
      toast.error(message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setUser(null);
      setLoading(false);
      // Redirecionar explicitamente para /login após logout
      router.push('/login');
    }
  };
  
  const clearAuth = () => {
    setUser(null);
  };

  const revalidateUser = useCallback(async () => {
    await fetchUserProfile();
  }, [fetchUserProfile]);  return (
    <AuthContext.Provider value={{ user, login, logout, clearAuth, revalidateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
