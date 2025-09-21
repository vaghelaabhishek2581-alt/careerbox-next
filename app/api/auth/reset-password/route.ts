import { NextRequest, NextResponse } from 'next/server'
import { verifyPasswordResetToken, resetPasswordWithToken } from '@/lib/email/password-reset'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Reset token is required' },
        { status: 400 }
      )
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Verify token first
    const verifyResult = await verifyPasswordResetToken(token)

    if (!verifyResult.success) {
      return NextResponse.json(
        { success: false, message: verifyResult.error },
        { status: 400 }
      )
    }

    // Reset password
    const resetResult = await resetPasswordWithToken(token, password)

    if (!resetResult.success) {
      return NextResponse.json(
        { success: false, message: resetResult.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to verify token validity
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Reset token is required' },
        { status: 400 }
      )
    }

    const verifyResult = await verifyPasswordResetToken(token)

    if (!verifyResult.success) {
      return NextResponse.json(
        { success: false, message: verifyResult.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Token is valid',
      email: verifyResult.email
    })
  } catch (error) {
    console.error('Verify reset token error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
