import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Application } from '@/src/models'
import { ApiResponse } from '@/lib/types/api.types'

/**
 * @swagger
 * /api/applications/{applicationId}:
 *   get:
 *     summary: Get a specific application by ID
 *     tags:
 *       - Applications
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Application'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Application not found
 *       500:
 *         description: Internal server error
 *   patch:
 *     summary: Update an application
 *     tags:
 *       - Applications
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, reviewed, shortlisted, accepted, rejected, withdrawn]
 *               notes:
 *                 type: string
 *               interviewScheduled:
 *                 type: string
 *                 format: date-time
 *               interviewNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Application updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Application not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete an application
 *     tags:
 *       - Applications
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Application not found
 *       500:
 *         description: Internal server error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const { applicationId } = params

    const application = await Application.findById(applicationId)
      .populate('userId', 'name email')
      .lean()

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Check if user can access this application
    if (session.user.role !== 'admin' && application.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const response: ApiResponse<any> = {
      success: true,
      data: application
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const { applicationId } = params
    const updateData = await request.json()

    // Find the application first to check permissions
    const existingApplication = await Application.findById(applicationId)
    if (!existingApplication) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Check if user can update this application
    if (session.user.role !== 'admin' && existingApplication.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Prepare update data
    const allowedUpdates = ['status', 'notes', 'interviewScheduled', 'interviewNotes']
    const filteredUpdates: any = { updatedAt: new Date() }

    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key) && updateData[key] !== undefined) {
        filteredUpdates[key] = updateData[key]
      }
    })

    // If status is being updated to reviewed, set reviewedAt
    if (filteredUpdates.status && filteredUpdates.status !== 'pending') {
      filteredUpdates.reviewedAt = new Date()
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      filteredUpdates,
      { new: true }
    ).populate('userId', 'name email')

    const response: ApiResponse<any> = {
      success: true,
      data: updatedApplication,
      message: 'Application updated successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const { applicationId } = params

    // Find the application first to check permissions
    const application = await Application.findById(applicationId)
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Check if user can delete this application
    if (session.user.role !== 'admin' && application.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await Application.findByIdAndDelete(applicationId)

    const response: ApiResponse<any> = {
      success: true,
      message: 'Application deleted successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    )
  }
}
