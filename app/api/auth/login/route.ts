import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToDatabase, getUserByEmail } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email/password and return JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['email', 'password']
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               userType:
 *                 type: string
 *                 enum: [student, professional]
 *                 description: Required for normal users
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                 token:
 *                   type: string
 *                 redirectUrl:
 *                   type: string
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, userType } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // For normal users, update userType if provided
    if (user.role === 'user' && userType && ['student', 'professional'].includes(userType)) {
      const { db } = await connectToDatabase();
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { userType, lastLogin: new Date() } }
      );
      user.userType = userType;
    }

    // Generate JWT token
    const token = jwt.sign(
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

    // Determine redirect URL based on role
    const redirectUrls = {
      admin: '/dashboard/admin',
      organization: '/dashboard/organization',
      business: '/dashboard/business',
      user: '/dashboard/user'
    };

    const redirectUrl = redirectUrls[user.role as keyof typeof redirectUrls] || '/dashboard/user';

    // Update last login
    const { db } = await connectToDatabase();
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userType: user.userType,
        avatar: user.avatar,
        organizationId: user.organizationId,
        permissions: user.permissions || []
      },
      token,
      redirectUrl
    });

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}