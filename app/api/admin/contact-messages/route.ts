import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongoose'
import { ContactMessage } from '@/src/models'

// GET - Fetch all contact messages with filtering and pagination
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

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    // Build query
    const query: any = {}

    if (status && status !== 'all') {
      query.status = status
    }

    if (type && type !== 'all') {
      query.type = type
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (page - 1) * limit

    const [messages, total, statusCounts] = await Promise.all([
      ContactMessage.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ContactMessage.countDocuments(query),
      ContactMessage.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ])

    // Transform status counts to object
    const statusStats = statusCounts.reduce(
      (acc: any, item: any) => {
        acc[item._id] = item.count
        return acc
      },
      { new: 0, read: 0, replied: 0, archived: 0 }
    )

    // Transform messages
    const transformedMessages = messages.map(msg => {
      const m = msg as any
      return {
        ...m,
        id: m._id?.toString(),
        _id: undefined
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        messages: transformedMessages,
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
    console.error('Error fetching contact messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete multiple contact messages
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
        { error: 'Message IDs are required' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const result = await ContactMessage.deleteMany({ _id: { $in: ids } })

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} message(s) deleted successfully`
    })
  } catch (error) {
    console.error('Error deleting contact messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
