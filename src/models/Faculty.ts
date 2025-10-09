import mongoose, { Schema, Document } from 'mongoose'

// Education Schema for Faculty
const EducationSchema = new Schema({
  degree: { type: String, required: true },
  field: { type: String, required: true },
  institution: { type: String, required: true },
  year: { type: Number, required: true },
  grade: { type: String }
}, { _id: false })

// Experience Schema for Faculty
const ExperienceSchema = new Schema({
  position: { type: String, required: true },
  organization: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  isCurrent: { type: Boolean, default: false },
  description: { type: String }
}, { _id: false })

// Research/Publication Schema
const PublicationSchema = new Schema({
  title: { type: String, required: true },
  journal: { type: String, required: true },
  year: { type: Number, required: true },
  authors: [{ type: String }],
  doi: { type: String },
  url: { type: String }
}, { _id: false })

// Social Media Schema
const SocialMediaSchema = new Schema({
  linkedin: { type: String },
  twitter: { type: String },
  researchGate: { type: String },
  googleScholar: { type: String },
  orcid: { type: String }
}, { _id: false })

// Faculty Schema
const FacultySchema = new Schema({
  instituteId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Institute', 
    required: true 
  },
  employeeId: { 
    type: String, 
    required: true,
    maxlength: 50
  },
  personalInfo: {
    firstName: { type: String, required: true, maxlength: 50 },
    lastName: { type: String, required: true, maxlength: 50 },
    middleName: { type: String, maxlength: 50 },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    alternatePhone: { type: String },
    dateOfBirth: { type: Date },
    gender: { 
      type: String, 
      enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    address: {
      street: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: { type: String }
    }
  },
  
  // Professional Information
  department: { 
    type: String, 
    required: true,
    maxlength: 100
  },
  designation: { 
    type: String, 
    required: true,
    maxlength: 100
  }, // e.g., "Professor", "Associate Professor", "Assistant Professor", "Lecturer"
  employmentType: { 
    type: String, 
    enum: ['full-time', 'part-time', 'visiting', 'adjunct', 'emeritus'],
    required: true
  },
  joiningDate: { type: Date, required: true },
  
  // Academic Information
  qualifications: [EducationSchema],
  specialization: [{ type: String, maxlength: 100 }],
  researchInterests: [{ type: String, maxlength: 100 }],
  
  // Experience
  totalExperience: { type: Number, default: 0 }, // in years
  teachingExperience: { type: Number, default: 0 }, // in years
  industryExperience: { type: Number, default: 0 }, // in years
  previousExperience: [ExperienceSchema],
  
  // Research & Publications
  publications: [PublicationSchema],
  researchProjects: [{
    title: { type: String, required: true },
    fundingAgency: { type: String },
    amount: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { 
      type: String, 
      enum: ['ongoing', 'completed', 'submitted', 'approved'],
      default: 'ongoing'
    }
  }],
  
  // Teaching
  subjectsTaught: [{ type: String }],
  coursesHandled: [{
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    courseName: { type: String, required: true },
    semester: { type: String },
    academicYear: { type: String }
  }],
  
  // Profile & Media
  profileImage: { type: String },
  bio: { type: String, maxlength: 1000 },
  socialMedia: SocialMediaSchema,
  
  // Awards & Recognition
  awards: [{
    title: { type: String, required: true },
    organization: { type: String, required: true },
    year: { type: Number, required: true },
    description: { type: String }
  }],
  
  // Administrative Roles
  administrativeRoles: [{
    position: { type: String, required: true },
    department: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    isCurrent: { type: Boolean, default: false }
  }],
  
  // Status
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'on-leave', 'retired'],
    default: 'active'
  },
  isVerified: { type: Boolean, default: false },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for full name
FacultySchema.virtual('fullName').get(function() {
  const { firstName, middleName, lastName } = this.personalInfo
  return `${firstName}${middleName ? ` ${middleName}` : ''} ${lastName}`
})

