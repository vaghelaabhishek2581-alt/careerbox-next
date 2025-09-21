import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { createPasswordReset, sendPasswordResetEmail } from '@/lib/email/password-reset'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

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
      // For security, don't reveal if email exists or not
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.'
      })
    }

    // Create password reset token
    const tokenResult = await createPasswordReset(email.toLowerCase())

    if (!tokenResult.success || !tokenResult.token) {
      return NextResponse.json(
        { success: false, message: tokenResult.error || 'Failed to create password reset token' },
        { status: 500 }
      )
    }

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(
      email.toLowerCase(),
      user.name || 'User',
      tokenResult.token
    )

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, message: emailResult.error || 'Failed to send password reset email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
