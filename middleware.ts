import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
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
  
  const accessToken = request.cookies.get('access_token');
  const hasValidToken = accessToken && 
    accessToken.value && 
    accessToken.value.trim() !== '' && 
    accessToken.value !== 'undefined' && 
    accessToken.value !== 'null';

  // Se rota protegida e sem token, redirecionar para login
  if (isProtectedRoute && !hasValidToken) {
    return NextResponse.redirect(new URL('/login', request.url));
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
