import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { verifyJWT, getUserById } from '@/lib/auth'

export interface AuthResult {
  userId: string
  user?: any
  authType: 'nextauth' | 'jwt'
}

/**
 * Unified authentication function that checks NextAuth session first, then falls back to JWT token
 * @param request - The NextRequest object
 * @returns AuthResult object with userId and auth type, or null if not authenticated
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthResult | null> {
  try {
    // 1. Try NextAuth session first
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      console.log('✅ [UnifiedAuth] NextAuth session found for user:', session.user.id)
      return {
        userId: session.user.id,
        user: session.user,
        authType: 'nextauth'
      }
    }

    // 2. Try JWT token from Authorization header
    // Support Authorization: Bearer <token> header and 'auth-token' cookie
    const headerToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    const cookieToken = request.cookies.get('auth-token')?.value
    const token = headerToken || cookieToken

    if (!token) {
      console.log('❌ [UnifiedAuth] No authentication found (no session or token)')
      return null
    }

    // 4. Verify JWT token
    const payload = verifyJWT(token)
    if (!payload) {
      console.log('❌ [UnifiedAuth] Invalid JWT token')
      return null
    }

    // 5. Get user data from database for JWT auth
    const user = await getUserById(payload.sub)
    if (!user) {
      console.log('❌ [UnifiedAuth] User not found for JWT token')
      return null
    }

    console.log('✅ [UnifiedAuth] JWT authentication successful for user:', payload.sub)
    return {
      userId: payload.sub,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        roles: user.roles || [user.role],
        activeRole: user.activeRole || user.role,
        needsOnboarding: user.needsOnboarding || false,
        needsRoleSelection: user.needsRoleSelection || false,
        provider: user.provider || 'credentials',
        emailVerified: user.emailVerified || false
      },
      authType: 'jwt'
    }

  } catch (error) {
    console.error('❌ [UnifiedAuth] Authentication error:', error)
    return null
  }
}

/**
 * Simplified version that only returns userId for basic auth checks
 */
export async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const auth = await getAuthenticatedUser(request)
  return auth?.userId || null
}

/**
 * Check if user has specific role
 */
export async function hasRole(request: NextRequest, requiredRole: string): Promise<boolean> {
  const auth = await getAuthenticatedUser(request)
  if (!auth?.user) return false
  
  const userRoles = auth.user.roles || [auth.user.activeRole || 'user']
  return userRoles.includes(requiredRole) || userRoles.includes('admin')
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(request: NextRequest, requiredRoles: string[]): Promise<boolean> {
  const auth = await getAuthenticatedUser(request)
  if (!auth?.user) return false
  
  const userRoles = auth.user.roles || [auth.user.activeRole || 'user']
  return requiredRoles.some(role => userRoles.includes(role)) || userRoles.includes('admin')
}

/**
 * Middleware-style auth check that returns standardized error responses
 */
export async function requireAuth(request: NextRequest): Promise<
  | { error: true; response: Response }
  | { error: false; auth: AuthResult }
> {
  const auth = await getAuthenticatedUser(request)
  
  if (!auth) {
    return {
      error: true as const,
      response: Response.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }
  }
  
  return { error: false as const, auth }
}

/**
 * Require specific role with standardized error response
 */
export async function requireRole(request: NextRequest, requiredRole: string): Promise<
  | { error: true; response: Response }
  | { error: false; auth: AuthResult }
> {
  const authCheck = await requireAuth(request)
  if (authCheck.error) return authCheck
  
  const hasRequiredRole = await hasRole(request, requiredRole)
  if (!hasRequiredRole) {
    return {
      error: true as const,
      response: Response.json(
        { error: 'Forbidden', message: `${requiredRole} role required` },
        { status: 403 }
      )
    }
  }
  
  return { error: false as const, auth: authCheck.auth }
}
