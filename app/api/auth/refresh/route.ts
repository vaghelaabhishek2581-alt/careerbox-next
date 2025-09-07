import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh JWT token
 *     description: Generate new JWT token using existing valid token
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    // Check if token is blacklisted
    const { db } = await connectToDatabase();
    const blacklistedToken = await db.collection('blacklisted_tokens').findOne({ token });
    if (blacklistedToken) {
      return NextResponse.json(
        { success: false, message: 'Token is invalidated' },
        { status: 401 }
      );
    }

    // Verify and decode token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Get updated user data
    const user = await db.collection('users').findOne({ _id: decoded.userId });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Generate new token
    const newToken = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role,
        userType: user.userType,
        organizationId: user.organizationId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      token: newToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userType: user.userType,
        avatar: user.avatar,
        organizationId: user.organizationId,
        permissions: user.permissions || []
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { success: false, message: 'Token refresh failed' },
      { status: 401 }
    );
  }
}