import { NextRequest, NextResponse } from 'next/server'
import { createUserWithProfile, OnboardingRole } from '@/lib/utils/user-creation'
import { generateTokenPair } from '@/lib/auth/jwt'
import { createSuccessResponse, createErrorResponse, validateRequiredFields } from '@/lib/middleware/jwt-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const validation = validateRequiredFields(body, ['name', 'email', 'password'])
    if (!validation.valid) {
      return createErrorResponse(
        `Missing required fields: ${validation.missingFields?.join(', ')}`,
        400,
        'MISSING_FIELDS'
      )
    }
    
    const { name, email, password, role } = body
    
    // Validate password strength
    if (password.length < 6) {
      return createErrorResponse(
        'Password must be at least 6 characters long',
        400,
        'WEAK_PASSWORD'
      )
    }
    
    // Create user with auto-hydrated profile
    const result = await createUserWithProfile({
      name,
      email,
      password,
      provider: 'credentials',
      role: role as OnboardingRole
    })
    
    if (!result.success) {
      return createErrorResponse(
        result.error || 'Failed to create user',
        400,
        'USER_CREATION_FAILED'
      )
    }
    
    // Generate tokens
    const { accessToken, refreshToken, tokenId } = await generateTokenPair(result.user)
    
    return createSuccessResponse({
      user: {
        ...result.user,
        _id: result.user._id.toString()
      },
      tokens: {
        accessToken,
        refreshToken,
        tokenId
      }
    }, 'Account created successfully')
    
  } catch (error) {
    console.error('JWT register error:', error)
    return createErrorResponse(
      'Internal server error',
      500,
      'INTERNAL_ERROR'
    )
  }
}
