import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth/signup');
    const isDashboard = req.nextUrl.pathname.startsWith('/dashboard');
    const isOnboarding = req.nextUrl.pathname.startsWith('/onboarding');

    // Redirect authenticated users away from auth pages
    if (isAuthPage && isAuth) {
      if (token?.needsOnboarding) {
        return NextResponse.redirect(new URL('/onboarding', req.url));
      }
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Redirect unauthenticated users to signin
    if ((isDashboard || isOnboarding) && !isAuth) {
      return NextResponse.redirect(new URL('/auth/signup', req.url));
    }

    // Redirect users who need onboarding
    if (isDashboard && token?.needsOnboarding) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }

    // Redirect users who completed onboarding away from onboarding page
    if (isOnboarding && isAuth && !token?.needsOnboarding) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages and API routes without authentication
        if (req.nextUrl.pathname.startsWith('/auth/signup') || 
            req.nextUrl.pathname.startsWith('/api/auth') ||
            req.nextUrl.pathname.startsWith('/api/onboarding') ||
            req.nextUrl.pathname.startsWith('/api/user') ||
            !req.nextUrl.pathname.startsWith('/dashboard') &&
            !req.nextUrl.pathname.startsWith('/onboarding')) {
          return true;
        }
        
        // Require authentication for dashboard and onboarding
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/auth/signup']
};