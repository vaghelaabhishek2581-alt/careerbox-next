import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db/mongodb'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()
    
    // Find user in database
    const user = await db.collection('users').findOne({
      email: session.user.email
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found in database' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      session: {
        user: session.user,
        expires: session.expires
      },
      database: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        activeRole: user.activeRole,
        needsOnboarding: user.needsOnboarding,
        needsRoleSelection: user.needsRoleSelection,
        provider: user.provider,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })
  } catch (error) {
    console.error('Debug user error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    )
  }
}
