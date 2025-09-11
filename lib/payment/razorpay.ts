import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Payment plan configurations
export const PAYMENT_PLANS = {
  BUSINESS: {
    MONTHLY: {
      amount: 2999 * 100, // ₹2999 in paise
      currency: 'INR',
      name: 'Business Plan - Monthly',
      description: 'Business subscription for 1 month',
      features: [
        'Job posting and management',
        'Candidate screening tools',
        'Exam creation for hiring',
        'Analytics dashboard',
        'Email support'
      ]
    },
    QUARTERLY: {
      amount: 7999 * 100, // ₹7999 in paise (save ₹1000)
      currency: 'INR',
      name: 'Business Plan - Quarterly',
      description: 'Business subscription for 3 months',
      features: [
        'Job posting and management',
        'Candidate screening tools',
        'Exam creation for hiring',
        'Analytics dashboard',
        'Priority support',
        'Advanced analytics'
      ]
    },
    YEARLY: {
      amount: 29999 * 100, // ₹29999 in paise (save ₹6000)
      currency: 'INR',
      name: 'Business Plan - Yearly',
      description: 'Business subscription for 12 months',
      features: [
        'Job posting and management',
        'Candidate screening tools',
        'Exam creation for hiring',
        'Analytics dashboard',
        'Priority support',
        'Advanced analytics',
        'Custom branding',
        'API access'
      ]
    }
  },
  INSTITUTE: {
    MONTHLY: {
      amount: 4999 * 100, // ₹4999 in paise
      currency: 'INR',
      name: 'Institute Plan - Monthly',
      description: 'Institute subscription for 1 month',
      features: [
        'Course creation and management',
        'Student enrollment system',
        'Exam creation for admissions',
        'Academic analytics',
        'Email support'
      ]
    },
    QUARTERLY: {
      amount: 12999 * 100, // ₹12999 in paise (save ₹2000)
      currency: 'INR',
      name: 'Institute Plan - Quarterly',
      description: 'Institute subscription for 3 months',
      features: [
        'Course creation and management',
        'Student enrollment system',
        'Exam creation for admissions',
        'Academic analytics',
        'Priority support',
        'Advanced reporting'
      ]
    },
    YEARLY: {
      amount: 49999 * 100, // ₹49999 in paise (save ₹10000)
      currency: 'INR',
      name: 'Institute Plan - Yearly',
      description: 'Institute subscription for 12 months',
      features: [
        'Course creation and management',
        'Student enrollment system',
        'Exam creation for admissions',
        'Academic analytics',
        'Priority support',
        'Advanced reporting',
        'Custom portal',
        'Bulk operations'
      ]
    }
  },
  STUDENT_PREMIUM: {
    MONTHLY: {
      amount: 299 * 100, // ₹299 in paise
      currency: 'INR',
      name: 'Premium Student - Monthly',
      description: 'Premium student features for 1 month',
      features: [
        'Unlimited job applications',
        'Advanced profile features',
        'Priority support',
        'Skill assessments',
        'Career guidance'
      ]
    },
    QUARTERLY: {
      amount: 799 * 100, // ₹799 in paise (save ₹100)
      currency: 'INR',
      name: 'Premium Student - Quarterly',
      description: 'Premium student features for 3 months',
      features: [
        'Unlimited job applications',
        'Advanced profile features',
        'Priority support',
        'Skill assessments',
        'Career guidance',
        'Mentorship access'
      ]
    },
    YEARLY: {
      amount: 2999 * 100, // ₹2999 in paise (save ₹600)
      currency: 'INR',
      name: 'Premium Student - Yearly',
      description: 'Premium student features for 12 months',
      features: [
        'Unlimited job applications',
        'Advanced profile features',
        'Priority support',
        'Skill assessments',
        'Career guidance',
        'Mentorship access',
        'Exclusive events',
        'Premium courses'
      ]
    }
  }
};

// Payment methods supported
export const PAYMENT_METHODS = {
  CARD: 'card',
  UPI: 'upi',
  NETBANKING: 'netbanking',
  WALLET: 'wallet',
  EMI: 'emi'
};

// Create payment order
export async function createPaymentOrder(
  planType: 'BUSINESS' | 'INSTITUTE' | 'STUDENT_PREMIUM',
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
  userId: string,
  userEmail: string,
  userName: string
) {
  const plan = PAYMENT_PLANS[planType][billingCycle];
  
  const options = {
    amount: plan.amount,
    currency: plan.currency,
    receipt: `receipt_${userId}_${Date.now()}`,
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

// Calculate refund amount based on usage
export function calculateRefundAmount(
  totalAmount: number,
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
  daysUsed: number
): number {
  const totalDays = billingCycle === 'MONTHLY' ? 30 : 
                   billingCycle === 'QUARTERLY' ? 90 : 365;
  
  const usedAmount = (totalAmount * daysUsed) / totalDays;
  const refundAmount = totalAmount - usedAmount;
  
  return Math.max(0, Math.floor(refundAmount));
}

// Payment status constants
export const PAYMENT_STATUS = {
  CREATED: 'created',
  AUTHORIZED: 'authorized',
  CAPTURED: 'captured',
  REFUNDED: 'refunded',
  FAILED: 'failed'
};

// Subscription status constants
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  PENDING: 'pending'
};
