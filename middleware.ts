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

    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Middleware:', {
        pathname: req.nextUrl.pathname,
        isAuth,
        needsOnboarding: token?.needsOnboarding,
        needsRoleSelection: token?.needsRoleSelection,
        activeRole: token?.activeRole,
        email: token?.email
      })
    }

    // Force /dashboard to /dashboard/user for authenticated users
    if (isMainDashboard && isAuth) {
      // If user needs onboarding, redirect to onboarding first
      if (token?.needsOnboarding || token?.needsRoleSelection) {
        return NextResponse.redirect(new URL('/onboarding', req.url))
      }
      return NextResponse.redirect(new URL('/dashboard/user', req.url))
    }

    // Redirect authenticated users away from auth pages
    if (isAuthPage && isAuth) {
      // If user needs onboarding, redirect to onboarding
      if (token?.needsOnboarding || token?.needsRoleSelection) {
        return NextResponse.redirect(new URL('/onboarding', req.url))
      }
      // Otherwise redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard/user', req.url))
    }

    // Redirect unauthenticated users to login
    if ((isDashboard || isOnboarding) && !isAuth) {
      return NextResponse.redirect(new URL('/auth/signup?mode=signin', req.url))
    }

    // Handle onboarding flow for authenticated users
    if (isAuth) {
      const needsOnboarding =
        token?.needsOnboarding || token?.needsRoleSelection

      // If user needs onboarding but is not on onboarding page, redirect them
      if (needsOnboarding && !isOnboarding) {
        return NextResponse.redirect(new URL('/onboarding', req.url))
      }

      // If user doesn't need onboarding but is on onboarding page, redirect to dashboard
      if (!needsOnboarding && isOnboarding) {
        return NextResponse.redirect(new URL('/dashboard/user', req.url))
      }
    }

    // Allow access to all other routes
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Always allow access to auth pages
        if (pathname.startsWith('/auth')) {
          return true
        }

        // For dashboard and onboarding routes, require authentication
        if (
          pathname.startsWith('/dashboard') ||
          pathname.startsWith('/onboarding')
        ) {
          return !!token
        }

        // Allow all other routes (public routes, API routes, etc.)
        return true
      }
    }
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/auth/:path*'],
  runtime: 'edge'
}
