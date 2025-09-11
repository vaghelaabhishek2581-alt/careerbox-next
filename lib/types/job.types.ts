export interface Job {
  id: string
  businessId: string
  title: string
  description: string
  requirements: string[]
  responsibilities: string[]
  location: string
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship'
  salaryRange: {
    min: number
    max: number
    currency: string
  }
  skills: string[]
  experience: {
    min: number
    max: number
  }
  applicationDeadline: Date
  status: 'draft' | 'active' | 'paused' | 'closed'
  applicationsCount: number
  createdAt: Date
  updatedAt: Date
}

export interface JobApplication {
  id: string
  jobId: string
  userId: string
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interviewed' | 'accepted' | 'rejected'
  coverLetter?: string
  resumeUrl?: string
  appliedAt: Date
  updatedAt: Date
  notes?: string
}

export interface CreateJobRequest {
  title: string
  description: string
  requirements: string[]
  responsibilities: string[]
  location: string
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship'
  salaryRange: {
    min: number
    max: number
    currency: string
  }
  skills: string[]
  experience: {
    min: number
    max: number
  }
  applicationDeadline: Date
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> {
  status?: 'draft' | 'active' | 'paused' | 'closed'
}

export interface JobSearchFilters {
  location?: string
  employmentType?: string[]
  salaryMin?: number
  salaryMax?: number
  skills?: string[]
  experienceMin?: number
  experienceMax?: number
  industry?: string
  companySize?: string
}

export interface JobSearchResponse {
  jobs: Job[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}
