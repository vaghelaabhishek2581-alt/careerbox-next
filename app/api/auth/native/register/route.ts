/**
 * @swagger
 * /api/auth/native/register:
 *   post:
 *     summary: Native app registration
 *     description: Register a new user and return JWT token for native applications
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User's password (min 6 characters)
 *               provider:
 *                 type: string
 *                 enum: [credentials, google]
 *                 description: Authentication provider
 *                 default: credentials
 *     responses:
 *       201:
 *         description: Registration successful
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
 *                     needsOnboarding:
 *                       type: boolean
 *       400:
 *         description: Bad request or user already exists
 *       500:
 *         description: Internal server error
 */

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/db'
import { generateJWT } from '@/lib/auth'
import { toPublicUser } from '@/lib/types/user'

export async function POST (request: NextRequest) {
  try {
    const {
      name,
      email,
      password,
      provider = 'credentials'
    } = await request.json()

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: 'Name and email are required' },
        { status: 400 }
      )
    }

    // For credentials signup, password is required
    if (provider === 'credentials' && (!password || password.length < 6)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Password must be at least 6 characters long'
        },
        { status: 400 }
      )
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({
      email: email.toLowerCase()
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists with this email' },
        { status: 400 }
      )
    }

    // Prepare user data
    const userData: any = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: 'user',
      roles: [], // Empty initially, will be set during onboarding
      provider,
      needsOnboarding: true, // All new users need onboarding
      needsRoleSelection: true, // New users need to select their roles
      activeRole: null, // Will be set during onboarding
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Add password for credentials users
    if (provider === 'credentials' && password) {
      userData.password = await bcrypt.hash(password, 12)
    }

    // Create user
    const result = await db.collection('users').insertOne(userData)
    userData._id = result.insertedId

    // Generate JWT token
    const token = generateJWT(userData)

    // Return public user data with token
    const publicUser = toPublicUser(userData)

    return NextResponse.json(
      {
        success: true,
        token,
        user: publicUser,
        message: 'Account created successfully'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Native registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
