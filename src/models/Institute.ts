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

// Institute Schema
const InstituteSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  instituteName: { 
    type: String, 
    required: true,
    maxlength: 200
  },
  type: { 
    type: String, 
    required: true,
    maxlength: 100
  },
  accreditation: [{ 
    type: String,
    maxlength: 200
  }],
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
  establishedYear: { type: Number },
  studentCount: { type: Number },
  facultyCount: { type: Number },
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
InstituteSchema.virtual('id').get(function() {
  return this._id.toHexString()
})

// Indexes
InstituteSchema.index({ userId: 1 })
InstituteSchema.index({ instituteName: 1 })
InstituteSchema.index({ type: 1 })
InstituteSchema.index({ status: 1 })
InstituteSchema.index({ isVerified: 1 })
InstituteSchema.index({ accreditation: 1 })
InstituteSchema.index({ 'address.city': 1, 'address.state': 1, 'address.country': 1 })

// Text search index
InstituteSchema.index({
  instituteName: 'text',
  description: 'text',
  type: 'text'
})

// Pre-save middleware
InstituteSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Interface for Institute document
export interface IInstitute extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  instituteName: string
  type: string
  accreditation: string[]
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
  establishedYear?: number
  studentCount?: number
  facultyCount?: number
  isVerified: boolean
  subscriptionId?: string
  status: 'active' | 'inactive' | 'suspended'
  createdAt: Date
  updatedAt: Date
}

export { IInstitute }
export default mongoose.models.Institute || mongoose.model<IInstitute>('Institute', InstituteSchema)
