import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import clientPromise from '../../db'

const querySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform(val => parseInt(val || '10')),
  page: z
    .string()
    .optional()
    .transform(val => parseInt(val || '1')),
  type: z.string().optional()
})

/**
 * @swagger
 * /api/user/activities:
 *   get:
 *     summary: Get user activities
 *     description: Retrieves user's recent activities with pagination
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of activities to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [course, goal, connection]
 *         description: Filter by activity type
 *     responses:
 *       200:
 *         description: Activities retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                       title:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
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

    const { searchParams } = new URL(request.url)
    const validatedParams = querySchema.parse({
      limit: searchParams.get('limit'),
      page: searchParams.get('page'),
      type: searchParams.get('type')
    })

    const client = await clientPromise
    const db = client.db()

    const query: any = { userId: session.user.id }
    if (validatedParams.type) {
      query.type = validatedParams.type
    }

    const [activities, total] = await Promise.all([
      db
        .collection('user_activities')
        .find(query)
        .sort({ timestamp: -1 })
        .skip((validatedParams.page - 1) * validatedParams.limit)
        .limit(validatedParams.limit)
        .toArray(),
      db.collection('user_activities').countDocuments(query)
    ])

    // Transform MongoDB _id to id
    const formattedActivities = activities.map(activity => ({
      id: activity._id.toString(),
      type: activity.type,
      title: activity.description,
      timestamp: activity.timestamp
    }))

    return NextResponse.json({
      activities: formattedActivities,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total,
        totalPages: Math.ceil(total / validatedParams.limit)
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error fetching user activities:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
