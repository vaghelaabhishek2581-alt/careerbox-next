import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Business } from '@/lib/types/business.types'
import { ApiResponse } from '@/lib/types/api.types'

// GET /api/businesses/my-business - Fetch current user's business
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await connectDB()
    const businessesCollection = db.collection('businesses')

    const business = await businessesCollection.findOne({ userId: session.user.id })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const response: ApiResponse<Business> = {
      success: true,
      data: business
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching my business:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business' },
      { status: 500 }
    )
  }
}
