import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import Payment from '@/src/models/Payment'
import User from '@/src/models/User'
import Profile from '@/src/models/Profile'

// Validation schemas
const paymentsQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).default('1'),
  limit: z.string().transform(val => parseInt(val, 10)).default('20'),
  status: z.enum(['created', 'pending', 'paid', 'failed', 'cancelled', 'refunded']).optional(),
  planType: z.enum(['free', 'basic', 'premium', 'enterprise']).optional(),
  organizationType: z.enum(['institute', 'business']).optional(),
  search: z.string().optional(),
  dateRangeStart: z.string().optional(),
  dateRangeEnd: z.string().optional(),
  sortBy: z.enum(['createdAt', 'amount', 'status', 'paidAt']).default('createdAt'),
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

    const validatedParams = paymentsQuerySchema.parse(queryParams)
    const {
      page,
      limit,
      status,
      planType,
      organizationType,
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

    if (planType) {
      filter.planType = planType
    }

    if (organizationType) {
      filter.organizationType = organizationType
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

    // Lookup user information
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    })

    // Lookup profile information for organization name
    pipeline.push({
      $lookup: {
        from: 'profiles',
        localField: 'userId',
        foreignField: 'userId',
        as: 'profile'
      }
    })

    // Add computed fields
    pipeline.push({
      $addFields: {
        user: { $arrayElemAt: ['$user', 0] },
        profile: { $arrayElemAt: ['$profile', 0] },
        userEmail: { $arrayElemAt: ['$user.email', 0] },
        userName: {
          $concat: [
            { $ifNull: [{ $arrayElemAt: ['$profile.personalDetails.firstName', 0] }, ''] },
            ' ',
            { $ifNull: [{ $arrayElemAt: ['$profile.personalDetails.lastName', 0] }, ''] }
          ]
        }
      }
    })

    // Search functionality
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { userEmail: { $regex: search, $options: 'i' } },
            { userName: { $regex: search, $options: 'i' } },
            { orderId: { $regex: search, $options: 'i' } },
            { paymentId: { $regex: search, $options: 'i' } },
            { organizationName: { $regex: search, $options: 'i' } }
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
    const countResult = await Payment.aggregate(countPipeline)
    const totalItems = countResult[0]?.total || 0

    // Add pagination
    const skip = (page - 1) * limit
    pipeline.push({ $skip: skip })
    pipeline.push({ $limit: limit })

    // Project final fields
    pipeline.push({
      $project: {
        id: { $toString: '$_id' },
        userId: { $toString: '$userId' },
        userEmail: 1,
        userName: 1,
        organizationName: 1,
        organizationType: 1,
        orderId: 1,
        paymentId: 1,
        amount: 1,
        currency: 1,
        status: 1,
        paymentMethod: 1,
        planType: 1,
        planDuration: 1,
        subscriptionId: { $toString: '$subscriptionId' },
        razorpayOrderId: 1,
        razorpayPaymentId: 1,
        failureReason: 1,
        refundId: 1,
        refundAmount: 1,
        refundReason: 1,
        createdAt: 1,
        updatedAt: 1,
        paidAt: 1,
        _id: 0
      }
    })

    // Execute aggregation
    const payments = await Payment.aggregate(pipeline)

    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: payments,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      }
    })

  } catch (error) {
    console.error('Error fetching admin payments:', error)

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
