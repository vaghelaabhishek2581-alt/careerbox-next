import mongoose, { Schema, Document } from 'mongoose'

// Application Document Schema
const ApplicationDocumentSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['resume', 'cover_letter', 'certificate', 'portfolio', 'other'],
    required: true
  },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false })

// Application Schema
const ApplicationSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['job', 'course', 'exam'],
    required: true
  },
  targetId: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  appliedAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  reviewedAt: { type: Date },
  notes: { type: String },
  documents: [ApplicationDocumentSchema],
  interviewScheduled: { type: Date },
  interviewNotes: { type: String },
  
  // Job-specific fields
  coverLetter: { type: String },
  resumeUrl: { type: String },
  expectedSalary: { type: Number },
  availabilityDate: { type: Date },
  
  // Course-specific fields
  motivationLetter: { type: String },
  previousExperience: { type: String },
  expectedOutcome: { type: String },
  
  // Exam-specific fields
  registrationFee: { type: Number },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed']
  },
  specialRequirements: { type: String }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for public ID
ApplicationSchema.virtual('id').get(function() {
  return this._id.toHexString()
})

// Indexes
ApplicationSchema.index({ type: 1 })
ApplicationSchema.index({ targetId: 1 })
ApplicationSchema.index({ status: 1 })
ApplicationSchema.index({ appliedAt: -1 })
ApplicationSchema.index({ userId: 1, type: 1, targetId: 1 }, { unique: true }) // Prevent duplicate applications (includes userId)

// Pre-save middleware
ApplicationSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Interface for Application document
export interface IApplication extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  type: 'job' | 'course' | 'exam'
  targetId: string
  status: 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn'
  appliedAt: Date
  updatedAt: Date
  reviewedAt?: Date
  notes?: string
  documents?: {
    id: string
    name: string
    type: 'resume' | 'cover_letter' | 'certificate' | 'portfolio' | 'other'
    url: string
    uploadedAt: Date
  }[]
  interviewScheduled?: Date
  interviewNotes?: string
  
  // Job-specific fields
  coverLetter?: string
  resumeUrl?: string
  expectedSalary?: number
  availabilityDate?: Date
  
  // Course-specific fields
  motivationLetter?: string
  previousExperience?: string
  expectedOutcome?: string
  
  // Exam-specific fields
  registrationFee?: number
  paymentStatus?: 'pending' | 'paid' | 'failed'
  specialRequirements?: string
}

export { IApplication }
export default mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema)
