import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Lead, CreateLeadRequest, UpdateLeadStatusRequest, ConvertLeadRequest } from '@/lib/types/lead.types'
import { ApiResponse, PaginatedResponse } from '@/lib/types/api.types'

interface LeadState {
  leads: Lead[]
  currentLead: Lead | null
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

const initialState: LeadState = {
  leads: [],
  currentLead: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    hasMore: false,
  },
}

// Async thunks
export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async (params: { page?: number; limit?: number; type?: string; status?: string }) => {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.type) queryParams.append('type', params.type)
    if (params.status) queryParams.append('status', params.status)

    const response = await fetch(`/api/leads?${queryParams}`)
    if (!response.ok) {
      throw new Error('Failed to fetch leads')
    }
    return response.json()
  }
)

export const createLead = createAsyncThunk(
  'leads/createLead',
  async (leadData: CreateLeadRequest) => {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
    })
    if (!response.ok) {
      throw new Error('Failed to create lead')
    }
    return response.json()
  }
)

export const updateLeadStatus = createAsyncThunk(
  'leads/updateLeadStatus',
  async (data: UpdateLeadStatusRequest) => {
    const response = await fetch(`/api/leads/${data.leadId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: data.status, notes: data.notes }),
    })
    if (!response.ok) {
      throw new Error('Failed to update lead status')
    }
    return response.json()
  }
)

export const convertLead = createAsyncThunk(
  'leads/convertLead',
  async (data: ConvertLeadRequest) => {
    const response = await fetch(`/api/leads/${data.leadId}/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to convert lead')
    }
    return response.json()
  }
)

export const fetchLeadById = createAsyncThunk(
  'leads/fetchLeadById',
  async (leadId: string) => {
    const response = await fetch(`/api/leads/${leadId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch lead')
    }
    return response.json()
  }
)

const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentLead: (state, action: PayloadAction<Lead | null>) => {
      state.currentLead = action.payload
    },
    updateLeadInList: (state, action: PayloadAction<Lead>) => {
      const index = state.leads.findIndex(lead => lead.id === action.payload.id)
      if (index !== -1) {
        state.leads[index] = action.payload
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch leads
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as PaginatedResponse<Lead>
        state.leads = response.data
        state.pagination = {
          page: response.page,
          limit: response.limit,
          total: response.total,
          hasMore: response.hasMore,
        }
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch leads'
      })
      // Create lead
      .addCase(createLead.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Lead>
        if (response.data) {
          state.leads.unshift(response.data)
        }
      })
      .addCase(createLead.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create lead'
      })
      // Update lead status
      .addCase(updateLeadStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateLeadStatus.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Lead>
        if (response.data) {
          const index = state.leads.findIndex(lead => lead.id === response.data!.id)
          if (index !== -1) {
            state.leads[index] = response.data!
          }
          if (state.currentLead?.id === response.data!.id) {
            state.currentLead = response.data!
          }
        }
      })
      .addCase(updateLeadStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update lead status'
      })
      // Convert lead
      .addCase(convertLead.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(convertLead.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Lead>
        if (response.data) {
          const index = state.leads.findIndex(lead => lead.id === response.data!.id)
          if (index !== -1) {
            state.leads[index] = response.data!
          }
          if (state.currentLead?.id === response.data!.id) {
            state.currentLead = response.data!
          }
        }
      })
      .addCase(convertLead.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to convert lead'
      })
      // Fetch lead by ID
      .addCase(fetchLeadById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLeadById.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Lead>
        if (response.data) {
          state.currentLead = response.data
        }
      })
      .addCase(fetchLeadById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch lead'
      })
  },
})

export const { clearError, setCurrentLead, updateLeadInList } = leadSlice.actions
export default leadSlice.reducer
