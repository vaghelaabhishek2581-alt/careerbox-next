export interface Application {
  id: string
  userId: string
  type: 'job' | 'course' | 'exam'
  targetId: string // jobId, courseId, or examId
  status: 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn'
  appliedAt: Date
  updatedAt: Date
  reviewedAt?: Date
  notes?: string
  documents?: ApplicationDocument[]
  interviewScheduled?: Date
  interviewNotes?: string
}

export interface ApplicationDocument {
  id: string
  name: string
  type: 'resume' | 'cover_letter' | 'certificate' | 'portfolio' | 'other'
  url: string
  uploadedAt: Date
}

export interface JobApplication extends Application {
  type: 'job'
  targetId: string // jobId
  coverLetter?: string
  resumeUrl?: string
  expectedSalary?: number
  availabilityDate?: Date
}

export interface CourseApplication extends Application {
  type: 'course'
  targetId: string // courseId
  motivationLetter?: string
  previousExperience?: string
  expectedOutcome?: string
}

export interface ExamApplication extends Application {
  type: 'exam'
  targetId: string // examId
  registrationFee?: number
  paymentStatus?: 'pending' | 'paid' | 'failed'
  specialRequirements?: string
}

export interface CreateApplicationRequest {
  type: 'job' | 'course' | 'exam'
  targetId: string
  coverLetter?: string
  motivationLetter?: string
  documents?: File[]
  additionalInfo?: Record<string, any>
}

export interface UpdateApplicationRequest {
  status?: 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn'
  notes?: string
  interviewScheduled?: Date
  interviewNotes?: string
}

export interface ApplicationFilters {
  type?: 'job' | 'course' | 'exam'
  status?: string[]
  appliedDateFrom?: Date
  appliedDateTo?: Date
  targetId?: string
}

export interface ApplicationSearchResponse {
  applications: Application[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}
