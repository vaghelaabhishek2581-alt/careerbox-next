import mongoose, { Schema, Document } from 'mongoose'

// ============================================================================
// INTERFACE
// ============================================================================

export interface ISubscription extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  organizationId: mongoose.Types.ObjectId
  organizationType: 'institute' | 'business'
  
  // Plan Details
  planName: string
  planType: 'free' | 'basic' | 'premium' | 'enterprise'
  billingCycle: 'monthly' | 'yearly' | 'lifetime'
  amount: number
  currency: string
  
  // Status
  status: 'active' | 'inactive' | 'cancelled' | 'expired' | 'suspended'
  isActive: boolean
  
  // Dates
  startDate: Date
  endDate?: Date
  nextBillingDate?: Date
  cancelledAt?: Date
  suspendedAt?: Date
  
  // Payment Information
  paymentMethod?: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  lastPaymentDate?: Date
  lastPaymentAmount?: number
  
  // Features
  features: {
    maxStudents?: number
    maxCourses?: number
    maxTeamMembers?: number
    maxJobPostings?: number
    analyticsAccess?: boolean
    prioritySupport?: boolean
    customBranding?: boolean
    apiAccess?: boolean
    bulkOperations?: boolean
  }
  
  // Usage Tracking
  usage: {
    studentsCount?: number
    coursesCount?: number
    teamMembersCount?: number
    jobPostingsCount?: number
    storageUsed?: number // in MB
  }
  
  // Admin Actions
  grantedBy?: mongoose.Types.ObjectId // Admin who granted free subscription
  grantReason?: string
  adminNotes?: string
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// SCHEMA
// ============================================================================

const SubscriptionSchema = new Schema<ISubscription>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  organizationId: { 
    type: Schema.Types.ObjectId, 
    required: true,
    refPath: 'organizationType'
  },
  organizationType: { 
    type: String, 
    enum: ['institute', 'business'], 
    required: true 
  },
  
  // Plan Details
  planName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  planType: { 
    type: String, 
    enum: ['free', 'basic', 'premium', 'enterprise'],
    required: true 
  },
  billingCycle: { 
    type: String, 
    enum: ['monthly', 'yearly', 'lifetime'],
    required: true 
  },
  amount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  currency: { 
    type: String, 
    required: true, 
    default: 'USD' 
  },
  
  // Status
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'cancelled', 'expired', 'suspended'],
    default: 'active' 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  // Dates
  startDate: { 
    type: Date, 
    required: true, 
    default: Date.now 
  },
  endDate: { 
    type: Date 
  },
  nextBillingDate: { 
    type: Date 
  },
  cancelledAt: { 
    type: Date 
  },
  suspendedAt: { 
    type: Date 
  },
  
  // Payment Information
  paymentMethod: { 
    type: String, 
    trim: true 
  },
  stripeCustomerId: { 
    type: String, 
    trim: true 
  },
  stripeSubscriptionId: { 
    type: String, 
    trim: true 
  },
  lastPaymentDate: { 
    type: Date 
  },
  lastPaymentAmount: { 
    type: Number 
  },
  
  // Features
  features: {
    maxStudents: { type: Number, default: 0 },
    maxCourses: { type: Number, default: 0 },
    maxTeamMembers: { type: Number, default: 1 },
    maxJobPostings: { type: Number, default: 0 },
    analyticsAccess: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    bulkOperations: { type: Boolean, default: false }
  },
  
  // Usage Tracking
  usage: {
    studentsCount: { type: Number, default: 0 },
    coursesCount: { type: Number, default: 0 },
    teamMembersCount: { type: Number, default: 0 },
    jobPostingsCount: { type: Number, default: 0 },
    storageUsed: { type: Number, default: 0 }
  },
  
  // Admin Actions
  grantedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  grantReason: { 
    type: String, 
    trim: true 
  },
  adminNotes: { 
    type: String, 
    trim: true 
  },
  
  // Metadata
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
})

// ============================================================================
// INDEXES
// ============================================================================

SubscriptionSchema.index({ userId: 1 })
SubscriptionSchema.index({ organizationId: 1 })
SubscriptionSchema.index({ status: 1 })
SubscriptionSchema.index({ planType: 1 })
SubscriptionSchema.index({ endDate: 1 })
SubscriptionSchema.index({ nextBillingDate: 1 })
SubscriptionSchema.index({ stripeCustomerId: 1 })
SubscriptionSchema.index({ stripeSubscriptionId: 1 })

// ============================================================================
// VIRTUALS
// ============================================================================

SubscriptionSchema.virtual('id').get(function() {
  return this._id.toHexString()
})

SubscriptionSchema.virtual('isExpired').get(function() {
  return this.endDate && this.endDate < new Date()
})

SubscriptionSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.endDate) return null
  const now = new Date()
  const diffTime = this.endDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// ============================================================================
// METHODS
// ============================================================================

SubscriptionSchema.methods.isFeatureEnabled = function(feature: string): boolean {
  return this.features[feature] === true
}

SubscriptionSchema.methods.hasReachedLimit = function(feature: string): boolean {
  const maxValue = this.features[`max${feature.charAt(0).toUpperCase() + feature.slice(1)}`]
  const currentUsage = this.usage[`${feature}Count`]
  
  if (maxValue === 0) return false // Unlimited
  return currentUsage >= maxValue
}

SubscriptionSchema.methods.canAddMore = function(feature: string, count: number = 1): boolean {
  const maxValue = this.features[`max${feature.charAt(0).toUpperCase() + feature.slice(1)}`]
  const currentUsage = this.usage[`${feature}Count`] || 0
  
  if (maxValue === 0) return true // Unlimited
  return (currentUsage + count) <= maxValue
}

SubscriptionSchema.methods.cancel = function(): void {
  this.status = 'cancelled'
  this.isActive = false
  this.cancelledAt = new Date()
}

SubscriptionSchema.methods.suspend = function(): void {
  this.status = 'suspended'
  this.isActive = false
  this.suspendedAt = new Date()
}

SubscriptionSchema.methods.reactivate = function(): void {
  this.status = 'active'
  this.isActive = true
  this.suspendedAt = undefined
}

// ============================================================================
// PRE-SAVE MIDDLEWARE
// ============================================================================

SubscriptionSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  
  // Update isActive based on status and expiry
  this.isActive = this.status === 'active' && (!this.endDate || this.endDate > new Date())
  
  next()
})

// ============================================================================
// EXPORT
// ============================================================================

export default mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema)
