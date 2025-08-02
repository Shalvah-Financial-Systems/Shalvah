'use server';

import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import api from "./api";

// Função para fazer logout via API (remove cookies httpOnly pelo backend)
export async function clearAuthCookies(): Promise<void> {
  try {
    await api.post('/auth/logout', {}, {
      withCredentials: true
    });
  } catch (error) {
    // Erro silencioso no logout
    console.log('Erro ao fazer logout via API');
  }
}

// Função server-side para verificar tokens no middleware
export function hasValidAuthTokenServer(request: NextRequest): boolean {
  const accessToken = request.cookies.get('access_token');
  const refreshToken = request.cookies.get('refresh_token');

  // Verificar se pelo menos um dos tokens existe e não está vazio
  if (accessToken && accessToken.value.trim() !== '' && accessToken.value !== 'undefined' && accessToken.value !== 'null') {
    return true;
  }
  
  if (refreshToken && refreshToken.value.trim() !== '' && refreshToken.value !== 'undefined' && refreshToken.value !== 'null') {
    return true;
  }
  
  return false;
}

// Função server-side para buscar tipo do usuário no middleware
export async function getUserTypeFromToken(request: NextRequest): Promise<string | null> {
  const accessToken = request.cookies.get('access_token');
  if (!accessToken) return null;
  
  try {
    const cookieHeader = request.cookies.toString();
    const response = await api.get('/auth/profile', {
      headers: { Cookie: cookieHeader },
      withCredentials: true,
    });
    const user = response.data.user || response.data;
    return user?.type || null;
  } catch {
    return null;
  }
}

// Função server-side para uso em Server Components
export async function hasValidAuthTokenServerComponent(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookieNames = ['access_token', 'refresh_token'];
  
  for (const cookieName of authCookieNames) {
    const token = cookieStore.get(cookieName);
    if (token && token.value.trim() !== '' && token.value !== 'undefined' && token.value !== 'null') {
      return true;
    }
  }
  
  return false;
}
