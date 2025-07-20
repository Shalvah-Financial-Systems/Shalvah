import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Rotas que requerem autenticação
  const protectedRoutes = [
    '/dashboard',
    '/admin',
    '/categorias',
    '/clientes',
    '/fornecedores',
    '/produtos-servicos',
    '/nova-transacao',
    '/configuracoes'
  ];
  
  // Verificar se a rota atual é protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Verificar se tem tokens de autenticação
  const accessToken = request.cookies.get('access_token');
  const refreshToken = request.cookies.get('refresh_token');
  const hasAuthTokens = accessToken || refreshToken;
  
  // Se está tentando acessar rota protegida sem autenticação
  if (isProtectedRoute && !hasAuthTokens) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // Se está autenticado e tentando acessar página de login, redirecionar para dashboard
  if (hasAuthTokens && pathname === '/login') {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
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
