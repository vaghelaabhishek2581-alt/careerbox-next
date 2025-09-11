import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cleanupBlacklistedTokens } from '@/lib/utils/cleanup-blacklisted-tokens'

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Clean up blacklisted tokens
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