// Virtual for faculty ID
FacultySchema.virtual('id').get(function() {
  return this._id.toHexString()
})

// Virtual for current age
FacultySchema.virtual('age').get(function() {
  if (!this.personalInfo.dateOfBirth) return null
  const today = new Date()
  const birthDate = new Date(this.personalInfo.dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
})

// Indexes
FacultySchema.index({ instituteId: 1 })
FacultySchema.index({ employeeId: 1, instituteId: 1 }, { unique: true })
FacultySchema.index({ department: 1 })
FacultySchema.index({ designation: 1 })
FacultySchema.index({ employmentType: 1 })
FacultySchema.index({ status: 1 })
FacultySchema.index({ 'personalInfo.email': 1 })
FacultySchema.index({ 'personalInfo.firstName': 1, 'personalInfo.lastName': 1 })

// Text search index
FacultySchema.index({
  'personalInfo.firstName': 'text',
  'personalInfo.lastName': 'text',
  'personalInfo.email': 'text',
  department: 'text',
  designation: 'text',
  specialization: 'text'
})

// Pre-save middleware
FacultySchema.pre('save', function(next) {
  this.updatedAt = new Date()
  
  // Calculate total experience based on joining date
  if (this.joiningDate) {
    const today = new Date()
    const joiningDate = new Date(this.joiningDate)
    const experienceInMs = today.getTime() - joiningDate.getTime()
    const experienceInYears = Math.floor(experienceInMs / (1000 * 60 * 60 * 24 * 365))
    this.teachingExperience = Math.max(this.teachingExperience, experienceInYears)
  }
  
  next()
})

// Interface for Faculty document
export interface IFaculty extends Document {
  _id: mongoose.Types.ObjectId
  instituteId: mongoose.Types.ObjectId
  employeeId: string
  personalInfo: {
    firstName: string
    lastName: string
    middleName?: string
    email: string
    phone: string
    alternatePhone?: string
    dateOfBirth?: Date
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say'
    address: {
      street?: string
      city: string
      state: string
      country: string
      zipCode?: string
    }
  }
  department: string
  designation: string
  employmentType: 'full-time' | 'part-time' | 'visiting' | 'adjunct' | 'emeritus'
  joiningDate: Date
  qualifications: {
    degree: string
    field: string
    institution: string
    year: number
    grade?: string
  }[]
  specialization: string[]
  researchInterests: string[]
  totalExperience: number
  teachingExperience: number
  industryExperience: number
  previousExperience: {
    position: string
    organization: string
    startDate: Date
    endDate?: Date
    isCurrent: boolean
    description?: string
  }[]
  publications: {
    title: string
    journal: string
    year: number
    authors: string[]
    doi?: string
    url?: string
  }[]
  researchProjects: {
    title: string
    fundingAgency?: string
    amount?: number
    startDate?: Date
    endDate?: Date
    status: 'ongoing' | 'completed' | 'submitted' | 'approved'
  }[]
  subjectsTaught: string[]
  coursesHandled: {
    courseId?: mongoose.Types.ObjectId
    courseName: string
    semester?: string
    academicYear?: string
  }[]
  profileImage?: string
  bio?: string
  socialMedia: {
    linkedin?: string
    twitter?: string
    researchGate?: string
    googleScholar?: string
    orcid?: string
  }
  awards: {
    title: string
    organization: string
    year: number
    description?: string
  }[]
  administrativeRoles: {
    position: string
    department?: string
    startDate: Date
    endDate?: Date
    isCurrent: boolean
  }[]
  status: 'active' | 'inactive' | 'on-leave' | 'retired'
  isVerified: boolean
  fullName: string
  age?: number
  createdAt: Date
  updatedAt: Date
}

export { IFaculty }
export default mongoose.models.Faculty || mongoose.model<IFaculty>('Faculty', FacultySchema)
