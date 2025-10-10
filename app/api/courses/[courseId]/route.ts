import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Course as CourseModel } from '@/src/models'
import { ApiResponse } from '@/lib/types/api.types'

// GET /api/courses/[courseId] - Get a specific course
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const authResult = await getAuthenticatedUser(req)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = await context.params
    await connectToDatabase()

    const courseDoc = await CourseModel.findById(courseId).lean().exec()
    
    if (!courseDoc) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Type assertion for lean document
    const course = courseDoc as unknown as any

    const response: ApiResponse<any> = {
      success: true,
      data: course,
      message: 'Course retrieved successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    )
  }
}

// PUT /api/courses/[courseId] - Update a specific course
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
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

    const { courseId } = await context.params
    const courseData = await req.json()
    await connectToDatabase()

    // Find the course and verify ownership
    const existingCourse = await CourseModel.findById(courseId)
    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Verify the user owns this course (through institute)
    // This would require checking if the course's instituteId belongs to the user
    // For now, we'll allow the update if the user has institute role

    const updatedCourse = await CourseModel.findByIdAndUpdate(
      courseId,
      {
        ...courseData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )

    const response: ApiResponse<any> = {
      success: true,
      data: updatedCourse?.toObject(),
      message: 'Course updated successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating course:', error)
    
    // Handle Mongoose validation errors
    if ((error as any)?.name === 'ValidationError') {
      const validationErrors = Object.values((error as any).errors).map((err: any) => err.message)
      return NextResponse.json(
        {
          error: 'Course validation failed',
          details: validationErrors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    )
  }
}

// DELETE /api/courses/[courseId] - Delete a specific course
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
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

    const { courseId } = await context.params
    await connectToDatabase()

    // Find the course and verify ownership
    const existingCourse = await CourseModel.findById(courseId)
    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Verify the user owns this course (through institute)
    // This would require checking if the course's instituteId belongs to the user
    // For now, we'll allow the deletion if the user has institute role

    await CourseModel.findByIdAndDelete(courseId)

    const response: ApiResponse<any> = {
      success: true,
      data: { courseId },
      message: 'Course deleted successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    )
  }
}
