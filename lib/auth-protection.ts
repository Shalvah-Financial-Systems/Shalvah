import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import api from './api';
import { User } from '@/types';

export interface AuthProtectionResult {
  user: User;
  isAuthenticated: boolean;
}

// Função para proteger rotas que requerem autenticação
export async function withAuthProtection(): Promise<AuthProtectionResult> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  
  try {
    const response = await api.get('/auth/profile', {
      headers: { Cookie: cookieHeader },
      withCredentials: true,
    });
    
    const user = response.data.user || response.data;
    console.log('User profile:', user);
    if (!user) {
      redirect('/login');
    }
    
    return {
      user,
      isAuthenticated: true
    };
  } catch (error) {
    redirect('/login');
  }
}

// Função para proteger rotas específicas do admin
export async function withAdminProtection(): Promise<AuthProtectionResult> {
  const result = await withAuthProtection();
  
  if (result.user.type !== 'ADMIN') {
    redirect('/dashboard');
  }
  
  return result;
}

// Função para proteger rotas enterprise (permite admin também)
export async function withEnterpriseProtection(): Promise<AuthProtectionResult> {
  const result = await withAuthProtection();
  
  if (result.user.type !== 'ENTERPRISE' && result.user.type !== 'ADMIN') {
    redirect('/login');
  }
  
  return result;
}

// Função para verificar autenticação sem redirecionamento (para páginas opcionais)
export async function checkAuth(): Promise<AuthProtectionResult | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  
  try {
    const response = await api.get('/auth/profile', {
      headers: { Cookie: cookieHeader },
      withCredentials: true,
    });
    
    const user = response.data.user || response.data;
    
    if (user) {
      return {
        user,
        isAuthenticated: true
      };
    }
    
    return null;
  } catch (error) {
    return null;
  }
}
