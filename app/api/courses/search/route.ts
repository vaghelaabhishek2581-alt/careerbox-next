import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { CourseSearchFilters, CourseSearchResponse } from '@/lib/types/course.types'

// GET /api/courses/search - Search courses with filters
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
    const coursesCollection = db.collection('courses')

    // Build query from search parameters
    const query: any = { status: 'active' }

    // Category filter
    if (searchParams.get('category')) {
      const categories = searchParams.getAll('category')
      query.category = { $in: categories }
    }

    // Level filter
    if (searchParams.get('level')) {
      const levels = searchParams.getAll('level')
      query.level = { $in: levels }
    }

    // Fee range filter
    if (searchParams.get('feeMax')) {
      query.fee = { $lte: parseInt(searchParams.get('feeMax')!) }
    }

    // Start date filter
    if (searchParams.get('startDateFrom')) {
      query.startDate = { $gte: new Date(searchParams.get('startDateFrom')!) }
    }
    if (searchParams.get('startDateTo')) {
      query.startDate = { ...query.startDate, $lte: new Date(searchParams.get('startDateTo')!) }
    }

    // Duration filter
    if (searchParams.get('durationMin')) {
      query.duration = { $gte: parseInt(searchParams.get('durationMin')!) }
    }
    if (searchParams.get('durationMax')) {
      query.duration = { ...query.duration, $lte: parseInt(searchParams.get('durationMax')!) }
    }

    // Status filter
    if (searchParams.get('status')) {
      const statuses = searchParams.getAll('status')
      query.status = { $in: statuses }
    }

    // Calculate pagination
    const skip = (page - 1) * limit
    const total = await coursesCollection.countDocuments(query)
    const courses = await coursesCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const response: CourseSearchResponse = {
      courses,
      total,
      page,
      limit,
      hasMore: skip + courses.length < total
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error searching courses:', error)
    return NextResponse.json(
      { error: 'Failed to search courses' },
      { status: 500 }
    )
  }
}
