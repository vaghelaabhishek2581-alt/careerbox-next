// store/slices/profileSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// Types based on the user types file
export interface PersonalDetails {
  firstName: string
  lastName: string
  dateOfBirth?: string
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say'
  professionalHeadline: string
  publicProfileId: string
  aboutMe: string
  interests?: string[]
  professionalBadges?: string[]
}

export interface Skill {
  id: string
  name: string
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
}

export interface Language {
  id: string
  name: string
  level: 'Basic' | 'Intermediate' | 'Advanced' | 'Fluent' | 'Native'
}

export interface UserProfile {
  id?: string
  name: string
  email?: string
  profileImage?: string
  coverImage?: string
  location?: string
  website?: string
  verified?: boolean
  followers?: number
  following?: number
  personalDetails: PersonalDetails
  skills: Skill[]
  languages: Language[]
  stats: {
    completedCourses: number
    skillsAssessed: number
    careerGoals: number
    networkSize: number
  }
  progress: {
    overall: number
    skills: number
    goals: number
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

// Async thunks for API calls
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData: Partial<UserProfile>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(profileData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.user || data
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const updatePersonalDetails = createAsyncThunk(
  'profile/updatePersonalDetails',
  async (personalDetails: PersonalDetails, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ personalDetails })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.user || data
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const addSkill = createAsyncThunk(
  'profile/addSkill',
  async (skillData: Omit<Skill, 'id'>, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { profile: ProfileState }
      const currentSkills = state.profile.profile?.skills || []

      const newSkill = {
        ...skillData,
        id: Date.now().toString() // Simple ID generation
      }

      const updatedSkills = [...currentSkills, newSkill]

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ skills: updatedSkills })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return newSkill
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const updateSkill = createAsyncThunk(
  'profile/updateSkill',
  async (
    { id, skillData }: { id: string; skillData: Partial<Skill> },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { profile: ProfileState }
      const currentSkills = state.profile.profile?.skills || []

      const updatedSkills = currentSkills.map(skill =>
        skill.id === id ? { ...skill, ...skillData } : skill
      )

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ skills: updatedSkills })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return { id, skillData }
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const deleteSkill = createAsyncThunk(
  'profile/deleteSkill',
  async (skillId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { profile: ProfileState }
      const currentSkills = state.profile.profile?.skills || []

      const updatedSkills = currentSkills.filter(skill => skill.id !== skillId)

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ skills: updatedSkills })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return skillId
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const addLanguage = createAsyncThunk(
  'profile/addLanguage',
  async (languageData: Omit<Language, 'id'>, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { profile: ProfileState }
      const currentLanguages = state.profile.profile?.languages || []

      const newLanguage = {
        ...languageData,
        id: Date.now().toString()
      }

      const updatedLanguages = [...currentLanguages, newLanguage]

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ languages: updatedLanguages })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return newLanguage
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const updateLanguage = createAsyncThunk(
  'profile/updateLanguage',
  async (
    { id, languageData }: { id: string; languageData: Partial<Language> },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { profile: ProfileState }
      const currentLanguages = state.profile.profile?.languages || []

      const updatedLanguages = currentLanguages.map(language =>
        language.id === id ? { ...language, ...languageData } : language
      )

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ languages: updatedLanguages })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return { id, languageData }
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const deleteLanguage = createAsyncThunk(
  'profile/deleteLanguage',
  async (languageId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { profile: ProfileState }
      const currentLanguages = state.profile.profile?.languages || []

      const updatedLanguages = currentLanguages.filter(
        language => language.id !== languageId
      )

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ languages: updatedLanguages })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return languageId
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const uploadProfileImage = createAsyncThunk(
  'profile/uploadProfileImage',
  async (
    { type, file }: { type: 'profile' | 'cover'; file: File },
    { rejectWithValue }
  ) => {
    try {
      // First, get presigned URL
      const urlResponse = await fetch('/api/user/profile/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          type,
          contentType: file.type
        })
      })

      if (!urlResponse.ok) {
        throw new Error('Failed to get upload URL')
      }

      const { uploadUrl, fileUrl } = await urlResponse.json()

      // Upload file to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file')
      }

      return { type, fileUrl }
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload
      state.isDirty = false
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
    },
    clearError: state => {
      state.error = null
    }
  },
  extraReducers: builder => {
    builder
      // Fetch profile
      .addCase(fetchProfile.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.profile = action.payload
        state.error = null
        state.isDirty = false
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch profile'
      })

      // Update profile
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
        state.error = (action.payload as string) || 'Failed to update profile'
      })

      // Update personal details
      .addCase(updatePersonalDetails.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile = action.payload
          state.isDirty = false
        }
      })

      // Skills
      .addCase(addSkill.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.skills.push(action.payload)
        }
      })
      .addCase(updateSkill.fulfilled, (state, action) => {
        if (state.profile) {
          const { id, skillData } = action.payload
          const skillIndex = state.profile.skills.findIndex(
            skill => skill.id === id
          )
          if (skillIndex !== -1) {
            state.profile.skills[skillIndex] = {
              ...state.profile.skills[skillIndex],
              ...skillData
            }
          }
        }
      })
      .addCase(deleteSkill.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.skills = state.profile.skills.filter(
            skill => skill.id !== action.payload
          )
        }
      })

      // Languages
      .addCase(addLanguage.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.languages.push(action.payload)
        }
      })
      .addCase(updateLanguage.fulfilled, (state, action) => {
        if (state.profile) {
          const { id, languageData } = action.payload
          const languageIndex = state.profile.languages.findIndex(
            language => language.id === id
          )
          if (languageIndex !== -1) {
            state.profile.languages[languageIndex] = {
              ...state.profile.languages[languageIndex],
              ...languageData
            }
          }
        }
      })
      .addCase(deleteLanguage.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.languages = state.profile.languages.filter(
            language => language.id !== action.payload
          )
        }
      })

      // Image upload
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        if (state.profile) {
          const { type, fileUrl } = action.payload
          if (type === 'profile') {
            state.profile.profileImage = fileUrl
          } else if (type === 'cover') {
            state.profile.coverImage = fileUrl
          }
        }
      })
  }
})

export const { setProfile, updateField, resetProfile, clearError } =
  profileSlice.actions
export default profileSlice.reducer
