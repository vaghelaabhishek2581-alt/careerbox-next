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

// Fetch Admin Statistics
export const fetchAdminStats = createAsyncThunk(
  'admin/fetchAdminStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.message || 'Failed to fetch admin stats')
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue('Network error occurred')
    }
  }
)

// Fetch All Users
export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async ({ page = 1, filters }: { page?: number; filters?: AdminFilters }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.set('page', page.toString())
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value && typeof value === 'string') {
            queryParams.set(key, value)
          } else if (value && typeof value === 'object' && 'start' in value && 'end' in value) {
            queryParams.set(`${key}Start`, value.start)
            queryParams.set(`${key}End`, value.end)
          }
        })
      }

      const response = await fetch(`/api/admin/users?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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
  async ({ page = 1, filters }: { page?: number; filters?: AdminFilters }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.set('page', page.toString())
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value && typeof value === 'string') {
            queryParams.set(key, value)
          } else if (value && typeof value === 'object' && 'start' in value && 'end' in value) {
            queryParams.set(`${key}Start`, value.start)
            queryParams.set(`${key}End`, value.end)
          }
        })
      }

      const response = await fetch(`/api/admin/registration-intents?${queryParams}`, {
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

// Review Registration Intent
export const reviewRegistrationIntent = createAsyncThunk(
  'admin/reviewRegistrationIntent',
  async ({ 
    intentId, 
    action, 
    adminNotes, 
    subscriptionPlan 
  }: { 
    intentId: string
    action: 'approve' | 'reject' | 'require_payment'
    adminNotes?: string
    subscriptionPlan?: string
  }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/registration-intents/${intentId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          adminNotes,
          subscriptionPlan,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.error || error.message || 'Failed to review registration intent')
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
  async ({ 
    userId, 
    organizationType, 
    planType, 
    reason 
  }: { 
    userId: string
    organizationType: 'institute' | 'business'
    planType: 'free' | 'basic' | 'premium' | 'enterprise'
    reason: string
  }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/subscriptions/grant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          organizationType,
          planType,
          reason,
        }),
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

// Fetch All Subscriptions
export const fetchAllSubscriptions = createAsyncThunk(
  'admin/fetchAllSubscriptions',
  async ({ page = 1, filters }: { page?: number; filters?: AdminFilters }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.set('page', page.toString())
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value && typeof value === 'string') {
            queryParams.set(key, value)
          } else if (value && typeof value === 'object' && 'start' in value && 'end' in value) {
            queryParams.set(`${key}Start`, value.start)
            queryParams.set(`${key}End`, value.end)
          }
        })
      }

      const response = await fetch(`/api/admin/subscriptions?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.message || 'Failed to fetch subscriptions')
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue('Network error occurred')
    }
  }
)

// Update User Role
export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ 
    userId, 
    roles, 
    activeRole 
  }: { 
    userId: string
    roles: string[]
    activeRole: string
  }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roles,
          activeRole,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.message || 'Failed to update user role')
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue('Network error occurred')
    }
  }
)

// Suspend/Activate Subscription
export const updateSubscriptionStatus = createAsyncThunk(
  'admin/updateSubscriptionStatus',
  async ({ 
    subscriptionId, 
    status, 
    reason 
  }: { 
    subscriptionId: string
    status: 'active' | 'suspended' | 'cancelled'
    reason?: string
  }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          reason,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.message || 'Failed to update subscription status')
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue('Network error occurred')
    }
  }
)

