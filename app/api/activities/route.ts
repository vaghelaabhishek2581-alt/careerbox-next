import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Activity } from '@/src/models'

/**
 * @swagger
 * /api/activities:
 *   get:
 *     summary: Get user activities
 *     description: Retrieves activities for the current user or all users (for admins)
 *     tags:
 *       - Activities
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by activity types
 *     responses:
 *       200:
 *         description: List of activities
 *       401:
 *         description: Unauthorized
 */
export async function GET (request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.getAll('type')
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined
    const search = searchParams.get('search') || undefined
    const userId = searchParams.get('userId') || undefined

    const query: any = {}

    // Only admins can see all activities
    if (!session.user.roles?.includes('admin')) {
      query.userId = session.user.id
    } else if (userId) {
      query.userId = userId
    }

    if (type?.length) {
      query.type = { $in: type }
    }

    if (startDate || endDate) {
      query.timestamp = {}
      if (startDate) query.timestamp.$gte = startDate
      if (endDate) query.timestamp.$lte = endDate
    }

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { 'metadata.details': { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (page - 1) * limit

    const [activities, total] = await Promise.all([
      Activity.find(query)
        .populate('userId', 'name email')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Activity.countDocuments(query)
    ])

    return NextResponse.json({
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * @swagger
 * /api/activities:
 *   post:
 *     summary: Create new activity
 *     description: Creates a new user activity log
 *     tags:
 *       - Activities
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Activity created
 *       401:
 *         description: Unauthorized
 */
export async function POST (request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const { type, description, metadata } = await request.json()

    const activity = new Activity({
      userId: session.user.id,
      type,
      description,
      metadata,
      timestamp: new Date(),
      read: false,
      notified: false,
      ip: request.ip,
      userAgent: request.headers.get('user-agent')
    })

    await activity.save()

    // Emit socket event for real-time updates
    // This will be handled by the socket server
    const io = (global as any).socketIo
    if (io) {
      io.to('admin').emit('activity:new', activity)
      io.to(`user:${session.user.id}`).emit('notification:new', activity)
    }

    return NextResponse.json({
      success: true,
      activity
    })
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * @swagger
 * /api/activities:
 *   patch:
 *     summary: Update activity status
 *     description: Mark activities as read
 *     tags:
 *       - Activities
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activityIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Activities updated
 *       401:
 *         description: Unauthorized
 */
export async function PATCH (request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const { activityIds } = await request.json()

    const query: any = { userId: session.user.id, read: false }
    if (activityIds?.length) {
      query._id = { $in: activityIds }
    }

    const result = await Activity.updateMany(query, { $set: { read: true } })

    return NextResponse.json({ count: result.modifiedCount })
  } catch (error) {
    console.error('Error updating activities:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
