import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { API } from '@/lib/api/services'

// Types
export interface Business {
  _id: string
  name: string
  email: string
  phone?: string
  website?: string
  description?: string
  industry?: string
  size?: string
  location?: string
  logo?: string
  coverImage?: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface BusinessProfile {
  _id: string
  businessId: string
  companyName: string
  industry: string
  size: string
  description: string
  website?: string
  logo?: string
  coverImage?: string
  headquarters: {
    address: string
    city: string
    state: string
    country: string
    zipCode: string
  }
  contactInfo: {
    email: string
    phone: string
    website?: string
  }
  socialLinks: {
    linkedin?: string
    twitter?: string
    facebook?: string
  }
  services: string[]
  isVerified: boolean
  stats: {
    jobPostings: number
    employees: number
    reviews: number
    rating: number
  }
}

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
  searchFilters: any
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

// Async thunks using API client
export const fetchBusinesses = createAsyncThunk(
  'business/fetchBusinesses',
  async (params: { page?: number; limit?: number; industry?: string; verified?: boolean } = {}, { rejectWithValue }) => {
    try {
      const response = await API.businesses.getBusinesses(
        params.page || 1,
        params.limit || 10,
        {
          industry: params.industry,
          verified: params.verified
        }
      )

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch businesses')
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch businesses')
    }
  }
)

export const fetchBusinessById = createAsyncThunk(
  'business/fetchBusinessById',
  async (businessId: string, { rejectWithValue }) => {
    try {
      const response = await API.businesses.getBusiness(businessId)

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch business')
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch business')
    }
  }
)

export const createBusiness = createAsyncThunk(
  'business/createBusiness',
  async (businessData: any, { rejectWithValue }) => {
    try {
      const response = await API.businesses.createBusiness(businessData)

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to create business')
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create business')
    }
  }
)

export const updateBusiness = createAsyncThunk(
  'business/updateBusiness',
  async ({ businessId, businessData }: { businessId: string; businessData: any }, { rejectWithValue }) => {
    try {
      const response = await API.businesses.updateBusiness(businessId, businessData)

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to update business')
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update business')
    }
  }
)

export const deleteBusiness = createAsyncThunk(
  'business/deleteBusiness',
  async (businessId: string, { rejectWithValue }) => {
    try {
      const response = await API.businesses.deleteBusiness(businessId)

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to delete business')
      }

      return businessId
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete business')
    }
  }
)

export const fetchBusinessProfile = createAsyncThunk(
  'business/fetchBusinessProfile',
  async (businessId: string, { rejectWithValue }) => {
    try {
      const response = await API.businesses.getBusinessProfile(businessId)

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch business profile')
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch business profile')
    }
  }
)

export const updateBusinessProfile = createAsyncThunk(
  'business/updateBusinessProfile',
  async ({ businessId, profileData }: { businessId: string; profileData: any }, { rejectWithValue }) => {
    try {
      const response = await API.businesses.updateBusinessProfile(businessId, profileData)

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to update business profile')
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update business profile')
    }
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
    setSearchFilters: (state, action: PayloadAction<any>) => {
      state.searchFilters = action.payload
    },
    clearBusinesses: (state) => {
      state.businesses = []
      state.currentBusiness = null
      state.businessProfile = null
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // Fetch businesses
    builder.addCase(fetchBusinesses.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchBusinesses.fulfilled, (state, action) => {
      state.loading = false
      state.businesses = action.payload.businesses || action.payload
      state.pagination = action.payload.pagination || state.pagination
    })
    builder.addCase(fetchBusinesses.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Fetch business by ID
    builder.addCase(fetchBusinessById.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchBusinessById.fulfilled, (state, action) => {
      state.loading = false
      state.currentBusiness = action.payload
    })
    builder.addCase(fetchBusinessById.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Create business
    builder.addCase(createBusiness.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(createBusiness.fulfilled, (state, action) => {
      state.loading = false
      state.businesses.unshift(action.payload)
    })
    builder.addCase(createBusiness.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Update business
    builder.addCase(updateBusiness.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(updateBusiness.fulfilled, (state, action) => {
      state.loading = false
      const index = state.businesses.findIndex(business => business._id === action.payload._id)
      if (index !== -1) {
        state.businesses[index] = action.payload
      }
      if (state.currentBusiness?._id === action.payload._id) {
        state.currentBusiness = action.payload
      }
    })
    builder.addCase(updateBusiness.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Delete business
    builder.addCase(deleteBusiness.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(deleteBusiness.fulfilled, (state, action) => {
      state.loading = false
      state.businesses = state.businesses.filter(business => business._id !== action.payload)
      if (state.currentBusiness?._id === action.payload) {
        state.currentBusiness = null
      }
    })
    builder.addCase(deleteBusiness.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Fetch business profile
    builder.addCase(fetchBusinessProfile.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchBusinessProfile.fulfilled, (state, action) => {
      state.loading = false
      state.businessProfile = action.payload
    })
    builder.addCase(fetchBusinessProfile.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Update business profile
    builder.addCase(updateBusinessProfile.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(updateBusinessProfile.fulfilled, (state, action) => {
      state.loading = false
      state.businessProfile = action.payload
    })
    builder.addCase(updateBusinessProfile.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })
  }
})

export const { clearError, setCurrentBusiness, setSearchFilters, clearBusinesses } = businessSlice.actions
export default businessSlice.reducer
