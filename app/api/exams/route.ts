import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Exam as ExamModel, Institute, Business } from '@/src/models'
import { Exam, CreateExamRequest } from '@/lib/types/exam.types'
import { ApiResponse, PaginatedResponse } from '@/lib/types/api.types'

// GET /api/exams - Fetch exams
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const createdBy = searchParams.get('createdBy')
    const createdByType = searchParams.get('createdByType')
    const status = searchParams.get('status')

    await connectToDatabase()

    // Build query
    const query: any = { status: 'active' }
    if (createdBy) query.createdBy = createdBy
    if (createdByType) query.createdByType = createdByType
    if (status) query.status = status

    // Calculate pagination
    const skip = (page - 1) * limit
    const total = await ExamModel.countDocuments(query)
    const exams = await ExamModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const response: PaginatedResponse<Exam> = {
      data: exams,
      total,
      page,
      limit,
      hasMore: skip + exams.length < total
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching exams:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exams' },
      { status: 500 }
    )
  }
}

// POST /api/exams - Create a new exam
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'institute' && session.user.role !== 'business')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const examData: CreateExamRequest = await req.json()
    await connectToDatabase()

    let createdBy = ''
    let createdByType = ''

    if (session.user.role === 'institute') {
      const institute = await Institute.findOne({ userId: session.user.id })
      if (!institute) {
        return NextResponse.json({ error: 'Institute profile required' }, { status: 400 })
      }
      createdBy = institute._id.toString()
      createdByType = 'institute'
    } else if (session.user.role === 'business') {
      const business = await Business.findOne({ userId: session.user.id })
      if (!business) {
        return NextResponse.json({ error: 'Business profile required' }, { status: 400 })
      }
      createdBy = business._id.toString()
      createdByType = 'business'
    }

    // Create exam
    const exam = new ExamModel({
      createdBy,
      createdByType: createdByType as 'business' | 'institute',
      title: examData.title,
      description: examData.description,
      type: examData.type,
      duration: examData.duration,
      totalMarks: examData.totalMarks,
      passingMarks: examData.passingMarks,
      instructions: examData.instructions,
      eligibilityCriteria: examData.eligibilityCriteria,
      examDate: examData.examDate,
      registrationDeadline: examData.registrationDeadline,
      fee: examData.fee,
      status: 'draft',
      questions: examData.questions,
      registrationsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const savedExam = await exam.save()

    const response: ApiResponse<Exam> = {
      success: true,
      data: savedExam.toObject(),
      message: 'Exam created successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating exam:', error)
    return NextResponse.json(
      { error: 'Failed to create exam' },
      { status: 500 }
    )
  }
}
