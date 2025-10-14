// import mongoose, { Schema, Document, models, model } from 'mongoose'

// // Interfaces (kept concise while covering structure of enhanced JSON)
// export interface IAdminInstitute extends Document {
//   id: string
//   name: string
//   shortName?: string
//   slug: string
//   establishedYear?: number
//   type?: string
//   status?: string
//   logo?: string
//   coverImage?: string
//   website?: string

//   accreditation?: {
//     naac?: { grade?: string; category?: string; cgpa?: number; validUntil?: string; cycleNumber?: number }
//     nirf?: { overallRank?: string | number; universityRank?: string | number; managementRank?: string | number; year?: number }
//     ugc?: { recognition?: string }
//   }

//   location?: {
//     address?: string
//     city?: string
//     state?: string
//     pincode?: string
//     country?: string
//     coordinates?: { latitude?: number; longitude?: number }
//     nearbyLandmarks?: string[]
//   }

//   contact?: {
//     phone?: string[]
//     email?: string
//     website?: string
//     admissionsEmail?: string
//   }

//   overview?: {
//     description?: string
//     vision?: string
//     mission?: string
//     motto?: string
//     founder?: string
//     chancellor?: string
//     viceChancellor?: string
//   }

//   campusDetails?: {
//     campusType?: string
//     environment?: string
//     facilities?: {
//       academic?: string[]
//       residential?: string[]
//       recreational?: string[]
//       support?: string[]
//     }
//   }

//   academics?: {
//     totalStudents?: number
//     totalFaculty?: number
//     studentFacultyRatio?: string
//     internationalStudents?: number
//     totalPrograms?: number
//     schools?: Array<{ name: string; established?: number; programs?: string[] }>
//   }

//   admissions?: {
//     courseWiseAdmissions?: Array<{
//       name: string
//       duration?: string
//       courseRating?: number
//       ratingCount?: number
//       totalSeats?: number
//       courseCount?: number
//       fees?: { min?: number; max?: number } | number
//       medianSalary?: { min?: number; max?: number } | number
//       eligibility?: { [k: string]: number }
//       courseLevel?: string
//       url?: string
//     }>
//     admissionProcess?: string[]
//     reservationPolicy?: { [k: string]: string | number }
//   }

//   placements?: {
//     [year: string]: any
//     topRecruiters?: string[]
//     sectors?: string[]
//   }

//   rankings?: {
//     national?: Array<{ agency: string; category: string; rank: string | number; year: number }>
//     rankingsDescription?: string
//   }

//   researchAndInnovation?: {
//     researchCenters?: number
//     patentsFiled?: number
//     publicationsPerYear?: number
//     researchFunding?: string
//     phdScholars?: number
//     incubationCenter?: { name?: string; startupsFunded?: number; totalFunding?: string }
//     collaborations?: string[]
//   }

//   alumniNetwork?: {
//     totalAlumni?: number
//     notableAlumni?: string[]
//     alumniInFortune500?: number
//     entrepreneursCreated?: number
//   }

//   awards?: string[]

//   mediaGallery?: {
//     photos?: { [category: string]: string[] }
//     videos?: Array<{ url: string; title?: string; thumbnail?: string }>
//   }

//   courses?: Array<{
//     name: string
//     degree?: string
//     school?: string
//     duration?: string
//     level?: string
//     category?: string
//     totalSeats?: number
//     reviewCount?: number
//     questionsCount?: number
//     fees?: { tuitionFee?: number; totalFee?: number; currency?: string }
//     brochure?: { url?: string; year?: number }
//     seoUrl?: string
//     location?: { state?: string; city?: string; locality?: string }
//     educationType?: string
//     deliveryMethod?: string
//     courseLevel?: string
//     affiliatedUniversity?: string
//     recognition?: string[]
//     placements?: { averagePackage?: number; highestPackage?: number; placementRate?: number; topRecruiters?: string[] }
//   }>

//   createdAt: Date
//   updatedAt: Date
// }

// const AdminInstituteSchema = new Schema<IAdminInstitute>(
//   {
//     id: { type: String, required: true, index: true },
//     name: { type: String, required: true },
//     shortName: { type: String },
//     slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
//     establishedYear: { type: Number },
//     type: { type: String },
//     status: { type: String },
//     logo: { type: String },
//     coverImage: { type: String },
//     website: { type: String },

//     accreditation: {
//       naac: {
//         grade: String,
//         category: String,
//         cgpa: Number,
//         validUntil: String,
//         cycleNumber: Number,
//       },
//       nirf: {
//         overallRank: Schema.Types.Mixed,
//         universityRank: Schema.Types.Mixed,
//         managementRank: Schema.Types.Mixed,
//         year: Number,
//       },
//       ugc: {
//         recognition: String,
//       },
//     },

