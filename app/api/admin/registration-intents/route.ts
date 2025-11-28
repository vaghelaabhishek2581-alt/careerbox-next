import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongoose'
import RegistrationIntent from '@/src/models/RegistrationIntent'
import AdminInstitute from '@/src/models/AdminInstitute'

// Validation schemas
const registrationIntentsQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).default('1'),
  limit: z.string().transform(val => parseInt(val, 10)).default('20'),
  status: z.enum(['pending', 'approved', 'rejected', 'payment_required', 'completed']).optional(),
  type: z.enum(['institute', 'business']).optional(),
  search: z.string().optional(),
  dateRangeStart: z.string().optional(),
  dateRangeEnd: z.string().optional(),
  sortBy: z.enum(['createdAt', 'organizationName', 'status', 'updatedAt']).default('createdAt'),
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
    
    const validatedParams = registrationIntentsQuerySchema.parse(queryParams)
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
            { organizationName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { contactName: { $regex: search, $options: 'i' } },
            { contactPhone: { $regex: search, $options: 'i' } },
            { city: { $regex: search, $options: 'i' } },
            { state: { $regex: search, $options: 'i' } }
          ]
        }
      })
    }

    // Create sort stage (will be added after the $project stage)
    const sortStage: any = {}
    sortStage[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Get total count for pagination
    let totalItems = 0
    if (Object.keys(filter).length === 0 && !search) {
      // No filters, get total count directly
      totalItems = await RegistrationIntent.countDocuments({})
    } else {
      // With filters, get count with the same filter
      totalItems = await RegistrationIntent.countDocuments(filter)
    }

    // Lookup to check if institute exists in AdminInstitute
    pipeline.push({
      $lookup: {
        from: 'admininstitutes',
        localField: 'instituteId',
        foreignField: '_id',
        as: 'adminInstitute'
      }
    })

    // Add a field to indicate if it's an admin institute
    pipeline.push({
      $addFields: {
        isAdminInstitute: { $gt: [{ $size: '$adminInstitute' }, 0] }
      }
    })

    // Project only the fields we need
    pipeline.push({
      $project: {
        adminInstitute: 0 // Exclude the adminInstitute array from results
      }
    })

    // Sort stage (moved after the $project stage)
    pipeline.push({ $sort: sortStage })

    // Pagination
    const skip = (page - 1) * limit
    pipeline.push(
      { $skip: skip },
      { $limit: limit }
    )

    // Project final fields
    pipeline.push({
      $project: {
        id: { $toString: '$_id' },
        userId: { $toString: '$userId' },
        type: 1,
        status: 1,
        organizationName: 1,
        email: 1,
        contactName: 1,
        contactPhone: 1,
        address: 1,
        city: 1,
        state: 1,
        country: 1,
        zipCode: 1,
        description: 1,
        website: 1,
        establishmentYear: 1,
        adminNotes: 1,
        reviewedBy: 1,
        reviewedAt: 1,
        isAdminInstitute: 1,
        instituteId: 1,
        createdAt: 1,
        updatedAt: 1,
        _id: 0
      }
    })

    // Execute aggregation
    let registrationIntents = []
    
    try {
      registrationIntents = await RegistrationIntent.aggregate(pipeline)
    } catch (aggregationError) {
      console.error('Aggregation failed, trying simple find:', aggregationError)
      
      // Fallback to simple find query
      const simpleQuery = await RegistrationIntent.find(filter)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
      
      // Transform the data manually
      registrationIntents = simpleQuery.map((intent: any) => ({
        id: intent._id.toString(),
        userId: intent.userId.toString(),
        type: intent.type,
        status: intent.status,
        organizationName: intent.organizationName,
        email: intent.email,
        contactName: intent.contactName,
        contactPhone: intent.contactPhone,
        address: intent.address,
        city: intent.city,
        state: intent.state,
        country: intent.country,
        zipCode: intent.zipCode,
        description: intent.description,
        website: intent.website,
        establishmentYear: intent.establishmentYear,
        instituteId: intent.instituteId,
        adminNotes: intent.adminNotes,
        reviewedBy: intent.reviewedBy,
        reviewedAt: intent.reviewedAt,
        createdAt: intent.createdAt,
        updatedAt: intent.updatedAt
      }))
    }

    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: registrationIntents,
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
    console.error('Error fetching admin registration intents:', error)
    
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
