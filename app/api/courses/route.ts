import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Course as CourseModel, Course, Institute } from '@/src/models'
import { ApiResponse, PaginatedResponse } from '@/lib/types/api.types'

// GET /api/courses - Fetch courses
export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = authResult

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const instituteId = searchParams.get('instituteId')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const level = searchParams.get('level')

    await connectToDatabase()

    // Build query - don't filter by status by default, let frontend handle it
    const query: any = {}
    if (instituteId) query.instituteId = instituteId
    if (status && status !== 'undefined') query.status = status
    if (category && category !== 'undefined') query.category = category
    if (level && level !== 'undefined') query.level = level

    console.log('Courses API query:', query)
    console.log('Search params:', Object.fromEntries(searchParams.entries()))

    // Calculate pagination
    const skip = (page - 1) * limit
    const total = await CourseModel.countDocuments(query)
    const courses = await CourseModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const response: PaginatedResponse<any> = {
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
    const authResult = await getAuthenticatedUser(req)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, user } = authResult

    // Check if user has institute role
    if (!user?.roles?.includes('institute')) {
      return NextResponse.json({ error: 'Institute role required' }, { status: 403 })
    }

    const courseData = await req.json()
    await connectToDatabase()

    // Verify user has an institute
    const institute = await Institute.findOne({ userId: userId })
    if (!institute) {
      return NextResponse.json({ error: 'Institute profile required' }, { status: 400 })
    }

    // Use instituteId from courseData if provided, otherwise use user's institute
    const instituteId = courseData.instituteId || institute._id;

    console.log('Course data received:', JSON.stringify(courseData, null, 2))
    console.log('User ID:', userId)
    console.log('Institute ID:', instituteId)

    // Create course with data from our form
    const course = new CourseModel({
      // Required fields
      instituteId: instituteId,
      title: courseData.title,
      description: courseData.description,
      courseType: courseData.courseType,
      duration: courseData.duration,
      fee: courseData.fee,
      maxStudents: courseData.maxStudents,
      modeOfStudy: courseData.modeOfStudy,
      isPublished: courseData.isPublished || false,

      // Optional new fields
      specializations: courseData.specializations || [],
      applicableStreams: courseData.applicableStreams || [],
      feesFrequency: courseData.feesFrequency,
      feesAmount: courseData.feesAmount,
      highestPackageAmount: courseData.highestPackageAmount,
      totalSeats: courseData.totalSeats,
      managementQuota: courseData.managementQuota,
      examsAccepted: courseData.examsAccepted || [],
      eligibilityRequirements: courseData.eligibilityRequirements || [],
      syllabus: courseData.syllabus || [],
      assessmentMethods: courseData.assessmentMethods || [],
      certificationType: courseData.certificationType || 'completion',
      tags: courseData.tags || [],

      // Legacy fields for backward compatibility (optional)
      category: courseData.category,
      level: courseData.level,
      currency: courseData.currency || 'INR',
      price: courseData.price || courseData.fee, // Map fee to price for backward compatibility
      startDate: courseData.startDate,
      endDate: courseData.endDate,
      registrationDeadline: courseData.registrationDeadline,
      currentEnrollments: courseData.currentEnrollments || 0,
      prerequisites: courseData.prerequisites || [],
      curriculum: courseData.curriculum || [],
      instructor: courseData.instructor,
      status: courseData.status || 'draft',
      applicationsCount: courseData.applicationsCount || 0,
      enrollmentCount: courseData.enrollmentCount || 0,
      rating: courseData.rating || 0,

      // Additional optional fields
      estimatedHours: courseData.estimatedHours,
      language: courseData.language || 'English',
      hasLiveClasses: courseData.hasLiveClasses || false,
      hasRecordedContent: courseData.hasRecordedContent || true,
      hasAssignments: courseData.hasAssignments || true,
      hasQuizzes: courseData.hasQuizzes || true,
      hasCertificate: courseData.hasCertificate || true,
      learningOutcomes: courseData.learningOutcomes || [],
      difficultyLevel: courseData.difficultyLevel || 3,
      enrollmentStartDate: courseData.enrollmentStartDate,
      enrollmentEndDate: courseData.enrollmentEndDate,
      courseStartDate: courseData.courseStartDate,
      courseEndDate: courseData.courseEndDate,
      supportEmail: courseData.supportEmail,
      supportPhone: courseData.supportPhone,
      thumbnail: courseData.thumbnail,

      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date()
    })

    console.log('Course object created:', course)

    try {
      const savedCourse = await course.save()
      console.log('Course saved successfully:', savedCourse)

      const response: ApiResponse<any> = {
        success: true,
        data: savedCourse.toObject(),
        message: 'Course created successfully'
      }

      return NextResponse.json(response)
    } catch (error: any) {
      console.error('Error creating course:', error)

      // Handle Mongoose validation errors
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map((err: any) => err.message)
        return NextResponse.json(
          {
            error: 'Course validation failed',
            details: validationErrors
          },
          { status: 400 }
        )
      }

      // Handle other errors
      return NextResponse.json(
        { error: 'Failed to create course' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in POST /api/courses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
