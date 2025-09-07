import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from '@/lib/db'

export async function POST (request: NextRequest) {
  try {
    // Get the session token
    const token = await getToken({ req: request })

    if (token) {
      const { db } = await connectToDatabase()

      // Add token to blacklist
      await db.collection('blacklisted_tokens').insertOne({
        token: token.jti, // JWT ID
        userId: token.sub,
        blacklistedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      })

      // Clear any user-specific data from Redis/cache if you have any
      // await clearUserCache(token.sub);
    }

    // Return success response with clear-session header
    const response = NextResponse.json({
      success: true,
      message: 'Signed out successfully'
    })

    // Clear the auth cookie
    response.cookies.delete('next-auth.session-token')
    response.cookies.delete('__Secure-next-auth.session-token')
    response.cookies.delete('__Host-next-auth.session-token')

    return response
  } catch (error) {
    console.error('Sign out error:', error)
    return NextResponse.json(
      { success: false, message: 'Sign out failed' },
      { status: 500 }
    )
  }
}
