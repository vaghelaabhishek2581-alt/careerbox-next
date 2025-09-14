import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// ============================================================================
// TYPES
// ============================================================================

export interface ISkill {
  id: string
  name: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  category?: string
  verified?: boolean
  endorsements?: number
  yearsOfExperience?: number
}

export interface ILanguage {
  id: string
  name: string
  level: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'FLUENT' | 'NATIVE'
  certifications?: string[]
}

export interface IPersonalDetails {
  firstName: string
  lastName: string
  middleName?: string
  dateOfBirth?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'
  professionalHeadline?: string
  publicProfileId: string
  aboutMe?: string
  phone?: string
  interests?: string[]
  professionalBadges?: string[]
  nationality?: string
}

export interface IWorkPosition {
  id: string
  title: string
  startDate: string
  endDate?: string
  isCurrent: boolean
  description?: string
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE'
  skills?: string[]
  achievements?: string[]
  salary?: {
    amount?: number
    currency?: string
    isPublic: boolean
  }
}

export interface IWorkExperience {
  id: string
  company: string
  location?: string
  positions: IWorkPosition[]
  companyLogo?: string
  companyWebsite?: string
  industry?: string
  companySize?: string
}

export interface IEducation {
  id: string
  degree: string
  institution: string
  fieldOfStudy?: string
  startDate: string
  endDate?: string
  isCurrent: boolean
  location?: string
  grade?: string
  description?: string
  institutionLogo?: string
  institutionWebsite?: string
  accreditation?: string
  honors?: string[]
}

export interface ISocialLinks {
  linkedin?: string
  twitter?: string
  github?: string
  instagram?: string
  facebook?: string
  youtube?: string
  portfolio?: string
  website?: string
}

export interface IProfile {
  _id?: string
  userId: string | {
    _id: string
    email: string
    emailVerified: boolean
  }
  personalDetails: IPersonalDetails
  workExperiences: IWorkExperience[]
  education: IEducation[]
  skills: ISkill[]
  languages: ILanguage[]
  socialLinks?: ISocialLinks
  profileImage?: string
  coverImage?: string
  location?: string
  bio?: string
  isPublic: boolean
  isComplete: boolean
  completionPercentage: number
  lastUpdated: string
  createdAt: string
  updatedAt: string
}

interface ProfileState {
  profile: IProfile | null
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

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Fetch user profile
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/profile')
      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to fetch profile')
      }

      return data.profile
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch profile')
    }
  }
)

// Create new profile
export const createProfile = createAsyncThunk(
  'profile/createProfile',
  async (profileData: Partial<IProfile>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })
      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to create profile')
      }

      return data.profile
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create profile')
    }
  }
)

// Update entire profile
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData: Partial<IProfile>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })
      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to update profile')
      }

      return data.profile
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update profile')
    }
  }
)

// Update personal details
export const updatePersonalDetails = createAsyncThunk(
  'profile/updatePersonalDetails',
  async (personalDetails: Partial<IPersonalDetails>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/profile/personal-details', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personalDetails),
      })
      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to update personal details')
      }

      return data.profile
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update personal details')
    }
  }
)

// Skills management
export const fetchSkills = createAsyncThunk(
  'profile/fetchSkills',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/profile/skills')
      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to fetch skills')
      }

      return data.skills
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch skills')
    }
  }
)

export const addSkill = createAsyncThunk(
  'profile/addSkill',
  async (skill: Omit<ISkill, 'id'>, { rejectWithValue }) => {
    try {
      const skillWithId = { ...skill, id: Date.now().toString() + Math.random().toString(36).substr(2, 9) }
      const response = await fetch('/api/profile/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(skillWithId),
      })
      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to add skill')
      }

      return data.skill
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add skill')
    }
  }
)

export const updateSkill = createAsyncThunk(
  'profile/updateSkill',
  async ({ id, skillData }: { id: string; skillData: Partial<ISkill> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/profile/skills/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(skillData),
      })
      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to update skill')
      }

      return data.skill
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update skill')
    }
  }
)

export const deleteSkill = createAsyncThunk(
  'profile/deleteSkill',
  async (skillId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/profile/skills/${skillId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to delete skill')
      }

      return skillId
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete skill')
    }
  }
)

// Languages management
export const fetchLanguages = createAsyncThunk(
  'profile/fetchLanguages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/profile/languages')
      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to fetch languages')
      }

      return data.languages
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch languages')
    }
  }
)

export const addLanguage = createAsyncThunk(
  'profile/addLanguage',
  async (language: Omit<ILanguage, 'id'>, { rejectWithValue }) => {
    try {
      const languageWithId = { ...language, id: Date.now().toString() + Math.random().toString(36).substr(2, 9) }
      const response = await fetch('/api/profile/languages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(languageWithId),
      })
      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to add language')
      }

      return data.language
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add language')
    }
  }
)

