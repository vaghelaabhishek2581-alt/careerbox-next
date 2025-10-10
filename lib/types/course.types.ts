export interface Course {
  id: string
  instituteId: string
  title: string
  description: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: number // in weeks
  fee: number
  currency: string
  startDate: Date
  endDate: Date
  registrationDeadline: Date
  maxStudents: number
  currentEnrollments: number
  prerequisites: string[]
  curriculum: CourseModule[]
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
  
  // Optional properties used in InstituteDetailPage
  educationType?: string
  brochure?: {
    url: string
    name?: string
  }
  recognition?: Array<{
    name: string
    type?: string
  }>
  fees?: {
    tuitionFee: number
    totalFee?: number
    currency?: string
  }
  name?: string // Alternative name field
  degree?: string // Degree type
  school?: string // School/department
  totalSeats?: number // Total available seats
}

export interface CourseModule {
  id: string
  title: string
  description: string
  duration: number // in hours
  lessons: CourseLesson[]
}

export interface CourseLesson {
  id: string
  title: string
  description: string
  duration: number // in minutes
  type: 'video' | 'text' | 'quiz' | 'assignment'
  content?: string
  videoUrl?: string
  attachments?: string[]
}

export interface CourseEnrollment {
  id: string
  courseId: string
  userId: string
  status: 'enrolled' | 'completed' | 'dropped'
  enrolledAt: Date
  completedAt?: Date
  progress: number // percentage
  certificateUrl?: string
}

export interface CourseApplication {
  id: string
  courseId: string
  userId: string
  status: 'pending' | 'accepted' | 'rejected' | 'waitlisted'
  appliedAt: Date
  reviewedAt?: Date
  notes?: string
  documents?: string[]
}

export interface CreateCourseRequest {
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
  prerequisites: string[]
  curriculum: CourseModule[]
  instructor: {
    name: string
    bio: string
    qualifications: string[]
    experience: string
  }
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
  status?: 'draft' | 'active' | 'completed' | 'cancelled'
}

export interface CourseSearchFilters {
  category?: string[]
  level?: string[]
  feeMax?: number
  startDateFrom?: Date
  startDateTo?: Date
  durationMin?: number
  durationMax?: number
  status?: string[]
}

export interface CourseSearchResponse {
  courses: Course[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}
