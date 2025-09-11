import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
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

    const db = await connectDB()
    const examsCollection = db.collection('exams')

    // Build query
    const query: any = { status: 'active' }
    if (createdBy) query.createdBy = createdBy
    if (createdByType) query.createdByType = createdByType
    if (status) query.status = status

    // Calculate pagination
    const skip = (page - 1) * limit
    const total = await examsCollection.countDocuments(query)
    const exams = await examsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

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
    const db = await connectDB()
    const examsCollection = db.collection('exams')
    const institutesCollection = db.collection('institutes')
    const businessesCollection = db.collection('businesses')

    let createdBy = ''
    let createdByType = ''

    if (session.user.role === 'institute') {
      const institute = await institutesCollection.findOne({ userId: session.user.id })
      if (!institute) {
        return NextResponse.json({ error: 'Institute profile required' }, { status: 400 })
      }
      createdBy = institute.id
      createdByType = 'institute'
    } else if (session.user.role === 'business') {
      const business = await businessesCollection.findOne({ userId: session.user.id })
      if (!business) {
        return NextResponse.json({ error: 'Business profile required' }, { status: 400 })
      }
      createdBy = business.id
      createdByType = 'business'
    }

    // Create exam
    const exam: Exam = {
      id: crypto.randomUUID(),
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
    }

    await examsCollection.insertOne(exam)

    const response: ApiResponse<Exam> = {
      success: true,
      data: exam,
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
