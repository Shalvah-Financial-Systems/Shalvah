import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import Cookies from 'js-cookie'
import axios from 'axios'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para fazer logout via API (remove cookies httpOnly pelo backend)
export async function clearAuthCookies(): Promise<void> {
  try {
   
    await axios.post('http://localhost:3000/auth/logout', {}, {
      withCredentials: true 
    });
    
    const authCookieNames = ['access_token', 'refresh_token'];
    authCookieNames.forEach(cookieName => {
      Cookies.remove(cookieName, { path: '/' });
    });
    
  } catch (error) {
    // Erro silencioso no logout, apenas limpar cookies
        const authCookieNames = ['access_token', 'refresh_token'];
    authCookieNames.forEach(cookieName => {
      Cookies.remove(cookieName, { path: '/' });
    });
  }
}

export function hasValidAuthToken(): boolean {
  const authCookieNames = ['access_token', 'refresh_token'];
  
  for (const cookieName of authCookieNames) {
    const token = Cookies.get(cookieName);
    if (token && token.trim() !== '' && token !== 'undefined' && token !== 'null') {
      return true;
    }
  }
  
  return false;
}