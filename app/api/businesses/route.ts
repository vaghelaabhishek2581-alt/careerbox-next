import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Business as BusinessModel } from '@/src/models'
import { Business, CreateBusinessRequest } from '@/lib/types/business.types'
import { ApiResponse, PaginatedResponse } from '@/lib/types/api.types'

// GET /api/businesses - Fetch businesses
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    await connectToDatabase()

    // Build query
    const query: any = { status: 'active' }
    if (status) query.status = status

    // Calculate pagination
    const skip = (page - 1) * limit
    const total = await BusinessModel.countDocuments(query)
    const businesses = await BusinessModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const response: PaginatedResponse<Business> = {
      data: businesses,
      total,
      page,
      limit,
      hasMore: skip + businesses.length < total
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching businesses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    )
  }
}

// POST /api/businesses - Create a new business
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const businessData: CreateBusinessRequest = await req.json()
    await connectToDatabase()

    // Check if user already has a business
    const existingBusiness = await BusinessModel.findOne({ userId: session.user.id })
    if (existingBusiness) {
      return NextResponse.json({ error: 'User already has a business profile' }, { status: 400 })
    }

    // Create business
    const business = new BusinessModel({
      userId: session.user.id,
      companyName: businessData.companyName,
      industry: businessData.industry,
      size: businessData.size,
      website: businessData.website,
      description: businessData.description,
      logo: businessData.logo,
      address: businessData.address,
      contactInfo: businessData.contactInfo,
      socialMedia: businessData.socialMedia,
      foundedYear: businessData.foundedYear,
      employeeCount: businessData.employeeCount,
      revenue: businessData.revenue,
      isVerified: false,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const savedBusiness = await business.save()

    const response: ApiResponse<Business> = {
      success: true,
      data: savedBusiness.toObject(),
      message: 'Business profile created successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating business:', error)
    return NextResponse.json(
      { error: 'Failed to create business' },
      { status: 500 }
    )
  }
}
