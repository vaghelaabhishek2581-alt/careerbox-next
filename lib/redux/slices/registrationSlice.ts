import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

// ============================================================================
// TYPES
// ============================================================================

export interface RegistrationIntent {
  id: string
  userId: string
  type: 'institute' | 'business'
  status: 'pending' | 'approved' | 'rejected' | 'payment_required' | 'completed'
  
  // Basic Information
  organizationName: string
  email: string
  contactName: string
  contactPhone: string
  
  // Institute specific fields
  instituteType?: string
  instituteCategory?: string
  establishmentYear?: number
  
  // Business specific fields
  businessCategory?: string
  organizationSize?: string
  
  // Address
  address: string
  city: string
  state: string
  country: string
  zipCode: string
  
  // Additional Information
  description: string
  website?: string
  
  // Admin Review
  adminNotes?: string
  reviewedBy?: string
  reviewedAt?: string
  
  // Subscription Details
  subscriptionPlan?: string
  subscriptionAmount?: number
  subscriptionGrantedBy?: string
  subscriptionGrantedAt?: string
  
  // Payment Information
  paymentIntentId?: string
  paymentStatus?: 'pending' | 'completed' | 'failed'
  paidAt?: string
  
  // Metadata
  createdAt: string
  updatedAt: string
}

export interface RegistrationFormData {
  type: 'institute' | 'business'
  organizationName: string
  email: string
  contactName: string
  contactPhone: string
  address: string
  city: string
  state: string
  country: string
  zipCode: string
  description: string
  website?: string
  
  // Institute specific
  instituteType?: string
  instituteCategory?: string
  establishmentYear?: number
  
  // Business specific
  businessCategory?: string
  organizationSize?: string
  linkedinUrl?: string
  twitterUrl?: string
  
  // Files
  businessLogo?: File
  coverImage?: File
  
  // Agreements
  agreeTerms: boolean
  subscribeNewsletter: boolean
  contactViaEmail: boolean
  contactViaPhone: boolean
}

interface RegistrationState {
  intents: RegistrationIntent[]
  currentIntent: RegistrationIntent | null
  loading: boolean
  error: string | null
  submissionSuccess: boolean
}

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Submit Institute Registration
export const submitInstituteRegistration = createAsyncThunk(
  'registration/submitInstituteRegistration',
  async (formData: RegistrationFormData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/registration/institute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.message || 'Registration failed')
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue('Network error occurred')
    }
  }
)

// Submit Business Registration
export const submitBusinessRegistration = createAsyncThunk(
  'registration/submitBusinessRegistration',
  async (formData: RegistrationFormData, { rejectWithValue }) => {
    try {
      const submitData = new FormData()
      
      // Add all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          submitData.append(key, value)
        } else if (typeof value === 'boolean') {
          submitData.append(key, value.toString())
        } else if (value !== null && value !== undefined) {
          submitData.append(key, value.toString())
        }
      })

      const response = await fetch('/api/registration/business', {
        method: 'POST',
        body: submitData,
      })

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.message || 'Registration failed')
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue('Network error occurred')
    }
  }
)

// Fetch User's Registration Intents
export const fetchUserRegistrationIntents = createAsyncThunk(
  'registration/fetchUserRegistrationIntents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/registration/intents', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.message || 'Failed to fetch registration intents')
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue('Network error occurred')
    }
  }
)

// Get Registration Intent by ID
export const getRegistrationIntent = createAsyncThunk(
  'registration/getRegistrationIntent',
  async (intentId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/registration/intents/${intentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.message || 'Failed to fetch registration intent')
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue('Network error occurred')
    }
  }
)

// Process Payment for Registration
export const processRegistrationPayment = createAsyncThunk(
  'registration/processRegistrationPayment',
  async ({ intentId, paymentData }: { intentId: string; paymentData: any }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/registration/payment/${intentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.message || 'Payment processing failed')
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue('Network error occurred')
    }
  }
)

// ============================================================================
// SLICE
// ============================================================================

const initialState: RegistrationState = {
  intents: [],
  currentIntent: null,
  loading: false,
  error: null,
  submissionSuccess: false,
}

const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSubmissionSuccess: (state) => {
      state.submissionSuccess = false
    },
    setCurrentIntent: (state, action: PayloadAction<RegistrationIntent | null>) => {
      state.currentIntent = action.payload
    },
    updateIntentStatus: (state, action: PayloadAction<{ id: string; status: string }>) => {
      const intent = state.intents.find(intent => intent.id === action.payload.id)
      if (intent) {
        intent.status = action.payload.status as any
      }
      if (state.currentIntent?.id === action.payload.id) {
        state.currentIntent.status = action.payload.status as any
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit Institute Registration
      .addCase(submitInstituteRegistration.pending, (state) => {
        state.loading = true
        state.error = null
        state.submissionSuccess = false
      })
      .addCase(submitInstituteRegistration.fulfilled, (state, action) => {
        state.loading = false
        state.submissionSuccess = true
        if (action.payload.data) {
          state.intents.push(action.payload.data)
          state.currentIntent = action.payload.data
        }
      })
      .addCase(submitInstituteRegistration.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.submissionSuccess = false
      })
      
      // Submit Business Registration
      .addCase(submitBusinessRegistration.pending, (state) => {
        state.loading = true
        state.error = null
        state.submissionSuccess = false
      })
      .addCase(submitBusinessRegistration.fulfilled, (state, action) => {
        state.loading = false
        state.submissionSuccess = true
        if (action.payload.data) {
          state.intents.push(action.payload.data)
          state.currentIntent = action.payload.data
        }
      })
      .addCase(submitBusinessRegistration.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.submissionSuccess = false
      })
      
      // Fetch User Registration Intents
      .addCase(fetchUserRegistrationIntents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserRegistrationIntents.fulfilled, (state, action) => {
        state.loading = false
        state.intents = action.payload.data || []
      })
      .addCase(fetchUserRegistrationIntents.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Get Registration Intent
      .addCase(getRegistrationIntent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getRegistrationIntent.fulfilled, (state, action) => {
        state.loading = false
        state.currentIntent = action.payload.data
      })
      .addCase(getRegistrationIntent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Process Registration Payment
      .addCase(processRegistrationPayment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(processRegistrationPayment.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.data && state.currentIntent) {
          state.currentIntent = { ...state.currentIntent, ...action.payload.data }
          const intentIndex = state.intents.findIndex(intent => intent.id === state.currentIntent!.id)
          if (intentIndex !== -1) {
            state.intents[intentIndex] = state.currentIntent
          }
        }
      })
      .addCase(processRegistrationPayment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { 
  clearError, 
  clearSubmissionSuccess, 
  setCurrentIntent, 
  updateIntentStatus 
} = registrationSlice.actions

export default registrationSlice.reducer
