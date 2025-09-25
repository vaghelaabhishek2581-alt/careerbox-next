import Razorpay from 'razorpay';
import crypto from 'crypto';
import { PAYMENT_PLANS } from './plans';

// Initialize Razorpay (server-side only)
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Re-export payment plans for server-side use
export { PAYMENT_PLANS } from './plans';

// Create payment order
export async function createPaymentOrder(
  planType: 'BUSINESS' | 'INSTITUTE' | 'STUDENT_PREMIUM',
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
  userId: string,
  userEmail: string,
  userName: string
) {
  const plan = PAYMENT_PLANS[planType][billingCycle];
  
  // Generate a short receipt (max 40 chars for Razorpay)
  // Use last 8 chars of userId + timestamp in base36 for brevity
  const shortUserId = userId.slice(-8);
  const shortTimestamp = Date.now().toString(36);
  const receipt = `rcpt_${shortUserId}_${shortTimestamp}`;
  
  console.log(`Generated receipt: ${receipt} (length: ${receipt.length})`);
  
  const options = {
    amount: plan.amount,
    currency: plan.currency,
    receipt: receipt,
    notes: {
      userId,
      planType,
      billingCycle,
      userName,
      userEmail
    }
  };

  try {
    const order = await razorpay.orders.create(options);
    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    };
  } catch (error) {
    console.error('Error creating payment order:', error);
    return {
      success: false,
      error: 'Failed to create payment order'
    };
  }
}

// Verify payment signature
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest('hex');

  return expectedSignature === razorpaySignature;
}

// Create refund
export async function createRefund(
  paymentId: string,
  amount?: number,
  notes?: Record<string, string>
) {
  try {
    const refundOptions: any = {
      payment_id: paymentId,
      notes: notes || {}
    };

    if (amount) {
      refundOptions.amount = amount;
    }

    const refund = await razorpay.payments.refund(paymentId, refundOptions);
    return {
      success: true,
      refundId: refund.id,
      amount: refund.amount,
      status: refund.status
    };
  } catch (error) {
    console.error('Error creating refund:', error);
    return {
      success: false,
      error: 'Failed to create refund'
    };
  }
}

// Get payment details
export async function getPaymentDetails(paymentId: string) {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return {
      success: true,
      payment
    };
  } catch (error) {
    console.error('Error fetching payment details:', error);
    return {
      success: false,
      error: 'Failed to fetch payment details'
    };
  }
}

// Get order details
export async function getOrderDetails(orderId: string) {
  try {
    const order = await razorpay.orders.fetch(orderId);
    return {
      success: true,
      order
    };
  } catch (error) {
    console.error('Error fetching order details:', error);
    return {
      success: false,
      error: 'Failed to fetch order details'
    };
  }
}


// Re-export constants for server-side use
export { PAYMENT_STATUS, SUBSCRIPTION_STATUS, calculateRefundAmount } from './plans';
