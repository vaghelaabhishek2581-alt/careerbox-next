import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from './authSlice';

interface UserState {
  users: User[];
  totalUsers: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  filters: {
    role: string;
    status: string;
    search: string;
  };
}

const initialState: UserState = {
  users: [],
  totalUsers: 0,
  currentPage: 1,
  isLoading: false,
  error: null,
  filters: {
    role: 'all',
    status: 'all',
    search: '',
  },
};

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async ({ page, limit, filters }: { page: number; limit: number; filters: any }) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });
    
    const response = await fetch(`/api/admin/users?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    return await response.json();
  }
);

export const updateUserRole = createAsyncThunk(
  'users/updateRole',
  async ({ userId, role }: { userId: string; role: string }) => {
    const response = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ role }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user role');
    }
    
    return await response.json();
  }
);

export const suspendUser = createAsyncThunk(
  'users/suspend',
  async (userId: string) => {
    const response = await fetch(`/api/admin/users/${userId}/suspend`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to suspend user');
    }
    
    return await response.json();
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearUsersError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUsers.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.isLoading = false;
      state.users = action.payload.users;
      state.totalUsers = action.payload.total;
    });
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to fetch users';
    });

    builder.addCase(updateUserRole.fulfilled, (state, action) => {
      const index = state.users.findIndex(user => user.id === action.payload.user.id);
      if (index !== -1) {
        state.users[index] = action.payload.user;
      }
    });

    builder.addCase(suspendUser.fulfilled, (state, action) => {
      const index = state.users.findIndex(user => user.id === action.payload.user.id);
      if (index !== -1) {
        state.users[index] = action.payload.user;
      }
    });
  },
});

export const { setFilters, setCurrentPage, clearUsersError } = userSlice.actions;
export default userSlice.reducer;