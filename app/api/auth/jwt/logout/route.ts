import { NextRequest, NextResponse } from 'next/server'
import { withJWTAuth } from '@/lib/middleware/jwt-auth'
import { revokeRefreshToken } from '@/lib/auth/jwt'
import { createSuccessResponse, createErrorResponse, validateRequiredFields } from '@/lib/middleware/jwt-auth'

async function logoutHandler(request: NextRequest, user: any) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const validation = validateRequiredFields(body, ['tokenId'])
    if (!validation.valid) {
      return createErrorResponse(
        'Token ID is required',
        400,
        'MISSING_TOKEN_ID'
      )
    }
    
    const { tokenId } = body
    
    // Revoke refresh token
    const success = await revokeRefreshToken(tokenId)
    
    if (!success) {
      return createErrorResponse(
        'Failed to revoke token',
        500,
        'TOKEN_REVOKE_FAILED'
      )
    }
    
    return createSuccessResponse(null, 'Logged out successfully')
    
  } catch (error) {
    console.error('JWT logout error:', error)
    return createErrorResponse(
      'Internal server error',
      500,
      'INTERNAL_ERROR'
    )
  }
}

export const POST = withJWTAuth(logoutHandler)
