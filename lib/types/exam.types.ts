export interface Exam {
  id: string
  createdBy: string // businessId or instituteId
  createdByType: 'business' | 'institute'
  title: string
  description: string
  type: 'admission' | 'recruitment' | 'certification'
  duration: number // in minutes
  totalMarks: number
  passingMarks: number
  instructions: string[]
  eligibilityCriteria: string[]
  examDate: Date
  registrationDeadline: Date
  fee: number
  status: 'draft' | 'active' | 'completed'
  questions?: ExamQuestion[]
  registrationsCount: number
  createdAt: Date
  updatedAt: Date
}

export interface ExamQuestion {
  id: string
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay'
  question: string
  options?: string[]
  correctAnswer?: string | number
  marks: number
}

export interface ExamRegistration {
  id: string
  examId: string
  userId: string
  status: 'registered' | 'attended' | 'completed' | 'absent'
  registeredAt: Date
  attendedAt?: Date
  completedAt?: Date
  score?: number
  answers?: ExamAnswer[]
}

export interface ExamAnswer {
  questionId: string
  answer: string | number
  isCorrect?: boolean
  marksObtained?: number
}

export interface ExamResult {
  id: string
  examId: string
  userId: string
  totalMarks: number
  obtainedMarks: number
  percentage: number
  status: 'pass' | 'fail'
  completedAt: Date
  answers: ExamAnswer[]
}

export interface CreateExamRequest {
  title: string
  description: string
  type: 'admission' | 'recruitment' | 'certification'
  duration: number
  totalMarks: number
  passingMarks: number
  instructions: string[]
  eligibilityCriteria: string[]
  examDate: Date
  registrationDeadline: Date
  fee: number
  questions?: ExamQuestion[]
}

export interface UpdateExamRequest extends Partial<CreateExamRequest> {
  status?: 'draft' | 'active' | 'completed'
}

export interface ExamSearchFilters {
  type?: string[]
  createdByType?: 'business' | 'institute'
  examDateFrom?: Date
  examDateTo?: Date
  feeMax?: number
  status?: string[]
}

export interface ExamSearchResponse {
  exams: Exam[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}
