import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createEmailVerification, sendVerificationEmail } from '@/lib/email/verification'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Check if email is already verified
    if (session.user.emailVerified) {
      return NextResponse.json(
        { success: false, message: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Create new verification token
    const tokenResult = await createEmailVerification(session.user.email)

    if (!tokenResult.success || !tokenResult.token) {
      return NextResponse.json(
        { success: false, message: tokenResult.error || 'Failed to create verification token' },
        { status: 500 }
      )
    }

    // Send verification email
    const emailResult = await sendVerificationEmail(
      session.user.email,
      session.user.name || 'User',
      tokenResult.token
    )

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, message: emailResult.error || 'Failed to send verification email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully'
    })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
