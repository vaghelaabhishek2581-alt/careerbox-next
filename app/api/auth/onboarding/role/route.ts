import { NextRequest, NextResponse } from 'next/server'
import { updateUserRole, OnboardingRole } from '@/lib/utils/user-creation'

export async function POST(request: NextRequest) {
  try {
    const { role, userId } = await request.json()

    // Validate input
    if (!role || !userId) {
      return NextResponse.json(
        { success: false, message: 'Role and userId are required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles: OnboardingRole[] = ['student', 'professional', 'institute_admin', 'business_owner']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role selected' },
        { status: 400 }
      )
    }

    // Update user role
    const result = await updateUserRole(userId, role)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Role updated successfully',
      role
    })
  } catch (error) {
    console.error('Role update error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
