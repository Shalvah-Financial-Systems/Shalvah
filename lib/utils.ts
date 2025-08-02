import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para verificar se tem tokens válidos no client-side
export function hasValidAuthToken(): boolean {
  if (typeof window === 'undefined') return false;
  
  const cookiesString = document.cookie;
  const authCookieNames = ['access_token', 'refresh_token'];
  console.log(cookiesString)
  for (const cookieName of authCookieNames) {
    const value = getCookie(cookieName);
    if (value && value.trim() !== '' && value !== 'undefined' && value !== 'null') {
      return true;
    }
  }
  
  return false;
}

// Função auxiliar para obter cookie específico
function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}