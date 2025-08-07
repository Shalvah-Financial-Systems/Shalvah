'use client';

import { useState, createContext, useContext, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, LoginCredentials, AuthResponse } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; user?: User; redirectTo?: string }>;
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

  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window !== 'undefined' && window.location.pathname === '/login') {
        setInitialized(true);
        return;
      }
      
      try {
        const response = await api.get('/auth/profile');
        if (response.data) {
          setUser(response.data);
        }
      } catch (error) {
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
    if (loading) {
      return { success: false };
    }
    
    setLoading(true);
    
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials, {
        withCredentials: true
      });
            
      setUser(response.data.user);
      toast.success('Login realizado com sucesso!');
      
      // Redirecionamento client-side baseado no tipo de usuário
      const redirectPath = response.data.user?.type == 'ADMIN' ? '/admin/dashboard' : '/dashboard';
      
      // Aguardar um pouco para garantir que os cookies sejam definidos
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 100);
      
      return { 
        success: true, 
        user: response.data.user,
        redirectTo: redirectPath
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login';
      toast.error(message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout', {}, {
        withCredentials: true
      });
    } catch (error) {
      // Erro silencioso no logout
    } finally {
      setUser(null);
      setLoading(false);
      // Redirecionar explicitamente para /login após logout
      window.location.href = '/login';
    }
  };
  
  const clearAuth = () => {
    setUser(null);
  };

  const revalidateUser = useCallback(async () => {
    await fetchUserProfile();
  }, [fetchUserProfile]);

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
