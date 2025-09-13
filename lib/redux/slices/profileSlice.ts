import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { API } from '@/lib/api/services'

// Types
export interface UserProfile {
  personalDetails: {
    firstName: string
    lastName: string
    publicProfileId: string
    professionalHeadline?: string
    aboutMe?: string
    phone?: string
    avatar?: string
  }
  workExperience: any[]
  education: any[]
  skills: any[]
  languages: any[]
  interests: string[]
  socialLinks: any[]
  achievements: any[]
  certifications: any[]
  projects: any[]
  goals: any[]
  preferences: {
    notifications: {
      email: boolean
      push: boolean
      marketing: boolean
    }
    privacy: {
      profileVisible: boolean
      showEmail: boolean
      showPhone: boolean
    }
  }
}

interface ProfileState {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  isDirty: boolean
}

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  error: null,
  isDirty: false
}

// Async thunks using API client
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.profile.getProfile()

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch profile')
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch profile')
    }
  }
)

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData: Partial<UserProfile>, { rejectWithValue }) => {
    try {
      const response = await API.profile.updateProfile(profileData)

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to update profile')
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update profile')
    }
  }
)

export const uploadProfileImage = createAsyncThunk(
  'profile/uploadProfileImage',
  async (file: File, { rejectWithValue }) => {
    try {
      const response = await API.profile.uploadProfileImage(file)

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to upload image')
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to upload image')
    }
  }
)

export const getProfileById = createAsyncThunk(
  'profile/getProfileById',
  async (profileId: string, { rejectWithValue }) => {
    try {
      const response = await API.profile.getProfileById(profileId)

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch profile')
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch profile')
    }
  }
)

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setDirty: (state, action: PayloadAction<boolean>) => {
      state.isDirty = action.payload
    },
    clearProfile: (state) => {
      state.profile = null
      state.error = null
      state.isDirty = false
    }
  },
  extraReducers: (builder) => {
    // Fetch profile
    builder.addCase(fetchProfile.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(fetchProfile.fulfilled, (state, action) => {
      state.isLoading = false
      state.profile = action.payload
      state.isDirty = false
    })
    builder.addCase(fetchProfile.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Update profile
    builder.addCase(updateProfile.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.isLoading = false
      state.profile = action.payload
      state.isDirty = false
    })
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Upload profile image
    builder.addCase(uploadProfileImage.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(uploadProfileImage.fulfilled, (state, action) => {
      state.isLoading = false
      if (state.profile && action.payload) {
        state.profile.personalDetails.avatar = action.payload.avatar
      }
      state.isDirty = false
    })
    builder.addCase(uploadProfileImage.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Get profile by ID
    builder.addCase(getProfileById.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(getProfileById.fulfilled, (state, action) => {
      state.isLoading = false
      state.profile = action.payload
      state.isDirty = false
    })
    builder.addCase(getProfileById.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })
  }
})

export const { clearError, setDirty, clearProfile } = profileSlice.actions
export default profileSlice.reducer
