import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, getUserFromToken, JWTPayload } from '@/lib/auth/jwt'

// JWT Authentication Middleware
export async function authenticateJWT(request: NextRequest): Promise<{
  user: any | null
  error?: string
  status?: number
}> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        user: null,
        error: 'Authorization header missing or invalid',
        status: 401
      }
    }
    
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    if (!token) {
      return {
        user: null,
        error: 'Token not provided',
        status: 401
      }
    }
    
    // Verify token and get user
    const { user, error } = await getUserFromToken(token)
    
    if (!user || error) {
      return {
        user: null,
        error: error || 'Invalid token',
        status: 401
      }
    }
    
    return { user }
  } catch (error) {
    console.error('JWT authentication error:', error)
    return {
      user: null,
      error: 'Authentication failed',
      status: 500
    }
  }
}

// Role-based authorization
export function requireRole(user: any, allowedRoles: string[]): boolean {
  if (!user || !user.role) {
    return false
  }
  
  return allowedRoles.includes(user.role) || allowedRoles.includes(user.activeRole)
}

// Admin authorization
export function requireAdmin(user: any): boolean {
  return requireRole(user, ['admin'])
}

// Business/Institute authorization
export function requireBusinessOrInstitute(user: any): boolean {
  return requireRole(user, ['business', 'institute', 'admin'])
}

// User authorization (any authenticated user)
export function requireUser(user: any): boolean {
  return !!user
}

// JWT Auth wrapper for API routes
export function withJWTAuth(
  handler: (request: NextRequest, user: any) => Promise<NextResponse>,
  options: {
    roles?: string[]
    requireAdmin?: boolean
    requireBusinessOrInstitute?: boolean
  } = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Authenticate user
      const { user, error, status } = await authenticateJWT(request)
      
      if (!user || error) {
        return NextResponse.json(
          { 
            success: false, 
            message: error || 'Authentication required',
            code: 'AUTH_REQUIRED'
          },
          { status: status || 401 }
        )
      }
      
      // Check role requirements
      if (options.requireAdmin && !requireAdmin(user)) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Admin access required',
            code: 'ADMIN_REQUIRED'
          },
          { status: 403 }
        )
      }
      
      if (options.requireBusinessOrInstitute && !requireBusinessOrInstitute(user)) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Business or Institute access required',
            code: 'BUSINESS_INSTITUTE_REQUIRED'
          },
          { status: 403 }
        )
      }
      
      if (options.roles && !requireRole(user, options.roles)) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Insufficient permissions',
            code: 'INSUFFICIENT_PERMISSIONS'
          },
          { status: 403 }
        )
      }
      
      // Call the handler with authenticated user
      return await handler(request, user)
    } catch (error) {
      console.error('JWT auth wrapper error:', error)
      return NextResponse.json(
        { 
          success: false, 
          message: 'Internal server error',
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      )
    }
  }
}

// JWT Auth wrapper for dynamic routes (with params)
export function withJWTAuthDynamic<T extends Record<string, string>>(
  handler: (request: NextRequest, user: any, context: { params: T }) => Promise<NextResponse>,
  options: {
    roles?: string[]
    requireAdmin?: boolean
    requireBusinessOrInstitute?: boolean
  } = {}
) {
  return async (request: NextRequest, context: { params: T }): Promise<NextResponse> => {
    try {
      // Authenticate user
      const { user, error, status } = await authenticateJWT(request)
      
      if (!user || error) {
        return NextResponse.json(
          { 
            success: false, 
            message: error || 'Authentication required',
            code: 'AUTH_REQUIRED'
          },
          { status: status || 401 }
        )
      }
      
      // Check role requirements
      if (options.requireAdmin && !requireAdmin(user)) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Admin access required',
            code: 'ADMIN_REQUIRED'
          },
          { status: 403 }
        )
      }
      
      if (options.requireBusinessOrInstitute && !requireBusinessOrInstitute(user)) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Business or Institute access required',
            code: 'BUSINESS_INSTITUTE_REQUIRED'
          },
          { status: 403 }
        )
      }
      
      if (options.roles && !requireRole(user, options.roles)) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Insufficient permissions',
            code: 'INSUFFICIENT_PERMISSIONS'
          },
          { status: 403 }
        )
      }
      
      // Call the handler with authenticated user and params
      return await handler(request, user, context)
    } catch (error) {
      console.error('JWT auth wrapper error:', error)
      return NextResponse.json(
        { 
          success: false, 
          message: 'Internal server error',
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      )
    }
  }
}

// Optional JWT Auth (for routes that work with or without auth)
export function withOptionalJWTAuth(
  handler: (request: NextRequest, user: any | null) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const { user } = await authenticateJWT(request)
      return await handler(request, user)
    } catch (error) {
      console.error('Optional JWT auth error:', error)
      return await handler(request, null)
    }
  }
}

// Rate limiting helper
export function createRateLimit(maxRequests: number, windowMs: number) {
  const requests = new Map<string, { count: number; resetTime: number }>()
  
  return (identifier: string): boolean => {
    const now = Date.now()
    const windowStart = now - windowMs
    
    // Clean up old entries
    for (const [key, value] of requests.entries()) {
      if (value.resetTime < windowStart) {
        requests.delete(key)
      }
    }
    
    const current = requests.get(identifier)
    
    if (!current) {
      requests.set(identifier, { count: 1, resetTime: now })
      return true
    }
    
    if (current.resetTime < windowStart) {
      requests.set(identifier, { count: 1, resetTime: now })
      return true
    }
    
    if (current.count >= maxRequests) {
      return false
    }
    
    current.count++
    return true
  }
}

// API Response helpers
export function createSuccessResponse(data: any, message?: string): NextResponse {
  return NextResponse.json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  })
}

export function createErrorResponse(
  message: string, 
  status: number = 400, 
  code?: string,
  details?: any
): NextResponse {
  return NextResponse.json({
    success: false,
    message,
    code,
    details,
    timestamp: new Date().toISOString()
  }, { status })
}

// Validation helpers
export function validateRequiredFields(data: any, requiredFields: string[]): {
  valid: boolean
  missingFields?: string[]
} {
  const missingFields = requiredFields.filter(field => 
    data[field] === undefined || data[field] === null || data[field] === ''
  )
  
  return {
    valid: missingFields.length === 0,
    missingFields: missingFields.length > 0 ? missingFields : undefined
  }
}

// Pagination helper
export function getPaginationParams(request: NextRequest): {
  page: number
  limit: number
  skip: number
} {
  const url = new URL(request.url)
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '10')))
  const skip = (page - 1) * limit
  
  return { page, limit, skip }
}
