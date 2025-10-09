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

  // New required fields
  courseType: {
    type: String,
    enum: ['degree', 'diploma', 'certificate', '10th', '10th+2', 'under_graduate', 'post_graduate'],
    required: true
  },
  duration: {
    type: Number,
    required: true
  }, // in years
  fee: {
    type: Number,
    required: true
  },
  maxStudents: {
    type: Number,
    required: true
  },
  modeOfStudy: {
    type: String,
    enum: ['online', 'offline', 'hybrid'],
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },

  // Optional new fields
  specializations: [{ type: String }],
  applicableStreams: [{ type: String }],
  feesFrequency: { type: String },
  feesAmount: { type: Number },
  highestPackageAmount: { type: Number },
  totalSeats: { type: Number },
  managementQuota: { type: Number },
  examsAccepted: [{ type: String }],
  eligibilityRequirements: [{ type: String }],
  assessmentMethods: [{ type: String }],
  certificationType: { type: String },
  tags: [{ type: String }],

  // Legacy fields for backward compatibility (optional)
  category: {
    type: String,
    maxlength: 100
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  price: { type: Number }, // Mapped from fee
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationDeadline: { type: Date, required: true },
  currentEnrollments: {
    type: Number,
    default: 0
  },
  prerequisites: [{
    type: String,
    maxlength: 200
  }],
  curriculum: [CourseModuleSchema],
  instructor: { type: String }, // Changed from InstructorSchema to simple string
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  enrollmentCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  language: { type: String, default: 'English' },
  hasLiveClasses: { type: Boolean, default: false },
  hasRecordedContent: { type: Boolean, default: true },
  hasAssignments: { type: Boolean, default: true },
  hasQuizzes: { type: Boolean, default: true },
  hasCertificate: { type: Boolean, default: true },
  learningOutcomes: [{ type: String }],
  difficultyLevel: { type: Number, default: 3 },
  enrollmentStartDate: { type: Date },
  enrollmentEndDate: { type: Date },
  courseStartDate: { type: Date },
  courseEndDate: { type: Date },
  supportEmail: { type: String },
  supportPhone: { type: String },
  thumbnail: { type: String },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for public ID
CourseSchema.virtual('id').get(function () {
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
CourseSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

// Interface for Course document
export interface ICourse extends Document {
  _id: mongoose.Types.ObjectId
  instituteId: mongoose.Types.ObjectId
  title: string
  description: string
  courseType: string
  duration: number
  fee: number
  maxStudents: number
  modeOfStudy: 'online' | 'offline' | 'hybrid'
  isPublished: boolean

  // Optional new fields
  specializations?: string[]
  applicableStreams?: string[]
  feesFrequency?: string
  feesAmount?: number
  highestPackageAmount?: number
  totalSeats?: number
  managementQuota?: number
  examsAccepted?: string[]
  eligibilityRequirements?: string[]
  syllabus?: string[]
  assessmentMethods?: string[]
  certificationType?: string
  tags?: string[]

  // Legacy fields for backward compatibility (optional)
  category?: string
  level?: 'beginner' | 'intermediate' | 'advanced'
  currency?: string
  price?: number
  startDate?: Date
  endDate?: Date
  registrationDeadline?: Date
  currentEnrollments?: number
  prerequisites?: string[]
  curriculum?: {
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
  instructor?: string
  status?: 'draft' | 'active' | 'completed' | 'cancelled'
  applicationsCount?: number
  enrollmentCount?: number
  rating?: number

  // Additional optional fields
  estimatedHours?: number
  language?: string
  hasLiveClasses?: boolean
  hasRecordedContent?: boolean
  hasAssignments?: boolean
  hasQuizzes?: boolean
  hasCertificate?: boolean
  learningOutcomes?: string[]
  difficultyLevel?: number
  enrollmentStartDate?: Date
  enrollmentEndDate?: Date
  courseStartDate?: Date
  courseEndDate?: Date
  supportEmail?: string
  supportPhone?: string
  thumbnail?: string

  createdAt: Date
  updatedAt: Date
}


// Clear any existing model to ensure schema updates are applied
if (mongoose.models.Course) {
  delete mongoose.models.Course;
}

export default mongoose.model<ICourse>('Course', CourseSchema)
