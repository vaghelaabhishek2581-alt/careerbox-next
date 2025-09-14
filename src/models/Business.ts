import mongoose, { Schema, Document } from 'mongoose'

// Address Schema
const AddressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  zipCode: { type: String, required: true }
}, { _id: false })

// Contact Info Schema
const ContactInfoSchema = new Schema({
  email: { type: String, required: true },
  phone: { type: String, required: true },
  linkedin: { type: String },
  twitter: { type: String }
}, { _id: false })

// Social Media Schema
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
    required: true,
    unique: true
  },
  companyName: { 
    type: String, 
    required: true,
    maxlength: 200
  },
  industry: { 
    type: String, 
    required: true,
    maxlength: 100
  },
  size: { 
    type: String, 
    required: true,
    maxlength: 50
  },
  website: { type: String },
  description: { 
    type: String, 
    required: true,
    maxlength: 2000
  },
  logo: { type: String },
  address: AddressSchema,
  contactInfo: ContactInfoSchema,
  socialMedia: SocialMediaSchema,
  foundedYear: { type: Number },
  employeeCount: { type: Number },
  revenue: { type: String },
  isVerified: { type: Boolean, default: false },
  subscriptionId: { type: String },
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
BusinessSchema.index({ userId: 1 })
BusinessSchema.index({ companyName: 1 })
BusinessSchema.index({ industry: 1 })
BusinessSchema.index({ status: 1 })
BusinessSchema.index({ isVerified: 1 })
BusinessSchema.index({ 'address.city': 1, 'address.state': 1, 'address.country': 1 })

// Text search index
BusinessSchema.index({
  companyName: 'text',
  description: 'text',
  industry: 'text'
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
  companyName: string
  industry: string
  size: string
  website?: string
  description: string
  logo?: string
  address: {
    street: string
    city: string
    state: string
    country: string
    zipCode: string
  }
  contactInfo: {
    email: string
    phone: string
    linkedin?: string
    twitter?: string
  }
  socialMedia: {
    linkedin?: string
    twitter?: string
    facebook?: string
    instagram?: string
  }
  foundedYear?: number
  employeeCount?: number
  revenue?: string
  isVerified: boolean
  subscriptionId?: string
  status: 'active' | 'inactive' | 'suspended'
  createdAt: Date
  updatedAt: Date
}

export { IBusiness }
export default mongoose.models.Business || mongoose.model<IBusiness>('Business', BusinessSchema)
