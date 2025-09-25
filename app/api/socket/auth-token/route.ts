import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/unified-auth'
import jwt from 'jsonwebtoken'

/**
 * GET /api/socket/auth-token
 * Generate a JWT token for socket authentication
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔐 Generating socket auth token')

    // Check if user is authenticated
    const authCheck = await requireAuth(request)
    if (authCheck.error) {
      return authCheck.response
    }

    const { userId, user } = authCheck.auth

    // Generate JWT token for socket authentication
    const jwtSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET
    if (!jwtSecret) {
      console.error('❌ JWT secret not configured')
      return NextResponse.json({
        success: false,
        message: 'Server configuration error'
      }, { status: 500 })
    }

    const token = jwt.sign(
      {
        userId: userId,
        email: user.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      },
      jwtSecret
    )

    console.log('✅ Socket auth token generated for user:', userId)

    return NextResponse.json({
      success: true,
      token,
      userId,
      email: user.email,
      expiresIn: '24h',
      socketUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/socket`,
      usage: {
        postman: 'Use this token in Socket.IO connection auth: { auth: { token: "..." } }',
        javascript: 'io("http://localhost:3000", { path: "/api/socket", auth: { token: "..." } })'
      }
    })

  } catch (error) {
    console.error('❌ Error generating socket auth token:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to generate auth token'
    }, { status: 500 })
  }
}
