import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { UserProfile } from '@/lib/types/profile'

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

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (userId: string) => {
    const response = await fetch(`/api/user/${userId}/profile`)
    if (!response.ok) {
      throw new Error('Failed to fetch profile')
    }
    return response.json()
  }
)

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profile: Partial<UserProfile>) => {
    const response = await fetch(`/api/user/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profile)
    })
    if (!response.ok) {
      throw new Error('Failed to update profile')
    }
    return response.json()
  }
)

export const uploadProfileImage = createAsyncThunk(
  'profile/uploadProfileImage',
  async ({ type, file }: { type: 'avatar' | 'cover'; file: File }) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const response = await fetch(`/api/user/profile/image`, {
      method: 'POST',
      body: formData
    })
    if (!response.ok) {
      throw new Error('Failed to upload image')
    }
    return response.json()
  }
)

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload
    },
    updateField: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload }
        state.isDirty = true
      }
    },
    resetProfile: state => {
      state.profile = null
      state.isLoading = false
      state.error = null
      state.isDirty = false
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProfile.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.profile = action.payload
        state.error = null
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch profile'
      })
      .addCase(updateProfile.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.profile = action.payload
        state.error = null
        state.isDirty = false
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to update profile'
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        if (state.profile) {
          const { type, url } = action.payload
          if (type === 'avatar') {
            state.profile.avatarUrl = url
          } else if (type === 'cover') {
            state.profile.coverImageUrl = url
          }
        }
      })
  }
})

export const { setProfile, updateField, resetProfile } = profileSlice.actions
export default profileSlice.reducer
