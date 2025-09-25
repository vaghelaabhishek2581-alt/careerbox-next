/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with auto-hydrated profile
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
 *                 description: User's password (required for credentials signup)
 *               role:
 *                 type: string
 *                 enum: [student, professional, institute_admin, business_owner]
 *                 description: User's onboarding role
 *               provider:
 *                 type: string
 *                 enum: [google, credentials]
 *                 description: Authentication provider
 *               image:
 *                 type: string
 *                 description: User's profile image URL (for Google OAuth)
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Bad request or user already exists
 *       500:
 *         description: Internal server error
 */

import { NextRequest, NextResponse } from 'next/server'
import { createUserWithProfile, sendEmailVerification, OnboardingRole } from '@/lib/utils/user-creation'
import { generateJWT } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      email,
      password,
      role,
      provider = 'credentials',
      image
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

    // Create user with auto-hydrated profile
    const result = await createUserWithProfile({
      name,
      email,
      password,
      provider,
      image,
      role: role as OnboardingRole
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 }
      )
    }

    // Send email verification for credentials signup
    if (provider === 'credentials') {
      console.log('Sending email verification...')
      await sendEmailVerification(email, name)
    }

    // Generate JWT token
    const token = generateJWT(result.user)

    // Return user data without sensitive information
    const { password: _, ...userWithoutPassword } = result.user

    return NextResponse.json({
      success: true,
      message: provider === 'credentials'
        ? 'Account created successfully! Please check your email for verification.'
        : 'Account created successfully!',
      user: userWithoutPassword,
      token,
      needsOnboarding: result.user.needsOnboarding,
      needsRoleSelection: result.user.needsRoleSelection
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}