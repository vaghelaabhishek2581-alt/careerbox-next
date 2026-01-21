import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongoose'
import Subscription from '@/src/models/Subscription'
import User from '@/src/models/User'
import { ApiResponse } from '@/lib/types/api.types'

// PATCH /api/admin/subscriptions/[subscriptionId]/status
// Updates subscription status and isActive flag; syncs User.subscriptionActive accordingly
const updateStatusSchema = z.object({
  status: z.enum(['active', 'inactive', 'cancelled', 'expired', 'suspended']),
  reason: z.string().optional()
})

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    const auth = await getAuthenticatedUser(req)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subscriptionId } = await context.params
    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 })
    }

    const body = await req.json()
    const parsed = updateStatusSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body', details: parsed.error.errors }, { status: 400 })
    }

    const { status } = parsed.data

    await connectToDatabase()

    // Find subscription
    const subscription = await Subscription.findById(subscriptionId)
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Update status and active flag
    const isActive = status === 'active'
    subscription.status = status
    // Ensure boolean field mirrors status
    ;(subscription as any).isActive = isActive
    subscription.updatedAt = new Date()

    await subscription.save()

    // Sync user.subscriptionActive based on any active subscriptions remaining
    const userId = subscription.userId?.toString()
    if (userId) {
      const anyActive = await Subscription.exists({ userId, status: 'active' })
      await User.findByIdAndUpdate(
        userId,
        { $set: { subscriptionActive: Boolean(anyActive), updatedAt: new Date() } },
        { new: true }
      )
    }

    const responseSubscription = {
      id: subscription._id.toString(),
      userId: subscription.userId?.toString() || '',
      organizationId: subscription.organizationId?.toString() || '',
      organizationType: subscription.organizationType,
      planName: subscription.planName,
      planType: subscription.planType,
      status: subscription.status,
      isActive,
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
      data: responseSubscription,
      message: 'Subscription status updated successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating subscription status:', error)
    return NextResponse.json({ error: 'Failed to update subscription status' }, { status: 500 })
  }
}