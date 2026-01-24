import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongoose'
import Subscription from '@/src/models/Subscription'
import User from '@/src/models/User'

// Validation schema
const grantSubscriptionSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  organizationType: z.enum(['institute', 'business']),
  planType: z.enum(['free', 'basic', 'premium', 'enterprise']),
  reason: z.string().min(1, 'Reason is required'),
  duration: z.number().min(1).max(60).default(12), // Duration in months, default 12
})

export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json()
    const validatedData = grantSubscriptionSchema.parse(body)
    const { userId, organizationType, planType, reason, duration } = validatedData

    await connectToDatabase()

    // Find the user
    const targetUser = await User.findById(userId)
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await Subscription.updateMany(
      { userId: userId, status: 'active' },
      { $set: { status: 'inactive', isActive: false, updatedAt: new Date() } }
    )

    // Calculate end date
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + duration)

    const subscription = new Subscription({
      userId: userId,
      organizationId: userId,
      organizationType: organizationType,
      planName: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan`,
      planType: planType,
      billingCycle: duration >= 12 ? 'yearly' : 'monthly',
      status: 'active',
      amount: 0,
      currency: 'INR',
      startDate: startDate,
      endDate: endDate,
      grantedBy: user._id,
      grantReason: reason,
      createdAt: new Date(),
    })

    await subscription.save()

    // Update user subscription status and roles
    const roleToAdd = organizationType === 'institute' ? 'institute' : 'business'
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          subscriptionActive: true,
          activeRole: roleToAdd,
          updatedAt: new Date(),
        },
        $addToSet: {
          roles: roleToAdd,
        },
      },
      { new: true }
    )

    // Transform subscription for response
    const responseSubscription = {
      id: subscription.id,
      userId: subscription.userId.toString(),
      organizationId: subscription.organizationId.toString(),
      organizationType: subscription.organizationType,
      planName: subscription.planName,
      planType: subscription.planType,
      status: subscription.status,
      amount: subscription.amount,
      currency: subscription.currency,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      grantedBy: subscription.grantedBy,
      grantReason: subscription.grantReason,
      createdAt: subscription.createdAt,
    }

    return NextResponse.json({
      success: true,
      message: `${planType} subscription granted successfully`,
      data: responseSubscription,
      user: {
        id: updatedUser._id.toString(),
        email: updatedUser.email,
        roles: updatedUser.roles,
        activeRole: updatedUser.activeRole,
        subscriptionActive: updatedUser.subscriptionActive,
      },
    })

  } catch (error) {
    console.error('Error granting subscription:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
