import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/db';

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User logout
 *     description: Logout user and invalidate token
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (token) {
      // Optionally add token to blacklist in database
      const { db } = await connectToDatabase();
      await db.collection('blacklisted_tokens').insertOne({
        token,
        blacklistedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });
    }

    // Create response and clear auth cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear the auth-token cookie
    response.cookies.set({
      name: 'auth-token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    );
  }
}