import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongoose'
import { User, Profile } from '@/src/models'
import { createEmailVerification, sendVerificationEmail } from '@/lib/email/verification'

export async function POST(request: NextRequest) {
  try {
    // Add validation for request body
    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { success: false, message: 'Content-Type must be application/json' },
        { status: 400 }
      )
    }

    // Get raw text first to check if body exists
    const rawBody = await request.text()
    if (!rawBody || rawBody.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Request body is required' },
        { status: 400 }
      )
    }

    // Parse JSON with error handling
    let body
    try {
      body = JSON.parse(rawBody)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json(
        { success: false, message: 'Invalid JSON format' },
        { status: 400 }
      )
    }

    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Find user by email
    const user = await User.findOne({
      email: email.toLowerCase()
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found with this email address' },
        { status: 404 }
      )
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, message: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Create new verification token
    const tokenResult = await createEmailVerification(email.toLowerCase())

    if (!tokenResult.success || !tokenResult.token) {
      return NextResponse.json(
        { success: false, message: tokenResult.error || 'Failed to create verification token' },
        { status: 500 }
      )
    }

    // Get user's name from profile
    let userName = 'User'
    if (user.profileId) {
      const profile = await Profile.findById(user.profileId)
      if (profile?.personalDetails?.firstName) {
        userName = profile.personalDetails.firstName
        if (profile.personalDetails.lastName) {
          userName += ` ${profile.personalDetails.lastName}`
        }
      }
    }

    // Send verification email
    const emailResult = await sendVerificationEmail(
      email.toLowerCase(),
      userName,
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