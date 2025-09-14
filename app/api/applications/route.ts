import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Application } from '@/src/models'
import { ApiResponse } from '@/lib/types/api.types'

/**
 * @swagger
 * /api/applications:
 *   get:
 *     summary: Get applications with pagination and filters
 *     tags:
 *       - Applications
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of applications per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [job, course, exam]
 *         description: Filter by application type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, reviewed, shortlisted, accepted, rejected, withdrawn]
 *         description: Filter by application status
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID (admin only)
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     applications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Application'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         hasMore:
 *                           type: boolean
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new application
 *     tags:
 *       - Applications
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - targetId
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [job, course, exam]
 *               targetId:
 *                 type: string
 *               coverLetter:
 *                 type: string
 *               motivationLetter:
 *                 type: string
 *               documents:
 *                 type: array
 *                 items:
 *                   type: object
 *               additionalInfo:
 *                 type: object
 *     responses:
 *       201:
 *         description: Application created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')

    // Build filter object
    const filter: any = {}

    // Regular users can only see their own applications
    // Admins can see all applications or filter by userId
    if (session.user.role !== 'admin') {
      filter.userId = session.user.id
    } else if (userId) {
      filter.userId = userId
    }

    if (type) {
      filter.type = type
    }

    if (status) {
      filter.status = status
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get applications with pagination
    const applications = await Application.find(filter)
      .populate('userId', 'name email')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Get total count
    const total = await Application.countDocuments(filter)

    const response: ApiResponse<any> = {
      success: true,
      data: {
        applications,
        pagination: {
          page,
          limit,
          total,
          hasMore: skip + applications.length < total
        }
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const data = await request.json()
    const { type, targetId, coverLetter, motivationLetter, documents, additionalInfo } = data

    // Validate required fields
    if (!type || !targetId) {
      return NextResponse.json(
        { error: 'Type and targetId are required' },
        { status: 400 }
      )
    }

    // Check if user already applied to this target
    const existingApplication = await Application.findOne({
      userId: session.user.id,
      type,
      targetId
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this item' },
        { status: 400 }
      )
    }

    // Create new application
    const applicationData: any = {
      userId: session.user.id,
      type,
      targetId,
      status: 'pending',
      appliedAt: new Date(),
      updatedAt: new Date()
    }

    // Add type-specific fields
    if (type === 'job') {
      applicationData.coverLetter = coverLetter
    } else if (type === 'course') {
      applicationData.motivationLetter = motivationLetter
    }

    if (documents) {
      applicationData.documents = documents
    }

    // Add any additional info
    if (additionalInfo) {
      Object.assign(applicationData, additionalInfo)
    }

    const application = new Application(applicationData)
    await application.save()

    // Populate the user field for response
    await application.populate('userId', 'name email')

    const response: ApiResponse<any> = {
      success: true,
      data: application,
      message: 'Application submitted successfully'
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    )
  }
}
