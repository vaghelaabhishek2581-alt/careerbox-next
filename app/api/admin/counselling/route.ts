import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db'

// GET - Fetch all counselling requests with filtering and pagination
export async function GET (request: NextRequest) {
  try {
    // Authentication check with admin role requirement
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = authResult
    if (!user?.roles?.includes('admin')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { db } = await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Build query
    const query: any = {}

    if (status && status !== 'all') {
      query.status = status
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { courseInterest: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (page - 1) * limit

    const [requests, total, statusCounts] = await Promise.all([
      db
        .collection('counselling_requests')
        .find(query)
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('counselling_requests').countDocuments(query),
      db
        .collection('counselling_requests')
        .aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
        .toArray()
    ])

    // Transform status counts to object
    const statusStats = statusCounts.reduce(
      (acc: any, item: any) => {
        acc[item._id] = item.count
        return acc
      },
      { pending: 0, contacted: 0, completed: 0 }
    )

    // Transform requests
    const transformedRequests = requests.map(req => ({
      id: req._id.toString(),
      name: req.name,
      email: req.email,
      phone: req.phone,
      state: req.state,
      city: req.city,
      courseLevel: req.courseLevel,
      courseInterest: req.courseInterest,
      status: req.status,
      submittedAt: req.submittedAt,
      source: req.source,
      adminNotes: req.adminNotes,
      counselorAssigned: req.counselorAssigned,
      contactedAt: req.contactedAt,
      completedAt: req.completedAt
    }))

    return NextResponse.json({
      success: true,
      data: {
        requests: transformedRequests,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        statusStats
      }
    })
  } catch (error) {
    console.error('Error fetching counselling requests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete multiple counselling requests
export async function DELETE (request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = authResult
    if (!user?.roles?.includes('admin')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { ids } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Request IDs are required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const { ObjectId } = require('mongodb')

    const objectIds = ids.map((id: string) => new ObjectId(id))
    const result = await db.collection('counselling_requests').deleteMany({
      _id: { $in: objectIds }
    })

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} request(s) deleted successfully`
    })
  } catch (error) {
    console.error('Error deleting counselling requests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
