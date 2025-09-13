import { NextRequest, NextResponse } from 'next/server'
import { verifyRefreshToken, generateTokenPair, revokeRefreshToken } from '@/lib/auth/jwt'
import { connectToDatabase } from '@/lib/db/mongodb'
import { createSuccessResponse, createErrorResponse, validateRequiredFields } from '@/lib/middleware/jwt-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const validation = validateRequiredFields(body, ['refreshToken'])
    if (!validation.valid) {
      return createErrorResponse(
        'Refresh token is required',
        400,
        'MISSING_REFRESH_TOKEN'
      )
    }
    
    const { refreshToken } = body
    
    // Verify refresh token
    const { valid, payload, error } = await verifyRefreshToken(refreshToken)
    
    if (!valid || !payload) {
      return createErrorResponse(
        error || 'Invalid refresh token',
        401,
        'INVALID_REFRESH_TOKEN'
      )
    }
    
    const { db } = await connectToDatabase()
    
    // Get user
    const user = await db.collection('users').findOne({
      _id: payload.userId
    })
    
    if (!user) {
      return createErrorResponse(
        'User not found',
        404,
        'USER_NOT_FOUND'
      )
    }
    
    // Check if user is active
    if (user.status !== 'active') {
      return createErrorResponse(
        'Account is not active',
        403,
        'ACCOUNT_INACTIVE'
      )
    }
    
    // Revoke old refresh token
    await revokeRefreshToken(payload.tokenId)
    
    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken, tokenId } = await generateTokenPair(user)
    
    return createSuccessResponse({
      tokens: {
        accessToken,
        refreshToken: newRefreshToken,
        tokenId
      }
    }, 'Tokens refreshed successfully')
    
  } catch (error) {
    console.error('JWT refresh error:', error)
    return createErrorResponse(
      'Internal server error',
      500,
      'INTERNAL_ERROR'
    )
  }
}
