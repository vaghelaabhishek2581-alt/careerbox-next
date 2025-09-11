export enum SubscriptionPlan {
  FREE = 'free',
  BUSINESS_BASIC = 'business_basic',
  BUSINESS_PRO = 'business_pro',
  INSTITUTE_BASIC = 'institute_basic',
  INSTITUTE_PRO = 'institute_pro'
}

export interface Subscription {
  id: string
  userId: string
  plan: SubscriptionPlan
  status: 'active' | 'canceled' | 'expired' | 'trial'
  startDate: Date
  endDate: Date
  autoRenew: boolean
  features: string[]
  limits: {
    jobPosts?: number
    coursePosts?: number
    examPosts?: number
    applicantViews?: number
    analyticsAccess: boolean
  }
  billingInfo: {
    amount: number
    currency: string
    interval: 'monthly' | 'yearly'
    nextBillingDate: Date
  }
  createdAt: Date
  updatedAt: Date
}

export interface SubscriptionPlanDetails {
  id: SubscriptionPlan
  name: string
  description: string
  price: {
    monthly: number
    yearly: number
  }
  features: string[]
  limits: {
    jobPosts?: number
    coursePosts?: number
    examPosts?: number
    applicantViews?: number
    analyticsAccess: boolean
  }
  popular?: boolean
}

export interface CreateSubscriptionRequest {
  plan: SubscriptionPlan
  interval: 'monthly' | 'yearly'
  paymentMethodId: string
  leadId?: string
}

export interface UpdateSubscriptionRequest {
  plan?: SubscriptionPlan
  interval?: 'monthly' | 'yearly'
  autoRenew?: boolean
  status?: 'active' | 'canceled' | 'expired'
}

export interface BillingHistory {
  id: string
  subscriptionId: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed'
  paymentDate: Date
  invoiceUrl?: string
}

export interface UsageStats {
  jobPosts: number
  coursePosts: number
  examPosts: number
  applicantViews: number
  analyticsAccess: boolean
}
