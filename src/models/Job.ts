import mongoose, { Schema, Document } from 'mongoose'

// Salary Range Schema
const SalaryRangeSchema = new Schema({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  currency: { type: String, required: true, default: 'USD' }
}, { _id: false })

// Experience Schema
const ExperienceSchema = new Schema({
  min: { type: Number, required: true },
  max: { type: Number, required: true }
}, { _id: false })

// Job Schema
const JobSchema = new Schema({
  businessId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Business', 
    required: true 
  },
  title: { 
    type: String, 
    required: true,
    maxlength: 200
  },
  description: { 
    type: String, 
    required: true,
    maxlength: 5000
  },
  requirements: [{ 
    type: String,
    maxlength: 500
  }],
  responsibilities: [{ 
    type: String,
    maxlength: 500
  }],
  location: { 
    type: String, 
    required: true,
    maxlength: 200
  },
  employmentType: { 
    type: String, 
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    required: true
  },
  salaryRange: SalaryRangeSchema,
  skills: [{ 
    type: String,
    maxlength: 100
  }],
  experience: ExperienceSchema,
  applicationDeadline: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['draft', 'active', 'paused', 'closed'],
    default: 'draft'
  },
  applicationsCount: { 
    type: Number, 
    default: 0 
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
JobSchema.virtual('id').get(function() {
  return this._id.toHexString()
})

// Indexes
JobSchema.index({ businessId: 1 })
JobSchema.index({ status: 1 })
JobSchema.index({ location: 1 })
JobSchema.index({ employmentType: 1 })
JobSchema.index({ 'salaryRange.min': 1, 'salaryRange.max': 1 })
JobSchema.index({ skills: 1 })
JobSchema.index({ applicationDeadline: 1 })
JobSchema.index({ createdAt: -1 })

// Text search index
JobSchema.index({
  title: 'text',
  description: 'text',
  location: 'text',
  skills: 'text'
})

// Pre-save middleware
JobSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Interface for Job document
export interface IJob extends Document {
  _id: mongoose.Types.ObjectId
  businessId: mongoose.Types.ObjectId
  title: string
  description: string
  requirements: string[]
  responsibilities: string[]
  location: string
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship'
  locationType: 'ONSITE' | 'REMOTE' | 'HYBRID'
  salaryRange: {
    min: number
    max: number
    currency: string
  }
  skills: string[]
  experience: {
    min: number
    max: number
  }
  applicationDeadline: Date
  status: 'draft' | 'active' | 'paused' | 'closed'
  applicationsCount: number
  createdAt: Date
  updatedAt: Date
}

export default mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema)
