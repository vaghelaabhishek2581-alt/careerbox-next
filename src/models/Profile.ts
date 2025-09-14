import mongoose, { Schema, Document } from 'mongoose'

// ============================================================================
// INTERFACES
// ============================================================================

export interface ISkill {
  id: string
  name: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  category?: string
  verified?: boolean
  endorsements?: number
  yearsOfExperience?: number
}

export interface ILanguage {
  id: string
  name: string
  level: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'FLUENT' | 'NATIVE'
  certifications?: string[]
}

export interface IPersonalDetails {
  firstName: string
  lastName: string
  middleName?: string
  dateOfBirth?: Date
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'
  professionalHeadline?: string
  publicProfileId: string
  aboutMe?: string
  phone?: string
  interests?: string[]
  professionalBadges?: string[]
  nationality?: string
}

export interface IWorkPosition {
  id: string
  title: string
  startDate: Date
  endDate?: Date
  isCurrent: boolean
  description?: string
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE'
  skills?: string[]
  achievements?: string[]
  salary?: {
    amount?: number
    currency?: string
    isPublic: boolean
  }
}

export interface IWorkExperience {
  id: string
  company: string
  location?: string
  positions: IWorkPosition[]
  companyLogo?: string
  companyWebsite?: string
  industry?: string
  companySize?: string
}

export interface IEducation {
  id: string
  degree: string
  institution: string
  fieldOfStudy?: string
  startDate: Date
  endDate?: Date
  isCurrent: boolean
  location?: string
  grade?: string
  description?: string
  institutionLogo?: string
  institutionWebsite?: string
  accreditation?: string
  honors?: string[]
}

export interface ISocialLinks {
  linkedin?: string
  twitter?: string
  github?: string
  instagram?: string
  facebook?: string
  youtube?: string
  portfolio?: string
  website?: string
}

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId
  personalDetails: IPersonalDetails
  workExperiences: IWorkExperience[]
  education: IEducation[]
  skills: ISkill[]
  languages: ILanguage[]
  socialLinks?: ISocialLinks
  profileImage?: string
  coverImage?: string
  location?: string
  bio?: string
  isPublic: boolean
  isComplete: boolean
  completionPercentage: number
  lastUpdated: Date
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// SCHEMAS
// ============================================================================

const SkillSchema = new Schema<ISkill>({
  id: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  level: { 
    type: String, 
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
    required: true 
  },
  category: { type: String, trim: true },
  verified: { type: Boolean, default: false },
  endorsements: { type: Number, default: 0 },
  yearsOfExperience: { type: Number, min: 0 }
}, { _id: false })

const LanguageSchema = new Schema<ILanguage>({
  id: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  level: { 
    type: String, 
    enum: ['BASIC', 'INTERMEDIATE', 'ADVANCED', 'FLUENT', 'NATIVE'],
    required: true 
  },
  certifications: [{ type: String, trim: true }]
}, { _id: false })

const PersonalDetailsSchema = new Schema<IPersonalDetails>({
  firstName: { type: String, required: true, trim: true, maxlength: 50 },
  lastName: { type: String, required: true, trim: true, maxlength: 50 },
  middleName: { type: String, trim: true, maxlength: 50 },
  dateOfBirth: { type: Date },
  gender: { 
    type: String, 
    enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'],
    default: 'PREFER_NOT_TO_SAY'
  },
  professionalHeadline: { type: String, trim: true, maxlength: 200 },
  publicProfileId: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_-]+$/
  },
  aboutMe: { type: String, trim: true, maxlength: 2000 },
  phone: { type: String, trim: true },
  interests: [{ type: String, trim: true, maxlength: 50 }],
  professionalBadges: [{ type: String, trim: true, maxlength: 50 }],
  nationality: { type: String, trim: true },
  languages: [{ type: String, trim: true }]
}, { _id: false })

