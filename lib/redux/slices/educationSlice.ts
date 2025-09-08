// store/slices/educationSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import {
  Education,
  EducationState
} from '@/lib/types/profile.unified'

const initialState: EducationState = {
  education: [],
  isLoading: false,
  error: null
}

// Async thunks
export const fetchEducation = createAsyncThunk(
  'education/fetchEducation',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.education || []
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const addEducation = createAsyncThunk(
  'education/addEducation',
  async (
    educationData: Omit<Education, 'id'>,
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { education: EducationState }
      const currentEducation = state.education.education

      const newEducation: Education = {
        ...educationData,
        id: Date.now().toString()
      }

      const updatedEducation = [...currentEducation, newEducation]

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
  'education/updateEducation',
  async (
    { id, educationData }: { id: string; educationData: Partial<Education> },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { education: EducationState }
      const currentEducation = state.education.education

      const updatedEducation = currentEducation.map(edu =>
        edu.id === id ? { ...edu, ...educationData } : edu
      )

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
  'education/deleteEducation',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { education: EducationState }
      const currentEducation = state.education.education

      const updatedEducation = currentEducation.filter(edu => edu.id !== id)

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ education: updatedEducation })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return id
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

const educationSlice = createSlice({
  name: 'education',
  initialState,
  reducers: {
    setEducation: (state, action: PayloadAction<Education[]>) => {
      state.education = action.payload
    },
    clearError: state => {
      state.error = null
    }
  },
  extraReducers: builder => {
    builder
      // Fetch education
      .addCase(fetchEducation.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchEducation.fulfilled, (state, action) => {
        state.isLoading = false
        state.education = action.payload
        state.error = null
      })
      .addCase(fetchEducation.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch education'
      })

      // Add education
      .addCase(addEducation.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addEducation.fulfilled, (state, action) => {
        state.isLoading = false
        state.education.push(action.payload)
        state.error = null
      })
      .addCase(addEducation.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to add education'
      })

      // Update education
      .addCase(updateEducation.fulfilled, (state, action) => {
        const { id, educationData } = action.payload
        const educationIndex = state.education.findIndex(edu => edu.id === id)
        if (educationIndex !== -1) {
          state.education[educationIndex] = {
            ...state.education[educationIndex],
            ...educationData
          }
        }
      })

      // Delete education
      .addCase(deleteEducation.fulfilled, (state, action) => {
        state.education = state.education.filter(
          edu => edu.id !== action.payload
        )
      })
  }
})

export const { setEducation, clearError } = educationSlice.actions
export default educationSlice.reducer
