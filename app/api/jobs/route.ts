import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Job, CreateJobRequest } from '@/lib/types/job.types'
import { ApiResponse, PaginatedResponse } from '@/lib/types/api.types'

// GET /api/jobs - Fetch jobs
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const businessId = searchParams.get('businessId')
    const status = searchParams.get('status')

    const db = await connectDB()
    const jobsCollection = db.collection('jobs')

    // Build query
    const query: any = {}
    if (businessId) query.businessId = businessId
    if (status) query.status = status
    else query.status = 'active' // Default to active jobs for public

    // Calculate pagination
    const skip = (page - 1) * limit
    const total = await jobsCollection.countDocuments(query)
    const jobs = await jobsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const response: PaginatedResponse<Job> = {
      data: jobs,
      total,
      page,
      limit,
      hasMore: skip + jobs.length < total
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

// POST /api/jobs - Create a new job
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'business') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const jobData: CreateJobRequest = await req.json()
    const db = await connectDB()
    const jobsCollection = db.collection('jobs')
    const businessesCollection = db.collection('businesses')

    // Verify user has a business
    const business = await businessesCollection.findOne({ userId: session.user.id })
    if (!business) {
      return NextResponse.json({ error: 'Business profile required' }, { status: 400 })
    }

    // Create job
    const job: Job = {
      id: crypto.randomUUID(),
      businessId: business.id,
      title: jobData.title,
      description: jobData.description,
      requirements: jobData.requirements,
      responsibilities: jobData.responsibilities,
      location: jobData.location,
      employmentType: jobData.employmentType,
      salaryRange: jobData.salaryRange,
      skills: jobData.skills,
      experience: jobData.experience,
      applicationDeadline: jobData.applicationDeadline,
      status: 'draft',
      applicationsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await jobsCollection.insertOne(job)

    const response: ApiResponse<Job> = {
      success: true,
      data: job,
      message: 'Job created successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    )
  }
}
