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
  const [loading, setLoading] = useState(false); // Começar com false
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  // useEffect para inicialização
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Inicializando autenticação...');
      
      // Se estamos na página de login, não verificar autenticação
      if (typeof window !== 'undefined' && window.location.pathname === '/login') {
        console.log('Na página de login, pulando verificação inicial');
        setInitialized(true);
        return;
      }
      
      try {
        const response = await api.get('/auth/profile');
        if (response.data) {
          setUser(response.data);
          console.log('Usuário autenticado encontrado:', response.data);
        }
      } catch (error) {
        console.log('Nenhum usuário autenticado encontrado');
      } finally {
        setInitialized(true);
      }
    };

    initializeAuth();
  }, []);

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

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; user?: User; redirectTo?: string }> => {
    console.log('=== LOGIN HOOK CHAMADO ===');
    console.log('Estado atual do loading:', loading);
    
    if (loading) {
      console.log('Login já em andamento, ignorando chamada duplicada');
      return { success: false };
    }
    
    console.log('Definindo loading como true');
    setLoading(true);
    
    try {
      console.log('Fazendo requisição para:', credentials.identifier);
      
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      console.log('Resposta do login:', response.data);
      console.log('Resposta recebida:', {
        status: response.status,
        hasUser: !!response.data.user,
        userType: response.data.user?.type,
      });
      
      // Aguardar um pouco para os cookies serem definidos pelo navegador
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Cookies após login:', {
        allCookies: document.cookie,
        hasAccessToken: document.cookie.includes('access_token'),
        hasRefreshToken: document.cookie.includes('refresh_token'),
      });
      
      setUser(response.data.user);
      toast.success('Login realizado com sucesso!');
      
      const redirectPath = response.data.user?.type === 'ADMIN' ? '/admin/dashboard' : '/dashboard';
      
      console.log('Redirecionamento definido para:', redirectPath);
      
      return { 
        success: true, 
        user: response.data.user,
        redirectTo: redirectPath
      };
    } catch (error: unknown) {
      console.error('Erro no login:', error);
      const message = error instanceof Error ? error.message : 'Erro ao fazer login';
      toast.error(message);
      return { success: false };
    } finally {
      console.log('Definindo loading como false');
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
  }, [fetchUserProfile]);  // Função para verificar autenticação - modificada para não interferir com login
  const checkAuthStatus = useCallback(async () => {
    // Não verificar status se acabamos de fazer login
    if (loading) {
      return;
    }
    
    // Se estamos na página de login, não fazer verificação automática
    if (typeof window !== 'undefined' && window.location.pathname === '/login') {
      return;
    }
    
    try {
      const response = await api.get('/auth/profile');
      if (response.data && response.data.id !== user?.id) {
        setUser(response.data);
      }
    } catch (error) {
      console.log('Erro ao verificar autenticação:', error);
      // Não limpar usuário automaticamente, deixar o interceptor lidar com isso
    }
  }, [user?.id, loading]);

  return (
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
