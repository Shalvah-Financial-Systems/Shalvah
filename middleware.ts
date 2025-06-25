import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que requerem autenticação
const protectedRoutes = ['/dashboard', '/nova-transacao', '/configuracoes', '/categorias'];

// Rotas públicas (podem ser acessadas sem autenticação)
const publicRoutes = ['/login', '/', '/cadastro'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verifica se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(route => 
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
  
  // Se for rota protegida e não tiver token, redireciona para login
  if (isProtectedRoute && !hasValidToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
    // Se tiver token e tentar acessar login, redireciona para dashboard
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
