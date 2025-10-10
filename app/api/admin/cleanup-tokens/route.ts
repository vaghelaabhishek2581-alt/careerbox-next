import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { cleanupBlacklistedTokens } from '@/lib/utils/cleanup-blacklisted-tokens'

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const authResult = await getAuthenticatedUser(request)
    
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = authResult
    if (!user?.roles?.includes('admin')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Perform cleanup
    const result = await cleanupBlacklistedTokens()
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${result.deletedCount} expired tokens`,
      deletedCount: result.deletedCount
    })
  } catch (error) {
    console.error('Cleanup tokens error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