//     location: {
//       address: String,
//       city: String,
//       state: String,
//       pincode: String,
//       country: String,
//       coordinates: {
//         latitude: Number,
//         longitude: Number,
//       },
//       nearbyLandmarks: [String],
//     },

//     contact: {
//       phone: [String],
//       email: String,
//       website: String,
//       admissionsEmail: String,
//     },

//     overview: {
//       description: String,
//       vision: String,
//       mission: String,
//       motto: String,
//       founder: String,
//       chancellor: String,
//       viceChancellor: String,
//     },

//     campusDetails: {
//       campusType: String,
//       environment: String,
//       facilities: {
//         academic: [String],
//         residential: [String],
//         recreational: [String],
//         support: [String],
//       },
//     },

//     academics: {
//       totalStudents: Number,
//       totalFaculty: Number,
//       studentFacultyRatio: String,
//       internationalStudents: Number,
//       totalPrograms: Number,
//       schools: [
//         new Schema(
//           {
//             name: { type: String, required: true },
//             established: Number,
//             programs: [String],
//           },
//           { _id: false }
//         ),
//       ],
//     },

//     admissions: {
//       courseWiseAdmissions: [
//         new Schema(
//           {
//             name: { type: String, required: true },
//             duration: String,
//             courseRating: Number,
//             ratingCount: Number,
//             totalSeats: Number,
//             courseCount: Number,
//             fees: { type: Schema.Types.Mixed }, // number or {min,max}
//             medianSalary: { type: Schema.Types.Mixed }, // number or {min,max}
//             eligibility: { type: Schema.Types.Mixed },
//             courseLevel: String,
//             url: String,
//           },
//           { _id: false }
//         ),
//       ],
//       admissionProcess: [String],
//       reservationPolicy: { type: Schema.Types.Mixed },
//     },

//     placements: { type: Schema.Types.Mixed },

//     rankings: {
//       national: [
//         new Schema(
//           {
//             agency: { type: String, required: true },
//             category: { type: String, required: true },
//             rank: { type: Schema.Types.Mixed, required: true },
//             year: { type: Number, required: true },
//           },
//           { _id: false }
//         ),
//       ],
//       rankingsDescription: String,
//     },

//     researchAndInnovation: {
//       researchCenters: Number,
//       patentsFiled: Number,
//       publicationsPerYear: Number,
//       researchFunding: String,
//       phdScholars: Number,
//       incubationCenter: {
//         name: String,
//         startupsFunded: Number,
//         totalFunding: String,
//       },
//       collaborations: [String],
//     },

//     alumniNetwork: {
//       totalAlumni: Number,
//       notableAlumni: [String],
//       alumniInFortune500: Number,
//       entrepreneursCreated: Number,
//     },

//     awards: [String],

//     mediaGallery: {
//       photos: { type: Schema.Types.Mixed }, // object with category arrays
//       videos: [
//         new Schema(
//           {
//             url: { type: String, required: true },
//             title: String,
//             thumbnail: String,
//           },
//           { _id: false }
//         ),
//       ],
//     },

//     courses: [
//       new Schema(
//         {
//           name: { type: String, required: true },
//           degree: String,
//           school: String,
//           duration: String,
//           level: String,
//           category: String,
//           totalSeats: Number,
//           reviewCount: Number,
//           questionsCount: Number,
//           fees: {
//             tuitionFee: Number,
//             totalFee: Number,
//             currency: String,
//           },
//           brochure: {
//             url: String,
//             year: Number,
//           },
//           seoUrl: String,
//           location: {
//             state: String,
//             city: String,
//             locality: String,
//           },
//           educationType: String,
//           deliveryMethod: String,
//           courseLevel: String,
//           affiliatedUniversity: String,
//           recognition: [String],
//           placements: {
//             averagePackage: Number,
//             highestPackage: Number,
//             placementRate: Number,
//             topRecruiters: [String],
//           },
//         },
//       ),
//     ],
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// )

// AdminInstituteSchema.index({ slug: 1 }, { unique: true })
// AdminInstituteSchema.index({ name: 1 })
// AdminInstituteSchema.index({ type: 1 })
// AdminInstituteSchema.index({ status: 1 })
// AdminInstituteSchema.index({ 'location.city': 1, 'location.state': 1 })

