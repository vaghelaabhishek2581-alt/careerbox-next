import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongodb'

// Helper functions
function getPaginationParams(request: NextRequest) {
  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 100)
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

// Get all active sessions
export async function GET(request: NextRequest) {
  const authCheck = await requireRole(request, 'admin')
  if (authCheck.error) return authCheck.response

  try {
    const { db } = await connectToDatabase()
    const { page, limit, skip } = getPaginationParams(request)
    
    // Get active refresh tokens with user info
    const sessions = await db.collection('refresh_tokens').aggregate([
      {
        $match: {
          isActive: true,
          expiresAt: { $gt: new Date() }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          tokenId: 1,
          userId: 1,
          email: 1,
          createdAt: 1,
          expiresAt: 1,
          'user.name': 1,
          'user.role': 1,
          'user.activeRole': 1,
          'user.lastLoginAt': 1,
          'user.provider': 1
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]).toArray()
    
    // Get total count
    const totalCount = await db.collection('refresh_tokens').countDocuments({
      isActive: true,
      expiresAt: { $gt: new Date() }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        sessions,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    })
    
  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

// Terminate specific session
export async function POST(request: NextRequest) {
  const authCheck = await requireRole(request, 'admin')
  if (authCheck.error) return authCheck.response

  try {
    const body = await request.json()
    const { tokenId } = body
    
    if (!tokenId) {
      return NextResponse.json(
        { error: 'Token ID is required' },
        { status: 400 }
      )
    }
    
    const { db } = await connectToDatabase()
    
    // Revoke the specific token
    const result = await db.collection('refresh_tokens').updateOne(
      { tokenId, isActive: true },
      { 
        $set: { 
          isActive: false, 
          revokedAt: new Date(),
          revokedBy: authCheck.auth.userId
        } 
      }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Session not found or already terminated' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Session terminated successfully'
    })
    
  } catch (error) {
    console.error('Terminate session error:', error)
    return NextResponse.json(
      { error: 'Failed to terminate session' },
      { status: 500 }
    )
  }
}