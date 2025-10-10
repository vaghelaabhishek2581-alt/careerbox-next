import jwt from 'jsonwebtoken'
import { connectToDatabase } from '@/lib/db/mongodb'
import { ObjectId } from 'mongodb'

// JWT Configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
export const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d'

// Token Types
export interface JWTPayload {
  userId: string
  email: string
  role: string
  activeRole?: string
  provider?: string
  iat?: number
  exp?: number
}

export interface RefreshTokenPayload {
  userId: string
  email: string
  tokenId: string
  iat?: number
  exp?: number
}

// Generate JWT Access Token
export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  // @ts-expect-error - jwt.sign types are complex but this usage is correct
  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: JWT_EXPIRES_IN as string,
    issuer: 'careerbox-api',
    audience: 'careerbox-app'
  })
}

// Generate JWT Refresh Token
export async function generateRefreshToken(userId: string, email: string): Promise<{
  refreshToken: string
  tokenId: string
}> {
  const { db } = await connectToDatabase()
  
  // Create refresh token record
  const tokenId = new ObjectId().toString()
  // @ts-expect-error - jwt.sign types are complex but this usage is correct
  const refreshToken = jwt.sign(
    { userId, email, tokenId },
    JWT_SECRET as string,
    {
      expiresIn: JWT_REFRESH_EXPIRES_IN as string,
      issuer: 'careerbox-api',
      audience: 'careerbox-app'
    }
  )
  
  // Store refresh token in database
  await db.collection('refresh_tokens').insertOne({
    tokenId,
    userId,
    email,
    refreshToken,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    createdAt: new Date(),
    isActive: true
  })
  
  return { refreshToken, tokenId }
}

// Verify JWT Access Token
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'careerbox-api',
      audience: 'careerbox-app'
    }) as JWTPayload
    
    return decoded
  } catch (error) {
    console.error('JWT verification error:', error)
    return null
  }
}

// Verify JWT Refresh Token
export async function verifyRefreshToken(token: string): Promise<{
  valid: boolean
  payload?: RefreshTokenPayload
  error?: string
}> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'careerbox-api',
      audience: 'careerbox-app'
    }) as RefreshTokenPayload
    
    const { db } = await connectToDatabase()
    
    // Check if refresh token exists and is active
    const tokenRecord = await db.collection('refresh_tokens').findOne({
      tokenId: decoded.tokenId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    })
    
    if (!tokenRecord) {
      return { valid: false, error: 'Refresh token not found or expired' }
    }
    
    return { valid: true, payload: decoded }
  } catch (error) {
    console.error('Refresh token verification error:', error)
    return { valid: false, error: 'Invalid refresh token' }
  }
}

// Revoke Refresh Token
export async function revokeRefreshToken(tokenId: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()
    
    await db.collection('refresh_tokens').updateOne(
      { tokenId },
      { $set: { isActive: false, revokedAt: new Date() } }
    )
    
    return true
  } catch (error) {
    console.error('Error revoking refresh token:', error)
    return false
  }
}

// Revoke All User Tokens
export async function revokeAllUserTokens(userId: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()
    
    await db.collection('refresh_tokens').updateMany(
      { userId, isActive: true },
      { $set: { isActive: false, revokedAt: new Date() } }
    )
    
    return true
  } catch (error) {
    console.error('Error revoking all user tokens:', error)
    return false
  }
}

// Get User from Token
export async function getUserFromToken(token: string): Promise<{
  user: any | null
  error?: string
}> {
  try {
    const payload = verifyAccessToken(token)
    
    if (!payload) {
      return { user: null, error: 'Invalid token' }
    }
    
    const { db } = await connectToDatabase()
    
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(payload.userId) },
      { projection: { password: 0 } }
    )
    
    if (!user) {
      return { user: null, error: 'User not found' }
    }
    
    return { user }
  } catch (error) {
    console.error('Error getting user from token:', error)
    return { user: null, error: 'Token verification failed' }
  }
}

// Clean up expired tokens
export async function cleanupExpiredTokens(): Promise<{
  success: boolean
  deletedCount?: number
  error?: string
}> {
  try {
    const { db } = await connectToDatabase()
    
    const result = await db.collection('refresh_tokens').deleteMany({
      $or: [
        { expiresAt: { $lt: new Date() } },
        { isActive: false }
      ]
    })
    
    return {
      success: true,
      deletedCount: result.deletedCount
    }
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error)
    return {
      success: false,
      error: 'Failed to clean up expired tokens'
    }
  }
}

// Generate Token Pair (Access + Refresh)
export async function generateTokenPair(user: any): Promise<{
  accessToken: string
  refreshToken: string
  tokenId: string
}> {
  const accessToken = generateAccessToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role || 'user',
    activeRole: user.activeRole,
    provider: user.provider
  })
  
  const { refreshToken, tokenId } = await generateRefreshToken(
    user._id.toString(),
    user.email
  )
  
  return { accessToken, refreshToken, tokenId }
}
