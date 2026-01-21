import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

// ============================================================================
// TYPES
// ============================================================================

export interface AdminUser {
  id: string
  email: string
  role: string
  roles: string[]
  activeRole: string
  isOrganizationOwner: boolean
  subscriptionActive: boolean
  createdAt: string
  lastLogin?: string
}

export interface AdminRegistrationIntent {
  id: string
  userId: string
  type: 'institute' | 'business'
  status: 'pending' | 'approved' | 'rejected' | 'payment_required' | 'completed'
  organizationName: string
  email: string
  contactName: string
  contactPhone: string
  address: string
  city: string
  state: string
  country: string
  description: string
  adminNotes?: string
  reviewedBy?: string
  reviewedAt?: string
  instituteId?: string
  isAdminInstitute?: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminSubscription {
  id: string
  userId: string
  organizationId: string
  organizationType: 'institute' | 'business'
  planName: string
  planType: 'free' | 'basic' | 'premium' | 'enterprise'
  status: 'active' | 'inactive' | 'cancelled' | 'expired' | 'suspended'
  isActive?: boolean
  amount: number
  currency: string
  startDate: string
  endDate?: string
  grantedBy?: string
  grantReason?: string
  createdAt: string
}

export interface AdminPayment {
  id: string
  userId: string
  userEmail: string
  userName: string
  organizationName?: string
  organizationType?: 'institute' | 'business'
  orderId: string
  paymentId?: string
  amount: number
  currency: string
  status: 'created' | 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded'
  paymentMethod?: string
  planType: 'free' | 'basic' | 'premium' | 'enterprise'
  planDuration: number // in months
  subscriptionId?: string
  razorpayOrderId?: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  failureReason?: string
  refundId?: string
  refundAmount?: number
  refundReason?: string
  createdAt: string
  updatedAt: string
  paidAt?: string
}

export interface AdminStats {
  totalUsers: number
  totalInstitutes: number
  totalBusinesses: number
  pendingRegistrations: number
  activeSubscriptions: number
  monthlyRevenue: number
  newUsersThisMonth: number
  conversionRate: number
}

export interface AdminFilters {
  userRole?: string
  subscriptionStatus?: string
  status?: string
  type?: string
  dateRange?: {
    start: string
    end: string
  }
  search?: string
}

interface AdminState {
  // Users Management
  users: AdminUser[]
  selectedUser: AdminUser | null

  // Registration Intents Management
  registrationIntents: AdminRegistrationIntent[]
  selectedIntent: AdminRegistrationIntent | null

  // Subscriptions Management
  subscriptions: AdminSubscription[]
  selectedSubscription: AdminSubscription | null

  // Payments Management
  payments: AdminPayment[]
  selectedPayment: AdminPayment | null

  // Statistics
  stats: AdminStats | null

  // UI State
  loading: boolean
  error: string | null
  filters: AdminFilters
  currentPage: number
  totalPages: number
  totalItems: number
}

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Fetch All Users
export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (
    { page = 1, filters }: { page?: number; filters?: AdminFilters },
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.set('page', page.toString())

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value && typeof value === 'string') {
            queryParams.set(key, value)
          } else if (
            value &&
            typeof value === 'object' &&
            'start' in value &&
            'end' in value
          ) {
            queryParams.set(`${key}Start`, value.start)
            queryParams.set(`${key}End`, value.end)
          }
        })
      }

      const response = await fetch(`/api/admin/users?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.message || 'Failed to fetch users')
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue('Network error occurred')
    }
  }
)

// Fetch All Registration Intents
export const fetchAllRegistrationIntents = createAsyncThunk(
  'admin/fetchAllRegistrationIntents',
  async (
    { page = 1, filters }: { page?: number; filters?: AdminFilters },
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.set('page', page.toString())

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value && typeof value === 'string') {
            queryParams.set(key, value)
          } else if (
            value &&
            typeof value === 'object' &&
            'start' in value &&
            'end' in value
          ) {
            queryParams.set(`${key}Start`, value.start)
            queryParams.set(`${key}End`, value.end)
          }
        })
      }

      const response = await fetch(
        `/api/admin/registration-intents?${queryParams}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(
          error.message || 'Failed to fetch registration intents'
        )
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue('Network error occurred')
    }
  }
)

// Review Registration Intent
export const reviewRegistrationIntent = createAsyncThunk(
  'admin/reviewRegistrationIntent',
  async (
    {
      intentId,
      action,
      adminNotes,
      subscriptionPlan
    }: {
      intentId: string
      action: 'approve' | 'reject' | 'require_payment' | 'pending'
      adminNotes?: string
      subscriptionPlan?: string
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        `/api/admin/registration-intents/${intentId}/review`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action,
            adminNotes,
            subscriptionPlan
          })
        }
      )

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(
          error.error || error.message || 'Failed to review registration intent'
        )
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue('Network error occurred')
    }
  }
)

