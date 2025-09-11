import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Course, CreateCourseRequest } from '@/lib/types/course.types'
import { ApiResponse, PaginatedResponse } from '@/lib/types/api.types'

// GET /api/courses - Fetch courses
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const instituteId = searchParams.get('instituteId')
    const status = searchParams.get('status')

    const db = await connectDB()
    const coursesCollection = db.collection('courses')

    // Build query
    const query: any = { status: 'active' }
    if (instituteId) query.instituteId = instituteId
    if (status) query.status = status

    // Calculate pagination
    const skip = (page - 1) * limit
    const total = await coursesCollection.countDocuments(query)
    const courses = await coursesCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const response: PaginatedResponse<Course> = {
      data: courses,
      total,
      page,
      limit,
      hasMore: skip + courses.length < total
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

// POST /api/courses - Create a new course
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'institute') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const courseData: CreateCourseRequest = await req.json()
    const db = await connectDB()
    const coursesCollection = db.collection('courses')
    const institutesCollection = db.collection('institutes')

    // Verify user has an institute
    const institute = await institutesCollection.findOne({ userId: session.user.id })
    if (!institute) {
      return NextResponse.json({ error: 'Institute profile required' }, { status: 400 })
    }

    // Create course
    const course: Course = {
      id: crypto.randomUUID(),
      instituteId: institute.id,
      title: courseData.title,
      description: courseData.description,
      category: courseData.category,
      level: courseData.level,
      duration: courseData.duration,
      fee: courseData.fee,
      currency: courseData.currency,
      startDate: courseData.startDate,
      endDate: courseData.endDate,
      registrationDeadline: courseData.registrationDeadline,
      maxStudents: courseData.maxStudents,
      currentEnrollments: 0,
      prerequisites: courseData.prerequisites,
      curriculum: courseData.curriculum,
      instructor: courseData.instructor,
      status: 'draft',
      applicationsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await coursesCollection.insertOne(course)

    const response: ApiResponse<Course> = {
      success: true,
      data: course,
      message: 'Course created successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}
