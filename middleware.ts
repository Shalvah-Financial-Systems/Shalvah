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
  
  // Rotas públicas
  const publicRoutes = [
    '/',
    '/login',
    '/cadastro',
    '/forgot-password',
    '/reset-password'
  ];
  
  // Verificar se a rota atual é protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Verificar se tem token de autenticação
  const authToken = request.cookies.get('auth-token') || 
                   request.cookies.get('session') ||
                   request.cookies.get('access_token');
  
  // Se está tentando acessar rota protegida sem autenticação
  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // Se está autenticado e tentando acessar página de login
  if (authToken && pathname === '/login') {
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