export const updateLanguage = createAsyncThunk(
  'profile/updateLanguage',
  async ({ id, languageData }: { id: string; languageData: Partial<ILanguage> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/profile/languages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(languageData),
      })
      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to update language')
      }

      return data.language
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update language')
    }
  }
)

export const deleteLanguage = createAsyncThunk(
  'profile/deleteLanguage',
  async (languageId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/profile/languages/${languageId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to delete language')
      }

      return languageId
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete language')
    }
  }
)

// Education management
export const fetchEducation = createAsyncThunk(
  'profile/fetchEducation',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/profile/education')
      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to fetch education')
      }

      return data.education
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch education')
    }
  }
)

export const addEducation = createAsyncThunk(
  'profile/addEducation',
  async (education: Omit<IEducation, 'id'>, { rejectWithValue }) => {
    try {
      const educationWithId = { ...education, id: Date.now().toString() + Math.random().toString(36).substr(2, 9) }
      const response = await fetch('/api/profile/education', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(educationWithId),
      })
      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to add education')
      }

      return data.education
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add education')
    }
  }
)

export const updateEducation = createAsyncThunk(
  'profile/updateEducation',
  async ({ id, educationData }: { id: string; educationData: Partial<IEducation> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/profile/education/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(educationData),
      })
      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to update education')
      }

      return data.education
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update education')
    }
  }
)

export const deleteEducation = createAsyncThunk(
  'profile/deleteEducation',
  async (educationId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/profile/education/${educationId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to delete education')
      }

      return educationId
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete education')
    }
  }
)

// Work experience management
export const fetchWorkExperience = createAsyncThunk(
  'profile/fetchWorkExperience',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/profile/work-experience')
      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to fetch work experience')
      }

      return data.workExperiences
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch work experience')
    }
  }
)

export const addWorkExperience = createAsyncThunk(
  'profile/addWorkExperience',
  async (workExperience: Omit<IWorkExperience, 'id'>, { rejectWithValue }) => {
    try {
      const workExperienceWithId = { ...workExperience, id: Date.now().toString() + Math.random().toString(36).substr(2, 9) }
      const response = await fetch('/api/profile/work-experience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workExperienceWithId),
      })
      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to add work experience')
      }

      return data.workExperience
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add work experience')
    }
  }
)

export const updateWorkExperience = createAsyncThunk(
  'profile/updateWorkExperience',
  async ({ id, workData }: { id: string; workData: Partial<IWorkExperience> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/profile/work-experience/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workData),
      })
      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to update work experience')
      }

      return data.workExperience
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update work experience')
    }
  }
)

export const deleteWorkExperience = createAsyncThunk(
  'profile/deleteWorkExperience',
  async (workExperienceId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/profile/work-experience/${workExperienceId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to delete work experience')
      }

      return workExperienceId
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete work experience')
    }
  }
)

// Upload profile image
export const uploadProfileImage = createAsyncThunk(
  'profile/uploadProfileImage',
  async ({ type, file }: { type: 'profile' | 'cover', file: File }, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/profile/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to upload image')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Upload profile image error:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to upload image')
    }
  }
)

