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
  locationType: 'ONSITE' | 'REMOTE' | 'HYBRID'
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
  verified?: boolean
  followers?: number
  following?: number
  stats?: {
    completedCourses?: number
    skillsAssessed?: number
    certificationsEarned?: number
    connectionsCount?: number
    profileViews?: number
    endorsements?: number
    careerGoals?: number
    networkSize?: number
  }
  progress?: {
    overall?: number
    skills?: number
    goals?: number
  }
}

interface ProfileState {
  profile: IProfile | null
  isLoading: boolean
  hasFetched: boolean  // ← ADD THIS
  isUploadingImage: boolean
  isUpdating: boolean
  isCreating: boolean
  error: string | null
  isDirty: boolean
}

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  hasFetched: false,  // ← ADD THIS
  isUploadingImage: false,
  isUpdating: false,
  isCreating: false,
  error: null,
  isDirty: false
}

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Fetch user profile
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
  },
  {
    // Prevent duplicate fetches - this is the key fix!
    condition: (_, { getState }) => {
      const { profile } = getState() as { profile: ProfileState }
      // Cancel if already fetched or currently loading
      if (profile.hasFetched || profile.isLoading) {
        console.log('⏭️ fetchProfile cancelled - already fetched or loading')
        return false
      }
      return true
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
  async (personalDetails: Partial<IPersonalDetails>, { rejectWithValue, dispatch, getState }) => {
    const { toast } = await import('sonner')
    const t = toast.loading('Saving personal details...')
    const prev = (getState() as any)?.profile?.profile?.personalDetails
    // Optimistic update
    dispatch(updateLocalProfile({ personalDetails: { ...prev, ...personalDetails } as any }))

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
        if (prev) dispatch(updateLocalProfile({ personalDetails: prev }))
        toast.error(data.error || 'Failed to update personal details')
        return rejectWithValue(data.error || 'Failed to update personal details')
      }

      toast.success('Personal details saved')
      return data.profile
    } catch (error) {
      if (prev) dispatch(updateLocalProfile({ personalDetails: prev }))
      toast.error(error instanceof Error ? error.message : 'Failed to update personal details')
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update personal details')
    } finally {
      toast.dismiss(t)
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
  async (skill: Omit<ISkill, 'id'>, { rejectWithValue, dispatch }) => {
    const { toast } = await import('sonner')
    const tempId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const tempSkill: ISkill = { ...skill, id: tempId }
    // Optimistic add
    dispatch(addSkillOptimistic(tempSkill))
    const t = toast.loading('Adding skill...')
    try {
      const response = await fetch('/api/profile/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tempSkill),
      })
      const data = await response.json()

      if (!response.ok) {
        dispatch(removeSkillOptimistic(tempId))
        toast.error(data.error || 'Failed to add skill')
        return rejectWithValue(data.error || 'Failed to add skill')
      }

      toast.success('Skill added')
      return data.skill
    } catch (error) {
      dispatch(removeSkillOptimistic(tempId))
      toast.error(error instanceof Error ? error.message : 'Failed to add skill')
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add skill')
    } finally {
      toast.dismiss(t)
    }
  }
)

export const updateSkill = createAsyncThunk(
  'profile/updateSkill',
  async ({ id, skillData }: { id: string; skillData: Partial<ISkill> }, { rejectWithValue, dispatch, getState }) => {
    const { toast } = await import('sonner')
    const t = toast.loading('Updating skill...')
    const prev = (getState() as any)?.profile?.profile?.skills?.find((s: ISkill) => s.id === id)
    // Optimistic update
    dispatch(updateSkillOptimistic({ id, changes: skillData }))
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
        if (prev) dispatch(updateSkillOptimistic({ id, changes: prev }))
        toast.error(data.error || 'Failed to update skill')
        return rejectWithValue(data.error || 'Failed to update skill')
      }

      toast.success('Skill updated')
      return data.skill
    } catch (error) {
      if (prev) dispatch(updateSkillOptimistic({ id, changes: prev }))
      toast.error(error instanceof Error ? error.message : 'Failed to update skill')
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update skill')
    } finally {
      toast.dismiss(t)
    }
  }
)

