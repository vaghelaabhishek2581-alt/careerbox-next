import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import { IBusiness } from '@/lib/types/business.types'
import { ApiResponse } from '@/lib/types/api.types'
import { Business } from '@/src/models'

// GET /api/businesses/my-business - Fetch current user's business
export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = authResult
    await connectToDatabase()

    const businessDoc = await Business.findOne({ userId }).lean().exec()

    if (!businessDoc) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Type assertion for lean document
    const business = businessDoc as unknown as IBusiness

    const response: ApiResponse<IBusiness> = {
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
