/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user login
 *     description: Handles user authentication via credentials or Google OAuth
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
 *                 required: true
 *               password:
 *                 type: string
 *                 description: User's password (required for credentials login)
 *               provider:
 *                 type: string
 *                 enum: [google, credentials]
 *                 description: Authentication provider
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
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
 *                     needsRoleSelection:
 *                       type: boolean
 *                     needsOnboarding:
 *                       type: boolean
 *                     provider:
 *                       type: string
 *       400:
 *         description: Bad request (missing email or password)
 *       401:
 *         description: Unauthorized (invalid credentials)
 *       500:
 *         description: Internal server error
 */

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/db'

export async function POST (request: NextRequest) {
  try {
    const { email, password, provider } = await request.json()

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
      return NextResponse.json({
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          roles: user.roles || [],
          activeRole: user.activeRole || null,
          needsRoleSelection: user.needsRoleSelection || false,
          needsOnboarding: user.needsOnboarding || false,
          provider: user.provider
        }
      })
    }

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

    // Return user data for NextAuth (don't create separate tokens)
    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        roles: user.roles || [],
        activeRole: user.activeRole || null,
        needsRoleSelection: user.needsRoleSelection || false,
        needsOnboarding: user.needsOnboarding || false,
        provider: user.provider || 'credentials'
      }
    })
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
