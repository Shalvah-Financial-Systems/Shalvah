import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que requerem autenticação como ENTERPRISE
const enterpriseRoutes = ['/dashboard', '/nova-transacao', '/configuracoes', '/categorias', '/clientes', '/fornecedores', '/produtos-servicos'];

// Rotas que requerem privilégios de ADMIN
const adminRoutes = ['/admin'];

// Rotas públicas (podem ser acessadas sem autenticação)
const publicRoutes = ['/login', '/', '/cadastro'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verifica se é uma rota empresarial
  const isEnterpriseRoute = enterpriseRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Verifica se é uma rota de admin
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  );
    // Verifica apenas os tokens que o backend realmente usa
  const authCookieNames = ['access_token', 'refresh_token'];
  let hasValidToken = false;
  
  for (const cookieName of authCookieNames) {
    const token = request.cookies.get(cookieName)?.value;
    if (token && token.trim() !== '' && token !== 'undefined' && token !== 'null') {
      hasValidToken = true;
      break;
    }
  }
  
  // Se for rota empresarial ou admin e não tiver token, redireciona para login
  if ((isEnterpriseRoute || isAdminRoute) && !hasValidToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Para rotas admin, precisaríamos verificar o tipo de usuário aqui
  // Por enquanto, vamos deixar passar e verificar no lado do cliente
  if (isAdminRoute && hasValidToken) {
    // TODO: Verificar se o usuário é ADMIN através do token
    // Por enquanto, permitimos o acesso e deixamos a verificação para o frontend
  }
  
  // Se tiver token e tentar acessar login, redireciona baseado no tipo do usuário
  // Por limitação do middleware, não conseguimos decodificar o token aqui facilmente
  // Então redirecionamos para /dashboard e deixamos o frontend decidir
  if (hasValidToken && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
