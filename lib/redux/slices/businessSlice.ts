import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Business {
  id: string;
  name: string;
  industry: string;
  size: 'startup' | 'small' | 'medium' | 'enterprise';
  status: 'active' | 'inactive' | 'trial';
  subscription: {
    plan: 'basic' | 'professional' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    expiresAt: string;
  };
  employees: number;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

interface BusinessState {
  businesses: Business[];
  currentBusiness: Business | null;
  totalBusinesses: number;
  isLoading: boolean;
  error: string | null;
  businessStats: {
    totalRevenue: number;
    activeSubscriptions: number;
    trialUsers: number;
    churnRate: number;
  };
  revenueData: Array<{
    month: string;
    revenue: number;
    subscriptions: number;
  }>;
}

const initialState: BusinessState = {
  businesses: [],
  currentBusiness: null,
  totalBusinesses: 0,
  isLoading: false,
  error: null,
  businessStats: {
    totalRevenue: 0,
    activeSubscriptions: 0,
    trialUsers: 0,
    churnRate: 0,
  },
  revenueData: [],
};

export const fetchBusinesses = createAsyncThunk(
  'business/fetchAll',
  async ({ page, limit, filters }: { page: number; limit: number; filters?: any }) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });
    
    const response = await fetch(`/api/admin/businesses?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch businesses');
    }
    
    return await response.json();
  }
);

export const fetchBusinessStats = createAsyncThunk(
  'business/fetchStats',
  async () => {
    const response = await fetch('/api/admin/businesses/stats', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch business stats');
    }
    
    return await response.json();
  }
);

export const createBusiness = createAsyncThunk(
  'business/create',
  async (businessData: Partial<Business>) => {
    const response = await fetch('/api/admin/businesses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(businessData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create business');
    }
    
    return await response.json();
  }
);

export const updateBusinessStatus = createAsyncThunk(
  'business/updateStatus',
  async ({ id, status }: { id: string; status: string }) => {
    const response = await fetch(`/api/admin/businesses/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update business status');
    }
    
    return await response.json();
  }
);

const businessSlice = createSlice({
  name: 'business',
  initialState,
  reducers: {
    setCurrentBusiness: (state, action) => {
      state.currentBusiness = action.payload;
    },
    clearBusinessError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBusinesses.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchBusinesses.fulfilled, (state, action) => {
      state.isLoading = false;
      state.businesses = action.payload.businesses;
      state.totalBusinesses = action.payload.total;
    });
    builder.addCase(fetchBusinesses.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to fetch businesses';
    });

    builder.addCase(fetchBusinessStats.fulfilled, (state, action) => {
      state.businessStats = action.payload.stats;
      state.revenueData = action.payload.revenueData;
    });

    builder.addCase(createBusiness.fulfilled, (state, action) => {
      state.businesses.unshift(action.payload.business);
      state.totalBusinesses += 1;
    });

    builder.addCase(updateBusinessStatus.fulfilled, (state, action) => {
      const index = state.businesses.findIndex(biz => biz.id === action.payload.business.id);
      if (index !== -1) {
        state.businesses[index] = action.payload.business;
      }
    });
  },
});

export const { setCurrentBusiness, clearBusinessError } = businessSlice.actions;
export default businessSlice.reducer;