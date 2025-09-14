import mongoose, { Schema, Document } from 'mongoose'

// Exam Question Schema
const ExamQuestionSchema = new Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'],
    required: true
  },
  question: { 
    type: String, 
    required: true,
    maxlength: 1000
  },
  options: [{ 
    type: String,
    maxlength: 500
  }],
  correctAnswer: { type: Schema.Types.Mixed },
  marks: { 
    type: Number, 
    required: true 
  }
}, { _id: false })

// Exam Schema
const ExamSchema = new Schema({
  createdBy: { 
    type: String, 
    required: true 
  }, // businessId or instituteId
  createdByType: { 
    type: String, 
    enum: ['business', 'institute'],
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
    maxlength: 2000
  },
  type: { 
    type: String, 
    enum: ['admission', 'recruitment', 'certification'],
    required: true
  },
  duration: { 
    type: Number, 
    required: true 
  }, // in minutes
  totalMarks: { 
    type: Number, 
    required: true 
  },
  passingMarks: { 
    type: Number, 
    required: true 
  },
  instructions: [{ 
    type: String,
    maxlength: 500
  }],
  eligibilityCriteria: [{ 
    type: String,
    maxlength: 500
  }],
  examDate: { 
    type: Date, 
    required: true 
  },
  registrationDeadline: { 
    type: Date, 
    required: true 
  },
  fee: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['draft', 'active', 'completed'],
    default: 'draft'
  },
  questions: [ExamQuestionSchema],
  registrationsCount: { 
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
ExamSchema.virtual('id').get(function() {
  return this._id.toHexString()
})

// Indexes
ExamSchema.index({ createdBy: 1 })
ExamSchema.index({ createdByType: 1 })
ExamSchema.index({ type: 1 })
ExamSchema.index({ status: 1 })
ExamSchema.index({ examDate: 1 })
ExamSchema.index({ registrationDeadline: 1 })
ExamSchema.index({ fee: 1 })
ExamSchema.index({ createdAt: -1 })

// Text search index
ExamSchema.index({
  title: 'text',
  description: 'text'
})

// Pre-save middleware
ExamSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Interface for Exam document
export interface IExam extends Document {
  _id: mongoose.Types.ObjectId
  createdBy: string
  createdByType: 'business' | 'institute'
  title: string
  description: string
  type: 'admission' | 'recruitment' | 'certification'
  duration: number
  totalMarks: number
  passingMarks: number
  instructions: string[]
  eligibilityCriteria: string[]
  examDate: Date
  registrationDeadline: Date
  fee: number
  status: 'draft' | 'active' | 'completed'
  questions?: {
    id: string
    type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay'
    question: string
    options?: string[]
    correctAnswer?: string | number
    marks: number
  }[]
  registrationsCount: number
  createdAt: Date
  updatedAt: Date
}

export { IExam }
export default mongoose.models.Exam || mongoose.model<IExam>('Exam', ExamSchema)
