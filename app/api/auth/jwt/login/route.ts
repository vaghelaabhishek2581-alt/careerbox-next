import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/db/mongodb'
import { generateTokenPair } from '@/lib/auth/jwt'
import { createSuccessResponse, createErrorResponse, validateRequiredFields } from '@/lib/middleware/jwt-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const validation = validateRequiredFields(body, ['email', 'password'])
    if (!validation.valid) {
      return createErrorResponse(
        `Missing required fields: ${validation.missingFields?.join(', ')}`,
        400,
        'MISSING_FIELDS'
      )
    }
    
    const { email, password } = body
    
    const { db } = await connectToDatabase()
    
    // Find user by email
    const user = await db.collection('users').findOne({
      email: email.toLowerCase()
    })
    
    if (!user) {
      return createErrorResponse(
        'Invalid email or password',
        401,
        'INVALID_CREDENTIALS'
      )
    }
    
    // Check if user has password (not OAuth user)
    if (!user.password) {
      return createErrorResponse(
        'Please sign in with Google or reset your password',
        401,
        'OAUTH_USER'
      )
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return createErrorResponse(
        'Invalid email or password',
        401,
        'INVALID_CREDENTIALS'
      )
    }
    
    // Check if user is active
    if (user.status !== 'active') {
      return createErrorResponse(
        'Account is not active. Please contact support.',
        403,
        'ACCOUNT_INACTIVE'
      )
    }
    
    // Generate tokens
    const { accessToken, refreshToken, tokenId } = await generateTokenPair(user)
    
    // Update last login
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { lastLoginAt: new Date() } }
    )
    
    // Return user data without password
    const { password: _, ...userWithoutPassword } = user
    
    return createSuccessResponse({
      user: {
        ...userWithoutPassword,
        _id: user._id.toString()
      },
      tokens: {
        accessToken,
        refreshToken,
        tokenId
      }
    }, 'Login successful')
    
  } catch (error) {
    console.error('JWT login error:', error)
    return createErrorResponse(
      'Internal server error',
      500,
      'INTERNAL_ERROR'
    )
  }
}
