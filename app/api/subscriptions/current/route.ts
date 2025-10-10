import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Subscription } from '@/lib/types/subscription.types'
import { ApiResponse } from '@/lib/types/api.types'

// GET /api/subscriptions/current - Fetch current user's subscription
export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = authResult
    await connectToDatabase()
    
    // TODO: This needs to be refactored to use Mongoose Subscription model
    return NextResponse.json({ 
      error: 'Please use the user profile API to check subscription status.' 
    }, { status: 503 })
    
    /*
    const subscriptionsCollection = db.collection('subscriptions')

    const subscription = await subscriptionsCollection.findOne({
      userId: userId,
      status: 'active'
    })

    const response: ApiResponse<Subscription | null> = {
      success: true,
      data: subscription
    }

    return NextResponse.json(response)
    */
  } catch (error) {
    console.error('Error fetching current subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch current subscription' },
      { status: 500 }
    )
  }
}
