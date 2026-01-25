import mongoose, { Schema, Document, models, model } from 'mongoose'

// ===============================
// Interfaces
// ===============================
export interface IAdminInstitute extends Document {
  id: string
  name: string
  shortName?: string
  slug: string
  establishedYear?: number
  type?: string
  status?: string
  logo?: string
  coverImage?: string
  website?: string
  published?: boolean
  publishLockedByAdmin?: boolean
  lastPublishChangedBy?: 'admin' | 'institute_admin'
  lastPublishedAt?: Date
  lastUnpublishedAt?: Date

  accreditation?: any
  location?: any
  contact?: any
  overview?: Array<{ key: string; value: string }>
  campusDetails?: any
  academics?: any
  admissions?: any
  placements?: any
  faculty_student_ratio?: any
  rankings?: any
  researchAndInnovation?: any
  alumniNetwork?: any
  awards?: string[]
  mediaGallery?: any

  // User management
  userIds: mongoose.Types.ObjectId[]

  courses?: Array<{
    _id?: mongoose.Types.ObjectId
    name: string
    degree?: string
    school?: string
    duration?: string
    level?: string
    category?: string
    totalSeats?: number
    reviewCount?: number
    questionsCount?: number
    eligibilityExams?: string[]
    fees?: { tuitionFee?: number; totalFee?: number; currency?: string }
    brochure?: { url?: string; year?: number }
    seoUrl?: string
    location?: { state?: string; city?: string; locality?: string }
    educationType?: string
    deliveryMethod?: string
    courseLevel?: string
    affiliatedUniversity?: string
    recognition?: string[]
    placements?: {
      averagePackage?: number
      highestPackage?: number
      placementRate?: number
      topRecruiters?: string[]
    }
  }>

  // New structure: Programmes with nested courses
  programmes?: Array<{
    _id?: mongoose.Types.ObjectId
    name: string
    courseCount?: number
    placementRating?: number
    eligibilityExams?: string[]
    course: Array<{
      _id?: mongoose.Types.ObjectId
      name: string
      degree?: string
      school?: string
      duration?: string
      level?: string
      category?: string
      totalSeats?: number
      reviewCount?: number
      questionsCount?: number
      eligibilityExams?: string[]
      fees?: { tuitionFee?: number; totalFee?: number; currency?: string }
      brochure?: { url?: string; year?: number }
      seoUrl?: string
      location?: { state?: string; city?: string; locality?: string }
      educationType?: string
      deliveryMethod?: string
      courseLevel?: string
      affiliatedUniversity?: string
      recognition?: string[]
      placements?: {
        averagePackage?: number
        highestPackage?: number
        placementRate?: number
        topRecruiters?: string[]
      }
    }>
  }>

  createdAt: Date
  updatedAt: Date
}

// ===============================
// Modularized Course Schema
// ===============================
const CourseSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    name: { type: String, required: false },
    degree: String,
    school: String,
    duration: String,
    level: String,
    category: String,
    totalSeats: Number,
    reviewCount: Number,
    questionsCount: Number,
    fees: {
      tuitionFee: Number,
      totalFee: Number,
      currency: String
    },
    brochure: {
      url: String,
      year: Number
    },
    seoUrl: String,
    location: {
      state: String,
      city: String,
      locality: String
    },
    educationType: String,
    deliveryMethod: String,
    courseLevel: String,
    affiliatedUniversity: String,
    recognition: [String],
    placements: {
      averagePackage: Number,
      highestPackage: Number,
      placementRate: Number,
      topRecruiters: [String]
    },
    eligibilityExams: [String]
  },
  { _id: true }
)

// ===============================
// Programme Schema (new)
// ===============================
const ProgrammeSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    name: { type: String, required: false },
    courseCount: Number,
    placementRating: Number,
    eligibilityExams: [String],
    course: [CourseSchema]
  },
  { _id: true }
)

