import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { JobSearchFilters, JobSearchResponse } from '@/lib/types/job.types'

// GET /api/jobs/search - Search jobs with filters
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const db = await connectDB()
    const jobsCollection = db.collection('jobs')

    // Build query from search parameters
    const query: any = { status: 'active' }

    // Location filter
    if (searchParams.get('location')) {
      query.location = { $regex: searchParams.get('location'), $options: 'i' }
    }

    // Employment type filter
    if (searchParams.get('employmentType')) {
      const employmentTypes = searchParams.getAll('employmentType')
      query.employmentType = { $in: employmentTypes }
    }

    // Salary range filter
    if (searchParams.get('salaryMin')) {
      query['salaryRange.min'] = { $gte: parseInt(searchParams.get('salaryMin')!) }
    }
    if (searchParams.get('salaryMax')) {
      query['salaryRange.max'] = { $lte: parseInt(searchParams.get('salaryMax')!) }
    }

    // Skills filter
    if (searchParams.get('skills')) {
      const skills = searchParams.getAll('skills')
      query.skills = { $in: skills }
    }

    // Experience filter
    if (searchParams.get('experienceMin')) {
      query['experience.min'] = { $lte: parseInt(searchParams.get('experienceMin')!) }
    }
    if (searchParams.get('experienceMax')) {
      query['experience.max'] = { $gte: parseInt(searchParams.get('experienceMax')!) }
    }

    // Industry filter (requires join with businesses)
    if (searchParams.get('industry')) {
      const businessesCollection = db.collection('businesses')
      const businesses = await businessesCollection
        .find({ industry: { $regex: searchParams.get('industry'), $options: 'i' } })
        .toArray()
      const businessIds = businesses.map(b => b.id)
      query.businessId = { $in: businessIds }
    }

    // Company size filter
    if (searchParams.get('companySize')) {
      const businessesCollection = db.collection('businesses')
      const businesses = await businessesCollection
        .find({ size: searchParams.get('companySize') })
        .toArray()
      const businessIds = businesses.map(b => b.id)
      query.businessId = { $in: businessIds }
    }

    // Calculate pagination
    const skip = (page - 1) * limit
    const total = await jobsCollection.countDocuments(query)
    const jobs = await jobsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const response: JobSearchResponse = {
      jobs,
      total,
      page,
      limit,
      hasMore: skip + jobs.length < total
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error searching jobs:', error)
    return NextResponse.json(
      { error: 'Failed to search jobs' },
      { status: 500 }
    )
  }
}
