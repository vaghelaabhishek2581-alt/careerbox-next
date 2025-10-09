import mongoose, { Schema, Document } from 'mongoose'

// Social Media Schema (moved up to be used, removing duplicate)
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
  accreditation: [{ 
    type: String,
    maxlength: 200
  }],
  socialMedia: SocialMediaSchema,
  studentCount: { type: Number, default: 0 },
  facultyCount: { type: Number, default: 0 },
  courseCount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  
  // Rankings and Achievements
  rankings: [{
    id: { type: String, required: true },
    title: { type: String, required: true, maxlength: 200 },
    organization: { type: String, required: true, maxlength: 200 },
    category: { 
      type: String, 
      enum: ['national', 'state', 'international', 'university', 'program-specific'],
      required: true
    },
    rank: { type: Number, required: true },
    totalParticipants: { type: Number },
    year: { type: Number, required: true },
    description: { type: String, required: true, maxlength: 1000 },
    certificateUrl: { type: String },
    verificationUrl: { type: String },
    status: { 
      type: String, 
      enum: ['verified', 'pending', 'unverified'],
      default: 'pending'
    },
    createdAt: { type: Date, default: Date.now }
  }],
  
  achievements: [{
    id: { type: String, required: true },
    title: { type: String, required: true, maxlength: 200 },
    type: { 
      type: String, 
      enum: ['accreditation', 'certification', 'award', 'recognition', 'milestone'],
      required: true
    },
    organization: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 1000 },
    dateAwarded: { type: Date, required: true },
    validUntil: { type: Date },
    certificateUrl: { type: String },
    status: { 
      type: String, 
      enum: ['active', 'expired', 'pending'],
      default: 'active'
    },
    createdAt: { type: Date, default: Date.now }
  }],

  // Awards
  awards: [{
    id: { type: String, required: true },
    title: { type: String, required: true, maxlength: 200 },
    category: { 
      type: String, 
      enum: ['academic_excellence', 'research_innovation', 'teaching_excellence', 'student_achievement', 'community_service', 'industry_partnership', 'sustainability', 'technology_innovation', 'sports_achievement', 'cultural_excellence', 'leadership', 'other'],
      required: true
    },
    issuer: { type: String, required: true, maxlength: 200 },
    year: { type: Number, required: true },
    month: { type: Number, min: 1, max: 12 },
    description: { type: String, required: true, maxlength: 1000 },
    certificateImage: { type: String },
    verificationUrl: { type: String },
    isFeatured: { type: Boolean, default: false },
    level: { 
      type: String, 
      enum: ['international', 'national', 'state', 'regional', 'institutional']
    },
    recipients: [{ type: String }],
    criteria: { type: String, maxlength: 500 },
    impact: { type: String, maxlength: 500 },
    mediaLinks: [{ type: String }],
    tags: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }],

  // Documents
  documents: [{
    id: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['pan_card', 'gst_certificate', 'cin_certificate', 'trade_license', 'msme_certificate', 'other'],
      required: true
    },
    name: { type: String, required: true },
    description: { type: String },
    fileName: { type: String, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    fileSize: { type: Number },
    mimeType: { type: String }
  }],

  // Highlights
  highlights: [{
    id: { type: String, required: true },
    title: { type: String, required: true, maxlength: 100 },
    value: { type: String, required: true, maxlength: 50 },
    description: { type: String, required: true, maxlength: 500 },
    example: { type: String, maxlength: 200 },
    icon: { type: String },
    color: { type: String },
    order: { type: Number, min: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }],

  // Locations
  locations: [{
    id: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['main_campus', 'branch_campus', 'hostel', 'library', 'sports_complex', 'research_center', 'other'],
      required: true
    },
    name: { type: String, required: true, maxlength: 200 },
    address: { type: String, required: true, maxlength: 500 },
    city: { type: String, required: true, maxlength: 100 },
    state: { type: String, required: true, maxlength: 100 },
    country: { type: String, required: true, maxlength: 100 },
    zipCode: { type: String, required: true, maxlength: 20 },
    isPrimary: { type: Boolean, default: false },
    coordinates: {
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 }
    },
    contactInfo: {
      phone: { type: String },
      email: { type: String },
      website: { type: String }
    },
    facilities: [{ type: String }],
    capacity: { type: Number, min: 0 },
    establishedYear: { type: Number, min: 1800, max: new Date().getFullYear() },
    description: { type: String, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }],

  // Scholarships
  scholarships: [{
    id: { type: String, required: true },
    title: { type: String, required: true, maxlength: 200 },
    type: { 
      type: String, 
      enum: ['merit_based', 'need_based', 'sports_scholarship', 'cultural_scholarship', 'research_scholarship', 'minority_scholarship', 'government_scholarship', 'corporate_scholarship', 'international_scholarship', 'other'],
      required: true
    },
    category: { 
      type: String, 
      enum: ['undergraduate', 'postgraduate', 'doctoral', 'diploma', 'certificate', 'all_levels'],
      required: true
    },
    amount: { type: String, required: true, maxlength: 100 },
    currency: { type: String, default: 'INR' },
    numberOfAwards: { type: String, required: true, maxlength: 50 },
    year: { type: Number, required: true },
    applicationDeadline: { type: String },
    announcementDate: { type: String },
    verificationUrl: { type: String },
    applicationUrl: { type: String },
    description: { type: String, required: true, maxlength: 1000 },
    eligibilityCriteria: { type: String, required: true, maxlength: 1000 },
    selectionProcess: { type: String, maxlength: 500 },
    documentsRequired: [{ type: String }],
    benefits: [{ type: String }],
    renewalCriteria: { type: String, maxlength: 500 },
    contactInfo: {
      email: { type: String },
      phone: { type: String },
      website: { type: String },
      address: { type: String }
    },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }],

  // Registration Details
  registrationDetails: {
    panNumber: { type: String, maxlength: 10 },
    gstNumber: { type: String, maxlength: 15 },
    cinNumber: { type: String },
    tanNumber: { type: String },
    tradeLicenseNumber: { type: String },
    licenseExpiryDate: { type: String },
    msmeRegistrationNumber: { type: String },
    importExportCode: { type: String }
  },
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
InstituteSchema.virtual('id').get(function() {
  return this._id.toHexString()
})

