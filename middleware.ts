import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserTypeFromToken } from './lib/server-utils';

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

  if (isProtectedRoute && !accessToken) {
    return NextResponse.redirect(`${request.nextUrl.origin}/login`);
  }
  
  if ((pathname === '/login' || pathname === '/cadastro') && accessToken) {
    const userType = await getUserTypeFromToken(request);
    if (userType === 'ADMIN') {
      return NextResponse.redirect(`${request.nextUrl.origin}/admin/dashboard`);
    } else {
      return NextResponse.redirect(`${request.nextUrl.origin}/dashboard`);
    }
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
