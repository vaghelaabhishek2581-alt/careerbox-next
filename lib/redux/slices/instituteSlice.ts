import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Institute, InstituteProfile, CreateInstituteRequest, UpdateInstituteRequest, InstituteSearchFilters, InstituteSearchResponse } from '@/lib/types/institute.types'
import { ApiResponse, PaginatedResponse } from '@/lib/types/api.types'
import { API } from '@/lib/api/services'

// Enhanced interfaces for new features
export interface RegistrationDetails {
  panNumber: string
  gstNumber: string
  cinNumber: string
  tanNumber: string
  tradeLicenseNumber: string
  licenseExpiryDate: string
  msmeRegistrationNumber: string
  importExportCode: string
}

export interface DocumentInfo {
  id: string
  type: string
  name: string
  url?: string
  uploadedAt: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface Highlight {
  id: string
  title: string
  value: string
  description: string
  example: string
}

export interface Location {
  id: string
  type: string
  address: string
  city: string
  state: string
  country: string
  zipCode: string
  isPrimary: boolean
}

export interface Facility {
  id: string
  name: string
  description: string
  capacity: string
  images: string[]
  amenities: string[]
  status: 'active' | 'inactive'
}

export interface PlacementProcess {
  id: string
  title: string
  description: string
  percentage: number
}

export interface Ranking {
  id: string
  title: string
  type: string
  organization: string
  year: string
  rank: string
  description: string
  certificateImage?: string
  verificationUrl?: string
  isFeatured: boolean
}

export interface Award {
  id: string
  title: string
  category: string
  issuer: string
  year: string
  description: string
  certificateImage?: string
  verificationUrl?: string
  isFeatured: boolean
}

export interface Scholarship {
  id: string
  title: string
  type: string
  position: string
  year: string
  amount: string
  numberOfAwards: string
  actDate: string
  verificationUrl: string
  description: string
  eligibilityCriteria: string
  applicationUrl: string
  isFeatured: boolean
}

interface InstituteState {
  institutes: Institute[]
  currentInstitute: Institute | null
  instituteProfile: InstituteProfile | null
  registrationDetails: RegistrationDetails | null
  documents: DocumentInfo[]
  highlights: Highlight[]
  locations: Location[]
  facilities: Facility[]
  placementProcesses: PlacementProcess[]
  rankings: Ranking[]
  awards: Award[]
  scholarships: Scholarship[]
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
  registrationDetails: null,
  documents: [],
  highlights: [],
  locations: [],
  facilities: [],
  placementProcesses: [],
  rankings: [],
  awards: [],
  scholarships: [],
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
    // Mock implementation - replace with actual API call
    return {
      success: true,
      data: {
        data: [],
        page: params.page || 1,
        limit: params.limit || 10,
        total: 0,
        hasMore: false
      }
    }
  }
)

export const searchInstitutes = createAsyncThunk(
  'institute/searchInstitutes',
  async (filters: InstituteSearchFilters & { page?: number; limit?: number }) => {
    // Mock implementation - replace with actual API call
    return {
      success: true,
      data: {
        institutes: [],
        page: filters.page || 1,
        limit: filters.limit || 10,
        total: 0,
        hasMore: false
      }
    }
  }
)

export const createInstitute = createAsyncThunk(
  'institute/createInstitute',
  async (instituteData: CreateInstituteRequest) => {
    // Mock implementation - replace with actual API call
    return {
      success: true,
      data: {
        id: Date.now().toString(),
        ...instituteData
      }
    }
  }
)

export const updateInstitute = createAsyncThunk(
  'institute/updateInstitute',
  async ({ instituteId, instituteData }: { instituteId: string; instituteData: UpdateInstituteRequest }) => {
    // Mock implementation - replace with actual API call
    return {
      success: true,
      data: {
        id: instituteId,
        ...instituteData
      }
    }
  }
)

