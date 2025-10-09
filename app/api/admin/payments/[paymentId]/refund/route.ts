import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import Payment from '@/src/models/Payment'
import Razorpay from 'razorpay'

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// Validation schema
const refundSchema = z.object({
  amount: z.number().positive().optional(), // If not provided, full refund
  reason: z.string().min(1, 'Refund reason is required'),
  notes: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
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
    const validatedData = refundSchema.parse(body)
    const { amount, reason, notes } = validatedData

    await connectToDatabase()

    // Find the payment
    const payment = await Payment.findById(params.paymentId)
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Check if payment is eligible for refund
    if (payment.status !== 'paid') {
      return NextResponse.json(
        { error: 'Only paid payments can be refunded' },
        { status: 400 }
      )
    }

    if (payment.status === 'refunded') {
      return NextResponse.json(
        { error: 'Payment has already been refunded' },
        { status: 400 }
      )
    }

    if (!payment.razorpayPaymentId) {
      return NextResponse.json(
        { error: 'No Razorpay payment ID found for this payment' },
        { status: 400 }
      )
    }

    // Calculate refund amount (full refund if amount not specified)
    const refundAmount = amount || payment.amount

    // Validate refund amount
    if (refundAmount > payment.amount) {
      return NextResponse.json(
        { error: 'Refund amount cannot exceed payment amount' },
        { status: 400 }
      )
    }

    // Process refund with Razorpay
    try {
      const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
        amount: Math.round(refundAmount * 100), // Convert to paise
        notes: {
          reason,
          admin_notes: notes || '',
          refunded_by: user.email,
          refunded_at: new Date().toISOString(),
        },
      })

      // Update payment record
      const updatedPayment = await Payment.findByIdAndUpdate(
        params.paymentId,
        {
          $set: {
            status: 'refunded',
            refundId: refund.id,
            refundAmount: refundAmount,
            refundReason: reason,
            updatedAt: new Date(),
          },
        },
        { new: true }
      )

      // Populate user information for response
      await updatedPayment.populate('userId', 'email')

      // Transform for response
      const responsePayment = {
        id: updatedPayment._id.toString(),
        userId: updatedPayment.userId._id.toString(),
        userEmail: updatedPayment.userId.email,
        userName: updatedPayment.userName || '',
        organizationName: updatedPayment.organizationName,
        organizationType: updatedPayment.organizationType,
        orderId: updatedPayment.orderId,
        paymentId: updatedPayment.paymentId,
        amount: updatedPayment.amount,
        currency: updatedPayment.currency,
        status: updatedPayment.status,
        paymentMethod: updatedPayment.paymentMethod,
        planType: updatedPayment.planType,
        planDuration: updatedPayment.planDuration,
        subscriptionId: updatedPayment.subscriptionId?.toString(),
        razorpayOrderId: updatedPayment.razorpayOrderId,
        razorpayPaymentId: updatedPayment.razorpayPaymentId,
        refundId: updatedPayment.refundId,
        refundAmount: updatedPayment.refundAmount,
        refundReason: updatedPayment.refundReason,
        createdAt: updatedPayment.createdAt,
        updatedAt: updatedPayment.updatedAt,
        paidAt: updatedPayment.paidAt,
      }

      return NextResponse.json({
        success: true,
        message: 'Refund processed successfully',
        data: responsePayment,
        refund: {
          id: refund.id,
          amount: refund.amount ? refund.amount / 100 : refundAmount, // Convert back to rupees or use our calculated amount
          status: refund.status,
          created_at: refund.created_at,
        },
      })

    } catch (razorpayError: any) {
      console.error('Razorpay refund error:', razorpayError)

      return NextResponse.json(
        {
          error: 'Failed to process refund with payment gateway',
          details: razorpayError.error?.description || 'Unknown error'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error processing refund:', error)

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
