import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Job, JobApplication, CreateJobRequest, UpdateJobRequest, JobSearchFilters, JobSearchResponse } from '@/lib/types/job.types'
import { ApiResponse, PaginatedResponse } from '@/lib/types/api.types'

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
  searchFilters: JobSearchFilters
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

// Async thunks
export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (params: { page?: number; limit?: number; businessId?: string; status?: string }) => {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.businessId) queryParams.append('businessId', params.businessId)
    if (params.status) queryParams.append('status', params.status)

    const response = await fetch(`/api/jobs?${queryParams}`)
    if (!response.ok) {
      throw new Error('Failed to fetch jobs')
    }
    return response.json()
  }
)

export const searchJobs = createAsyncThunk(
  'jobs/searchJobs',
  async (filters: JobSearchFilters & { page?: number; limit?: number }) => {
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

    const response = await fetch(`/api/jobs/search?${queryParams}`)
    if (!response.ok) {
      throw new Error('Failed to search jobs')
    }
    return response.json()
  }
)

export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (jobData: CreateJobRequest) => {
    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData),
    })
    if (!response.ok) {
      throw new Error('Failed to create job')
    }
    return response.json()
  }
)

export const updateJob = createAsyncThunk(
  'jobs/updateJob',
  async ({ jobId, jobData }: { jobId: string; jobData: UpdateJobRequest }) => {
    const response = await fetch(`/api/jobs/${jobId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData),
    })
    if (!response.ok) {
      throw new Error('Failed to update job')
    }
    return response.json()
  }
)

export const deleteJob = createAsyncThunk(
  'jobs/deleteJob',
  async (jobId: string) => {
    const response = await fetch(`/api/jobs/${jobId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete job')
    }
    return { jobId }
  }
)

export const fetchJobById = createAsyncThunk(
  'jobs/fetchJobById',
  async (jobId: string) => {
    const response = await fetch(`/api/jobs/${jobId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch job')
    }
    return response.json()
  }
)

export const fetchJobApplications = createAsyncThunk(
  'jobs/fetchJobApplications',
  async (jobId: string) => {
    const response = await fetch(`/api/jobs/${jobId}/applications`)
    if (!response.ok) {
      throw new Error('Failed to fetch job applications')
    }
    return response.json()
  }
)

export const applyToJob = createAsyncThunk(
  'jobs/applyToJob',
  async ({ jobId, applicationData }: { jobId: string; applicationData: any }) => {
    const response = await fetch(`/api/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicationData),
    })
    if (!response.ok) {
      throw new Error('Failed to apply to job')
    }
    return response.json()
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
    setSearchFilters: (state, action: PayloadAction<JobSearchFilters>) => {
      state.searchFilters = action.payload
    },
    updateJobInList: (state, action: PayloadAction<Job>) => {
      const index = state.jobs.findIndex(job => job.id === action.payload.id)
      if (index !== -1) {
        state.jobs[index] = action.payload
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch jobs
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as PaginatedResponse<Job>
        state.jobs = response.data
        state.pagination = {
          page: response.page,
          limit: response.limit,
          total: response.total,
          hasMore: response.hasMore,
        }
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch jobs'
      })
      // Search jobs
      .addCase(searchJobs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(searchJobs.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as JobSearchResponse
        state.jobs = response.jobs
        state.pagination = {
          page: response.page,
          limit: response.limit,
          total: response.total,
          hasMore: response.hasMore,
        }
      })
      .addCase(searchJobs.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to search jobs'
      })
      // Create job
      .addCase(createJob.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Job>
        if (response.data) {
          state.jobs.unshift(response.data)
        }
      })
      .addCase(createJob.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create job'
      })
      // Update job
      .addCase(updateJob.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Job>
        if (response.data) {
          const index = state.jobs.findIndex(job => job.id === response.data!.id)
          if (index !== -1) {
            state.jobs[index] = response.data!
          }
          if (state.currentJob?.id === response.data!.id) {
            state.currentJob = response.data!
          }
        }
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update job'
      })
      // Delete job
      .addCase(deleteJob.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.loading = false
        state.jobs = state.jobs.filter(job => job.id !== action.payload.jobId)
        if (state.currentJob?.id === action.payload.jobId) {
          state.currentJob = null
        }
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete job'
      })
      // Fetch job by ID
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Job>
        if (response.data) {
          state.currentJob = response.data
        }
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch job'
      })
      // Fetch job applications
      .addCase(fetchJobApplications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchJobApplications.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as PaginatedResponse<JobApplication>
        state.applications = response.data
      })
      .addCase(fetchJobApplications.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch job applications'
      })
      // Apply to job
      .addCase(applyToJob.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(applyToJob.fulfilled, (state, action) => {
        state.loading = false
        // Handle successful application
      })
      .addCase(applyToJob.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to apply to job'
      })
  },
})

export const { clearError, setCurrentJob, setSearchFilters, updateJobInList } = jobSlice.actions
export default jobSlice.reducer
