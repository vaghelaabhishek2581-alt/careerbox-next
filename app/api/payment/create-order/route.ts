import { NextRequest, NextResponse } from 'next/server'
import { createPaymentOrder } from '@/lib/payment/razorpay'
import { connectToDatabase } from '@/lib/db/mongodb'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { z } from 'zod'

const createOrderSchema = z.object({
  planType: z.enum(['BUSINESS', 'INSTITUTE', 'STUDENT_PREMIUM']).optional(),
  billingCycle: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
  // For registration intent payments
  amount: z.number().optional(),
  currency: z.string().optional(),
  registrationIntentId: z.string().optional(),
  subscriptionPlan: z.string().optional()
})

export async function POST (request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request)

    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, user } = authResult

    const body = await request.json()
    const {
      planType,
      billingCycle,
      amount,
      currency,
      registrationIntentId,
      subscriptionPlan
    } = createOrderSchema.parse(body)
    const effectiveBillingCycle =
      planType === 'INSTITUTE' ? 'YEARLY' : billingCycle || 'YEARLY'

    const { db } = await connectToDatabase()

    // Handle registration intent payment
    if (registrationIntentId && amount) {
      // Create payment order for registration intent
      const orderResult = await createPaymentOrder(
        planType || 'INSTITUTE',
        planType === 'INSTITUTE' ? 'YEARLY' : billingCycle || 'YEARLY',
        userId,
        user?.email || '',
        user?.name || '',
        amount
      )

      if (!orderResult.success) {
        return NextResponse.json({ error: orderResult.error }, { status: 500 })
      }

      // Store order in database with registration intent details
      await db.collection('payment_orders').insertOne({
        orderId: orderResult.orderId,
        userId: userId,
        planType: planType || 'INSTITUTE',
        billingCycle:
          planType === 'INSTITUTE' ? 'YEARLY' : billingCycle || 'YEARLY',
        amount: orderResult.amount,
        currency: orderResult.currency,
        registrationIntentId,
        subscriptionPlan,
        status: 'created',
        createdAt: new Date(),
        updatedAt: new Date()
      })

      return NextResponse.json({
        success: true,
        data: {
          orderId: orderResult.orderId,
          amount: orderResult.amount,
          currency: orderResult.currency,
          key: process.env.RAZORPAY_KEY_ID
        }
      })
    }

    // Handle regular subscription payment
    if (!planType || !effectiveBillingCycle) {
      return NextResponse.json(
        {
          error:
            'planType and billingCycle are required for regular subscriptions'
        },
        { status: 400 }
      )
    }

    // Create payment order
    const orderResult = await createPaymentOrder(
      planType,
      effectiveBillingCycle,
      userId,
      user?.email || '',
      user?.name || ''
    )

    if (!orderResult.success) {
      return NextResponse.json({ error: orderResult.error }, { status: 500 })
    }

    // Store order in database
    await db.collection('payment_orders').insertOne({
      orderId: orderResult.orderId,
      userId: userId,
      planType,
      billingCycle: effectiveBillingCycle,
      amount: orderResult.amount,
      currency: orderResult.currency,
      status: 'created',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      orderId: orderResult.orderId,
      amount: orderResult.amount,
      currency: orderResult.currency,
      key: process.env.RAZORPAY_KEY_ID
    })
  } catch (error) {
    console.error('Error creating payment order:', error)

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