// Grant Free Subscription
export const grantFreeSubscription = createAsyncThunk(
  'admin/grantFreeSubscription',
  async (
    {
      userId,
      organizationType,
      planType,
      reason
    }: {
      userId: string
      organizationType: 'institute' | 'business'
      planType: 'free' | 'basic' | 'premium' | 'enterprise'
      reason: string
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch('/api/admin/subscriptions/grant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          organizationType,
          planType,
          reason
        })
      })

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.message || 'Failed to grant subscription')
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue('Network error occurred')
    }
  }
)

// Fetch active subscription by user (for admin view)
export const fetchLatestSubscriptionByUser = createAsyncThunk(
  'admin/fetchLatestSubscriptionByUser',
  async (
    { userId }: { userId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        `/api/admin/subscriptions/latest?userId=${encodeURIComponent(userId)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      )

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.message || 'Failed to fetch latest subscription')
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue('Network error occurred')
    }
  }
)

// Suspend/Activate/Deactivate Subscription
export const updateSubscriptionStatus = createAsyncThunk(
  'admin/updateSubscriptionStatus',
  async (
    {
      subscriptionId,
      status,
      reason
    }: {
      subscriptionId: string
      status: 'active' | 'suspended' | 'cancelled' | 'inactive'
      reason?: string
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        `/api/admin/subscriptions/${subscriptionId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status,
            reason
          })
        }
      )

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(
          error.message || 'Failed to update subscription status'
        )
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

const initialState: AdminState = {
  users: [],
  selectedUser: null,
  registrationIntents: [],
  selectedIntent: null,
  subscriptions: [],
  selectedSubscription: null,
  payments: [],
  selectedPayment: null,
  stats: null,
  loading: false,
  error: null,
  filters: {},
  currentPage: 1,
  totalPages: 1,
  totalItems: 0
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null
    },
    setSelectedUser: (state, action: PayloadAction<AdminUser | null>) => {
      state.selectedUser = action.payload
    },
    setSelectedIntent: (
      state,
      action: PayloadAction<AdminRegistrationIntent | null>
    ) => {
      state.selectedIntent = action.payload
    },
    setSelectedSubscription: (
      state,
      action: PayloadAction<AdminSubscription | null>
    ) => {
      state.selectedSubscription = action.payload
    },
    setSelectedPayment: (state, action: PayloadAction<AdminPayment | null>) => {
      state.selectedPayment = action.payload
    },
    // Added back: filters & pagination controls used by admin pages
    setFilters: (state, action: PayloadAction<AdminFilters>) => {
      state.filters = action.payload
      state.currentPage = 1
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    }
  },
  extraReducers: builder => {
    builder
      // Fetch All Registration Intents
      .addCase(fetchAllRegistrationIntents.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllRegistrationIntents.fulfilled, (state, action) => {
        state.loading = false
        state.registrationIntents = action.payload.data || []
        state.currentPage = action.payload.pagination?.currentPage || 1
        state.totalPages = action.payload.pagination?.totalPages || 1
        state.totalItems = action.payload.pagination?.totalItems || 0
      })
      .addCase(fetchAllRegistrationIntents.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Review Registration Intent
      .addCase(reviewRegistrationIntent.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(reviewRegistrationIntent.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.data) {
          const updatedIntent = action.payload.data
          const index = state.registrationIntents.findIndex(
            intent => intent.id === updatedIntent.id
          )
          if (index !== -1) {
            state.registrationIntents[index] = updatedIntent
          }
          if (state.selectedIntent?.id === updatedIntent.id) {
            state.selectedIntent = updatedIntent
          }
        }
      })
      .addCase(reviewRegistrationIntent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Grant Free Subscription
      .addCase(grantFreeSubscription.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(grantFreeSubscription.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.data) {
          state.subscriptions.push(action.payload.data)
        }
      })
      .addCase(grantFreeSubscription.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch latest subscription by user
      .addCase(fetchLatestSubscriptionByUser.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLatestSubscriptionByUser.fulfilled, (state, action) => {
        state.loading = false
        const subscription = action.payload.data || null
        state.selectedSubscription = subscription
      })
      .addCase(fetchLatestSubscriptionByUser.rejected, (state, action) => {
        state.loading = false
        state.selectedSubscription = null
        state.error = action.payload as string
      })

      // Update Subscription Status
      .addCase(updateSubscriptionStatus.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSubscriptionStatus.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.data) {
          const updatedSubscription = action.payload.data
          const index = state.subscriptions.findIndex(
            sub => sub.id === updatedSubscription.id
          )
          if (index !== -1) {
            state.subscriptions[index] = updatedSubscription
          }
          if (state.selectedSubscription?.id === updatedSubscription.id) {
            state.selectedSubscription = updatedSubscription
          }
        }
      })
      .addCase(updateSubscriptionStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { clearError, setSelectedUser, setSelectedIntent, setSelectedSubscription, setSelectedPayment, setFilters, setCurrentPage } = adminSlice.actions
export default adminSlice.reducer
