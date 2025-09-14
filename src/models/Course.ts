import mongoose, { Schema, Document } from 'mongoose'

// Course Lesson Schema
const CourseLessonSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, required: true }, // in minutes
  type: { 
    type: String, 
    enum: ['video', 'text', 'quiz', 'assignment'],
    required: true
  },
  content: { type: String },
  videoUrl: { type: String },
  attachments: [{ type: String }]
}, { _id: false })

// Course Module Schema
const CourseModuleSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, required: true }, // in hours
  lessons: [CourseLessonSchema]
}, { _id: false })

// Instructor Schema
const InstructorSchema = new Schema({
  name: { type: String, required: true },
  bio: { type: String, required: true },
  qualifications: [{ type: String }],
  experience: { type: String, required: true }
}, { _id: false })

// Course Schema
const CourseSchema = new Schema({
  instituteId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Institute', 
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
  category: { 
    type: String, 
    required: true,
    maxlength: 100
  },
  level: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  duration: { 
    type: Number, 
    required: true 
  }, // in weeks
  fee: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    required: true,
    default: 'USD'
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  registrationDeadline: { 
    type: Date, 
    required: true 
  },
  maxStudents: { 
    type: Number, 
    required: true 
  },
  currentEnrollments: { 
    type: Number, 
    default: 0 
  },
  prerequisites: [{ 
    type: String,
    maxlength: 200
  }],
  curriculum: [CourseModuleSchema],
  instructor: InstructorSchema,
  status: { 
    type: String, 
    enum: ['draft', 'active', 'completed', 'cancelled'],
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
CourseSchema.virtual('id').get(function() {
  return this._id.toHexString()
})

// Indexes
CourseSchema.index({ instituteId: 1 })
CourseSchema.index({ category: 1 })
CourseSchema.index({ level: 1 })
CourseSchema.index({ status: 1 })
CourseSchema.index({ startDate: 1 })
CourseSchema.index({ registrationDeadline: 1 })
CourseSchema.index({ fee: 1 })
CourseSchema.index({ createdAt: -1 })

// Text search index
CourseSchema.index({
  title: 'text',
  description: 'text',
  category: 'text'
})

// Pre-save middleware
CourseSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Interface for Course document
export interface ICourse extends Document {
  _id: mongoose.Types.ObjectId
  instituteId: mongoose.Types.ObjectId
  title: string
  description: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  fee: number
  currency: string
  startDate: Date
  endDate: Date
  registrationDeadline: Date
  maxStudents: number
  currentEnrollments: number
  prerequisites: string[]
  curriculum: {
    id: string
    title: string
    description?: string
    duration: number
    lessons: {
      id: string
      title: string
      description?: string
      duration: number
      type: 'video' | 'text' | 'quiz' | 'assignment'
      content?: string
      videoUrl?: string
      attachments?: string[]
    }[]
  }[]
  instructor: {
    name: string
    bio: string
    qualifications: string[]
    experience: string
  }
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  applicationsCount: number
  createdAt: Date
  updatedAt: Date
}

export { ICourse }
export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema)