// const AdminInstitute = models.AdminInstitute || model<IAdminInstitute>('AdminInstitute', AdminInstituteSchema)
// export default AdminInstitute
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

  accreditation?: any
  location?: any
  contact?: any
  overview?: any
  campusDetails?: any
  academics?: any
  admissions?: any
  placements?: any
  rankings?: any
  researchAndInnovation?: any
  alumniNetwork?: any
  awards?: string[]
  mediaGallery?: any

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
    placements?: { averagePackage?: number; highestPackage?: number; placementRate?: number; topRecruiters?: string[] }
  }>

  // New structure: Programmes with nested courses
  programmes?: Array<{
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
      placements?: { averagePackage?: number; highestPackage?: number; placementRate?: number; topRecruiters?: string[] }
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
    // 👇 this ensures each course gets its own MongoDB ObjectId automatically
    _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },

    name: { type: String, required: true },
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
      currency: String,
    },
    brochure: {
      url: String,
      year: Number,
    },
    seoUrl: String,
    location: {
      state: String,
      city: String,
      locality: String,
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
      topRecruiters: [String],
    },
    eligibilityExams: [String],
  },
  { _id: true } // explicitly ensure _id is included
)

// ===============================
// Programme Schema (new)
// ===============================
const ProgrammeSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    name: { type: String, required: true },
    courseCount: Number,
    placementRating: Number,
    eligibilityExams: [String],
    course: [CourseSchema],
  },
)

// ===============================
// Main Institute Schema
// ===============================
const AdminInstituteSchema = new Schema<IAdminInstitute>(
  {
    id: { type: String, required: true, index: true },
    name: { type: String, required: true },
    shortName: String,
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    establishedYear: Number,
    type: String,
    status: String,
    logo: String,
    coverImage: String,
    website: String,

    accreditation: {
      naac: {
        grade: String,
        category: String,
        cgpa: Number,
        validUntil: String,
        cycleNumber: Number,
      },
      nirf: {
        overallRank: Schema.Types.Mixed,
        universityRank: Schema.Types.Mixed,
        managementRank: Schema.Types.Mixed,
        year: Number,
      },
      ugc: {
        recognition: String,
      },
    },

    location: {
      address: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
      nearbyLandmarks: [String],
    },

    contact: {
      phone: [String],
      email: String,
      website: String,
      admissionsEmail: String,
    },

    overview: {
      description: String,
      vision: String,
      mission: String,
      motto: String,
      founder: String,
      chancellor: String,
      viceChancellor: String,
      stats: [
        new Schema(
          {
            title: String,
            description: String,
          },
          { _id: false }
        ),
      ],
    },

    campusDetails: {
      campusType: String,
      environment: String,
      facilities: {
        academic: [String],
        residential: [String],
        recreational: [String],
        support: [String],
      },
    },

    academics: {
      totalStudents: Number,
      totalFaculty: Number,
      studentFacultyRatio: String,
      internationalStudents: Number,
      totalPrograms: Number,
      schools: [
        new Schema(
          {
            name: { type: String, required: true },
            established: Number,
            programs: [String],
          },
          { _id: false }
        ),
      ],
    },

    admissions: {
      courseWiseAdmissions: [
        new Schema(
          {
            name: { type: String, required: true },
            duration: String,
            courseRating: Number,
            ratingCount: Number,
            totalSeats: Number,
            courseCount: Number,
            fees: { type: Schema.Types.Mixed },
            medianSalary: { type: Schema.Types.Mixed },
            eligibility: { type: Schema.Types.Mixed },
            courseLevel: String,
            url: String,
          },
          { _id: false }
        ),
      ],
      admissionProcess: [String],
      reservationPolicy: { type: Schema.Types.Mixed },
    },

    placements: { type: Schema.Types.Mixed },

    rankings: {
      national: [
        new Schema(
          {
            agency: { type: String, required: true },
            category: { type: String, required: true },
            rank: { type: Schema.Types.Mixed, required: true },
            year: { type: Number, required: true },
          },
          { _id: false }
        ),
      ],
      rankingsDescription: String,
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
        totalFunding: String,
      },
      collaborations: [String],
    },

    alumniNetwork: {
      totalAlumni: Number,
      notableAlumni: [String],
      alumniInFortune500: Number,
      entrepreneursCreated: Number,
    },

    awards: [String],

    mediaGallery: {
      photos: { type: Schema.Types.Mixed },
      videos: [
        new Schema(
          {
            url: { type: String, required: true },
            title: String,
            thumbnail: String,
          },
          { _id: false }
        ),
      ],
    },

    programmes: [ProgrammeSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// ===============================
// Indexes
// ===============================
AdminInstituteSchema.index({ slug: 1 }, { unique: true })
AdminInstituteSchema.index({ name: 1 })
AdminInstituteSchema.index({ type: 1 })
AdminInstituteSchema.index({ status: 1 })
AdminInstituteSchema.index({ 'location.city': 1, 'location.state': 1 })

// ===============================
// Export Model
// ===============================
const AdminInstitute =
  models.AdminInstitute || model<IAdminInstitute>('AdminInstitute', AdminInstituteSchema)
export default AdminInstitute
