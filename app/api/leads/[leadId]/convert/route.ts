import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Lead } from '@/lib/types/lead.types'
import { ApiResponse } from '@/lib/types/api.types'

// POST /api/leads/[leadId]/convert - Convert lead to active subscription (admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: { leadId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { leadId } = params
    const { subscriptionPlan, paymentDetails } = await req.json()
    const db = await connectDB()
    const leadsCollection = db.collection('leads')
    const usersCollection = db.collection('users')
    const subscriptionsCollection = db.collection('subscriptions')

    const lead = await leadsCollection.findOne({ id: leadId })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    if (lead.status === 'converted') {
      return NextResponse.json({ error: 'Lead already converted' }, { status: 400 })
    }

    // Create subscription
    const subscription = {
      id: crypto.randomUUID(),
      userId: lead.userId,
      plan: subscriptionPlan,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      autoRenew: true,
      features: getPlanFeatures(subscriptionPlan),
      limits: getPlanLimits(subscriptionPlan),
      billingInfo: {
        amount: getPlanPrice(subscriptionPlan),
        currency: 'USD',
        interval: 'monthly',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await subscriptionsCollection.insertOne(subscription)

    // Update user role
    const newRole = getRoleFromPlan(subscriptionPlan)
    await usersCollection.updateOne(
      { id: lead.userId },
      { $set: { role: newRole, subscriptionId: subscription.id } }
    )

    // Update lead status
    const contactRecord = {
      id: crypto.randomUUID(),
      type: 'note' as const,
      content: `Lead converted to ${subscriptionPlan} subscription`,
      timestamp: new Date(),
      adminId: session.user.id,
      adminName: session.user.name || 'Admin'
    }

    const updatedLead = {
      ...lead,
      status: 'converted',
      contactHistory: [...lead.contactHistory, contactRecord],
      updatedAt: new Date()
    }

    await leadsCollection.updateOne(
      { id: leadId },
      { $set: updatedLead }
    )

    const response: ApiResponse<Lead> = {
      success: true,
      data: updatedLead,
      message: 'Lead converted successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error converting lead:', error)
    return NextResponse.json(
      { error: 'Failed to convert lead' },
      { status: 500 }
    )
  }
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

function getPlanPrice(plan: string): number {
  const prices: Record<string, number> = {
    business_basic: 29.99,
    business_pro: 99.99,
    institute_basic: 39.99,
    institute_pro: 129.99
  }
  return prices[plan] || 0
}

function getRoleFromPlan(plan: string): string {
  if (plan.startsWith('business_')) return 'business'
  if (plan.startsWith('institute_')) return 'institute'
  return 'user'
}
