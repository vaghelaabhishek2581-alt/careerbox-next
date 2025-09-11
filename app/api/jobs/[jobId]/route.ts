import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Job, UpdateJobRequest } from '@/lib/types/job.types'
import { ApiResponse } from '@/lib/types/api.types'

// GET /api/jobs/[jobId] - Fetch job by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId } = params
    const db = await connectDB()
    const jobsCollection = db.collection('jobs')

    const job = await jobsCollection.findOne({ id: jobId })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const response: ApiResponse<Job> = {
      success: true,
      data: job
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    )
  }
}

// PUT /api/jobs/[jobId] - Update job
export async function PUT(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId } = params
    const updateData: UpdateJobRequest = await req.json()
    const db = await connectDB()
    const jobsCollection = db.collection('jobs')
    const businessesCollection = db.collection('businesses')

    const job = await jobsCollection.findOne({ id: jobId })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Check if user can update this job
    const business = await businessesCollection.findOne({ id: job.businessId })
    if (session.user.role !== 'admin' && business?.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updatedJob = {
      ...job,
      ...updateData,
      updatedAt: new Date()
    }

    await jobsCollection.updateOne(
      { id: jobId },
      { $set: updatedJob }
    )

    const response: ApiResponse<Job> = {
      success: true,
      data: updatedJob,
      message: 'Job updated successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    )
  }
}

// DELETE /api/jobs/[jobId] - Delete job
export async function DELETE(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId } = params
    const db = await connectDB()
    const jobsCollection = db.collection('jobs')
    const businessesCollection = db.collection('businesses')

    const job = await jobsCollection.findOne({ id: jobId })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Check if user can delete this job
    const business = await businessesCollection.findOne({ id: job.businessId })
    if (session.user.role !== 'admin' && business?.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await jobsCollection.deleteOne({ id: jobId })

    const response: ApiResponse<null> = {
      success: true,
      data: null,
      message: 'Job deleted successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    )
  }
}
