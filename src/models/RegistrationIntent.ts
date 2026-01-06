import mongoose, { Schema, Document } from 'mongoose'

// ============================================================================
// INTERFACE
// ============================================================================

export interface IRegistrationIntent extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  type: 'institute' | 'business'
  status: 'pending' | 'approved' | 'rejected' | 'payment_required' | 'completed'

  // Basic Information
  organizationName: string
  email: string
  contactName: string
  contactPhone: string

  // Institute specific fields
  instituteId: mongoose.Types.ObjectId
  instituteType?: string
  instituteCategory?: string
  establishmentYear?: number

  // Business specific fields
  businessCategory?: string
  organizationSize?: string
  uniquePageId?: string
  organizationType?: string
  tagline?: string

  // Address
  address: string
  city: string
  state: string
  country: string
  zipCode: string

  // Additional Information
  description: string
  website?: string

  // Admin Review
  adminNotes?: string
  reviewedBy?: mongoose.Types.ObjectId
  reviewedAt?: Date

  // Subscription Details
  subscriptionPlan?: string
  subscriptionAmount?: number
  subscriptionGrantedBy?: mongoose.Types.ObjectId // Admin who granted free subscription
  subscriptionGrantedAt?: Date

  // Payment Information
  paymentIntentId?: string
  paymentStatus?: 'pending' | 'completed' | 'failed'
  paidAt?: Date

  // Metadata
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// LEAN TYPE DEFINITION
// ============================================================================

// Type for lean document to fix Mongoose typing issues with .lean()
export type LeanRegistrationIntent = {
  _id: any
  userId: any
  type: string
  status: string
  organizationName: string
  email: string
  contactName: string
  contactPhone: string
  instituteId?: any
  instituteType?: string
  instituteCategory?: string
  establishmentYear?: number
  businessCategory?: string
  organizationSize?: string
  uniquePageId?: string
  organizationType?: string
  tagline?: string
  address: string
  city: string
  state: string
  country: string
  zipCode?: string
  description?: string
  website?: string
  adminNotes?: string
  reviewedBy?: any
  reviewedAt?: Date
  subscriptionPlan?: string
  subscriptionAmount?: number
  subscriptionGrantedBy?: any
  subscriptionGrantedAt?: Date
  paymentIntentId?: string
  paymentStatus?: string
  paidAt?: Date
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// SCHEMA
// ============================================================================

const RegistrationIntentSchema = new Schema<IRegistrationIntent>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['institute', 'business'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'payment_required', 'completed'],
    default: 'pending'
  },

  // Basic Information
  organizationName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  contactName: {
    type: String,
    required: true,
    trim: true
  },
  contactPhone: {
    type: String,
    required: true,
    trim: true
  },

  // Institute specific fields
  instituteId: {
    type: Schema.Types.ObjectId,
    ref: 'AdminInstitute',
    index: true
  },
  instituteType: {
    type: String,
    trim: true
  },
  instituteCategory: {
    type: String,
    trim: true
  },
  establishmentYear: {
    type: Number
  },

  // Business specific fields
  businessCategory: {
    type: String,
    trim: true
  },
  organizationSize: {
    type: String,
    trim: true
  },
  uniquePageId: {
    type: String,
    trim: true,
    index: true,
    unique: true,
    sparse: true
  },
  organizationType: {
    type: String,
    trim: true
  },
  tagline: {
    type: String,
    trim: true
  },

  // Address
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: false,
    trim: true
  },

  // Additional Information
  description: {
    type: String,
    required: false,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },

  // Admin Review
  adminNotes: {
    type: String,
    trim: true
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },

  // Subscription Details
  subscriptionPlan: {
    type: String,
    trim: true
  },
  subscriptionAmount: {
    type: Number
  },
  subscriptionGrantedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  subscriptionGrantedAt: {
    type: Date
  },

  // Payment Information
  paymentIntentId: {
    type: String,
    trim: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed']
  },
  paidAt: {
    type: Date
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

RegistrationIntentSchema.index({ userId: 1 })
RegistrationIntentSchema.index({ type: 1 })
RegistrationIntentSchema.index({ status: 1 })
RegistrationIntentSchema.index({ reviewedBy: 1 })
RegistrationIntentSchema.index({ createdAt: -1 })

// ============================================================================
// VIRTUALS
// ============================================================================

RegistrationIntentSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

// ============================================================================
// METHODS
// ============================================================================

RegistrationIntentSchema.methods.canBeApproved = function (): boolean {
  return this.status === 'pending'
}

RegistrationIntentSchema.methods.canBeRejected = function (): boolean {
  return this.status === 'pending'
}

RegistrationIntentSchema.methods.requiresPayment = function (): boolean {
  return this.status === 'payment_required'
}

// ============================================================================
// PRE-SAVE MIDDLEWARE
// ============================================================================

RegistrationIntentSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

// ============================================================================
// EXPORT
// ============================================================================

export default mongoose.models.RegistrationIntent || mongoose.model<IRegistrationIntent>('RegistrationIntent', RegistrationIntentSchema)
