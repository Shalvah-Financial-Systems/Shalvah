'use client';

import { useState, createContext, useContext, useEffect } from 'react';
import { User, LoginCredentials, AuthResponse } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  // Verificar se há token ao carregar a página
  useEffect(() => {
    const token = Cookies.get('token');
    if (token && !user) {
      // Buscar dados do usuário com base no token
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data);
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      // Se o token for inválido, remove dos cookies
      Cookies.remove('token');
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      // O backend já salva o token nos cookies via Set-Cookie header
      // Apenas definimos o usuário no estado
      setUser(response.data.user);
      toast.success('Login realizado com sucesso!');
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
      // O backend deve limpar o cookie via Set-Cookie header
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Limpa o cookie localmente como fallback
      Cookies.remove('token');
      setUser(null);
      setLoading(false);
      window.location.href = '/login';
    }
  };
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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
