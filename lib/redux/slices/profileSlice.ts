// store/slices/profileSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import {
  UserProfile,
  ProfileState,
  PersonalDetails,
  Skill,
  Language,
  WorkExperience,
  Education
} from '@/lib/types/profile.unified'

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
// Education async thunks
export const addEducation = createAsyncThunk(
  'profile/addEducation',
  async (educationData: Omit<Education, 'id'>, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { profile: ProfileState }
      const currentEducation = state.profile.profile?.education || []

      const newEducation = {
        ...educationData,
        id: Date.now().toString() // Generate new id
      }

      const updatedEducation = [...currentEducation, newEducation]

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ education: updatedEducation })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return newEducation
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const updateEducation = createAsyncThunk(
  'profile/updateEducation',
  async (
    { id, educationData }: { id: string; educationData: Partial<Education> },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { profile: ProfileState }
      const currentEducation = state.profile.profile?.education || []

      const updatedEducation = currentEducation.map(edu =>
        edu.id === id ? { ...edu, ...educationData } : edu
      )

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ education: updatedEducation })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return { id, educationData }
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const deleteEducation = createAsyncThunk(
  'profile/deleteEducation',
  async (educationId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { profile: ProfileState }
      const currentEducation = state.profile.profile?.education || []

      const updatedEducation = currentEducation.filter(
        edu => edu.id !== educationId
      )

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ education: updatedEducation })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return educationId
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

// Work Experience async thunks
export const addWorkExperience = createAsyncThunk(
  'profile/addWorkExperience',
  async (workData: Omit<WorkExperience, 'id'>, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { profile: ProfileState }
      const currentWorkExperiences = state.profile.profile?.workExperiences || []

      const newWorkExperience = {
        ...workData,
        id: Date.now().toString(), // Simple ID generation
        positions: workData.positions.map(pos => ({
          ...pos,
          id: pos.id || Date.now().toString() + Math.random().toString(36).substr(2, 9)
        }))
      }

      const updatedWorkExperiences = [...currentWorkExperiences, newWorkExperience]

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ workExperiences: updatedWorkExperiences })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return newWorkExperience
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const updateWorkExperience = createAsyncThunk(
  'profile/updateWorkExperience',
  async (
    { id, workData }: { id: string; workData: Partial<WorkExperience> },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { profile: ProfileState }
      const currentWorkExperiences = state.profile.profile?.workExperiences || []

      const updatedWorkExperiences = currentWorkExperiences.map(work =>
        work.id === id ? { ...work, ...workData } : work
      )

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ workExperiences: updatedWorkExperiences })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return { id, workData }
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const deleteWorkExperience = createAsyncThunk(
  'profile/deleteWorkExperience',
  async (workId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { profile: ProfileState }
      const currentWorkExperiences = state.profile.profile?.workExperiences || []

      const updatedWorkExperiences = currentWorkExperiences.filter(
        work => work.id !== workId
      )

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ workExperiences: updatedWorkExperiences })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return workId
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
    
// Work Experience
      .addCase(addWorkExperience.fulfilled, (state, action) => {
        if (state.profile) {
          if (!state.profile.workExperiences) {
            state.profile.workExperiences = []
          }
          state.profile.workExperiences.push(action.payload)
        }
      })
      .addCase(updateWorkExperience.fulfilled, (state, action) => {
        if (state.profile) {
          const { id, workData } = action.payload
          const workIndex = state.profile.workExperiences.findIndex(
            work => work.id === id
          )
          if (workIndex !== -1) {
            state.profile.workExperiences[workIndex] = {
              ...state.profile.workExperiences[workIndex],
              ...workData
            }
          }
        }
      })
      .addCase(deleteWorkExperience.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.workExperiences = state.profile.workExperiences.filter(
            work => work.id !== action.payload
          )
        }
      })

      // Education
      .addCase(addEducation.fulfilled, (state, action) => {
        if (state.profile) {
          if (!state.profile.education) {
            state.profile.education = []
          }
          state.profile.education.push(action.payload)
        }
      })
      .addCase(updateEducation.fulfilled, (state, action) => {
        if (state.profile) {
          const { id, educationData } = action.payload
          const eduIndex = state.profile.education.findIndex(
            edu => edu.id === id
          )
          if (eduIndex !== -1) {
            state.profile.education[eduIndex] = {
              ...state.profile.education[eduIndex],
              ...educationData
            }
          }
        }
      })
      .addCase(deleteEducation.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.education = state.profile.education.filter(
            edu => edu.id !== action.payload
          )
        }
      })
  }
})

export const { setProfile, updateField, resetProfile, clearError } =
  profileSlice.actions
export default profileSlice.reducer
