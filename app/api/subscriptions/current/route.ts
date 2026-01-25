import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase as connectMongoose } from '@/lib/db/mongoose'
import SubscriptionModel from '@/src/models/Subscription'
import { ApiResponse } from '@/lib/types/api.types'

// GET /api/subscriptions/current - Fetch current user's subscription
export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectMongoose()
    const sub = await SubscriptionModel.findOne({ userId: authResult.userId, status: 'active' })
      .sort({ createdAt: -1 })
      .exec()

    if (!sub) {
      const response: ApiResponse<null> = {
        success: true,
        data: null,
        message: 'No active subscription'
      }
      return NextResponse.json(response)
    }

    const response: ApiResponse<any> = {
      success: true,
      data: {
        id: sub.id,
        userId: sub.userId?.toString(),
        organizationId: sub.organizationId?.toString(),
        organizationType: sub.organizationType,
        planName: sub.planName,
        planType: sub.planType,
        status: sub.status,
        startDate: sub.startDate,
        endDate: sub.endDate,
        isActive: sub.status === 'active'
      }
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
