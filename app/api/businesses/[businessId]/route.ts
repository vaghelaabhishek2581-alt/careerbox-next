import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Business, UpdateBusinessRequest } from '@/lib/types/business.types'
import { ApiResponse } from '@/lib/types/api.types'

// GET /api/businesses/[businessId] - Fetch business by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { businessId } = params
    const db = await connectDB()
    const businessesCollection = db.collection('businesses')

    const business = await businessesCollection.findOne({ id: businessId })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const response: ApiResponse<Business> = {
      success: true,
      data: business
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching business:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business' },
      { status: 500 }
    )
  }
}

// PUT /api/businesses/[businessId] - Update business
export async function PUT(
  req: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { businessId } = params
    const updateData: UpdateBusinessRequest = await req.json()
    const db = await connectDB()
    const businessesCollection = db.collection('businesses')

    const business = await businessesCollection.findOne({ id: businessId })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Check if user can update this business
    if (session.user.role !== 'admin' && business.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updatedBusiness = {
      ...business,
      ...updateData,
      updatedAt: new Date()
    }

    await businessesCollection.updateOne(
      { id: businessId },
      { $set: updatedBusiness }
    )

    const response: ApiResponse<Business> = {
      success: true,
      data: updatedBusiness,
      message: 'Business updated successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating business:', error)
    return NextResponse.json(
      { error: 'Failed to update business' },
      { status: 500 }
    )
  }
}