export const fetchInstituteById = createAsyncThunk(
  'institute/fetchInstituteById',
  async (instituteId: string) => {
    // Mock implementation - replace with actual API call
    return {
      success: true,
      data: {
        id: instituteId,
        name: 'Sample Institute'
      }
    }
  }
)

export const fetchInstituteProfile = createAsyncThunk(
  'institute/fetchInstituteProfile',
  async (instituteId: string) => {
    // Mock implementation - replace with actual API call
    return {
      success: true,
      data: {
        id: instituteId,
        name: 'Sample Institute Profile'
      }
    }
  }
)

export const fetchMyInstitute = createAsyncThunk(
  'institute/fetchMyInstitute',
  async () => {
    // Mock implementation - replace with actual API call
    return {
      success: true,
      data: {
        id: 'my-institute',
        name: 'My Institute'
      }
    }
  }
)

export const verifyInstitute = createAsyncThunk(
  'institute/verifyInstitute',
  async ({ instituteId, isVerified }: { instituteId: string; isVerified: boolean }) => {
    // Temporary mock implementation - replace with actual API call
    return { success: true, data: { id: instituteId, isVerified } }
  }
)

// New async thunks for enhanced features
export const updateRegistrationDetails = createAsyncThunk(
  'institute/updateRegistrationDetails',
  async (registrationData: RegistrationDetails) => {
    // Mock implementation - replace with actual API call
    return { success: true, data: registrationData }
  }
)

export const uploadDocument = createAsyncThunk(
  'institute/uploadDocument',
  async ({ type, file }: { type: string; file: File }) => {
    // Mock implementation - replace with actual API call
    const document: DocumentInfo = {
      id: Date.now().toString(),
      type,
      name: file.name,
      uploadedAt: new Date().toISOString(),
      status: 'pending'
    }
    return { success: true, data: document }
  }
)

export const addHighlight = createAsyncThunk(
  'institute/addHighlight',
  async (highlight: Omit<Highlight, 'id'>) => {
    // Mock implementation - replace with actual API call
    const newHighlight: Highlight = {
      ...highlight,
      id: Date.now().toString()
    }
    return { success: true, data: newHighlight }
  }
)

export const addLocation = createAsyncThunk(
  'institute/addLocation',
  async (location: Omit<Location, 'id'>) => {
    // Mock implementation - replace with actual API call
    const newLocation: Location = {
      ...location,
      id: Date.now().toString()
    }
    return { success: true, data: newLocation }
  }
)

export const addFacility = createAsyncThunk(
  'institute/addFacility',
  async (facility: Omit<Facility, 'id'>) => {
    // Mock implementation - replace with actual API call
    const newFacility: Facility = {
      ...facility,
      id: Date.now().toString()
    }
    return { success: true, data: newFacility }
  }
)

export const addRanking = createAsyncThunk(
  'institute/addRanking',
  async (ranking: Omit<Ranking, 'id'>) => {
    // Mock implementation - replace with actual API call
    const newRanking: Ranking = {
      ...ranking,
      id: Date.now().toString()
    }
    return { success: true, data: newRanking }
  }
)

export const addAward = createAsyncThunk(
  'institute/addAward',
  async (award: Omit<Award, 'id'>) => {
    // Mock implementation - replace with actual API call
    const newAward: Award = {
      ...award,
      id: Date.now().toString()
    }
    return { success: true, data: newAward }
  }
)

