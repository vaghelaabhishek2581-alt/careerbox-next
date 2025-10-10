import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongoose'
import { User } from '@/src/models'

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request)
    
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = authResult
    await connectToDatabase()
    
    // Fetch fresh user data from database
    const user = await User.findById(userId)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return updated user data
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        activeRole: user.activeRole,
        roles: user.roles,
        needsOnboarding: user.needsOnboarding,
        needsRoleSelection: user.needsRoleSelection,
        emailVerified: user.emailVerified,
        subscriptionActive: user.subscriptionActive
      }
    })

  } catch (error) {
    console.error('Error refreshing session:', error)
    return NextResponse.json(
      { error: 'Failed to refresh session' },
      { status: 500 }
    )
  }
}
