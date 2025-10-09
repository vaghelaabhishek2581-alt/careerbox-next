import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import { EmailLog } from '@/src/models/EmailLog'

// Validation schemas
const emailLogsQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).default('1'),
  limit: z.string().transform(val => parseInt(val, 10)).default('20'),
  status: z.enum(['pending', 'sent', 'failed', 'bounced']).optional(),
  type: z.enum(['registration_confirmation', 'registration_approved', 'registration_rejected', 'payment_confirmation', 'subscription_granted', 'system_notification', 'admin_notification']).optional(),
  search: z.string().optional(),
  dateRangeStart: z.string().optional(),
  dateRangeEnd: z.string().optional(),
  sortBy: z.enum(['createdAt', 'sentAt', 'status', 'type']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export async function GET(request: NextRequest) {
  try {
    // Authentication check with admin role requirement
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = authResult
    if (!user?.roles?.includes('admin')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const validatedParams = emailLogsQuerySchema.parse(queryParams)
    const { 
      page, 
      limit, 
      status, 
      type, 
      search, 
      dateRangeStart, 
      dateRangeEnd,
      sortBy,
      sortOrder
    } = validatedParams

    await connectToDatabase()

    // Build query filter
    const filter: any = {}
    
    if (status) {
      filter.status = status
    }
    
    if (type) {
      filter.type = type
    }
    
    if (dateRangeStart || dateRangeEnd) {
      filter.createdAt = {}
      if (dateRangeStart) {
        filter.createdAt.$gte = new Date(dateRangeStart)
      }
      if (dateRangeEnd) {
        filter.createdAt.$lte = new Date(dateRangeEnd)
      }
    }

    // Build aggregation pipeline
    const pipeline: any[] = []

    // Match stage
    if (Object.keys(filter).length > 0) {
      pipeline.push({ $match: filter })
    }

    // Search functionality
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { to: { $elemMatch: { $regex: search, $options: 'i' } } },
            { subject: { $regex: search, $options: 'i' } },
            { from: { $regex: search, $options: 'i' } },
            { messageId: { $regex: search, $options: 'i' } }
          ]
        }
      })
    }

    // Sort stage
    const sortStage: any = {}
    sortStage[sortBy] = sortOrder === 'asc' ? 1 : -1
    pipeline.push({ $sort: sortStage })

    // Get total count
    const countPipeline = [...pipeline, { $count: 'total' }]
    const countResult = await EmailLog.aggregate(countPipeline)
    const totalItems = countResult[0]?.total || 0

    // Add pagination
    const skip = (page - 1) * limit
    pipeline.push({ $skip: skip })
    pipeline.push({ $limit: limit })

    // Project final fields (excluding large HTML content for list view)
    pipeline.push({
      $project: {
        id: { $toString: '$_id' },
        to: 1,
        cc: 1,
        bcc: 1,
        from: 1,
        subject: 1,
        type: 1,
        status: 1,
        provider: 1,
        messageId: 1,
        errorMessage: 1,
        retryCount: 1,
        maxRetries: 1,
        relatedEntityId: { $toString: '$relatedEntityId' },
        relatedEntityType: 1,
        notificationId: { $toString: '$notificationId' },
        sentAt: 1,
        deliveredAt: 1,
        openedAt: 1,
        clickedAt: 1,
        createdAt: 1,
        updatedAt: 1,
        // Include metadata but exclude large fields
        'metadata.templateUsed': 1,
        'metadata.userAgent': 1,
        'metadata.ipAddress': 1,
        _id: 0
      }
    })

    // Execute aggregation
    const emailLogs = await EmailLog.aggregate(pipeline)

    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    // Get summary statistics
    const stats = await EmailLog.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const statusStats = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      data: emailLogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      },
      stats: {
        total: totalItems,
        pending: statusStats.pending || 0,
        sent: statusStats.sent || 0,
        failed: statusStats.failed || 0,
        bounced: statusStats.bounced || 0
      }
    })

  } catch (error) {
    console.error('Error fetching email logs:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