// Indexes
// userId index is automatically created by unique: true
// publicProfileId index is automatically created by unique: true
InstituteSchema.index({ name: 1 })
InstituteSchema.index({ status: 1 })
InstituteSchema.index({ isVerified: 1 })
InstituteSchema.index({ registrationIntentId: 1 })
InstituteSchema.index({ 'address.city': 1, 'address.state': 1, 'address.country': 1 })

// Text search index
InstituteSchema.index({
  name: 'text',
  description: 'text',
  contactPerson: 'text'
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
  accreditation: string[]
  socialMedia: {
    linkedin?: string
    twitter?: string
    facebook?: string
    instagram?: string
  }
  studentCount: number
  facultyCount: number
  courseCount: number
  isVerified: boolean
  rankings: {
    id: string
    title: string
    organization: string
    category: 'national' | 'state' | 'international' | 'university' | 'program-specific'
    rank: number
    totalParticipants?: number
    year: number
    description: string
    certificateUrl?: string
    verificationUrl?: string
    status: 'verified' | 'pending' | 'unverified'
    createdAt: Date
  }[]
  achievements: {
    id: string
    title: string
    type: 'accreditation' | 'certification' | 'award' | 'recognition' | 'milestone'
    organization: string
    description: string
    dateAwarded: Date
    validUntil?: Date
    certificateUrl?: string
    status: 'active' | 'expired' | 'pending'
    createdAt: Date
  }[]
  awards: {
    id: string
    title: string
    category: 'academic_excellence' | 'research_innovation' | 'teaching_excellence' | 'student_achievement' | 'community_service' | 'industry_partnership' | 'sustainability' | 'technology_innovation' | 'sports_achievement' | 'cultural_excellence' | 'leadership' | 'other'
    issuer: string
    year: number
    month?: number
    description: string
    certificateImage?: string
    verificationUrl?: string
    isFeatured: boolean
    level?: 'international' | 'national' | 'state' | 'regional' | 'institutional'
    recipients?: string[]
    criteria?: string
    impact?: string
    mediaLinks?: string[]
    tags?: string[]
    createdAt: Date
    updatedAt: Date
  }[]
  documents: {
    id: string
    type: 'pan_card' | 'gst_certificate' | 'cin_certificate' | 'trade_license' | 'msme_certificate' | 'other'
    name: string
    description?: string
    fileName: string
    url: string
    uploadedAt: Date
    status: 'pending' | 'approved' | 'rejected'
    fileSize?: number
    mimeType?: string
  }[]
  highlights: {
    id: string
    title: string
    value: string
    description: string
    example?: string
    icon?: string
    color?: string
    order?: number
    createdAt: Date
    updatedAt: Date
  }[]
  locations: {
    id: string
    type: 'main_campus' | 'branch_campus' | 'hostel' | 'library' | 'sports_complex' | 'research_center' | 'other'
    name: string
    address: string
    city: string
    state: string
    country: string
    zipCode: string
    isPrimary: boolean
    coordinates?: {
      latitude: number
      longitude: number
    }
    contactInfo?: {
      phone?: string
      email?: string
      website?: string
    }
    facilities?: string[]
    capacity?: number
    establishedYear?: number
    description?: string
    createdAt: Date
    updatedAt: Date
  }[]
  scholarships: {
    id: string
    title: string
    type: 'merit_based' | 'need_based' | 'sports_scholarship' | 'cultural_scholarship' | 'research_scholarship' | 'minority_scholarship' | 'government_scholarship' | 'corporate_scholarship' | 'international_scholarship' | 'other'
    category: 'undergraduate' | 'postgraduate' | 'doctoral' | 'diploma' | 'certificate' | 'all_levels'
    amount: string
    currency: string
    numberOfAwards: string
    year: number
    applicationDeadline?: string
    announcementDate?: string
    verificationUrl?: string
    applicationUrl?: string
    description: string
    eligibilityCriteria: string
    selectionProcess?: string
    documentsRequired?: string[]
    benefits?: string[]
    renewalCriteria?: string
    contactInfo?: {
      email?: string
      phone?: string
      website?: string
      address?: string
    }
    isFeatured: boolean
    isActive: boolean
    tags?: string[]
    createdAt: Date
    updatedAt: Date
  }[]
  registrationDetails?: {
    panNumber?: string
    gstNumber?: string
    cinNumber?: string
    tanNumber?: string
    tradeLicenseNumber?: string
    licenseExpiryDate?: string
    msmeRegistrationNumber?: string
    importExportCode?: string
  }
  subscriptionId?: mongoose.Types.ObjectId
  status: 'active' | 'inactive' | 'suspended'
  createdAt: Date
  updatedAt: Date
}

// Use existing model if available (prevents re-compilation errors)
const Institute = mongoose.models.Institute || mongoose.model<IInstitute>('Institute', InstituteSchema);

export default Institute
