import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
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

    const { jobId } = params
    const applicationData = await req.json()
    const db = await connectDB()
    const jobsCollection = db.collection('jobs')
    const applicationsCollection = db.collection('applications')

    // Check if job exists and is active
    const job = await jobsCollection.findOne({ id: jobId })
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
    const existingApplication = await applicationsCollection.findOne({
      userId: session.user.id,
      targetId: jobId,
      type: 'job'
    })

    if (existingApplication) {
      return NextResponse.json({ error: 'Already applied to this job' }, { status: 400 })
    }

    // Create job application
    const jobApplication: JobApplication = {
      id: crypto.randomUUID(),
      jobId,
      userId: session.user.id,
      status: 'pending',
      coverLetter: applicationData.coverLetter,
      resumeUrl: applicationData.resumeUrl,
      appliedAt: new Date(),
      updatedAt: new Date()
    }

    await applicationsCollection.insertOne(jobApplication)

    // Update job applications count
    await jobsCollection.updateOne(
      { id: jobId },
      { $inc: { applicationsCount: 1 } }
    )

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
