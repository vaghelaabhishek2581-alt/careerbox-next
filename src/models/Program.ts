import mongoose, { Schema, Document } from 'mongoose'

// Program Semester Schema
const ProgramSemesterSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true }, // e.g., "Semester 1", "Year 1"
  subjects: [{
    name: { type: String, required: true },
    code: { type: String, required: true },
    credits: { type: Number, required: true },
    type: { 
      type: String, 
      enum: ['core', 'elective', 'practical', 'project'],
      required: true
    }
  }],
  totalCredits: { type: Number, required: true }
}, { _id: false })

// Eligibility Criteria Schema
const EligibilityCriteriaSchema = new Schema({
  minimumPercentage: { type: Number },
  requiredQualification: { type: String, required: true },
  ageLimit: {
    min: { type: Number },
    max: { type: Number }
  },
  entranceExam: { type: String },
  additionalRequirements: [{ type: String }]
}, { _id: false })

// Fee Structure Schema
const FeeStructureSchema = new Schema({
  tuitionFee: { type: Number, required: true },
  admissionFee: { type: Number, default: 0 },
  developmentFee: { type: Number, default: 0 },
  examFee: { type: Number, default: 0 },
  libraryFee: { type: Number, default: 0 },
  labFee: { type: Number, default: 0 },
  hostelFee: { type: Number, default: 0 },
  otherFees: { type: Number, default: 0 },
  totalFee: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paymentStructure: { 
    type: String, 
    enum: ['yearly', 'semester', 'monthly'],
    default: 'yearly'
  }
}, { _id: false })

// Program Schema
const ProgramSchema = new Schema({
  instituteId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Institute', 
    required: true 
  },
  name: { 
    type: String, 
    required: true,
    maxlength: 200
  },
  code: { 
    type: String, 
    required: true,
    maxlength: 20,
    uppercase: true
  },
  degree: { 
    type: String, 
    enum: ['Certificate', 'Diploma', 'Bachelor', 'Master', 'PhD', 'Post Graduate Diploma'],
    required: true
  },
  field: { 
    type: String, 
    required: true,
    maxlength: 100
  }, // e.g., "Engineering", "Medicine", "Arts", "Science"
  specialization: { 
    type: String, 
    maxlength: 100
  }, // e.g., "Computer Science", "Mechanical", "Civil"
  description: { 
    type: String, 
    required: true,
    maxlength: 5000
  },
  duration: Schema.Types.Mixed,
  mode: { 
    type: String, 
    enum: ['full-time', 'part-time', 'online', 'hybrid'],
    required: true
  },
  eligibilityCriteria: Schema.Types.Mixed,
  feeStructure: Schema.Types.Mixed,
  curriculum: [Schema.Types.Mixed],
  totalCredits: { type: Number, required: true },
  accreditation: [String],
  affiliatedUniversity: { type: String },
  approvedBy: [String], // e.g., "AICTE", "UGC", "NAAC"
  
  // Admission details
  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number },
  admissionStartDate: { type: Date },
  admissionEndDate: { type: Date },
  
  // Rankings and ratings
  ranking: Schema.Types.Mixed,
  
  // Statistics
  currentStudents: { type: Number, default: 0 },
  totalGraduates: { type: Number, default: 0 },
  placementPercentage: { type: Number, default: 0 },
  averagePackage: { type: Number, default: 0 },
  
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'discontinued'],
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

// Virtual for full program name
ProgramSchema.virtual('fullName').get(function() {
  return `${this.degree} in ${this.field}${this.specialization ? ` (${this.specialization})` : ''}`
})

// Virtual for program ID
ProgramSchema.virtual('id').get(function() {
  return this._id.toHexString()
})

// Indexes
ProgramSchema.index({ instituteId: 1 })
ProgramSchema.index({ degree: 1 })
ProgramSchema.index({ field: 1 })
ProgramSchema.index({ specialization: 1 })
ProgramSchema.index({ mode: 1 })
ProgramSchema.index({ status: 1 })
ProgramSchema.index({ code: 1 })
ProgramSchema.index({ 'feeStructure.totalFee': 1 })

// Text search index
ProgramSchema.index({
  name: 'text',
  description: 'text',
  field: 'text',
  specialization: 'text'
})

// Pre-save middleware
ProgramSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  
  // Calculate available seats
  if (this.totalSeats && !this.availableSeats) {
    this.availableSeats = this.totalSeats - this.currentStudents
  }
  
  next()
})

// Interface for Program document
export interface IProgram extends Document {
  _id: mongoose.Types.ObjectId
  instituteId: mongoose.Types.ObjectId
  name: string
  code: string
  degree: 'Certificate' | 'Diploma' | 'Bachelor' | 'Master' | 'PhD' | 'Post Graduate Diploma'
  field: string
  specialization?: string
  description: string
  duration: {
    years: number
    months: number
  }
  mode: 'full-time' | 'part-time' | 'online' | 'hybrid'
  eligibilityCriteria: {
    minimumPercentage?: number
    requiredQualification: string
    ageLimit?: {
      min?: number
      max?: number
    }
    entranceExam?: string
    additionalRequirements?: string[]
  }
  feeStructure: {
    tuitionFee: number
    admissionFee: number
    developmentFee: number
    examFee: number
    libraryFee: number
    labFee: number
    hostelFee: number
    otherFees: number
    totalFee: number
    currency: string
    paymentStructure: 'yearly' | 'semester' | 'monthly'
  }
  curriculum: {
    id: string
    name: string
    subjects: {
      name: string
      code: string
      credits: number
      type: 'core' | 'elective' | 'practical' | 'project'
    }[]
    totalCredits: number
  }[]
  totalCredits: number
  accreditation: string[]
  affiliatedUniversity?: string
  approvedBy: string[]
  totalSeats: number
  availableSeats?: number
  admissionStartDate?: Date
  admissionEndDate?: Date
  ranking?: {
    national?: number
    state?: number
    category?: number
  }
  currentStudents: number
  totalGraduates: number
  placementPercentage: number
  averagePackage: number
  status: 'active' | 'inactive' | 'discontinued'
  fullName: string
  createdAt: Date
  updatedAt: Date
}

export default mongoose.models.Program || mongoose.model<IProgram>('Program', ProgramSchema)
