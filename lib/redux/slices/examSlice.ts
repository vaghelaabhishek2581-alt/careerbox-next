import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Exam, ExamRegistration, CreateExamRequest, UpdateExamRequest, ExamSearchFilters, ExamSearchResponse } from '@/lib/types/exam.types'
import { ApiResponse, PaginatedResponse } from '@/lib/types/api.types'
import apiClient from '@/lib/api/client'

interface ExamState {
  exams: Exam[]
  currentExam: Exam | null
  registrations: ExamRegistration[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
  searchFilters: ExamSearchFilters
}

const initialState: ExamState = {
  exams: [],
  currentExam: null,
  registrations: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    hasMore: false,
  },
  searchFilters: {},
}

// Async thunks
export const fetchExams = createAsyncThunk(
  'exams/fetchExams',
  async (params: { page?: number; limit?: number; createdBy?: string; createdByType?: string; status?: string }) => {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.createdBy) queryParams.append('createdBy', params.createdBy)
    if (params.createdByType) queryParams.append('createdByType', params.createdByType)
    if (params.status) queryParams.append('status', params.status)

    const response = await apiClient.get(`/api/exams?${queryParams}`)
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch exams')
    }
    return response.data
  }
)

export const searchExams = createAsyncThunk(
  'exams/searchExams',
  async (filters: ExamSearchFilters & { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v.toString()))
        } else {
          queryParams.append(key, value.toString())
        }
      }
    })

    const response = await apiClient.get(`/api/exams/search?${queryParams}`)
    if (!response.success) {
      throw new Error(response.error || 'Failed to search exams')
    }
    return response.data
  }
)

export const createExam = createAsyncThunk(
  'exams/createExam',
  async (examData: CreateExamRequest) => {
    const response = await apiClient.post('/api/exams', examData)
    if (!response.success) {
      throw new Error(response.error || 'Failed to create exam')
    }
    return response.data
  }
)

export const updateExam = createAsyncThunk(
  'exams/updateExam',
  async ({ examId, examData }: { examId: string; examData: UpdateExamRequest }) => {
    const response = await apiClient.put(`/api/exams/${examId}`, examData)
    if (!response.success) {
      throw new Error(response.error || 'Failed to update exam')
    }
    return response.data
  }
)

export const deleteExam = createAsyncThunk(
  'exams/deleteExam',
  async (examId: string) => {
    const response = await apiClient.delete(`/api/exams/${examId}`)
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete exam')
    }
    return { examId }
  }
)

export const fetchExamById = createAsyncThunk(
  'exams/fetchExamById',
  async (examId: string) => {
    const response = await apiClient.get(`/api/exams/${examId}`)
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch exam')
    }
    return response.data
  }
)

export const fetchExamRegistrations = createAsyncThunk(
  'exams/fetchExamRegistrations',
  async (examId: string) => {
    const response = await apiClient.get(`/api/exams/${examId}/registrations`)
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch exam registrations')
    }
    return response.data
  }
)

export const registerForExam = createAsyncThunk(
  'exams/registerForExam',
  async ({ examId, registrationData }: { examId: string; registrationData: any }) => {
    const response = await apiClient.post(`/api/exams/${examId}/register`, registrationData)
    if (!response.success) {
      throw new Error(response.error || 'Failed to register for exam')
    }
    return response.data
  }
)

export const submitExamAnswers = createAsyncThunk(
  'exams/submitExamAnswers',
  async ({ examId, answers }: { examId: string; answers: any[] }) => {
    const response = await apiClient.post(`/api/exams/${examId}/submit`, { answers })
    if (!response.success) {
      throw new Error(response.error || 'Failed to submit exam answers')
    }
    return response.data
  }
)

const examSlice = createSlice({
  name: 'exams',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentExam: (state, action: PayloadAction<Exam | null>) => {
      state.currentExam = action.payload
    },
    setSearchFilters: (state, action: PayloadAction<ExamSearchFilters>) => {
      state.searchFilters = action.payload
    },
    updateExamInList: (state, action: PayloadAction<Exam>) => {
      const index = state.exams.findIndex(exam => exam.id === action.payload.id)
      if (index !== -1) {
        state.exams[index] = action.payload
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch exams
      .addCase(fetchExams.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchExams.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as PaginatedResponse<Exam>
        state.exams = response.data
        state.pagination = {
          page: response.page,
          limit: response.limit,
          total: response.total,
          hasMore: response.hasMore,
        }
      })
      .addCase(fetchExams.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch exams'
      })
      // Search exams
      .addCase(searchExams.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(searchExams.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ExamSearchResponse
        state.exams = response.exams
        state.pagination = {
          page: response.page,
          limit: response.limit,
          total: response.total,
          hasMore: response.hasMore,
        }
      })
      .addCase(searchExams.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to search exams'
      })
      // Create exam
      .addCase(createExam.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createExam.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Exam>
        if (response.data) {
          state.exams.unshift(response.data)
        }
      })
      .addCase(createExam.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create exam'
      })
      // Update exam
      .addCase(updateExam.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateExam.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Exam>
        if (response.data) {
          const index = state.exams.findIndex(exam => exam.id === response.data!.id)
          if (index !== -1) {
            state.exams[index] = response.data!
          }
          if (state.currentExam?.id === response.data!.id) {
            state.currentExam = response.data!
          }
        }
      })
      .addCase(updateExam.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update exam'
      })
      // Delete exam
      .addCase(deleteExam.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteExam.fulfilled, (state, action) => {
        state.loading = false
        state.exams = state.exams.filter(exam => exam.id !== action.payload.examId)
        if (state.currentExam?.id === action.payload.examId) {
          state.currentExam = null
        }
      })
      .addCase(deleteExam.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete exam'
      })
      // Fetch exam by ID
      .addCase(fetchExamById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchExamById.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Exam>
        if (response.data) {
          state.currentExam = response.data
        }
      })
      .addCase(fetchExamById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch exam'
      })
      // Fetch exam registrations
      .addCase(fetchExamRegistrations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchExamRegistrations.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as PaginatedResponse<ExamRegistration>
        state.registrations = response.data
      })
      .addCase(fetchExamRegistrations.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch exam registrations'
      })
      // Register for exam
      .addCase(registerForExam.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerForExam.fulfilled, (state, action) => {
        state.loading = false
        // Handle successful registration
      })
      .addCase(registerForExam.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to register for exam'
      })
      // Submit exam answers
      .addCase(submitExamAnswers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(submitExamAnswers.fulfilled, (state, action) => {
        state.loading = false
        // Handle successful submission
      })
      .addCase(submitExamAnswers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to submit exam answers'
      })
  },
})

export const { clearError, setCurrentExam, setSearchFilters, updateExamInList } = examSlice.actions
export default examSlice.reducer
