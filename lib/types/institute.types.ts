export interface Institute {
  id: string
  userId: string
  instituteName: string
  type: string
  accreditation: string[]
  website?: string
  description: string
  logo?: string
  address: {
    street: string
    city: string
    state: string
    country: string
    zipCode: string
  }
  contactInfo: {
    email: string
    phone: string
    linkedin?: string
    twitter?: string
  }
  socialMedia: {
    linkedin?: string
    twitter?: string
    facebook?: string
    instagram?: string
  }
  establishedYear?: number
  studentCount?: number
  facultyCount?: number
  isVerified: boolean
  subscriptionId?: string
  status: 'active' | 'inactive' | 'suspended'
  createdAt: Date
  updatedAt: Date
}

// RegistrationIntent is used for tracking application status before approval.
// This interface matches the Redux state in registrationSlice.
export interface RegistrationIntent {
  id: string;
  userId: string;
  organizationName: string;
  type: 'institute' | 'business';
  email: string;
  contactPhone: string;
  status: 'pending' | 'approved' | 'rejected' | 'payment_required' | 'completed';
  description?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  adminNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface InstituteProfile {
  institute: Institute
  courses: any[] // Course[]
  exams: any[] // Exam[]
  analytics: InstituteAnalytics
}

export interface InstituteAnalytics {
  totalCoursesOffered: number
  activeCourses: number
  totalEnrollments: number
  totalExamsCreated: number
  activeExams: number
  totalExamRegistrations: number
  monthlyViews: number
  profileCompleteness: number
}

export interface CreateInstituteRequest {
  instituteName: string
  type: string
  accreditation: string[]
  website?: string
  description: string
  logo?: string
  address: {
    street: string
    city: string
    state: string
    country: string
    zipCode: string
  }
  contactInfo: {
    email: string
    phone: string
    linkedin?: string
    twitter?: string
  }
  socialMedia: {
    linkedin?: string
    twitter?: string
    facebook?: string
    instagram?: string
  }
  establishedYear?: number
  studentCount?: number
  facultyCount?: number
}

export interface UpdateInstituteRequest extends Partial<CreateInstituteRequest> {
  status?: 'active' | 'inactive' | 'suspended'
  isVerified?: boolean
}

export interface InstituteSearchFilters {
  type?: string[]
  accreditation?: string[]
  location?: string
  isVerified?: boolean
  establishedYearFrom?: number
  establishedYearTo?: number
}

export interface InstituteSearchResponse {
  institutes: Institute[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}
