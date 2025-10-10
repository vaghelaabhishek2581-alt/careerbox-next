import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongodb'

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request)
    
    if (!authResult) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    const { userId, user } = authResult

    await connectToDatabase()

    return NextResponse.json({
      success: true,
      authResult: {
        userId,
        authType: authResult.authType
      },
      user: {
        _id: user?._id,
        name: user?.name,
        email: user?.email,
        roles: user?.roles,
        activeRole: user?.activeRole,
        needsOnboarding: user?.needsOnboarding,
        needsRoleSelection: user?.needsRoleSelection,
        provider: user?.provider,
        createdAt: user?.createdAt,
        updatedAt: user?.updatedAt
      }
    })
  } catch (error) {
    console.error('Debug user error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: (error as Error).message },
      { status: 500 }
    )
  }
}
