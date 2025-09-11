import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Institute, InstituteProfile, CreateInstituteRequest, UpdateInstituteRequest, InstituteSearchFilters, InstituteSearchResponse } from '@/lib/types/institute.types'
import { ApiResponse, PaginatedResponse } from '@/lib/types/api.types'

interface InstituteState {
  institutes: Institute[]
  currentInstitute: Institute | null
  instituteProfile: InstituteProfile | null
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
  searchFilters: InstituteSearchFilters
}

const initialState: InstituteState = {
  institutes: [],
  currentInstitute: null,
  instituteProfile: null,
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
export const fetchInstitutes = createAsyncThunk(
  'institute/fetchInstitutes',
  async (params: { page?: number; limit?: number; status?: string } = {}) => {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.status) queryParams.append('status', params.status)

    const response = await fetch(`/api/institutes?${queryParams}`)
    if (!response.ok) {
      throw new Error('Failed to fetch institutes')
    }
    return response.json()
  }
)

export const searchInstitutes = createAsyncThunk(
  'institute/searchInstitutes',
  async (filters: InstituteSearchFilters & { page?: number; limit?: number }) => {
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

    const response = await fetch(`/api/institutes/search?${queryParams}`)
    if (!response.ok) {
      throw new Error('Failed to search institutes')
    }
    return response.json()
  }
)

export const createInstitute = createAsyncThunk(
  'institute/createInstitute',
  async (instituteData: CreateInstituteRequest) => {
    const response = await fetch('/api/institutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(instituteData),
    })
    if (!response.ok) {
      throw new Error('Failed to create institute')
    }
    return response.json()
  }
)

export const updateInstitute = createAsyncThunk(
  'institute/updateInstitute',
  async ({ instituteId, instituteData }: { instituteId: string; instituteData: UpdateInstituteRequest }) => {
    const response = await fetch(`/api/institutes/${instituteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(instituteData),
    })
    if (!response.ok) {
      throw new Error('Failed to update institute')
    }
    return response.json()
  }
)

export const fetchInstituteById = createAsyncThunk(
  'institute/fetchInstituteById',
  async (instituteId: string) => {
    const response = await fetch(`/api/institutes/${instituteId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch institute')
    }
    return response.json()
  }
)

export const fetchInstituteProfile = createAsyncThunk(
  'institute/fetchInstituteProfile',
  async (instituteId: string) => {
    const response = await fetch(`/api/institutes/${instituteId}/profile`)
    if (!response.ok) {
      throw new Error('Failed to fetch institute profile')
    }
    return response.json()
  }
)

export const fetchMyInstitute = createAsyncThunk(
  'institute/fetchMyInstitute',
  async () => {
    const response = await fetch('/api/institutes/my-institute')
    if (!response.ok) {
      throw new Error('Failed to fetch my institute')
    }
    return response.json()
  }
)

export const verifyInstitute = createAsyncThunk(
  'institute/verifyInstitute',
  async ({ instituteId, isVerified }: { instituteId: string; isVerified: boolean }) => {
    const response = await fetch(`/api/institutes/${instituteId}/verify`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isVerified }),
    })
    if (!response.ok) {
      throw new Error('Failed to verify institute')
    }
    return response.json()
  }
)

const instituteSlice = createSlice({
  name: 'institute',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentInstitute: (state, action: PayloadAction<Institute | null>) => {
      state.currentInstitute = action.payload
    },
    setSearchFilters: (state, action: PayloadAction<InstituteSearchFilters>) => {
      state.searchFilters = action.payload
    },
    updateInstituteInList: (state, action: PayloadAction<Institute>) => {
      const index = state.institutes.findIndex(institute => institute.id === action.payload.id)
      if (index !== -1) {
        state.institutes[index] = action.payload
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch institutes
      .addCase(fetchInstitutes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInstitutes.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as PaginatedResponse<Institute>
        state.institutes = response.data
        state.pagination = {
          page: response.page,
          limit: response.limit,
          total: response.total,
          hasMore: response.hasMore,
        }
      })
      .addCase(fetchInstitutes.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch institutes'
      })
      // Search institutes
      .addCase(searchInstitutes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(searchInstitutes.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as InstituteSearchResponse
        state.institutes = response.institutes
        state.pagination = {
          page: response.page,
          limit: response.limit,
          total: response.total,
          hasMore: response.hasMore,
        }
      })
      .addCase(searchInstitutes.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to search institutes'
      })
      // Create institute
      .addCase(createInstitute.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createInstitute.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Institute>
        if (response.data) {
          state.institutes.unshift(response.data)
          state.currentInstitute = response.data
        }
      })
      .addCase(createInstitute.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create institute'
      })
      // Update institute
      .addCase(updateInstitute.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateInstitute.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Institute>
        if (response.data) {
          const index = state.institutes.findIndex(institute => institute.id === response.data!.id)
          if (index !== -1) {
            state.institutes[index] = response.data!
          }
          if (state.currentInstitute?.id === response.data!.id) {
            state.currentInstitute = response.data!
          }
        }
      })
      .addCase(updateInstitute.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update institute'
      })
      // Fetch institute by ID
      .addCase(fetchInstituteById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInstituteById.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Institute>
        if (response.data) {
          state.currentInstitute = response.data
        }
      })
      .addCase(fetchInstituteById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch institute'
      })
      // Fetch institute profile
      .addCase(fetchInstituteProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInstituteProfile.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<InstituteProfile>
        if (response.data) {
          state.instituteProfile = response.data
        }
      })
      .addCase(fetchInstituteProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch institute profile'
      })
      // Fetch my institute
      .addCase(fetchMyInstitute.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMyInstitute.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Institute>
        if (response.data) {
          state.currentInstitute = response.data
        }
      })
      .addCase(fetchMyInstitute.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch my institute'
      })
      // Verify institute
      .addCase(verifyInstitute.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyInstitute.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Institute>
        if (response.data) {
          const index = state.institutes.findIndex(institute => institute.id === response.data!.id)
          if (index !== -1) {
            state.institutes[index] = response.data!
          }
          if (state.currentInstitute?.id === response.data!.id) {
            state.currentInstitute = response.data!
          }
        }
      })
      .addCase(verifyInstitute.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to verify institute'
      })
  },
})

export const { clearError, setCurrentInstitute, setSearchFilters, updateInstituteInList } = instituteSlice.actions
export default instituteSlice.reducer
