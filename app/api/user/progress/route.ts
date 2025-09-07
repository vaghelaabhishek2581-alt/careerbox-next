import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import clientPromise from '../../db'

/**
 * @swagger
 * /api/user/progress:
 *   get:
 *     summary: Get user progress
 *     description: Retrieves user's overall progress, skills development, and goal achievement
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progress retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 overall:
 *                   type: number
 *                 skills:
 *                   type: number
 *                 goals:
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

    // Calculate skills progress
    const [totalSkills, completedSkills] = await Promise.all([
      db.collection('user_skills').countDocuments({ userId: session.user.id }),
      db.collection('user_skills').countDocuments({
        userId: session.user.id,
        proficiency: { $gte: 7 }
      })
    ])
    const skillsProgress = totalSkills
      ? (completedSkills / totalSkills) * 100
      : 0

    // Calculate goals progress
    const [totalGoals, completedGoals] = await Promise.all([
      db.collection('user_goals').countDocuments({ userId: session.user.id }),
      db.collection('user_goals').countDocuments({
        userId: session.user.id,
        status: 'completed'
      })
    ])
    const goalsProgress = totalGoals ? (completedGoals / totalGoals) * 100 : 0

    // Calculate overall progress (weighted average)
    const overallProgress = skillsProgress * 0.6 + goalsProgress * 0.4

    return NextResponse.json({
      overall: Math.round(overallProgress),
      skills: Math.round(skillsProgress),
      goals: Math.round(goalsProgress)
    })
  } catch (error) {
    console.error('Error fetching user progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
