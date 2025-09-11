import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Business, BusinessProfile, CreateBusinessRequest, UpdateBusinessRequest, BusinessSearchFilters, BusinessSearchResponse } from '@/lib/types/business.types'
import { ApiResponse, PaginatedResponse } from '@/lib/types/api.types'

interface BusinessState {
  businesses: Business[]
  currentBusiness: Business | null
  businessProfile: BusinessProfile | null
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
  searchFilters: BusinessSearchFilters
}

const initialState: BusinessState = {
  businesses: [],
  currentBusiness: null,
  businessProfile: null,
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
export const fetchBusinesses = createAsyncThunk(
  'business/fetchBusinesses',
  async (params: { page?: number; limit?: number; status?: string } = {}) => {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.status) queryParams.append('status', params.status)

    const response = await fetch(`/api/businesses?${queryParams}`)
    if (!response.ok) {
      throw new Error('Failed to fetch businesses')
    }
    return response.json()
  }
)

export const searchBusinesses = createAsyncThunk(
  'business/searchBusinesses',
  async (filters: BusinessSearchFilters & { page?: number; limit?: number }) => {
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

    const response = await fetch(`/api/businesses/search?${queryParams}`)
    if (!response.ok) {
      throw new Error('Failed to search businesses')
    }
    return response.json()
  }
)

export const createBusiness = createAsyncThunk(
  'business/createBusiness',
  async (businessData: CreateBusinessRequest) => {
    const response = await fetch('/api/businesses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(businessData),
    })
    if (!response.ok) {
      throw new Error('Failed to create business')
    }
    return response.json()
  }
)

export const updateBusiness = createAsyncThunk(
  'business/updateBusiness',
  async ({ businessId, businessData }: { businessId: string; businessData: UpdateBusinessRequest }) => {
    const response = await fetch(`/api/businesses/${businessId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(businessData),
    })
    if (!response.ok) {
      throw new Error('Failed to update business')
    }
    return response.json()
  }
)

export const fetchBusinessById = createAsyncThunk(
  'business/fetchBusinessById',
  async (businessId: string) => {
    const response = await fetch(`/api/businesses/${businessId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch business')
    }
    return response.json()
  }
)

export const fetchBusinessProfile = createAsyncThunk(
  'business/fetchBusinessProfile',
  async (businessId: string) => {
    const response = await fetch(`/api/businesses/${businessId}/profile`)
    if (!response.ok) {
      throw new Error('Failed to fetch business profile')
    }
    return response.json()
  }
)

export const fetchMyBusiness = createAsyncThunk(
  'business/fetchMyBusiness',
  async () => {
    const response = await fetch('/api/businesses/my-business')
    if (!response.ok) {
      throw new Error('Failed to fetch my business')
    }
    return response.json()
  }
)

export const verifyBusiness = createAsyncThunk(
  'business/verifyBusiness',
  async ({ businessId, isVerified }: { businessId: string; isVerified: boolean }) => {
    const response = await fetch(`/api/businesses/${businessId}/verify`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isVerified }),
    })
    if (!response.ok) {
      throw new Error('Failed to verify business')
    }
    return response.json()
  }
)

const businessSlice = createSlice({
  name: 'business',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentBusiness: (state, action: PayloadAction<Business | null>) => {
      state.currentBusiness = action.payload
    },
    setSearchFilters: (state, action: PayloadAction<BusinessSearchFilters>) => {
      state.searchFilters = action.payload
    },
    updateBusinessInList: (state, action: PayloadAction<Business>) => {
      const index = state.businesses.findIndex(business => business.id === action.payload.id)
      if (index !== -1) {
        state.businesses[index] = action.payload
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch businesses
      .addCase(fetchBusinesses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBusinesses.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as PaginatedResponse<Business>
        state.businesses = response.data
        state.pagination = {
          page: response.page,
          limit: response.limit,
          total: response.total,
          hasMore: response.hasMore,
        }
      })
      .addCase(fetchBusinesses.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch businesses'
      })
      // Search businesses
      .addCase(searchBusinesses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(searchBusinesses.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as BusinessSearchResponse
        state.businesses = response.businesses
        state.pagination = {
          page: response.page,
          limit: response.limit,
          total: response.total,
          hasMore: response.hasMore,
        }
      })
      .addCase(searchBusinesses.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to search businesses'
      })
      // Create business
      .addCase(createBusiness.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createBusiness.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Business>
        if (response.data) {
          state.businesses.unshift(response.data)
          state.currentBusiness = response.data
        }
      })
      .addCase(createBusiness.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create business'
      })
      // Update business
      .addCase(updateBusiness.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateBusiness.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Business>
        if (response.data) {
          const index = state.businesses.findIndex(business => business.id === response.data!.id)
          if (index !== -1) {
            state.businesses[index] = response.data!
          }
          if (state.currentBusiness?.id === response.data!.id) {
            state.currentBusiness = response.data!
          }
        }
      })
      .addCase(updateBusiness.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update business'
      })
      // Fetch business by ID
      .addCase(fetchBusinessById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBusinessById.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Business>
        if (response.data) {
          state.currentBusiness = response.data
        }
      })
      .addCase(fetchBusinessById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch business'
      })
      // Fetch business profile
      .addCase(fetchBusinessProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBusinessProfile.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<BusinessProfile>
        if (response.data) {
          state.businessProfile = response.data
        }
      })
      .addCase(fetchBusinessProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch business profile'
      })
      // Fetch my business
      .addCase(fetchMyBusiness.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMyBusiness.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Business>
        if (response.data) {
          state.currentBusiness = response.data
        }
      })
      .addCase(fetchMyBusiness.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch my business'
      })
      // Verify business
      .addCase(verifyBusiness.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyBusiness.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Business>
        if (response.data) {
          const index = state.businesses.findIndex(business => business.id === response.data!.id)
          if (index !== -1) {
            state.businesses[index] = response.data!
          }
          if (state.currentBusiness?.id === response.data!.id) {
            state.currentBusiness = response.data!
          }
        }
      })
      .addCase(verifyBusiness.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to verify business'
      })
  },
})

export const { clearError, setCurrentBusiness, setSearchFilters, updateBusinessInList } = businessSlice.actions
export default businessSlice.reducer