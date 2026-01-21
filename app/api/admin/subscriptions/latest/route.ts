import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongoose'
import Subscription from '@/src/models/Subscription'
import { ApiResponse } from '@/lib/types/api.types'

// GET /api/admin/subscriptions/latest?userId=...
// Returns the most recent subscription for a given user (admin-only), regardless of status
export async function GET (req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    await connectToDatabase()

    const subscription = await Subscription.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean<{
        _id: { toString(): string }
        userId?: { toString(): string }
        organizationId?: { toString(): string }
        organizationType?: string
        planName: string
        planType: string
        status: string
        amount?: number
        currency?: string
        startDate?: Date
        endDate?: Date
        grantedBy?: string
        grantReason?: string
        createdAt: Date
      }>()
      .exec()

    if (!subscription) {
      const response: ApiResponse<null> = {
        success: true,
        data: null,
        message: 'No subscription found'
      }
      return NextResponse.json(response)
    }

    const responseSubscription = {
      id: subscription._id.toString(),
      userId: subscription.userId?.toString() || '',
      organizationId: subscription.organizationId?.toString() || '',
      organizationType: subscription.organizationType,
      planName: subscription.planName,
      planType: subscription.planType,
      status: subscription.status,
      isActive: subscription.status === 'active',
      amount: subscription.amount,
      currency: subscription.currency,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      grantedBy: subscription.grantedBy,
      grantReason: subscription.grantReason,
      createdAt: subscription.createdAt
    }

    const response: ApiResponse<typeof responseSubscription> = {
      success: true,
      data: responseSubscription
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching latest subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch latest subscription' },
      { status: 500 }
    )
  }
}
