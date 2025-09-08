// lib/auth.ts
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'

export interface JWTPayload {
  sub: string // user id
  email: string
  name: string
  roles?: string[]
  activeRole?: string
  iat: number
  exp: number
  jti?: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  roles: string[]
  activeRole: string | null
  needsOnboarding?: boolean
  needsRoleSelection?: boolean
}

/**
 * Extract JWT token from request headers
 */
export function getTokenFromRequest (request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return null
}

/**
 * Verify and decode JWT token
 */
export function verifyJWT (token: string): JWTPayload | null {
  try {
    const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET or NEXTAUTH_SECRET not configured')
    }

    const decoded = jwt.verify(token, secret) as JWTPayload
    return decoded
  } catch (error) {
    console.error('JWT verification error:', error)
    return null
  }
}

/**
 * Check if token is blacklisted
 */
export async function isTokenBlacklisted (tokenId: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()
    const blacklistedToken = await db.collection('blacklisted_tokens').findOne({
      $or: [{ tokenId }, { token: tokenId }],
      expiresAt: { $gt: new Date() }
    })

    return !!blacklistedToken
  } catch (error) {
    console.error('Error checking token blacklist:', error)
    return false
  }
}

/**
 * Get user from database by ID
 */
export async function getUserById (userId: string): Promise<any | null> {
  try {
    const { db } = await connectToDatabase()
    const user = await db.collection('users').findOne({
      _id: new ObjectId(userId)
    })
    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

/**
 * Authenticate request and return user data
 * Works for both NextAuth sessions (web) and JWT tokens (native)
 */
export async function authenticateRequest (
  request: NextRequest
): Promise<AuthUser | null> {
  try {
    // Try NextAuth session first (for web app)
    const { getServerSession } = await import('next-auth')
    const { authOptions } = await import('../app/api/auth/[...nextauth]/route')

    try {
      const session = await getServerSession(authOptions)
      if (session?.user) {
        return {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.name!,
          roles: session.user.roles || [],
          activeRole: session.user.activeRole || null,
          needsOnboarding: session.user.needsOnboarding,
          needsRoleSelection: session.user.needsRoleSelection
        }
      }
    } catch (sessionError) {
      // NextAuth session failed, continue to JWT check
      console.log('NextAuth session not available, checking JWT token')
    }

    // Try JWT token (for native app or API access)
    const token = getTokenFromRequest(request)
    if (!token) {
      return null
    }

    const payload = verifyJWT(token)
    if (!payload) {
      return null
    }

    // Check if token is blacklisted
    const tokenId = payload.jti || `${payload.sub}-${payload.iat}`
    const isBlacklisted = await isTokenBlacklisted(tokenId)
    if (isBlacklisted) {
      console.log('Token is blacklisted')
      return null
    }

    // Get fresh user data from database
    const user = await getUserById(payload.sub)
    if (!user) {
      return null
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      roles: user.roles || [user.role],
      activeRole: user.activeRole || user.role || null,
      needsOnboarding: user.needsOnboarding || false,
      needsRoleSelection: user.needsRoleSelection || false
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

/**
 * Generate JWT token for user (for native app login)
 */
export function generateJWT (user: any): string {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET or NEXTAUTH_SECRET not configured')
  }

  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    sub: user._id.toString(),
    email: user.email,
    name: user.name,
    roles: user.roles || [user.role],
    activeRole: user.activeRole || user.role,
    jti: `${user._id}-${Date.now()}`
  }

  return jwt.sign(payload, secret, {
    expiresIn: '7d', // Token expires in 7 days
    issuer: 'your-app-name'
  })
}
