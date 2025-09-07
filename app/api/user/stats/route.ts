import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import clientPromise from '../../db'

/**
 * @swagger
 * /api/user/stats:
 *   get:
 *     summary: Get user statistics
 *     description: Retrieves user's course completion, skills, goals, and network statistics
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 completedCourses:
 *                   type: number
 *                 skillsAssessed:
 *                   type: number
 *                 careerGoals:
 *                   type: number
 *                 networkSize:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function GET (request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    // Get completed courses count
    const completedCourses = await db
      .collection('user_courses')
      .countDocuments({
        userId: session.user.id,
        status: 'completed'
      })

    // Get skills count
    const skillsAssessed = await db.collection('user_skills').countDocuments({
      userId: session.user.id
    })

    // Get career goals count
    const careerGoals = await db.collection('user_goals').countDocuments({
      userId: session.user.id
    })

    // Get network size
    const networkSize = await db.collection('user_connections').countDocuments({
      userId: session.user.id,
      status: 'accepted'
    })

    return NextResponse.json({
      completedCourses,
      skillsAssessed,
      careerGoals,
      networkSize
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
