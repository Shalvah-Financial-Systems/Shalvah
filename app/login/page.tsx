import { redirect } from 'next/navigation';
import { checkAuth } from '@/lib/auth-protection';
import LoginClient from './login-client';

export default async function LoginPage() {
  // Verificar se o usuário já está autenticado
  const authResult = await checkAuth();
  
  if (authResult?.isAuthenticated) {
    // Se já está autenticado, redirecionar baseado no tipo de usuário
    if (authResult.user.type === 'ADMIN') {
      redirect('/admin/dashboard');
    } else {
      redirect('/dashboard');
    }
  }
  
  // Se não está autenticado, renderizar o formulário de login
  return <LoginClient />;
}
