import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from './authSlice';
import { API } from '@/lib/api/services';

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
    const response = await API.admin.getUsers(page, limit, filters);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch users');
    }
    return response.data;
  }
);

export const updateUserRole = createAsyncThunk(
  'users/updateRole',
  async ({ userId, role }: { userId: string; role: string }) => {
    // TODO: Implement updateUserRole in AdminAPI
    return { user: { id: userId, role } };
  }
);

export const suspendUser = createAsyncThunk(
  'users/suspend',
  async (userId: string) => {
    // TODO: Implement suspendUser in AdminAPI
    return { user: { id: userId, status: 'suspended' } };
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
      const index = state.users.findIndex(user => user.id === (action.payload as any).user.id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...(action.payload as any).user };
      }
    });

    builder.addCase(suspendUser.fulfilled, (state, action) => {
      const index = state.users.findIndex(user => user.id === (action.payload as any).user.id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...(action.payload as any).user };
      }
    });
  },
});

export const { setFilters, setCurrentPage, clearUsersError } = userSlice.actions;
export default userSlice.reducer;