import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que requerem autenticação
const protectedRoutes = ['/dashboard', '/nova-transacao', '/configuracoes'];

// Rotas públicas (podem ser acessadas sem autenticação)
const publicRoutes = ['/login', '/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verifica se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Verifica se é uma rota pública
  const isPublicRoute = publicRoutes.includes(pathname);
    // Pega o token dos cookies (pode ser 'token', 'authToken', 'access_token', etc.)
  const token = request.cookies.get('token')?.value || 
                request.cookies.get('authToken')?.value ||
                request.cookies.get('access_token')?.value;
  
  // Se for rota protegida e não tiver token, redireciona para login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Se estiver logado e tentar acessar login, redireciona para dashboard
  if (token && pathname === '/login') {
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