// ===============================
// Main Institute Schema
// ===============================
const AdminInstituteSchema = new Schema<IAdminInstitute>(
  {
    id: { type: String, required: false, index: true },
    name: { type: String, required: false },
    shortName: String,
    slug: { type: String, required: false, lowercase: true, trim: true },
    establishedYear: Number,
    type: String,
    status: String,
    published: { type: Boolean, default: true },
    publishLockedByAdmin: { type: Boolean, default: false },
    lastPublishChangedBy: {
      type: String,
      enum: ['admin', 'institute_admin'],
      default: undefined
    },
    lastPublishedAt: { type: Date },
    lastUnpublishedAt: { type: Date },
    logo: String,
    coverImage: String,
    website: String,

    accreditation: {
      naac: {
        grade: String,
        category: String,
        cgpa: Number,
        validUntil: String,
        cycleNumber: Number
      },
      nirf: Schema.Types.Mixed, // Dynamic keys like Pharmacy, Innovation, University, etc.
      ugc: {
        recognition: String
      }
    },

    location: {
      address: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      },
      nearbyLandmarks: [String]
    },

    contact: {
      phone: [String],
      email: String,
      website: String,
      admissionsEmail: String
    },

    overview: [
      new Schema(
        {
          key: { type: String, required: false },
          value: { type: String, required: false }
        },
        { _id: false }
      )
    ],

    campusDetails: {
      campusType: String,
      environment: String,
      facilities: [
        new Schema(
          {
            key: { type: String, required: false },
            value: String
          },
          { _id: false }
        )
      ],
      facilities_arr: [String]
    },

    academics: {
      totalStudents: String,
      totalFaculty: String,
      studentFacultyRatio: String,
      internationalStudents: String,
      totalPrograms: String,
      schools: [
        new Schema(
          {
            name: { type: String, required: false },
            established: Number,
            programs: [String]
          },
          { _id: false }
        )
      ],
      programOverviews: [
        new Schema(
          {
            key: { type: String, required: false },
            value: String
          },
          { _id: false }
        )
      ]
    },

    admissions: {
      courseWiseAdmissions: [
        new Schema(
          {
            name: { type: String, required: false },
            duration: String,
            courseRating: Number,
            ratingCount: Number,
            totalSeats: Number,
            courseCount: Number,
            fees: { type: Schema.Types.Mixed },
            mediaGallery: {
              type: Schema.Types.Mixed,
              default: {}
            },
            userIds: [
              {
                type: Schema.Types.ObjectId,
                ref: 'User',
                default: []
              }
            ],
            eligibility: { type: Schema.Types.Mixed },
            courseLevel: String,
            url: String
          },
          { _id: false }
        )
      ],
      admissionProcess: [String],
      reservationPolicy: { type: Schema.Types.Mixed },
      applicationFee: { type: Schema.Types.Mixed }
    },

    placements: {
      type: new Schema(
        {
          2024: {
            overallPlacementRate: Number,
            averageSalary: Number,
            highestSalary: Number,
            medianSalary: Number,
            companiesVisited: Number,
            totalOffers: Number
          },
          topRecruiters: [String],
          sectors: [String]
        },
        { _id: false, strict: false }
      )
    },

    faculty_student_ratio: {
      faculties: [
        new Schema(
          {
            key: { type: String, required: false },
            value: String
          },
          { _id: false }
        )
      ],
      students: [
        new Schema(
          {
            title: String,
            data: [
              new Schema(
                {
                  key: { type: String, required: false },
                  value: String
                },
                { _id: false }
              )
            ],
            key: String,
            value: String
          },
          { _id: false }
        )
      ]
    },

    rankings: {
      national: {
        national: [
          new Schema(
            {
              agency: { type: String, required: false },
              category: { type: String, required: false },
              rank: { type: Schema.Types.Mixed, required: false },
              year: { type: Number, required: false }
            },
            { _id: false }
          )
        ]
      },
      rankingsDescription: String,
      title: String,
      description: String,
      data: [
        new Schema(
          {
            publisherName: { type: String, required: false },
            publisherLogo: String,
            entityName: String,
            rankData: [
              new Schema(
                {
                  year: { type: Number, required: false },
                  rank: String
                },
                { _id: false }
              )
            ]
          },
          { _id: false }
        )
      ]
    },

    researchAndInnovation: {
      researchCenters: Number,
      patentsFiled: Number,
      publicationsPerYear: Number,
      researchFunding: String,
      phdScholars: Number,
      incubationCenter: {
        name: String,
        startupsFunded: Number,
        totalFunding: String
      },
      collaborations: [String]
    },

    alumniNetwork: {
      totalAlumni: Number,
      notableAlumni: [String],
      alumniInFortune500: Number,
      entrepreneursCreated: Number
    },

    awards: [String],

    mediaGallery: {
      photos: { type: Schema.Types.Mixed },
      videos: [
        new Schema(
          {
            url: { type: String, required: false },
            title: String,
            thumbnail: String
          },
          { _id: false }
        )
      ]
    },

    userIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: []
      }
    ],

    programmes: [ProgrammeSchema]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// ===============================
// Indexes - Optimized for Performance
// ===============================
AdminInstituteSchema.index({ slug: 1 }, { unique: true })
AdminInstituteSchema.index({ name: 1 })
AdminInstituteSchema.index({ type: 1 })
AdminInstituteSchema.index({ status: 1 })
AdminInstituteSchema.index({ 'location.city': 1 })
AdminInstituteSchema.index({ 'location.state': 1 })
AdminInstituteSchema.index({ 'location.city': 1, 'location.state': 1 })

// Compound indexes for common queries
AdminInstituteSchema.index({ type: 1, 'location.city': 1 })
AdminInstituteSchema.index({ status: 1, type: 1 })
AdminInstituteSchema.index({ 'accreditation.nirf.overallRank': 1 })
AdminInstituteSchema.index({ 'accreditation.naac.grade': 1 })

// Text search index with optimized weights
AdminInstituteSchema.index(
  {
    name: 'text',
    'overview.description': 'text',
    'programmes.name': 'text',
    'programmes.course.name': 'text'
  },
  {
    weights: {
      name: 10,
      'programmes.name': 5,
      'programmes.course.name': 3,
      'overview.description': 1
    }
  }
)

// ===============================
// Export Model
// ===============================
const AdminInstitute =
  models.AdminInstitute ||
  model<IAdminInstitute>('AdminInstitute', AdminInstituteSchema)
export default AdminInstitute
