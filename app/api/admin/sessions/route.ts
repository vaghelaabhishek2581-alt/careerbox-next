import { NextRequest, NextResponse } from 'next/server'
import { withJWTAuth } from '@/lib/middleware/jwt-auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import { createSuccessResponse, createErrorResponse, getPaginationParams } from '@/lib/middleware/jwt-auth'

// Get all active sessions
async function getSessionsHandler(request: NextRequest, user: any) {
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
    
    return createSuccessResponse({
      sessions,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })
    
  } catch (error) {
    console.error('Get sessions error:', error)
    return createErrorResponse(
      'Failed to fetch sessions',
      500,
      'FETCH_SESSIONS_FAILED'
    )
  }
}

// Terminate specific session
async function terminateSessionHandler(request: NextRequest, user: any) {
  try {
    const body = await request.json()
    const { tokenId } = body
    
    if (!tokenId) {
      return createErrorResponse(
        'Token ID is required',
        400,
        'MISSING_TOKEN_ID'
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
          revokedBy: user._id.toString()
        } 
      }
    )
    
    if (result.matchedCount === 0) {
      return createErrorResponse(
        'Session not found or already terminated',
        404,
        'SESSION_NOT_FOUND'
      )
    }
    
    return createSuccessResponse(null, 'Session terminated successfully')
    
  } catch (error) {
    console.error('Terminate session error:', error)
    return createErrorResponse(
      'Failed to terminate session',
      500,
      'TERMINATE_SESSION_FAILED'
    )
  }
}

export const GET = withJWTAuth(getSessionsHandler, { requireAdmin: true })
export const POST = withJWTAuth(terminateSessionHandler, { requireAdmin: true })