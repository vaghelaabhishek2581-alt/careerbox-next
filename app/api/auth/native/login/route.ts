/**
 * @swagger
 * /api/auth/native/login:
 *   post:
 *     summary: Native app login
 *     description: Authenticate user and return JWT token for native applications
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *               provider:
 *                 type: string
 *                 enum: [credentials, google]
 *                 description: Authentication provider
 *                 default: credentials
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
 *                 token:
 *                   type: string
 *                   description: JWT access token
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *                     activeRole:
 *                       type: string
 *                     needsOnboarding:
 *                       type: boolean
 *                     needsRoleSelection:
 *                       type: boolean
 *       400:
 *         description: Bad request
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/db'
import { generateJWT } from '@/lib/auth'
import { toPublicUser, UserDocument } from '@/lib/types/user'

export async function POST (request: NextRequest) {
  try {
    const { email, password, provider = 'credentials' } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Find user by email
    const user = await db.collection('users').findOne({
      email: email.toLowerCase()
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 401 }
      )
    }

    // For Google OAuth, skip password check
    if (provider === 'google') {
      // Verify this is a Google user
      if (user.provider !== 'google') {
        return NextResponse.json(
          { success: false, message: 'Invalid login method' },
          { status: 401 }
        )
      }
    } else {
      // For credentials login, check password
      if (!password) {
        return NextResponse.json(
          { success: false, message: 'Password is required' },
          { status: 400 }
        )
      }

      if (!user.password) {
        return NextResponse.json(
          { success: false, message: 'Invalid login method' },
          { status: 401 }
        )
      }

      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, message: 'Invalid credentials' },
          { status: 401 }
        )
      }
    }

    // Generate JWT token
    const token = generateJWT(user)
    // Return user data and token
    const publicUser = toPublicUser(user as UserDocument)

    return NextResponse.json({
      success: true,
      token,
      user: publicUser,
      message: 'Login successful'
    })
  } catch (error) {
    console.error('Native login error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