export const addScholarship = createAsyncThunk(
  'institute/addScholarship',
  async (scholarship: Omit<Scholarship, 'id'>) => {
    // Mock implementation - replace with actual API call
    const newScholarship: Scholarship = {
      ...scholarship,
      id: Date.now().toString()
    }
    return { success: true, data: newScholarship }
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
    // New reducers for enhanced features
    removeDocument: (state, action: PayloadAction<string>) => {
      state.documents = state.documents.filter(doc => doc.id !== action.payload)
    },
    updateDocument: (state, action: PayloadAction<DocumentInfo>) => {
      const index = state.documents.findIndex(doc => doc.id === action.payload.id)
      if (index !== -1) {
        state.documents[index] = action.payload
      }
    },
    removeHighlight: (state, action: PayloadAction<string>) => {
      state.highlights = state.highlights.filter(highlight => highlight.id !== action.payload)
    },
    updateHighlight: (state, action: PayloadAction<Highlight>) => {
      const index = state.highlights.findIndex(highlight => highlight.id === action.payload.id)
      if (index !== -1) {
        state.highlights[index] = action.payload
      }
    },
    removeLocation: (state, action: PayloadAction<string>) => {
      state.locations = state.locations.filter(location => location.id !== action.payload)
    },
    updateLocation: (state, action: PayloadAction<Location>) => {
      const index = state.locations.findIndex(location => location.id === action.payload.id)
      if (index !== -1) {
        state.locations[index] = action.payload
      }
    },
    removeFacility: (state, action: PayloadAction<string>) => {
      state.facilities = state.facilities.filter(facility => facility.id !== action.payload)
    },
    updateFacility: (state, action: PayloadAction<Facility>) => {
      const index = state.facilities.findIndex(facility => facility.id === action.payload.id)
      if (index !== -1) {
        state.facilities[index] = action.payload
      }
    },
    removeRanking: (state, action: PayloadAction<string>) => {
      state.rankings = state.rankings.filter(ranking => ranking.id !== action.payload)
    },
    updateRanking: (state, action: PayloadAction<Ranking>) => {
      const index = state.rankings.findIndex(ranking => ranking.id === action.payload.id)
      if (index !== -1) {
        state.rankings[index] = action.payload
      }
    },
    removeAward: (state, action: PayloadAction<string>) => {
      state.awards = state.awards.filter(award => award.id !== action.payload)
    },
    updateAward: (state, action: PayloadAction<Award>) => {
      const index = state.awards.findIndex(award => award.id === action.payload.id)
      if (index !== -1) {
        state.awards[index] = action.payload
      }
    },
    removeScholarship: (state, action: PayloadAction<string>) => {
      state.scholarships = state.scholarships.filter(scholarship => scholarship.id !== action.payload)
    },
    updateScholarship: (state, action: PayloadAction<Scholarship>) => {
      const index = state.scholarships.findIndex(scholarship => scholarship.id === action.payload.id)
      if (index !== -1) {
        state.scholarships[index] = action.payload
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
      // Registration Details
      .addCase(updateRegistrationDetails.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateRegistrationDetails.fulfilled, (state, action) => {
        state.loading = false
        state.registrationDetails = action.payload.data
      })
      .addCase(updateRegistrationDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update registration details'
      })
      // Upload Document
      .addCase(uploadDocument.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.loading = false
        state.documents.push(action.payload.data)
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to upload document'
      })
      // Add Highlight
      .addCase(addHighlight.fulfilled, (state, action) => {
        state.highlights.push(action.payload.data)
      })
      // Add Location
      .addCase(addLocation.fulfilled, (state, action) => {
        state.locations.push(action.payload.data)
      })
      // Add Facility
      .addCase(addFacility.fulfilled, (state, action) => {
        state.facilities.push(action.payload.data)
      })
      // Add Ranking
      .addCase(addRanking.fulfilled, (state, action) => {
        state.rankings.push(action.payload.data)
      })
      // Add Award
      .addCase(addAward.fulfilled, (state, action) => {
        state.awards.push(action.payload.data)
      })
      // Add Scholarship
      .addCase(addScholarship.fulfilled, (state, action) => {
        state.scholarships.push(action.payload.data)
      })
  },
})

export const { 
  clearError, 
  setCurrentInstitute, 
  setSearchFilters, 
  updateInstituteInList,
  removeDocument,
  updateDocument,
  removeHighlight,
  updateHighlight,
  removeLocation,
  updateLocation,
  removeFacility,
  updateFacility,
  removeRanking,
  updateRanking,
  removeAward,
  updateAward,
  removeScholarship,
  updateScholarship
} = instituteSlice.actions
export default instituteSlice.reducer
