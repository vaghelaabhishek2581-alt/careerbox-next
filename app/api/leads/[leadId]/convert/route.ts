import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, hasRole } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Lead } from '@/lib/types/lead.types'
import { ApiResponse } from '@/lib/types/api.types'

// POST /api/leads/[leadId]/convert - Convert lead to active subscription (admin only)
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ leadId: string }> }
) {
  try {
    const authResult = await getAuthenticatedUser(req)
    if (!authResult || !hasRole(authResult.user, 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { leadId } = await context.params
    const { subscriptionPlan, paymentDetails } = await req.json()
    await connectToDatabase()
    
    // TODO: This route needs to be completely refactored to use Mongoose models
    // instead of raw MongoDB collections. The current implementation is incomplete.
    
    return NextResponse.json({ 
      error: 'This endpoint is currently under maintenance. Please use the new payment flow.' 
    }, { status: 503 })
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
