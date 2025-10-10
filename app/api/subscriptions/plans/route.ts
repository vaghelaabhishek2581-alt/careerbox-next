import { NextRequest, NextResponse } from 'next/server'
import { SubscriptionPlanDetails, SubscriptionPlan } from '@/lib/types/subscription.types'
import { ApiResponse } from '@/lib/types/api.types'

// GET /api/subscriptions/plans - Fetch available subscription plans
export async function GET(req: NextRequest) {
  try {
    const plans: SubscriptionPlanDetails[] = [
      {
        id: SubscriptionPlan.BUSINESS_BASIC,
        name: 'Business Basic',
        description: 'Perfect for small businesses starting their hiring journey',
        price: { monthly: 29.99, yearly: 299.99 },
        features: [
          'Post up to 5 jobs',
          'Create 2 recruitment exams',
          'View up to 100 applications',
          'Basic analytics dashboard',
          'Email support'
        ],
        limits: {
          jobPosts: 5,
          examPosts: 2,
          applicantViews: 100,
          analyticsAccess: true
        }
      },
      {
        id: SubscriptionPlan.BUSINESS_PRO,
        name: 'Business Pro',
        description: 'Advanced features for growing businesses',
        price: { monthly: 99.99, yearly: 999.99 },
        features: [
          'Unlimited job posts',
          'Unlimited recruitment exams',
          'Unlimited application views',
          'Advanced analytics & reporting',
          'Priority support',
          'Custom branding',
          'API access'
        ],
        limits: {
          jobPosts: -1,
          examPosts: -1,
          applicantViews: -1,
          analyticsAccess: true
        },
        popular: true
      },
      {
        id: SubscriptionPlan.INSTITUTE_BASIC,
        name: 'Institute Basic',
        description: 'Essential tools for educational institutions',
        price: { monthly: 39.99, yearly: 399.99 },
        features: [
          'Create up to 3 courses',
          'Create 2 admission exams',
          'Manage up to 50 students',
          'Basic academic analytics',
          'Email support'
        ],
        limits: {
          coursePosts: 3,
          examPosts: 2,
          applicantViews: 50,
          analyticsAccess: true
        }
      },
      {
        id: SubscriptionPlan.INSTITUTE_PRO,
        name: 'Institute Pro',
        description: 'Comprehensive solution for large institutions',
        price: { monthly: 129.99, yearly: 1299.99 },
        features: [
          'Unlimited courses',
          'Unlimited admission exams',
          'Unlimited student management',
          'Advanced academic analytics',
          'Priority support',
          'Custom branding',
          'API access',
          'White-label options'
        ],
        limits: {
          coursePosts: -1,
          examPosts: -1,
          applicantViews: -1,
          analyticsAccess: true
        }
      }
    ]

    const response: ApiResponse<SubscriptionPlanDetails[]> = {
      success: true,
      data: plans
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching subscription plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 }
    )
  }
}