export const deleteSkill = createAsyncThunk(
  'profile/deleteSkill',
  async (skillId: string, { rejectWithValue, dispatch, getState }) => {
    const { toast } = await import('sonner')
    const t = toast.loading('Deleting skill...')
    const prev = (getState() as any)?.profile?.profile?.skills?.find((s: ISkill) => s.id === skillId)
    // Optimistic remove
    dispatch(removeSkillOptimistic(skillId))
    try {
      const response = await fetch(`/api/profile/skills/${skillId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok) {
        if (prev) dispatch(addSkillOptimistic(prev))
        toast.error(data.error || 'Failed to delete skill')
        return rejectWithValue(data.error || 'Failed to delete skill')
      }

      toast.success('Skill deleted')
      return skillId
    } catch (error) {
      if (prev) dispatch(addSkillOptimistic(prev))
      toast.error(error instanceof Error ? error.message : 'Failed to delete skill')
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete skill')
    } finally {
      toast.dismiss(t)
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
  async (language: Omit<ILanguage, 'id'>, { rejectWithValue, dispatch }) => {
    const { toast } = await import('sonner')
    const tempId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const tempLanguage: ILanguage = { ...language, id: tempId }
    // Optimistic add
    dispatch(addLanguageOptimistic(tempLanguage))
    const t = toast.loading('Adding language...')
    try {
      const response = await fetch('/api/profile/languages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tempLanguage),
      })
      const data = await response.json()

      if (!response.ok) {
        dispatch(removeLanguageOptimistic(tempId))
        toast.error(data.error || 'Failed to add language')
        return rejectWithValue(data.error || 'Failed to add language')
      }

      toast.success('Language added')
      return data.language
    } catch (error) {
      dispatch(removeLanguageOptimistic(tempId))
      toast.error(error instanceof Error ? error.message : 'Failed to add language')
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add language')
    } finally {
      toast.dismiss(t)
    }
  }
)

export const updateLanguage = createAsyncThunk(
  'profile/updateLanguage',
  async ({ id, languageData }: { id: string; languageData: Partial<ILanguage> }, { rejectWithValue, dispatch, getState }) => {
    const { toast } = await import('sonner')
    const t = toast.loading('Updating language...')
    const prev = (getState() as any)?.profile?.profile?.languages?.find((l: ILanguage) => l.id === id)
    // Optimistic update
    dispatch(updateLanguageOptimistic({ id, changes: languageData }))
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
        if (prev) dispatch(updateLanguageOptimistic({ id, changes: prev }))
        toast.error(data.error || 'Failed to update language')
        return rejectWithValue(data.error || 'Failed to update language')
      }

      toast.success('Language updated')
      return data.language
    } catch (error) {
      if (prev) dispatch(updateLanguageOptimistic({ id, changes: prev }))
      toast.error(error instanceof Error ? error.message : 'Failed to update language')
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update language')
    } finally {
      toast.dismiss(t)
    }
  }
)

export const deleteLanguage = createAsyncThunk(
  'profile/deleteLanguage',
  async (languageId: string, { rejectWithValue, dispatch, getState }) => {
    const { toast } = await import('sonner')
    const t = toast.loading('Deleting language...')
    const prev = (getState() as any)?.profile?.profile?.languages?.find((l: ILanguage) => l.id === languageId)
    // Optimistic remove
    dispatch(removeLanguageOptimistic(languageId))
    try {
      const response = await fetch(`/api/profile/languages/${languageId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok) {
        if (prev) dispatch(addLanguageOptimistic(prev))
        toast.error(data.error || 'Failed to delete language')
        return rejectWithValue(data.error || 'Failed to delete language')
      }

      toast.success('Language deleted')
      return languageId
    } catch (error) {
      if (prev) dispatch(addLanguageOptimistic(prev))
      toast.error(error instanceof Error ? error.message : 'Failed to delete language')
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete language')
    } finally {
      toast.dismiss(t)
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
  async (education: Omit<IEducation, 'id'>, { rejectWithValue, dispatch }) => {
    const { toast } = await import('sonner')
    const tempId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const tempEducation: IEducation = { ...education, id: tempId }
    // Optimistic add
    dispatch(addEducationOptimistic(tempEducation))
    const t = toast.loading('Adding education...')
    try {
      const response = await fetch('/api/profile/education', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tempEducation),
      })
      const data = await response.json()

      if (!response.ok) {
        dispatch(removeEducationOptimistic(tempId))
        toast.error(data.error || 'Failed to add education')
        return rejectWithValue(data.error || 'Failed to add education')
      }

      toast.success('Education added')
      return data.education
    } catch (error) {
      dispatch(removeEducationOptimistic(tempId))
      toast.error(error instanceof Error ? error.message : 'Failed to add education')
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add education')
    } finally {
      toast.dismiss(t)
    }
  }
)

export const updateEducation = createAsyncThunk(
  'profile/updateEducation',
  async ({ id, educationData }: { id: string; educationData: Partial<IEducation> }, { rejectWithValue, dispatch, getState }) => {
    const { toast } = await import('sonner')
    const t = toast.loading('Updating education...')
    const prev = (getState() as any)?.profile?.profile?.education?.find((e: IEducation) => e.id === id)
    // Optimistic update
    dispatch(updateEducationOptimistic({ id, changes: educationData }))
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
        if (prev) dispatch(updateEducationOptimistic({ id, changes: prev }))
        toast.error(data.error || 'Failed to update education')
        return rejectWithValue(data.error || 'Failed to update education')
      }

      toast.success('Education updated')
      return data.education
    } catch (error) {
      if (prev) dispatch(updateEducationOptimistic({ id, changes: prev }))
      toast.error(error instanceof Error ? error.message : 'Failed to update education')
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update education')
    } finally {
      toast.dismiss(t)
    }
  }
)

