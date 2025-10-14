import mongoose, { Schema, Document, models, model } from 'mongoose'

export interface IStudentLead extends Document {
  _id: mongoose.Types.ObjectId
  // Who is applying
  userId?: mongoose.Types.ObjectId
  fullName: string
  email: string
  phone?: string
  city?: string
  eligibilityExams?: Array<{ exam: string; score: string }>

  // What they applied for
  courseId?: string
  courseName?: string
  instituteId?: string // Mongo _id (admin or account)
  instituteSlug?: string // AdminInstitute.slug
  publicProfileId?: string // Account Institute.publicProfileId
  isAdminInstitute: boolean // requested flag

  // Extra
  message?: string
  source?: string
  utm?: {
    source?: string
    medium?: string
    campaign?: string
  }
  status: 'new' | 'contacted' | 'qualified' | 'enrolled' | 'rejected'

  createdAt: Date
  updatedAt: Date
}

const StudentLeadSchema = new Schema<IStudentLead>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String },
    city: { type: String },
    eligibilityExams: [{
      exam: { type: String, trim: true },
      score: { type: String, trim: true }
    }],
    courseId: { type: String }, 
    courseName: { type: String },
    instituteId: { type: String },
    instituteSlug: { type: String, index: true, lowercase: true, trim: true },
    publicProfileId: { type: String, index: true, lowercase: true, trim: true },
    isAdminInstitute: { type: Boolean, required: true, default: true },
    message: { type: String },
    source: { type: String, default: 'institute_detail_page' },
    utm: {
      source: String,
      medium: String,
      campaign: String,
    },
    status: { type: String, enum: ['new', 'contacted', 'qualified', 'enrolled', 'rejected'], default: 'new' },
  },
  { timestamps: true } 
)

StudentLeadSchema.index({ email: 1, courseId: 1, instituteSlug: 1 })

const StudentLead = (models.StudentLead as mongoose.Model<IStudentLead>) || model<IStudentLead>('StudentLead', StudentLeadSchema)
export default StudentLead;