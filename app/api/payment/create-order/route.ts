import { NextRequest, NextResponse } from 'next/server';
import { createPaymentOrder } from '@/lib/payment/razorpay';
import { connectToDatabase } from '@/lib/db/mongodb';
import { getAuthenticatedUser } from '@/lib/auth/unified-auth';
import { z } from 'zod';

const createOrderSchema = z.object({
  planType: z.enum(['BUSINESS', 'INSTITUTE', 'STUDENT_PREMIUM']),
  billingCycle: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY'])
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);

    if (!authResult) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId, user } = authResult;

    const body = await request.json();
    const { planType, billingCycle } = createOrderSchema.parse(body);

    const { db } = await connectToDatabase();

    // Check if user already has an active subscription
    const existingSubscription = await db.collection('subscriptions').findOne({
      userId: userId,
      status: 'active'
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 400 }
      );
    }

    // Create payment order
    const orderResult = await createPaymentOrder(
      planType,
      billingCycle,
      userId,
      user?.email || '',
      user?.name || ''
    );

    if (!orderResult.success) {
      return NextResponse.json(
        { error: orderResult.error },
        { status: 500 }
      );
    }

    // Store order in database
    await db.collection('payment_orders').insertOne({
      orderId: orderResult.orderId,
      userId: userId,
      planType,
      billingCycle,
      amount: orderResult.amount,
      currency: orderResult.currency,
      status: 'created',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      orderId: orderResult.orderId,
      amount: orderResult.amount,
      currency: orderResult.currency,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Error creating payment order:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
