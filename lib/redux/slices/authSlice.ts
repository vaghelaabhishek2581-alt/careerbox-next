import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API } from '@/lib/api/services';
import { OnboardingAPI } from '@/lib/api/onboarding';

export interface User {
  id: string;
  email: string;
  name: string;
  role?: 'user' | 'admin' | 'organization' | 'business';
  roles?: string[];
  activeRole?: string;
  userType?: 'student' | 'professional';
  avatar?: string;
  organization?: string;
  permissions?: string[];
  emailVerified?: boolean;
  needsEmailVerification?: boolean;
  needsOnboarding?: boolean;
  needsRoleSelection?: boolean;
  profile?: any;
  createdAt?: string;
  lastLogin?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks for authentication
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string; userType?: string }, { rejectWithValue }) => {
    try {
      const response = await API.auth.login(credentials.email, credentials.password);
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Login failed');
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    userType?: string;
    organizationCode?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await API.auth.register(userData.name, userData.email, userData.password);
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Registration failed');
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await API.auth.logout();
    localStorage.removeItem('token');
    return null;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Logout failed');
  }
});

export const refreshToken = createAsyncThunk('auth/refresh', async (_, { rejectWithValue }) => {
  try {
    // Note: This might need to be implemented in the API service
    const response = await API.auth.login('', ''); // This is a placeholder
    return response.data;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Token refresh failed');
  }
});

// New onboarding thunk
export const completeOnboarding = createAsyncThunk(
  'auth/completeOnboarding',
  async (onboardingData: {
    userId: string;
    role: 'student' | 'professional' | 'institute_admin' | 'business_owner';
    userType?: 'student' | 'professional';
    bio?: string;
    skills?: string[];
    interests?: string[];
    company?: string;
    location?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await OnboardingAPI.completeOnboarding(onboardingData);
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Onboarding failed');
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Onboarding failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Login failed';
    });

    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Registration failed';
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    });

    // Refresh token
    builder.addCase(refreshToken.fulfilled, (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token);
    });

    // Complete onboarding
    builder.addCase(completeOnboarding.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(completeOnboarding.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload?.user) {
        state.user = action.payload.user;
        state.isAuthenticated = true;
      }
    });
    builder.addCase(completeOnboarding.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string || 'Onboarding failed';
    });
  },
});

export const { clearError, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;