const WorkPositionSchema = new Schema<IWorkPosition>({
  id: { type: String, required: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  isCurrent: { type: Boolean, default: false },
  description: { type: String, trim: true, maxlength: 2000 },
  employmentType: { 
    type: String, 
    enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'],
    required: true 
  },
  skills: [{ type: String, trim: true }],
  achievements: [{ type: String, trim: true }],
  salary: {
    amount: { type: Number, min: 0 },
    currency: { type: String, trim: true },
    isPublic: { type: Boolean, default: false }
  }
}, { _id: false })

const WorkExperienceSchema = new Schema<IWorkExperience>({
  id: { type: String, required: true },
  company: { type: String, required: true, trim: true, maxlength: 100 },
  location: { type: String, trim: true, maxlength: 100 },
  positions: [WorkPositionSchema],
  companyLogo: { type: String, trim: true },
  companyWebsite: { type: String, trim: true },
  industry: { type: String, trim: true },
  companySize: { type: String, trim: true }
}, { _id: false })

const EducationSchema = new Schema<IEducation>({
  id: { type: String, required: true },
  degree: { type: String, required: true, trim: true, maxlength: 100 },
  institution: { type: String, required: true, trim: true, maxlength: 100 },
  fieldOfStudy: { type: String, trim: true, maxlength: 100 },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  isCurrent: { type: Boolean, default: false },
  location: { type: String, trim: true, maxlength: 100 },
  grade: { type: String, trim: true, maxlength: 50 },
  description: { type: String, trim: true, maxlength: 1000 },
  institutionLogo: { type: String, trim: true },
  institutionWebsite: { type: String, trim: true },
  accreditation: { type: String, trim: true },
  honors: [{ type: String, trim: true }]
}, { _id: false })

const SocialLinksSchema = new Schema<ISocialLinks>({
  linkedin: { type: String, trim: true },
  twitter: { type: String, trim: true },
  github: { type: String, trim: true },
  instagram: { type: String, trim: true },
  facebook: { type: String, trim: true },
  youtube: { type: String, trim: true },
  portfolio: { type: String, trim: true },
  website: { type: String, trim: true }
}, { _id: false })

const ProfileSchema = new Schema<IProfile>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  personalDetails: { type: PersonalDetailsSchema, required: true },
  workExperiences: [WorkExperienceSchema],
  education: [EducationSchema],
  skills: [SkillSchema],
  languages: [LanguageSchema],
  socialLinks: SocialLinksSchema,
  profileImage: { type: String, trim: true },
  coverImage: { type: String, trim: true },
  location: { type: String, trim: true, maxlength: 100 },
  bio: { type: String, trim: true, maxlength: 500 },
  isPublic: { type: Boolean, default: true },
  isComplete: { type: Boolean, default: false },
  completionPercentage: { type: Number, min: 0, max: 100, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// ============================================================================
// INDEXES
// ============================================================================

// userId and publicProfileId indexes are automatically created by unique: true
ProfileSchema.index({ isPublic: 1 })
ProfileSchema.index({ isComplete: 1 })
ProfileSchema.index({ createdAt: -1 })
ProfileSchema.index({ updatedAt: -1 })

// ============================================================================
// VIRTUALS
// ============================================================================

ProfileSchema.virtual('fullName').get(function() {
  const { firstName, lastName, middleName } = this.personalDetails
  return middleName ? `${firstName} ${middleName} ${lastName}` : `${firstName} ${lastName}`
})

ProfileSchema.virtual('age').get(function() {
  if (!this.personalDetails.dateOfBirth) return null
  const today = new Date()
  const birthDate = new Date(this.personalDetails.dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
})

// ============================================================================
// METHODS
// ============================================================================

ProfileSchema.methods.calculateCompletionPercentage = function() {
  let completed = 0
  let total = 0

  // Personal details (40% weight)
  const personalFields = ['firstName', 'lastName', 'professionalHeadline', 'aboutMe']
  personalFields.forEach(field => {
    total++
    if (this.personalDetails[field]) completed++
  })

  // Work experience (25% weight)
  if (this.workExperiences && this.workExperiences.length > 0) {
    completed += 25
  }
  total += 25

  // Education (15% weight)
  if (this.education && this.education.length > 0) {
    completed += 15
  }
  total += 15

  // Skills (10% weight)
  if (this.skills && this.skills.length > 0) {
    completed += 10
  }
  total += 10

  // Languages (5% weight)
  if (this.languages && this.languages.length > 0) {
    completed += 5
  }
  total += 5

  // Social links (5% weight)
  if (this.socialLinks && Object.values(this.socialLinks).some(link => link)) {
    completed += 5
  }
  total += 5

  return Math.round((completed / total) * 100)
}

ProfileSchema.methods.updateCompletionStatus = function() {
  this.completionPercentage = this.calculateCompletionPercentage()
  this.isComplete = this.completionPercentage >= 80
  this.lastUpdated = new Date()
  return this
}

// ============================================================================
// PRE-SAVE MIDDLEWARE
// ============================================================================

ProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  this.updateCompletionStatus()
  next()
})

// ============================================================================
// EXPORT
// ============================================================================

export { IProfile }
export default mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema)
