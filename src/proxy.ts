import { NextRequest, NextResponse } from 'next/server';

/**
 * Route protection proxy.
 * Reads the lightweight `auth-token` cookie written by authStore on login/register.
 * Falls back gracefully — the AuthGuard client component provides a second layer.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authToken = request.cookies.get('auth-token')?.value;
  const authRole = request.cookies.get('auth-role')?.value;

  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAdminRoute = pathname.startsWith('/admin');

  // Unauthenticated -> send to /login with a redirect-back param
  if ((isDashboardRoute || isAdminRoute) && !authToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Non-admin trying to access /admin -> bounce to user dashboard
  if (isAdminRoute && authRole !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
