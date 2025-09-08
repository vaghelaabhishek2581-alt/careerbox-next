import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from '@/lib/db'
import jwt from 'jsonwebtoken'

export async function POST (request: NextRequest) {
  try {
    // Get the session token using NextAuth's getToken
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    if (token) {
      const { db } = await connectToDatabase()

      // Add token to blacklist using the token's jti (JWT ID) or sub (user ID) + iat (issued at)
      const tokenIdentifier = token.jti || `${token.sub}-${token.iat}`

      await db.collection('blacklisted_tokens').insertOne({
        tokenId: tokenIdentifier,
        userId: token.sub,
        email: token.email,
        blacklistedAt: new Date(),
        expiresAt: new Date(Number(token.exp || 0) * 1000) // Convert exp to Date
      })

      console.log(`Token blacklisted for user: ${token.email}`)
    }

    // Alternative: Handle manual JWT token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const jwtToken = authHeader.substring(7)

      try {
        // Decode the JWT token (don't verify since we're blacklisting it)
        const decodedToken = jwt.decode(jwtToken, { complete: true })

        if (
          decodedToken &&
          typeof decodedToken === 'object' &&
          decodedToken.payload
        ) {
          const payload = decodedToken.payload as any
          const { db } = await connectToDatabase()

          const tokenIdentifier = payload.jti || `${payload.sub}-${payload.iat}`

          await db.collection('blacklisted_tokens').insertOne({
            tokenId: tokenIdentifier,
            userId: payload.sub,
            email: payload.email,
            blacklistedAt: new Date(),
            expiresAt: new Date((payload.exp || 0) * 1000)
          })

          console.log(`Manual JWT token blacklisted for user: ${payload.email}`)
        }
      } catch (jwtError) {
        console.error('Error decoding manual JWT token:', jwtError)
        // Continue with the response, don't fail the logout
      }
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Signed out successfully'
    })

    // Clear NextAuth session cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0 // Expire immediately
    }

    // Clear all possible NextAuth cookie variations
    response.cookies.set('next-auth.session-token', '', cookieOptions)
    response.cookies.set('__Secure-next-auth.session-token', '', {
      ...cookieOptions,
      secure: true
    })
    response.cookies.set('__Host-next-auth.session-token', '', {
      ...cookieOptions,
      secure: true
    })

    // Clear CSRF token cookie
    response.cookies.set('next-auth.csrf-token', '', cookieOptions)
    response.cookies.set('__Secure-next-auth.csrf-token', '', {
      ...cookieOptions,
      secure: true
    })
    response.cookies.set('__Host-next-auth.csrf-token', '', {
      ...cookieOptions,
      secure: true
    })

    return response
  } catch (error) {
    console.error('Sign out error:', error)
    return NextResponse.json(
      { success: false, message: 'Sign out failed' },
      { status: 500 }
    )
  }
}

// Utility function to check if a token is blacklisted (use in middleware or auth checks)
export async function isTokenBlacklisted (tokenId: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()
    const blacklistedToken = await db.collection('blacklisted_tokens').findOne({
      tokenId,
      expiresAt: { $gt: new Date() } // Only check non-expired blacklisted tokens
    })

    return !!blacklistedToken
  } catch (error) {
    console.error('Error checking token blacklist:', error)
    return false
  }
}
