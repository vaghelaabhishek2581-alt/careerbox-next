import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { API } from '@/lib/api/services'

// Types
export interface Application {
  _id: string
  id?: string // Alias for _id
  userId: string
  type: 'job' | 'course' | 'exam'
  targetId: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  applicationData: any
  submittedAt: string
  appliedAt?: string // Alternative field name
  reviewedAt?: string
  notes?: string
}

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
  filters: any
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

// Async thunks using API client
export const fetchApplications = createAsyncThunk(
  'application/fetchApplications',
  async (params: { page?: number; limit?: number; type?: string; status?: string; userId?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await API.applications.getApplications(
        params.page || 1,
        params.limit || 10,
        {
          type: params.type,
          status: params.status,
          userId: params.userId
        }
      )

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch applications')
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch applications')
    }
  }
)

export const fetchApplicationById = createAsyncThunk(
  'application/fetchApplicationById',
  async (applicationId: string, { rejectWithValue }) => {
    try {
      const response = await API.applications.getApplication(applicationId)

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch application')
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch application')
    }
  }
)

export const createApplication = createAsyncThunk(
  'application/createApplication',
  async (applicationData: any, { rejectWithValue }) => {
    try {
      const response = await API.applications.createApplication(applicationData)

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to create application')
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create application')
    }
  }
)

export const updateApplication = createAsyncThunk(
  'application/updateApplication',
  async ({ applicationId, applicationData }: { applicationId: string; applicationData: any }, { rejectWithValue }) => {
    try {
      const response = await API.applications.updateApplication(applicationId, applicationData)

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to update application')
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update application')
    }
  }
)

export const deleteApplication = createAsyncThunk(
  'application/deleteApplication',
  async (applicationId: string, { rejectWithValue }) => {
    try {
      const response = await API.applications.deleteApplication(applicationId)

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to delete application')
      }

      return applicationId
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete application')
    }
  }
)

const applicationSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentApplication: (state, action: PayloadAction<Application | null>) => {
      state.currentApplication = action.payload
    },
    setFilters: (state, action: PayloadAction<any>) => {
      state.filters = action.payload
    },
    clearApplications: (state) => {
      state.applications = []
      state.currentApplication = null
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // Fetch applications
    builder.addCase(fetchApplications.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchApplications.fulfilled, (state, action) => {
      state.loading = false
      state.applications = action.payload.applications || action.payload
      state.pagination = action.payload.pagination || state.pagination
    })
    builder.addCase(fetchApplications.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Fetch application by ID
    builder.addCase(fetchApplicationById.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchApplicationById.fulfilled, (state, action) => {
      state.loading = false
      state.currentApplication = action.payload
    })
    builder.addCase(fetchApplicationById.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Create application
    builder.addCase(createApplication.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(createApplication.fulfilled, (state, action) => {
      state.loading = false
      state.applications.unshift(action.payload)
    })
    builder.addCase(createApplication.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Update application
    builder.addCase(updateApplication.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(updateApplication.fulfilled, (state, action) => {
      state.loading = false
      const index = state.applications.findIndex(app => app._id === action.payload._id)
      if (index !== -1) {
        state.applications[index] = action.payload
      }
      if (state.currentApplication?._id === action.payload._id) {
        state.currentApplication = action.payload
      }
    })
    builder.addCase(updateApplication.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Delete application
    builder.addCase(deleteApplication.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(deleteApplication.fulfilled, (state, action) => {
      state.loading = false
      state.applications = state.applications.filter(app => app._id !== action.payload)
      if (state.currentApplication?._id === action.payload) {
        state.currentApplication = null
      }
    })
    builder.addCase(deleteApplication.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })
  }
})

export const { clearError, setCurrentApplication, setFilters, clearApplications } = applicationSlice.actions
export default applicationSlice.reducer
