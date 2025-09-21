import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'

/**
 * @swagger
 * /api/session:
 *   get:
 *     summary: Get current user session
 *     description: Returns current user session data from JWT token (cookie or header)
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Session data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *                     activeRole:
 *                       type: string
 *                     needsOnboarding:
 *                       type: boolean
 *                     needsRoleSelection:
 *                       type: boolean
 *       401:
 *         description: Unauthorized - No valid token found
 *       403:
 *         description: Forbidden - Token expired or invalid
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Getting session...')
    
    const auth = await getAuthenticatedUser(request)
    if (!auth?.userId) {
      console.log('❌ No authentication found')
      return NextResponse.json(
        { success: false, message: 'No authentication token found' },
        { status: 401 }
      )
    }

    console.log('✅ Authentication found for user:', auth.userId, 'via', auth.authType)

    // Return session data - auth.user already contains the formatted user data
    return NextResponse.json({
      success: true,
      user: auth.user,
      authType: auth.authType
    })
  } catch (error) {
    console.error('Session API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
