import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware (req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
    const isOnboarding = req.nextUrl.pathname.startsWith('/onboarding')
    const isDashboard = req.nextUrl.pathname.startsWith('/dashboard')
    const isMainDashboard = req.nextUrl.pathname === '/dashboard'

    // Force /dashboard to /dashboard/user
    if (isMainDashboard && isAuth) {
      return NextResponse.redirect(new URL('/dashboard/user', req.url))
    }

    // Redirect authenticated users away from auth pages
    if (isAuthPage && isAuth) {
      if (token?.needsOnboarding) {
        return NextResponse.redirect(new URL('/onboarding', req.url))
      }
      return NextResponse.redirect(new URL('/dashboard/user', req.url))
    }

    // Redirect unauthenticated users to login
    if ((isDashboard || isOnboarding) && !isAuth) {
      return NextResponse.redirect(new URL('/auth/signup?mode=signin', req.url))
    }

    // Redirect users who need onboarding
    if (isDashboard && token?.needsOnboarding) {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (
          req.nextUrl.pathname.startsWith('/auth') ||
          (!req.nextUrl.pathname.startsWith('/dashboard') &&
            !req.nextUrl.pathname.startsWith('/onboarding'))
        ) {
          return true
        }
        return !!token
      }
    }
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/auth/:path*'],
  runtime: 'edge'
}
