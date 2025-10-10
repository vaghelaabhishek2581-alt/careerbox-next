import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { API } from '@/lib/api/services'

// Types
export interface Job {
  _id: string
  id?: string // Alias for _id
  title: string
  description: string
  company: string
  location: string
  type: 'full-time' | 'part-time' | 'contract' | 'internship'
  employmentType?: string // Alternative field name
  salary?: {
    min: number
    max: number
    currency: string
  }
  salaryRange?: {
    min: number
    max: number
    currency: string
  }
  requirements: string[]
  benefits: string[]
  skills?: string[]
  status: 'draft' | 'active' | 'paused' | 'closed'
  businessId: string
  applicationDeadline?: string | Date
  createdAt: string
  updatedAt: string
}

export interface JobApplication {
  _id: string
  jobId: string
  userId: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  coverLetter?: string
  resume?: string
  appliedAt: string
}

interface JobState {
  jobs: Job[]
  currentJob: Job | null
  applications: JobApplication[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
  searchFilters: any
}

const initialState: JobState = {
  jobs: [],
  currentJob: null,
  applications: [],
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

// Async thunks using API client
export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (params: { page?: number; limit?: number; businessId?: string; status?: string }, { rejectWithValue }) => {
    try {
      const response = await API.jobs.getJobs(
        params.page || 1,
        params.limit || 10,
        { businessId: params.businessId, status: params.status }
      )

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch jobs')
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch jobs')
    }
  }
)

export const fetchJobById = createAsyncThunk(
  'jobs/fetchJobById',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await API.jobs.getJob(jobId)

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch job')
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch job')
    }
  }
)

export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (jobData: any, { rejectWithValue }) => {
    try {
      const response = await API.jobs.createJob(jobData)

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to create job')
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create job')
    }
  }
)

export const updateJob = createAsyncThunk(
  'jobs/updateJob',
  async ({ jobId, jobData }: { jobId: string; jobData: any }, { rejectWithValue }) => {
    try {
      const response = await API.jobs.updateJob(jobId, jobData)

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to update job')
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update job')
    }
  }
)

export const deleteJob = createAsyncThunk(
  'jobs/deleteJob',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await API.jobs.deleteJob(jobId)

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to delete job')
      }

      return jobId
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete job')
    }
  }
)

export const applyToJob = createAsyncThunk(
  'jobs/applyToJob',
  async ({ jobId, applicationData }: { jobId: string; applicationData: any }, { rejectWithValue }) => {
    try {
      const response = await API.jobs.applyToJob(jobId, applicationData)

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to apply to job')
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to apply to job')
    }
  }
)

export const fetchApplications = createAsyncThunk(
  'jobs/fetchApplications',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await API.jobs.getApplications(jobId)

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch applications')
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch applications')
    }
  }
)

const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentJob: (state, action: PayloadAction<Job | null>) => {
      state.currentJob = action.payload
    },
    setSearchFilters: (state, action: PayloadAction<any>) => {
      state.searchFilters = action.payload
    },
    clearJobs: (state) => {
      state.jobs = []
      state.currentJob = null
      state.applications = []
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // Fetch jobs
    builder.addCase(fetchJobs.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchJobs.fulfilled, (state, action) => {
      state.loading = false
      state.jobs = action.payload.jobs || action.payload
      state.pagination = action.payload.pagination || state.pagination
    })
    builder.addCase(fetchJobs.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Fetch job by ID
    builder.addCase(fetchJobById.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchJobById.fulfilled, (state, action) => {
      state.loading = false
      state.currentJob = action.payload
    })
    builder.addCase(fetchJobById.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Create job
    builder.addCase(createJob.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(createJob.fulfilled, (state, action) => {
      state.loading = false
      state.jobs.unshift(action.payload)
    })
    builder.addCase(createJob.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Update job
    builder.addCase(updateJob.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(updateJob.fulfilled, (state, action) => {
      state.loading = false
      const index = state.jobs.findIndex(job => job._id === action.payload._id)
      if (index !== -1) {
        state.jobs[index] = action.payload
      }
      if (state.currentJob?._id === action.payload._id) {
        state.currentJob = action.payload
      }
    })
    builder.addCase(updateJob.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Delete job
    builder.addCase(deleteJob.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(deleteJob.fulfilled, (state, action) => {
      state.loading = false
      state.jobs = state.jobs.filter(job => job._id !== action.payload)
      if (state.currentJob?._id === action.payload) {
        state.currentJob = null
      }
    })
    builder.addCase(deleteJob.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Apply to job
    builder.addCase(applyToJob.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(applyToJob.fulfilled, (state, action) => {
      state.loading = false
      state.applications.push(action.payload)
    })
    builder.addCase(applyToJob.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Fetch applications
    builder.addCase(fetchApplications.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchApplications.fulfilled, (state, action) => {
      state.loading = false
      state.applications = action.payload
    })
    builder.addCase(fetchApplications.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })
  }
})

export const { clearError, setCurrentJob, setSearchFilters, clearJobs } = jobSlice.actions
export default jobSlice.reducer
