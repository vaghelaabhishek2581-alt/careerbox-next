import mongoose, { Schema, Document } from 'mongoose'

// Social Media Schema (moved up to be used, removing duplicate)
const SocialMediaSchema = new Schema({
  linkedin: { type: String },
  twitter: { type: String },
  facebook: { type: String },
  instagram: { type: String }
}, { _id: false })


// Business Schema
const BusinessSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  },
  registrationIntentId: {
    type: Schema.Types.ObjectId,
    ref: 'RegistrationIntent',
    required: true
  },
  name: { 
    type: String, 
    required: true,
    maxlength: 200
  },
  publicProfileId: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-_]+$/, 'Public profile ID can only contain lowercase letters, numbers, hyphens, and underscores']
  },
  email: {
    type: String,
    required: true
  },
  contactPerson: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    street: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String }
  },
  website: { type: String },
  establishmentYear: { type: Number },
  description: { 
    type: String,
    maxlength: 2000
  },
  logo: { type: String },
  coverImage: { type: String },
  industry: { 
    type: String,
    maxlength: 100
  },
  size: { 
    type: String,
    maxlength: 50
  },
  socialMedia: SocialMediaSchema,
  employeeCount: { type: Number, default: 0 },
  revenue: { type: String },
  jobPostings: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  subscriptionId: { 
    type: Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for public ID
BusinessSchema.virtual('id').get(function() {
  return this._id.toHexString()
})

// Indexes
// publicProfileId index is automatically created by unique: true
BusinessSchema.index({ userId: 1 })
BusinessSchema.index({ name: 1 })
BusinessSchema.index({ industry: 1 })
BusinessSchema.index({ status: 1 })
BusinessSchema.index({ isVerified: 1 })
BusinessSchema.index({ registrationIntentId: 1 })
BusinessSchema.index({ 'address.city': 1, 'address.state': 1, 'address.country': 1 })

// Text search index
BusinessSchema.index({
  name: 'text',
  description: 'text',
  industry: 'text',
  contactPerson: 'text'
})

// Pre-save middleware
BusinessSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Interface for Business document
export interface IBusiness extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  registrationIntentId: mongoose.Types.ObjectId
  name: string
  publicProfileId?: string
  email: string
  contactPerson: string
  phone: string
  address: {
    street?: string
    city: string
    state: string
    country: string
    zipCode?: string
  }
  website?: string
  establishmentYear?: number
  description?: string
  logo?: string
  coverImage?: string
  industry?: string
  size?: string
  socialMedia: {
    linkedin?: string
    twitter?: string
    facebook?: string
    instagram?: string
  }
  employeeCount: number
  revenue?: string
  jobPostings: number
  isVerified: boolean
  subscriptionId?: mongoose.Types.ObjectId
  status: 'active' | 'inactive' | 'suspended'
  createdAt: Date
  updatedAt: Date
}

// Use existing model if available (prevents re-compilation errors)
const Business = mongoose.models.Business || mongoose.model<IBusiness>('Business', BusinessSchema);

export default Business
