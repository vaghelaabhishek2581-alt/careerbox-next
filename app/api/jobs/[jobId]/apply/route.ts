import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Job, Application } from '@/src/models'
import { JobApplication } from '@/lib/types/job.types'
import { ApiResponse } from '@/lib/types/api.types'

// POST /api/jobs/[jobId]/apply - Apply to a job
export async function POST(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const { jobId } = params
    const applicationData = await req.json()

    // Check if job exists and is active
    const job = await Job.findById(jobId)
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.status !== 'active') {
      return NextResponse.json({ error: 'Job is not accepting applications' }, { status: 400 })
    }

    if (new Date() > new Date(job.applicationDeadline)) {
      return NextResponse.json({ error: 'Application deadline has passed' }, { status: 400 })
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      userId: session.user.id,
      targetId: jobId,
      type: 'job'
    })

    if (existingApplication) {
      return NextResponse.json({ error: 'Already applied to this job' }, { status: 400 })
    }

    // Create job application using Mongoose
    const jobApplication = new Application({
      userId: session.user.id,
      type: 'job',
      targetId: jobId,
      status: 'pending',
      coverLetter: applicationData.coverLetter,
      resumeUrl: applicationData.resumeUrl,
      appliedAt: new Date(),
      updatedAt: new Date()
    })

    await jobApplication.save()

    // Update job applications count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicationsCount: 1 }
    })

    // Populate user info for response
    await jobApplication.populate('userId', 'name email')

    const response: ApiResponse<JobApplication> = {
      success: true,
      data: jobApplication,
      message: 'Application submitted successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error applying to job:', error)
    return NextResponse.json(
      { error: 'Failed to apply to job' },
      { status: 500 }
    )
  }
}
