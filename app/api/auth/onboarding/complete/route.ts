import { NextRequest, NextResponse } from 'next/server'
import { completeUserOnboarding, OnboardingRole } from '@/lib/utils/user-creation'

export async function POST(request: NextRequest) {
  try {
    const { userId, role } = await request.json()

    // Validate input
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'UserId is required' },
        { status: 400 }
      )
    }

    // Complete onboarding
    const result = await completeUserOnboarding(userId, role)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully'
    })
  } catch (error) {
    console.error('Onboarding completion error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