export const deleteEducation = createAsyncThunk(
  'profile/deleteEducation',
  async (educationId: string, { rejectWithValue, dispatch, getState }) => {
    const { toast } = await import('sonner')
    const t = toast.loading('Deleting education...')
    const prev = (getState() as any)?.profile?.profile?.education?.find((e: IEducation) => e.id === educationId)
    // Optimistic remove
    dispatch(removeEducationOptimistic(educationId))
    try {
      const response = await fetch(`/api/profile/education/${educationId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok) {
        if (prev) dispatch(addEducationOptimistic(prev))
        toast.error(data.error || 'Failed to delete education')
        return rejectWithValue(data.error || 'Failed to delete education')
      }

      toast.success('Education deleted')
      return educationId
    } catch (error) {
      if (prev) dispatch(addEducationOptimistic(prev))
      toast.error(error instanceof Error ? error.message : 'Failed to delete education')
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete education')
    } finally {
      toast.dismiss(t)
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
  async (workExperience: Omit<IWorkExperience, 'id'>, { rejectWithValue, dispatch }) => {
    const { toast } = await import('sonner')
    const tempId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const tempWork: IWorkExperience = { ...workExperience, id: tempId }
    // Optimistic add
    dispatch(addWorkExperienceOptimistic(tempWork))
    const t = toast.loading('Adding work experience...')
    try {
      const response = await fetch('/api/profile/work-experience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tempWork),
      })
      const data = await response.json()

      if (!response.ok) {
        dispatch(removeWorkExperienceOptimistic(tempId))
        toast.error(data.error || 'Failed to add work experience')
        return rejectWithValue(data.error || 'Failed to add work experience')
      }

      toast.success('Work experience added')
      return data.workExperience
    } catch (error) {
      dispatch(removeWorkExperienceOptimistic(tempId))
      toast.error(error instanceof Error ? error.message : 'Failed to add work experience')
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add work experience')
    } finally {
      toast.dismiss(t)
    }
  }
)

export const updateWorkExperience = createAsyncThunk(
  'profile/updateWorkExperience',
  async ({ id, workData }: { id: string; workData: Partial<IWorkExperience> }, { rejectWithValue, dispatch, getState }) => {
    const { toast } = await import('sonner')
    const t = toast.loading('Updating work experience...')
    const prev = (getState() as any)?.profile?.profile?.workExperiences?.find((w: IWorkExperience) => w.id === id)
    // Optimistic update
    dispatch(updateWorkExperienceOptimistic({ id, changes: workData }))
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
        if (prev) dispatch(updateWorkExperienceOptimistic({ id, changes: prev }))
        toast.error(data.error || 'Failed to update work experience')
        return rejectWithValue(data.error || 'Failed to update work experience')
      }

      toast.success('Work experience updated')
      return data.workExperience
    } catch (error) {
      if (prev) dispatch(updateWorkExperienceOptimistic({ id, changes: prev }))
      toast.error(error instanceof Error ? error.message : 'Failed to update work experience')
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update work experience')
    } finally {
      toast.dismiss(t)
    }
  }
)

export const deleteWorkExperience = createAsyncThunk(
  'profile/deleteWorkExperience',
  async (workExperienceId: string, { rejectWithValue, dispatch, getState }) => {
    const { toast } = await import('sonner')
    const t = toast.loading('Deleting work experience...')
    const prev = (getState() as any)?.profile?.profile?.workExperiences?.find((w: IWorkExperience) => w.id === workExperienceId)
    // Optimistic remove
    dispatch(removeWorkExperienceOptimistic(workExperienceId))
    try {
      const response = await fetch(`/api/profile/work-experience/${workExperienceId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok) {
        if (prev) dispatch(addWorkExperienceOptimistic(prev))
        toast.error(data.error || 'Failed to delete work experience')
        return rejectWithValue(data.error || 'Failed to delete work experience')
      }

      toast.success('Work experience deleted')
      return workExperienceId
    } catch (error) {
      if (prev) dispatch(addWorkExperienceOptimistic(prev))
      toast.error(error instanceof Error ? error.message : 'Failed to delete work experience')
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete work experience')
    } finally {
      toast.dismiss(t)
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
      state.hasFetched = false
    },
      resetProfileFetchState: (state) => {
    state.hasFetched = false
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
    updateSkillOptimistic: (state, action: PayloadAction<{ id: string; changes: Partial<ISkill> }>) => {
      if (state.profile?.skills) {
        const idx = state.profile.skills.findIndex(s => s.id === action.payload.id)
        if (idx !== -1) {
          state.profile.skills[idx] = { ...state.profile.skills[idx], ...action.payload.changes }
        } else {
          state.profile.skills.push({ id: action.payload.id, name: '', level: 'BEGINNER', ...action.payload.changes } as ISkill)
        }
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
    },
    updateLanguageOptimistic: (state, action: PayloadAction<{ id: string; changes: Partial<ILanguage> }>) => {
      if (state.profile?.languages) {
        const idx = state.profile.languages.findIndex(l => l.id === action.payload.id)
        if (idx !== -1) {
          state.profile.languages[idx] = { ...state.profile.languages[idx], ...action.payload.changes }
        } else {
          state.profile.languages.push({ id: action.payload.id, name: '', level: 'BASIC', ...action.payload.changes } as ILanguage)
        }
        state.isDirty = true
      }
    },
    // Optimistic updates for work experience
    addWorkExperienceOptimistic: (state, action: PayloadAction<IWorkExperience>) => {
      if (state.profile) {
        if (!state.profile.workExperiences) {
          state.profile.workExperiences = []
        }
        state.profile.workExperiences.push(action.payload)
        state.isDirty = true
      }
    },
    updateWorkExperienceOptimistic: (state, action: PayloadAction<{ id: string; changes: Partial<IWorkExperience> }>) => {
      if (state.profile?.workExperiences) {
        const idx = state.profile.workExperiences.findIndex(w => w.id === action.payload.id)
        if (idx !== -1) {
          state.profile.workExperiences[idx] = { ...state.profile.workExperiences[idx], ...action.payload.changes }
        } else {
          state.profile.workExperiences.push({ id: action.payload.id, company: '', positions: [], ...action.payload.changes } as IWorkExperience)
        }
        state.isDirty = true
      }
    },
    removeWorkExperienceOptimistic: (state, action: PayloadAction<string>) => {
      if (state.profile?.workExperiences) {
        state.profile.workExperiences = state.profile.workExperiences.filter(w => w.id !== action.payload)
        state.isDirty = true
      }
    },
    // Optimistic updates for education
    addEducationOptimistic: (state, action: PayloadAction<IEducation>) => {
      if (state.profile) {
        if (!state.profile.education) {
          state.profile.education = []
        }
        state.profile.education.push(action.payload)
        state.isDirty = true
      }
    },
    updateEducationOptimistic: (state, action: PayloadAction<{ id: string; changes: Partial<IEducation> }>) => {
      if (state.profile?.education) {
        const idx = state.profile.education.findIndex(e => e.id === action.payload.id)
        if (idx !== -1) {
          state.profile.education[idx] = { ...state.profile.education[idx], ...action.payload.changes }
        } else {
          state.profile.education.push({ id: action.payload.id, degree: '', institution: '', startDate: '', isCurrent: false, ...action.payload.changes } as IEducation)
        }
        state.isDirty = true
      }
    },
    removeEducationOptimistic: (state, action: PayloadAction<string>) => {
      if (state.profile?.education) {
        state.profile.education = state.profile.education.filter(e => e.id !== action.payload)
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
      state.isCreating = true
      state.error = null
    })
    builder.addCase(createProfile.fulfilled, (state, action) => {
      state.isCreating = false
      state.profile = action.payload
      state.isDirty = false
    })
    builder.addCase(createProfile.rejected, (state, action) => {
      state.isCreating = false
      state.error = action.payload as string
    })

    // Update profile
    builder.addCase(updateProfile.pending, (state) => {
      state.isUpdating = true
      state.error = null
    })
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.isUpdating = false
      state.profile = action.payload
      state.isDirty = false
    })
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.isUpdating = false
      state.error = action.payload as string
    })

    // Update personal details
    builder.addCase(updatePersonalDetails.pending, (state) => {
      state.isUpdating = true
      state.error = null
    })
    builder.addCase(updatePersonalDetails.fulfilled, (state, action) => {
      state.isUpdating = false
      state.profile = action.payload
      state.isDirty = false
    })
    builder.addCase(updatePersonalDetails.rejected, (state, action) => {
      state.isUpdating = false
      state.error = action.payload as string
    })

    // Skills
    builder.addCase(addSkill.fulfilled, (state, action) => {
      console.log('🎯 addSkill.fulfilled - Profile exists:', !!state.profile, 'Payload:', action.payload)
      if (state.profile) {
        if (!state.profile.skills) {
          state.profile.skills = []
        }
        // Upsert: replace existing or add new
        const existingIndex = state.profile.skills.findIndex(s => s.id === action.payload.id)
        if (existingIndex !== -1) {
          state.profile.skills[existingIndex] = action.payload
        } else {
          state.profile.skills.push(action.payload)
        }
        state.isDirty = true
        console.log('✅ Skill upserted to profile, new skills count:', state.profile.skills.length)
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
        // Upsert: replace existing or add new
        const existingIndex = state.profile.languages.findIndex(l => l.id === action.payload.id)
        if (existingIndex !== -1) {
          state.profile.languages[existingIndex] = action.payload
        } else {
          state.profile.languages.push(action.payload)
        }
        state.isDirty = true
        console.log('✅ Language upserted to profile, new languages count:', state.profile.languages.length)
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
        if (!state.profile.education) {
          state.profile.education = []
        }
        // Upsert: replace existing or add new
        const existingIndex = state.profile.education.findIndex(e => e.id === action.payload.id)
        if (existingIndex !== -1) {
          state.profile.education[existingIndex] = action.payload
        } else {
          state.profile.education.push(action.payload)
        }
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
        if (!state.profile.workExperiences) {
          state.profile.workExperiences = []
        }
        // Upsert: replace existing or add new
        const existingIndex = state.profile.workExperiences.findIndex(w => w.id === action.payload.id)
        if (existingIndex !== -1) {
          state.profile.workExperiences[existingIndex] = action.payload
        } else {
          state.profile.workExperiences.push(action.payload)
        }
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
      state.isUploadingImage = true
      state.error = null
    })
    builder.addCase(uploadProfileImage.fulfilled, (state, action) => {
      state.isUploadingImage = false
      if (state.profile && action.payload && action.payload.imageUrl) {
        // Only update the specific image field - no full profile refresh
        const uploadType = action.meta.arg.type
        if (uploadType === 'profile') {
          state.profile.profileImage = action.payload.imageUrl
        } else if (uploadType === 'cover') {
          state.profile.coverImage = action.payload.imageUrl
        }
        
        // Update timestamps for optimistic UI
        state.profile.updatedAt = new Date().toISOString()
        state.isDirty = true
        state.error = null
      }
    })
    builder.addCase(uploadProfileImage.rejected, (state, action) => {
      state.isUploadingImage = false
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
  updateSkillOptimistic,
  removeLanguageOptimistic,
  addLanguageOptimistic,
  updateLanguageOptimistic,
  addWorkExperienceOptimistic,
  updateWorkExperienceOptimistic,
  removeWorkExperienceOptimistic,
  addEducationOptimistic,
  updateEducationOptimistic,
  removeEducationOptimistic,
  resetProfileFetchState
} = profileSlice.actions

// Selectors
export const selectProfile = (state: { profile: ProfileState }) => state.profile.profile
export const selectIsLoading = (state: { profile: ProfileState }) => state.profile.isLoading
export const selectIsUpdating = (state: { profile: ProfileState }) => state.profile.isUpdating
export const selectIsCreating = (state: { profile: ProfileState }) => state.profile.isCreating
export const selectIsUploadingImage = (state: { profile: ProfileState }) => state.profile.isUploadingImage
export const selectError = (state: { profile: ProfileState }) => state.profile.error
export const selectIsDirty = (state: { profile: ProfileState }) => state.profile.isDirty
export const selectHasFetched = (state: { profile: ProfileState }) => state.profile.hasFetched

export default profileSlice.reducer