import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Subscription } from '@/lib/types/subscription.types'
import { ApiResponse } from '@/lib/types/api.types'

// GET /api/subscriptions/current - Fetch current user's subscription
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await connectDB()
    const subscriptionsCollection = db.collection('subscriptions')

    const subscription = await subscriptionsCollection.findOne({
      userId: session.user.id,
      status: 'active'
    })

    const response: ApiResponse<Subscription | null> = {
      success: true,
      data: subscription
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching current subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch current subscription' },
      { status: 500 }
    )
  }
}
