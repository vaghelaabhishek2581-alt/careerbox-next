import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature, getPaymentDetails, calculateRefundAmount } from '@/lib/payment/razorpay';
import { connectToDatabase } from '@/lib/db/mongodb';
import { getAuthenticatedUser } from '@/lib/auth/unified-auth';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string()
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
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = verifyPaymentSchema.parse(body);

    const { db } = await connectToDatabase();

    // Verify payment signature
    const isValidSignature = verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Get payment details from Razorpay
    const paymentResult = await getPaymentDetails(razorpayPaymentId);
    
    if (!paymentResult.success) {
      return NextResponse.json(
        { error: 'Failed to verify payment' },
        { status: 500 }
      );
    }

    const payment = paymentResult.payment;
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment details not found' },
        { status: 404 }
      );
    }

    // Get order details from database
    const order = await db.collection('payment_orders').findOne({
      orderId: razorpayOrderId,
      userId: userId
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if payment is already processed
    if (order.status === 'completed') {
      return NextResponse.json(
        { error: 'Payment already processed' },
        { status: 400 }
      );
    }

    // Calculate subscription end date
    const startDate = new Date();
    const endDate = new Date();
    
    switch (order.billingCycle) {
      case 'MONTHLY':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'QUARTERLY':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'YEARLY':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    // Create or update subscription
    const subscription = {
      userId: userId,
      planType: order.planType,
      billingCycle: order.billingCycle,
      status: 'active',
      startDate,
      endDate,
      amount: order.amount,
      currency: order.currency,
      paymentId: razorpayPaymentId,
      orderId: razorpayOrderId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('subscriptions').updateOne(
      { userId: userId },
      { $set: subscription },
      { upsert: true }
    );

    // Update user role based on subscription
    const userRole = order.planType === 'BUSINESS' ? 'business' : 
                    order.planType === 'INSTITUTE' ? 'institute' : 'user';

    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          role: userRole,
          activeRole: userRole,
          subscriptionActive: true,
          updatedAt: new Date()
        },
        $addToSet: {
          roles: userRole
        }
      }
    );

    // Update order status
    await db.collection('payment_orders').updateOne(
      { orderId: razorpayOrderId },
      { 
        $set: { 
          status: 'completed',
          paymentId: razorpayPaymentId,
          completedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    // Create payment record
    await db.collection('payments').insertOne({
      userId: userId,
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      amount: order.amount,
      currency: order.currency,
      planType: order.planType,
      billingCycle: order.billingCycle,
      status: 'completed',
      razorpayPaymentId: payment.id,
      razorpayOrderId: payment.order_id,
      method: payment.method,
      bank: payment.bank,
      wallet: payment.wallet,
      vpa: payment.vpa,
      email: payment.email,
      contact: payment.contact,
      createdAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      subscription: {
        planType: order.planType,
        billingCycle: order.billingCycle,
        status: 'active',
        endDate
      }
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    
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
