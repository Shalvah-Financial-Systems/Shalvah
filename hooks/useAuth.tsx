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
  }, [fetchUserProfile]);  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; user?: User }> => {
    setLoading(true);
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      // Definir o usuário imediatamente com os dados da resposta
      setUser(response.data.user);
      toast.success('Login realizado com sucesso!');
      
      return { success: true, user: response.data.user };
    } catch (error: unknown) {
      console.error('Erro no login:', error);
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
