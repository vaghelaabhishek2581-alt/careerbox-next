import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Application, CreateApplicationRequest, UpdateApplicationRequest, ApplicationFilters, ApplicationSearchResponse } from '@/lib/types/application.types'
import { ApiResponse, PaginatedResponse } from '@/lib/types/api.types'

interface ApplicationState {
  applications: Application[]
  currentApplication: Application | null
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
  filters: ApplicationFilters
}

const initialState: ApplicationState = {
  applications: [],
  currentApplication: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    hasMore: false,
  },
  filters: {},
}

// Async thunks
export const fetchApplications = createAsyncThunk(
  'application/fetchApplications',
  async (params: { page?: number; limit?: number; type?: string; status?: string; userId?: string } = {}) => {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.type) queryParams.append('type', params.type)
    if (params.status) queryParams.append('status', params.status)
    if (params.userId) queryParams.append('userId', params.userId)

    const response = await fetch(`/api/applications?${queryParams}`)
    if (!response.ok) {
      throw new Error('Failed to fetch applications')
    }
    return response.json()
  }
)

export const searchApplications = createAsyncThunk(
  'application/searchApplications',
  async (filters: ApplicationFilters & { page?: number; limit?: number }) => {
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

    const response = await fetch(`/api/applications/search?${queryParams}`)
    if (!response.ok) {
      throw new Error('Failed to search applications')
    }
    return response.json()
  }
)

export const createApplication = createAsyncThunk(
  'application/createApplication',
  async (applicationData: CreateApplicationRequest) => {
    const response = await fetch('/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicationData),
    })
    if (!response.ok) {
      throw new Error('Failed to create application')
    }
    return response.json()
  }
)

export const updateApplication = createAsyncThunk(
  'application/updateApplication',
  async ({ applicationId, applicationData }: { applicationId: string; applicationData: UpdateApplicationRequest }) => {
    const response = await fetch(`/api/applications/${applicationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicationData),
    })
    if (!response.ok) {
      throw new Error('Failed to update application')
    }
    return response.json()
  }
)

export const fetchApplicationById = createAsyncThunk(
  'application/fetchApplicationById',
  async (applicationId: string) => {
    const response = await fetch(`/api/applications/${applicationId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch application')
    }
    return response.json()
  }
)

export const fetchApplicationsByTarget = createAsyncThunk(
  'application/fetchApplicationsByTarget',
  async ({ type, targetId }: { type: 'job' | 'course' | 'exam'; targetId: string }) => {
    const response = await fetch(`/api/applications/${type}/${targetId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch applications by target')
    }
    return response.json()
  }
)

export const fetchMyApplications = createAsyncThunk(
  'application/fetchMyApplications',
  async (params: { page?: number; limit?: number; type?: string } = {}) => {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.type) queryParams.append('type', params.type)

    const response = await fetch(`/api/applications/my-applications?${queryParams}`)
    if (!response.ok) {
      throw new Error('Failed to fetch my applications')
    }
    return response.json()
  }
)

export const withdrawApplication = createAsyncThunk(
  'application/withdrawApplication',
  async (applicationId: string) => {
    const response = await fetch(`/api/applications/${applicationId}/withdraw`, {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error('Failed to withdraw application')
    }
    return response.json()
  }
)

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentApplication: (state, action: PayloadAction<Application | null>) => {
      state.currentApplication = action.payload
    },
    setFilters: (state, action: PayloadAction<ApplicationFilters>) => {
      state.filters = action.payload
    },
    updateApplicationInList: (state, action: PayloadAction<Application>) => {
      const index = state.applications.findIndex(app => app.id === action.payload.id)
      if (index !== -1) {
        state.applications[index] = action.payload
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch applications
      .addCase(fetchApplications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as PaginatedResponse<Application>
        state.applications = response.data
        state.pagination = {
          page: response.page,
          limit: response.limit,
          total: response.total,
          hasMore: response.hasMore,
        }
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch applications'
      })
      // Search applications
      .addCase(searchApplications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(searchApplications.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApplicationSearchResponse
        state.applications = response.applications
        state.pagination = {
          page: response.page,
          limit: response.limit,
          total: response.total,
          hasMore: response.hasMore,
        }
      })
      .addCase(searchApplications.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to search applications'
      })
      // Create application
      .addCase(createApplication.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createApplication.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Application>
        if (response.data) {
          state.applications.unshift(response.data)
        }
      })
      .addCase(createApplication.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create application'
      })
      // Update application
      .addCase(updateApplication.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateApplication.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Application>
        if (response.data) {
          const index = state.applications.findIndex(app => app.id === response.data!.id)
          if (index !== -1) {
            state.applications[index] = response.data!
          }
          if (state.currentApplication?.id === response.data!.id) {
            state.currentApplication = response.data!
          }
        }
      })
      .addCase(updateApplication.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update application'
      })
      // Fetch application by ID
      .addCase(fetchApplicationById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchApplicationById.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Application>
        if (response.data) {
          state.currentApplication = response.data
        }
      })
      .addCase(fetchApplicationById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch application'
      })
      // Fetch applications by target
      .addCase(fetchApplicationsByTarget.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchApplicationsByTarget.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as PaginatedResponse<Application>
        state.applications = response.data
        state.pagination = {
          page: response.page,
          limit: response.limit,
          total: response.total,
          hasMore: response.hasMore,
        }
      })
      .addCase(fetchApplicationsByTarget.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch applications by target'
      })
      // Fetch my applications
      .addCase(fetchMyApplications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as PaginatedResponse<Application>
        state.applications = response.data
        state.pagination = {
          page: response.page,
          limit: response.limit,
          total: response.total,
          hasMore: response.hasMore,
        }
      })
      .addCase(fetchMyApplications.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch my applications'
      })
      // Withdraw application
      .addCase(withdrawApplication.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(withdrawApplication.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Application>
        if (response.data) {
          const index = state.applications.findIndex(app => app.id === response.data!.id)
          if (index !== -1) {
            state.applications[index] = response.data!
          }
          if (state.currentApplication?.id === response.data!.id) {
            state.currentApplication = response.data!
          }
        }
      })
      .addCase(withdrawApplication.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to withdraw application'
      })
  },
})

export const { clearError, setCurrentApplication, setFilters, updateApplicationInList } = applicationSlice.actions
export default applicationSlice.reducer
