import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*',
    '/onboarding/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/business/:path*',
    '/institute/:path*'
  ]
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
    const isOnboarding = req.nextUrl.pathname.startsWith('/onboarding')
    const isDashboard = req.nextUrl.pathname.startsWith('/dashboard')
    const isMainDashboard = req.nextUrl.pathname === '/dashboard'
    const isUserRoute = req.nextUrl.pathname.startsWith('/dashboard/user')
    const isAdminRoute = req.nextUrl.pathname.startsWith('/dashboard/admin')
    const isBusinessRoute = req.nextUrl.pathname.startsWith('/dashboard/business')
    const isInstituteRoute = req.nextUrl.pathname.startsWith('/dashboard/institute')

    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Middleware:', {
        pathname: req.nextUrl.pathname,
        isAuth,
        needsOnboarding: token?.needsOnboarding,
        needsRoleSelection: token?.needsRoleSelection,
        activeRole: token?.activeRole,
        role: token?.role,
        roles: token?.roles,
        email: token?.email,
        subscriptionActive: token?.subscriptionActive
      })
    }

    // Role-based access control for dashboard routes
    if (isAuth && isDashboard && !isMainDashboard) {
      const userRole = token?.activeRole || token?.role || 'user'
      const userRoles = token?.roles || [token?.role || 'user']

      // Admin routes - only users with admin role can access
      if (isAdminRoute && !userRoles.includes('admin')) {
        console.log('Access denied to admin route - redirecting to dashboard')
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }

      // Business routes - only users with business role and active subscription can access
      if (isBusinessRoute && (!userRoles.includes('business') || !token?.subscriptionActive)) {
        console.log('Access denied to business route - redirecting to dashboard')
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }

      // Institute routes - only users with institute role and active subscription can access
      if (isInstituteRoute && (!userRoles.includes('institute') || !token?.subscriptionActive)) {
        console.log('Access denied to institute route - redirecting to dashboard')
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }

      // User routes - accessible to all authenticated users
      if (isUserRoute) {
        // Allow access to user routes for all authenticated users
        return NextResponse.next()
      }
    }

    // Handle main dashboard access for authenticated users
    if (isMainDashboard && isAuth) {
      console.log('Main dashboard access - checking onboarding status:', {
        needsOnboarding: token?.needsOnboarding,
        needsRoleSelection: token?.needsRoleSelection,
        role: token?.role,
        activeRole: token?.activeRole
      })

      // Only redirect to onboarding if user actually needs onboarding
      if (token?.needsOnboarding || token?.needsRoleSelection) {
        console.log('Redirecting to onboarding')
        return NextResponse.redirect(new URL('/onboarding', req.url))
      }

      // If user has completed onboarding, allow access to main dashboard
      console.log('Allowing access to main dashboard')
      return NextResponse.next()
    }

    // Redirect authenticated users away from auth pages
    if (isAuthPage && isAuth) {
      // If user needs onboarding, redirect to onboarding
      if (token?.needsOnboarding || token?.needsRoleSelection) {
        return NextResponse.redirect(new URL('/onboarding', req.url))
      }
      // Otherwise redirect to main dashboard instead of role-specific dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Redirect unauthenticated users to login
    if ((isDashboard || isOnboarding) && !isAuth) {
      return NextResponse.redirect(new URL('/auth/signup?mode=signin', req.url))
    }

    // Handle onboarding flow for authenticated users
    if (isAuth) {
      const needsOnboarding =
        token?.needsOnboarding || token?.needsRoleSelection

      console.log('Middleware - onboarding check:', {
        pathname: req.nextUrl.pathname,
        needsOnboarding,
        isOnboarding,
        tokenNeedsOnboarding: token?.needsOnboarding,
        tokenNeedsRoleSelection: token?.needsRoleSelection
      })

      // If user needs onboarding but is not on onboarding page, redirect them
      if (needsOnboarding && !isOnboarding) {
        console.log('Middleware - redirecting to onboarding')
        return NextResponse.redirect(new URL('/onboarding', req.url))
      }

      // If user doesn't need onboarding but is on onboarding page, redirect to main dashboard
      if (!needsOnboarding && isOnboarding) {
        console.log('Middleware - redirecting to dashboard')
        return NextResponse.redirect(new URL('/dashboard', req.url))
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