// Fetch All Payments
export const fetchAllPayments = createAsyncThunk(
  'admin/fetchAllPayments',
  async ({ page = 1, filters }: { page?: number; filters?: AdminFilters }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.set('page', page.toString())
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value && typeof value === 'string') {
            queryParams.set(key, value)
          } else if (value && typeof value === 'object' && 'start' in value && 'end' in value) {
            queryParams.set(`${key}Start`, value.start)
            queryParams.set(`${key}End`, value.end)
          }
        })
      }

      const response = await fetch(`/api/admin/payments?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.message || 'Failed to fetch payments')
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue('Network error occurred')
    }
  }
)

// Process Refund
export const processRefund = createAsyncThunk(
  'admin/processRefund',
  async ({ 
    paymentId, 
    amount, 
    reason 
  }: { 
    paymentId: string
    amount?: number
    reason: string
  }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          reason,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.message || 'Failed to process refund')
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue('Network error occurred')
    }
  }
)

// Update Payment Status
export const updatePaymentStatus = createAsyncThunk(
  'admin/updatePaymentStatus',
  async ({ 
    paymentId, 
    status, 
    notes 
  }: { 
    paymentId: string
    status: 'paid' | 'failed' | 'cancelled'
    notes?: string
  }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          notes,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.message || 'Failed to update payment status')
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
  totalItems: 0,
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedUser: (state, action: PayloadAction<AdminUser | null>) => {
      state.selectedUser = action.payload
    },
    setSelectedIntent: (state, action: PayloadAction<AdminRegistrationIntent | null>) => {
      state.selectedIntent = action.payload
    },
    setSelectedSubscription: (state, action: PayloadAction<AdminSubscription | null>) => {
      state.selectedSubscription = action.payload
    },
    setSelectedPayment: (state, action: PayloadAction<AdminPayment | null>) => {
      state.selectedPayment = action.payload
    },
    setFilters: (state, action: PayloadAction<AdminFilters>) => {
      state.filters = action.payload
      state.currentPage = 1 // Reset to first page when filters change
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    },
    updateIntentInList: (state, action: PayloadAction<AdminRegistrationIntent>) => {
      const index = state.registrationIntents.findIndex(intent => intent.id === action.payload.id)
      if (index !== -1) {
        state.registrationIntents[index] = action.payload
      }
    },
    updateUserInList: (state, action: PayloadAction<AdminUser>) => {
      const index = state.users.findIndex(user => user.id === action.payload.id)
      if (index !== -1) {
        state.users[index] = action.payload
      }
    },
    updateSubscriptionInList: (state, action: PayloadAction<AdminSubscription>) => {
      const index = state.subscriptions.findIndex(sub => sub.id === action.payload.id)
      if (index !== -1) {
        state.subscriptions[index] = action.payload
      }
    },
    updatePaymentInList: (state, action: PayloadAction<AdminPayment>) => {
      const index = state.payments.findIndex(payment => payment.id === action.payload.id)
      if (index !== -1) {
        state.payments[index] = action.payload
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Admin Stats
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload.data
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Fetch All Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload.data || []
        state.currentPage = action.payload.currentPage || 1
        state.totalPages = action.payload.totalPages || 1
        state.totalItems = action.payload.totalItems || 0
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Fetch All Registration Intents
      .addCase(fetchAllRegistrationIntents.pending, (state) => {
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
      .addCase(reviewRegistrationIntent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(reviewRegistrationIntent.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.data) {
          const updatedIntent = action.payload.data
          const index = state.registrationIntents.findIndex(intent => intent.id === updatedIntent.id)
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
      .addCase(grantFreeSubscription.pending, (state) => {
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
      
      // Fetch All Subscriptions
      .addCase(fetchAllSubscriptions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllSubscriptions.fulfilled, (state, action) => {
        state.loading = false
        state.subscriptions = action.payload.data || []
        state.currentPage = action.payload.currentPage || 1
        state.totalPages = action.payload.totalPages || 1
        state.totalItems = action.payload.totalItems || 0
      })
      .addCase(fetchAllSubscriptions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Update User Role
      .addCase(updateUserRole.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.data) {
          const updatedUser = action.payload.data
          const index = state.users.findIndex(user => user.id === updatedUser.id)
          if (index !== -1) {
            state.users[index] = updatedUser
          }
          if (state.selectedUser?.id === updatedUser.id) {
            state.selectedUser = updatedUser
          }
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Update Subscription Status
      .addCase(updateSubscriptionStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSubscriptionStatus.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.data) {
          const updatedSubscription = action.payload.data
          const index = state.subscriptions.findIndex(sub => sub.id === updatedSubscription.id)
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
      
      // Fetch All Payments
      .addCase(fetchAllPayments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllPayments.fulfilled, (state, action) => {
        state.loading = false
        state.payments = action.payload.data || []
        state.currentPage = action.payload.currentPage || 1
        state.totalPages = action.payload.totalPages || 1
        state.totalItems = action.payload.totalItems || 0
      })
      .addCase(fetchAllPayments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Process Refund
      .addCase(processRefund.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(processRefund.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.data) {
          const updatedPayment = action.payload.data
          const index = state.payments.findIndex(payment => payment.id === updatedPayment.id)
          if (index !== -1) {
            state.payments[index] = updatedPayment
          }
          if (state.selectedPayment?.id === updatedPayment.id) {
            state.selectedPayment = updatedPayment
          }
        }
      })
      .addCase(processRefund.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Update Payment Status
      .addCase(updatePaymentStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.data) {
          const updatedPayment = action.payload.data
          const index = state.payments.findIndex(payment => payment.id === updatedPayment.id)
          if (index !== -1) {
            state.payments[index] = updatedPayment
          }
          if (state.selectedPayment?.id === updatedPayment.id) {
            state.selectedPayment = updatedPayment
          }
        }
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const {
  clearError,
  setSelectedUser,
  setSelectedIntent,
  setSelectedSubscription,
  setSelectedPayment,
  setFilters,
  setCurrentPage,
  updateIntentInList,
  updateUserInList,
  updateSubscriptionInList,
  updatePaymentInList,
} = adminSlice.actions

export default adminSlice.reducer
