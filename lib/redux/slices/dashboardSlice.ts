import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyGrowth: number;
  recentActivities: Activity[];
  chartData: ChartData[];
}

interface Activity {
  id: string;
  type: 'user_registered' | 'course_completed' | 'payment_received' | 'support_ticket';
  message: string;
  timestamp: string;
  user?: string;
}

interface ChartData {
  name: string;
  value: number;
  date: string;
}

interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  selectedDateRange: string;
}

const initialState: DashboardState = {
  stats: null,
  isLoading: false,
  error: null,
  selectedDateRange: '30d',
};

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async ({ role, dateRange }: { role: string; dateRange: string }) => {
    const response = await fetch(`/api/dashboard/${role}/stats?range=${dateRange}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }
    
    return await response.json();
  }
);

export const fetchRecentActivities = createAsyncThunk(
  'dashboard/fetchActivities',
  async (role: string) => {
    const response = await fetch(`/api/dashboard/${role}/activities`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch activities');
    }
    
    return await response.json();
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setDateRange: (state, action: PayloadAction<string>) => {
      state.selectedDateRange = action.payload;
    },
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchDashboardStats.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchDashboardStats.fulfilled, (state, action) => {
      state.isLoading = false;
      state.stats = action.payload;
    });
    builder.addCase(fetchDashboardStats.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to fetch dashboard stats';
    });

    builder.addCase(fetchRecentActivities.fulfilled, (state, action) => {
      if (state.stats) {
        state.stats.recentActivities = action.payload.activities;
      }
    });
  },
});

export const { setDateRange, clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;