// ============================================================================
// SLICE
// ============================================================================

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
    },
    updateLocalProfile: (state, action: PayloadAction<Partial<IProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload }
        state.isDirty = true
      }
    },
    // Optimistic updates for skills
    removeSkillOptimistic: (state, action: PayloadAction<string>) => {
      if (state.profile && state.profile.skills) {
        state.profile.skills = state.profile.skills.filter(skill => skill.id !== action.payload)
        state.isDirty = true
      }
    },
    addSkillOptimistic: (state, action: PayloadAction<ISkill>) => {
      if (state.profile) {
        if (!state.profile.skills) {
          state.profile.skills = []
        }
        state.profile.skills.push(action.payload)
        state.isDirty = true
      }
    },
    // Optimistic updates for languages
    removeLanguageOptimistic: (state, action: PayloadAction<string>) => {
      if (state.profile && state.profile.languages) {
        state.profile.languages = state.profile.languages.filter(language => language.id !== action.payload)
        state.isDirty = true
      }
    },
    addLanguageOptimistic: (state, action: PayloadAction<ILanguage>) => {
      if (state.profile) {
        if (!state.profile.languages) {
          state.profile.languages = []
        }
        state.profile.languages.push(action.payload)
        state.isDirty = true
      }
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
      console.log('🎯 fetchProfile.fulfilled - Profile loaded:', {
        hasProfile: !!action.payload,
        skillsCount: action.payload?.skills?.length || 0,
        languagesCount: action.payload?.languages?.length || 0
      })
    })
    builder.addCase(fetchProfile.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Create profile
    builder.addCase(createProfile.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(createProfile.fulfilled, (state, action) => {
      state.isLoading = false
      state.profile = action.payload
      state.isDirty = false
    })
    builder.addCase(createProfile.rejected, (state, action) => {
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

    // Update personal details
    builder.addCase(updatePersonalDetails.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(updatePersonalDetails.fulfilled, (state, action) => {
      state.isLoading = false
      state.profile = action.payload
      state.isDirty = false
    })
    builder.addCase(updatePersonalDetails.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Skills
    builder.addCase(addSkill.fulfilled, (state, action) => {
      console.log('🎯 addSkill.fulfilled - Profile exists:', !!state.profile, 'Payload:', action.payload)
      if (state.profile) {
        if (!state.profile.skills) {
          state.profile.skills = []
        }
        state.profile.skills.push(action.payload)
        state.isDirty = true
        console.log('✅ Skill added to profile, new skills count:', state.profile.skills.length)
      } else {
        console.log('❌ No profile found when adding skill')
      }
    })
    builder.addCase(updateSkill.fulfilled, (state, action) => {
      if (state.profile) {
        const index = state.profile.skills.findIndex(skill => skill.id === action.payload.id)
        if (index !== -1) {
          state.profile.skills[index] = action.payload
          state.isDirty = true
        }
      }
    })
    builder.addCase(deleteSkill.fulfilled, (state, action) => {
      if (state.profile) {
        state.profile.skills = state.profile.skills.filter(skill => skill.id !== action.payload)
        state.isDirty = true
      }
    })

    // Languages
    builder.addCase(addLanguage.fulfilled, (state, action) => {
      console.log('🎯 addLanguage.fulfilled - Profile exists:', !!state.profile, 'Payload:', action.payload)
      if (state.profile) {
        if (!state.profile.languages) {
          state.profile.languages = []
        }
        state.profile.languages.push(action.payload)
        state.isDirty = true
        console.log('✅ Language added to profile, new languages count:', state.profile.languages.length)
      } else {
        console.log('❌ No profile found when adding language')
      }
    })
    builder.addCase(updateLanguage.fulfilled, (state, action) => {
      if (state.profile) {
        const index = state.profile.languages.findIndex(lang => lang.id === action.payload.id)
        if (index !== -1) {
          state.profile.languages[index] = action.payload
          state.isDirty = true
        }
      }
    })
    builder.addCase(deleteLanguage.fulfilled, (state, action) => {
      if (state.profile) {
        state.profile.languages = state.profile.languages.filter(lang => lang.id !== action.payload)
        state.isDirty = true
      }
    })

    // Education
    builder.addCase(addEducation.fulfilled, (state, action) => {
      if (state.profile) {
        state.profile.education.push(action.payload)
        state.isDirty = true
      }
    })
    builder.addCase(updateEducation.fulfilled, (state, action) => {
      if (state.profile) {
        const index = state.profile.education.findIndex(edu => edu.id === action.payload.id)
        if (index !== -1) {
          state.profile.education[index] = action.payload
          state.isDirty = true
        }
      }
    })
    builder.addCase(deleteEducation.fulfilled, (state, action) => {
      if (state.profile) {
        state.profile.education = state.profile.education.filter(edu => edu.id !== action.payload)
        state.isDirty = true
      }
    })

    // Work experience
    builder.addCase(addWorkExperience.fulfilled, (state, action) => {
      if (state.profile) {
        state.profile.workExperiences.push(action.payload)
        state.isDirty = true
      }
    })
    builder.addCase(updateWorkExperience.fulfilled, (state, action) => {
      if (state.profile) {
        const index = state.profile.workExperiences.findIndex(work => work.id === action.payload.id)
        if (index !== -1) {
          state.profile.workExperiences[index] = action.payload
          state.isDirty = true
        }
      }
    })
    builder.addCase(deleteWorkExperience.fulfilled, (state, action) => {
      if (state.profile) {
        state.profile.workExperiences = state.profile.workExperiences.filter(work => work.id !== action.payload)
        state.isDirty = true
      }
    })

    // Upload profile image
    builder.addCase(uploadProfileImage.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(uploadProfileImage.fulfilled, (state, action) => {
      state.isLoading = false
      if (state.profile && action.payload) {
        if (action.payload.type === 'profile') {
          state.profile.profileImage = action.payload.url
        } else if (action.payload.type === 'cover') {
          state.profile.coverImage = action.payload.url
        }
        state.isDirty = true
      }
    })
    builder.addCase(uploadProfileImage.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })
  }
})

export const { 
  clearError, 
  setDirty, 
  clearProfile, 
  updateLocalProfile,
  removeSkillOptimistic,
  addSkillOptimistic,
  removeLanguageOptimistic,
  addLanguageOptimistic
} = profileSlice.actions
export default profileSlice.reducer