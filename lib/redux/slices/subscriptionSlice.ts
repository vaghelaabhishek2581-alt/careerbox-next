import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Subscription, SubscriptionPlanDetails, CreateSubscriptionRequest, UpdateSubscriptionRequest, BillingHistory, UsageStats } from '@/lib/types/subscription.types'
import { ApiResponse, PaginatedResponse } from '@/lib/types/api.types'

interface SubscriptionState {
  currentSubscription: Subscription | null
  availablePlans: SubscriptionPlanDetails[]
  billingHistory: BillingHistory[]
  usageStats: UsageStats | null
  loading: boolean
  error: string | null
}

const initialState: SubscriptionState = {
  currentSubscription: null,
  availablePlans: [],
  billingHistory: [],
  usageStats: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchCurrentSubscription = createAsyncThunk(
  'subscription/fetchCurrentSubscription',
  async () => {
    const response = await fetch('/api/subscriptions/current')
    if (!response.ok) {
      throw new Error('Failed to fetch current subscription')
    }
    return response.json()
  }
)

export const fetchAvailablePlans = createAsyncThunk(
  'subscription/fetchAvailablePlans',
  async () => {
    const response = await fetch('/api/subscriptions/plans')
    if (!response.ok) {
      throw new Error('Failed to fetch available plans')
    }
    return response.json()
  }
)

export const createSubscription = createAsyncThunk(
  'subscription/createSubscription',
  async (subscriptionData: CreateSubscriptionRequest) => {
    const response = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriptionData),
    })
    if (!response.ok) {
      throw new Error('Failed to create subscription')
    }
    return response.json()
  }
)

export const updateSubscription = createAsyncThunk(
  'subscription/updateSubscription',
  async ({ subscriptionId, subscriptionData }: { subscriptionId: string; subscriptionData: UpdateSubscriptionRequest }) => {
    const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriptionData),
    })
    if (!response.ok) {
      throw new Error('Failed to update subscription')
    }
    return response.json()
  }
)

export const cancelSubscription = createAsyncThunk(
  'subscription/cancelSubscription',
  async (subscriptionId: string) => {
    const response = await fetch(`/api/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error('Failed to cancel subscription')
    }
    return response.json()
  }
)

export const fetchBillingHistory = createAsyncThunk(
  'subscription/fetchBillingHistory',
  async (params: { page?: number; limit?: number } = {}) => {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())

    const response = await fetch(`/api/subscriptions/billing-history?${queryParams}`)
    if (!response.ok) {
      throw new Error('Failed to fetch billing history')
    }
    return response.json()
  }
)

export const fetchUsageStats = createAsyncThunk(
  'subscription/fetchUsageStats',
  async () => {
    const response = await fetch('/api/subscriptions/usage-stats')
    if (!response.ok) {
      throw new Error('Failed to fetch usage stats')
    }
    return response.json()
  }
)

export const processPayment = createAsyncThunk(
  'subscription/processPayment',
  async ({ plan, interval, paymentMethodId }: { plan: string; interval: string; paymentMethodId: string }) => {
    const response = await fetch('/api/subscriptions/process-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan, interval, paymentMethodId }),
    })
    if (!response.ok) {
      throw new Error('Failed to process payment')
    }
    return response.json()
  }
)

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentSubscription: (state, action: PayloadAction<Subscription | null>) => {
      state.currentSubscription = action.payload
    },
    updateUsageStats: (state, action: PayloadAction<Partial<UsageStats>>) => {
      if (state.usageStats) {
        state.usageStats = { ...state.usageStats, ...action.payload }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch current subscription
      .addCase(fetchCurrentSubscription.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCurrentSubscription.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Subscription>
        if (response.data) {
          state.currentSubscription = response.data
        }
      })
      .addCase(fetchCurrentSubscription.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch current subscription'
      })
      // Fetch available plans
      .addCase(fetchAvailablePlans.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAvailablePlans.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<SubscriptionPlanDetails[]>
        if (response.data) {
          state.availablePlans = response.data
        }
      })
      .addCase(fetchAvailablePlans.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch available plans'
      })
      // Create subscription
      .addCase(createSubscription.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Subscription>
        if (response.data) {
          state.currentSubscription = response.data
        }
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create subscription'
      })
      // Update subscription
      .addCase(updateSubscription.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Subscription>
        if (response.data) {
          state.currentSubscription = response.data
        }
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update subscription'
      })
      // Cancel subscription
      .addCase(cancelSubscription.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Subscription>
        if (response.data) {
          state.currentSubscription = response.data
        }
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to cancel subscription'
      })
      // Fetch billing history
      .addCase(fetchBillingHistory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBillingHistory.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as PaginatedResponse<BillingHistory>
        state.billingHistory = response.data
      })
      .addCase(fetchBillingHistory.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch billing history'
      })
      // Fetch usage stats
      .addCase(fetchUsageStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsageStats.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<UsageStats>
        if (response.data) {
          state.usageStats = response.data
        }
      })
      .addCase(fetchUsageStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch usage stats'
      })
      // Process payment
      .addCase(processPayment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.loading = false
        // Handle successful payment
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to process payment'
      })
  },
})

export const { clearError, setCurrentSubscription, updateUsageStats } = subscriptionSlice.actions
export default subscriptionSlice.reducer
