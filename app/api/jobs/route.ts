import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Job as JobModel, Business } from '@/src/models'
import { Job, CreateJobRequest } from '@/lib/types/job.types'
import { ApiResponse, PaginatedResponse } from '@/lib/types/api.types'

// GET /api/jobs - Fetch jobs
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const businessId = searchParams.get('businessId')
    const status = searchParams.get('status')

    // Build query
    const query: any = {}
    if (businessId) query.businessId = businessId
    if (status) query.status = status
    else query.status = 'active' // Default to active jobs for public

    // Calculate pagination
    const skip = (page - 1) * limit
    const total = await JobModel.countDocuments(query)
    const jobs = await JobModel.find(query)
      .populate('businessId', 'companyName industry logo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

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

    await connectToDatabase()

    const jobData: CreateJobRequest = await req.json()

    // Verify user has a business
    const business = await Business.findOne({ userId: session.user.id })
    if (!business) {
      return NextResponse.json({ error: 'Business profile required' }, { status: 400 })
    }

    // Create job using Mongoose
    const job = new JobModel({
      businessId: business._id,
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
      applicationsCount: 0
    })

    await job.save()

    // Populate business info for response
    await job.populate('businessId', 'companyName industry logo')

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
