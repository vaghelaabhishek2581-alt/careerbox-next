import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { ExamSearchFilters, ExamSearchResponse } from '@/lib/types/exam.types'

// GET /api/exams/search - Search exams with filters
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
    const examsCollection = db.collection('exams')

    // Build query from search parameters
    const query: any = { status: 'active' }

    // Type filter
    if (searchParams.get('type')) {
      const types = searchParams.getAll('type')
      query.type = { $in: types }
    }

    // Created by type filter
    if (searchParams.get('createdByType')) {
      query.createdByType = searchParams.get('createdByType')
    }

    // Exam date filter
    if (searchParams.get('examDateFrom')) {
      query.examDate = { $gte: new Date(searchParams.get('examDateFrom')!) }
    }
    if (searchParams.get('examDateTo')) {
      query.examDate = { ...query.examDate, $lte: new Date(searchParams.get('examDateTo')!) }
    }

    // Fee filter
    if (searchParams.get('feeMax')) {
      query.fee = { $lte: parseInt(searchParams.get('feeMax')!) }
    }

    // Status filter
    if (searchParams.get('status')) {
      const statuses = searchParams.getAll('status')
      query.status = { $in: statuses }
    }

    // Calculate pagination
    const skip = (page - 1) * limit
    const total = await examsCollection.countDocuments(query)
    const exams = await examsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const response: ExamSearchResponse = {
      exams,
      total,
      page,
      limit,
      hasMore: skip + exams.length < total
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error searching exams:', error)
    return NextResponse.json(
      { error: 'Failed to search exams' },
      { status: 500 }
    )
  }
}
