import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Subscription, CreateSubscriptionRequest } from '@/lib/types/subscription.types'
import { ApiResponse } from '@/lib/types/api.types'

// POST /api/subscriptions - Create a new subscription
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscriptionData: CreateSubscriptionRequest = await req.json()
    const db = await connectDB()
    const subscriptionsCollection = db.collection('subscriptions')
    const usersCollection = db.collection('users')

    // Check if user already has an active subscription
    const existingSubscription = await subscriptionsCollection.findOne({
      userId: session.user.id,
      status: 'active'
    })

    if (existingSubscription) {
      return NextResponse.json({ error: 'User already has an active subscription' }, { status: 400 })
    }

    // Process payment (mock implementation)
    const paymentResult = await processSubscriptionPayment(
      subscriptionData.plan,
      subscriptionData.interval,
      subscriptionData.paymentMethodId
    )

    if (!paymentResult.success) {
      return NextResponse.json({ error: 'Payment failed' }, { status: 400 })
    }

    // Create subscription
    const subscription: Subscription = {
      id: crypto.randomUUID(),
      userId: session.user.id,
      plan: subscriptionData.plan,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + (subscriptionData.interval === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
      autoRenew: true,
      features: getPlanFeatures(subscriptionData.plan),
      limits: getPlanLimits(subscriptionData.plan),
      billingInfo: {
        amount: getPlanPrice(subscriptionData.plan, subscriptionData.interval),
        currency: 'USD',
        interval: subscriptionData.interval,
        nextBillingDate: new Date(Date.now() + (subscriptionData.interval === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000)
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await subscriptionsCollection.insertOne(subscription)

    // Update user role
    const newRole = getRoleFromPlan(subscriptionData.plan)
    await usersCollection.updateOne(
      { id: session.user.id },
      { $set: { role: newRole, subscriptionId: subscription.id } }
    )

    // Convert lead if provided
    if (subscriptionData.leadId) {
      await convertLeadToActiveSubscription(subscriptionData.leadId, subscription.id)
    }

    const response: ApiResponse<Subscription> = {
      success: true,
      data: subscription,
      message: 'Subscription created successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

async function processSubscriptionPayment(plan: string, interval: string, paymentMethodId: string) {
  // Mock payment processing
  // In a real implementation, this would integrate with Stripe, PayPal, etc.
  return { success: true, transactionId: crypto.randomUUID() }
}

function getPlanFeatures(plan: string): string[] {
  const features: Record<string, string[]> = {
    business_basic: ['job_posting', 'candidate_management', 'basic_analytics'],
    business_pro: ['job_posting', 'candidate_management', 'advanced_analytics', 'exam_creation', 'priority_support'],
    institute_basic: ['course_creation', 'student_management', 'basic_analytics'],
    institute_pro: ['course_creation', 'student_management', 'advanced_analytics', 'exam_creation', 'priority_support']
  }
  return features[plan] || []
}

function getPlanLimits(plan: string) {
  const limits: Record<string, any> = {
    business_basic: { jobPosts: 5, examPosts: 2, applicantViews: 100, analyticsAccess: true },
    business_pro: { jobPosts: -1, examPosts: -1, applicantViews: -1, analyticsAccess: true },
    institute_basic: { coursePosts: 3, examPosts: 2, applicantViews: 50, analyticsAccess: true },
    institute_pro: { coursePosts: -1, examPosts: -1, applicantViews: -1, analyticsAccess: true }
  }
  return limits[plan] || { analyticsAccess: false }
}

function getPlanPrice(plan: string, interval: string): number {
  const prices: Record<string, { monthly: number; yearly: number }> = {
    business_basic: { monthly: 29.99, yearly: 299.99 },
    business_pro: { monthly: 99.99, yearly: 999.99 },
    institute_basic: { monthly: 39.99, yearly: 399.99 },
    institute_pro: { monthly: 129.99, yearly: 1299.99 }
  }
  return prices[plan]?.[interval as 'monthly' | 'yearly'] || 0
}

function getRoleFromPlan(plan: string): string {
  if (plan.startsWith('business_')) return 'business'
  if (plan.startsWith('institute_')) return 'institute'
  return 'user'
}

async function convertLeadToActiveSubscription(leadId: string, subscriptionId: string) {
  try {
    const db = await connectDB()
    const leadsCollection = db.collection('leads')

    await leadsCollection.updateOne(
      { id: leadId },
      { 
        $set: { 
          status: 'converted',
          updatedAt: new Date()
        }
      }
    )
  } catch (error) {
    console.error('Error converting lead:', error)
  }
}
