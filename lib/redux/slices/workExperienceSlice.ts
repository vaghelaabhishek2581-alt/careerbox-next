// store/slices/workExperienceSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface WorkPosition {
  id: string
  title: string
  startDate: Date
  endDate?: Date | null
  isCurrent: boolean
  description?: string
  skills?: string[]
}

export interface WorkExperience {
  id: string
  company: string
  location: string
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Freelance'
  positions: WorkPosition[]
}

interface WorkExperienceState {
  workExperiences: WorkExperience[]
  isLoading: boolean
  error: string | null
}

const initialState: WorkExperienceState = {
  workExperiences: [],
  isLoading: false,
  error: null
}

// Async thunks
export const fetchWorkExperiences = createAsyncThunk(
  'workExperience/fetchWorkExperiences',
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
      return data.workExperiences || []
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const addWorkExperience = createAsyncThunk(
  'workExperience/addWorkExperience',
  async (
    workData: Omit<WorkExperience, 'id'>,
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { workExperience: WorkExperienceState }
      const currentExperiences = state.workExperience.workExperiences

      const newExperience: WorkExperience = {
        ...workData,
        id: Date.now().toString()
      }

      const updatedExperiences = [...currentExperiences, newExperience]

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ workExperiences: updatedExperiences })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return newExperience
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const updateWorkExperience = createAsyncThunk(
  'workExperience/updateWorkExperience',
  async (
    { id, workData }: { id: string; workData: Partial<WorkExperience> },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { workExperience: WorkExperienceState }
      const currentExperiences = state.workExperience.workExperiences

      const updatedExperiences = currentExperiences.map(exp =>
        exp.id === id ? { ...exp, ...workData } : exp
      )

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ workExperiences: updatedExperiences })
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
  'workExperience/deleteWorkExperience',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { workExperience: WorkExperienceState }
      const currentExperiences = state.workExperience.workExperiences

      const updatedExperiences = currentExperiences.filter(exp => exp.id !== id)

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ workExperiences: updatedExperiences })
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

export const addPositionToExperience = createAsyncThunk(
  'workExperience/addPositionToExperience',
  async (
    {
      experienceId,
      positionData
    }: { experienceId: string; positionData: Omit<WorkPosition, 'id'> },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { workExperience: WorkExperienceState }
      const currentExperiences = state.workExperience.workExperiences

      const newPosition: WorkPosition = {
        ...positionData,
        id: Date.now().toString()
      }

      const updatedExperiences = currentExperiences.map(exp => {
        if (exp.id === experienceId) {
          return {
            ...exp,
            positions: [...exp.positions, newPosition]
          }
        }
        return exp
      })

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ workExperiences: updatedExperiences })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return { experienceId, position: newPosition }
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const updatePositionInExperience = createAsyncThunk(
  'workExperience/updatePositionInExperience',
  async (
    {
      experienceId,
      positionId,
      positionData
    }: {
      experienceId: string
      positionId: string
      positionData: Partial<WorkPosition>
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { workExperience: WorkExperienceState }
      const currentExperiences = state.workExperience.workExperiences

      const updatedExperiences = currentExperiences.map(exp => {
        if (exp.id === experienceId) {
          return {
            ...exp,
            positions: exp.positions.map(pos =>
              pos.id === positionId ? { ...pos, ...positionData } : pos
            )
          }
        }
        return exp
      })

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ workExperiences: updatedExperiences })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return { experienceId, positionId, positionData }
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const deletePositionFromExperience = createAsyncThunk(
  'workExperience/deletePositionFromExperience',
  async (
    { experienceId, positionId }: { experienceId: string; positionId: string },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { workExperience: WorkExperienceState }
      const currentExperiences = state.workExperience.workExperiences

      const updatedExperiences = currentExperiences.map(exp => {
        if (exp.id === experienceId) {
          return {
            ...exp,
            positions: exp.positions.filter(pos => pos.id !== positionId)
          }
        }
        return exp
      })

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ workExperiences: updatedExperiences })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return { experienceId, positionId }
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

const workExperienceSlice = createSlice({
  name: 'workExperience',
  initialState,
  reducers: {
    setWorkExperiences: (state, action: PayloadAction<WorkExperience[]>) => {
      state.workExperiences = action.payload
    },
    clearError: state => {
      state.error = null
    }
  },
  extraReducers: builder => {
    builder
      // Fetch work experiences
      .addCase(fetchWorkExperiences.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchWorkExperiences.fulfilled, (state, action) => {
        state.isLoading = false
        state.workExperiences = action.payload
        state.error = null
      })
      .addCase(fetchWorkExperiences.rejected, (state, action) => {
        state.isLoading = false
        state.error =
          (action.payload as string) || 'Failed to fetch work experiences'
      })

      // Add work experience
      .addCase(addWorkExperience.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addWorkExperience.fulfilled, (state, action) => {
        state.isLoading = false
        state.workExperiences.push(action.payload)
        state.error = null
      })
      .addCase(addWorkExperience.rejected, (state, action) => {
        state.isLoading = false
        state.error =
          (action.payload as string) || 'Failed to add work experience'
      })

      // Update work experience
      .addCase(updateWorkExperience.fulfilled, (state, action) => {
        const { id, workData } = action.payload
        const experienceIndex = state.workExperiences.findIndex(
          exp => exp.id === id
        )
        if (experienceIndex !== -1) {
          state.workExperiences[experienceIndex] = {
            ...state.workExperiences[experienceIndex],
            ...workData
          }
        }
      })

      // Delete work experience
      .addCase(deleteWorkExperience.fulfilled, (state, action) => {
        state.workExperiences = state.workExperiences.filter(
          exp => exp.id !== action.payload
        )
      })

      // Add position to experience
      .addCase(addPositionToExperience.fulfilled, (state, action) => {
        const { experienceId, position } = action.payload
        const experienceIndex = state.workExperiences.findIndex(
          exp => exp.id === experienceId
        )
        if (experienceIndex !== -1) {
          state.workExperiences[experienceIndex].positions.push(position)
        }
      })

      // Update position in experience
      .addCase(updatePositionInExperience.fulfilled, (state, action) => {
        const { experienceId, positionId, positionData } = action.payload
        const experienceIndex = state.workExperiences.findIndex(
          exp => exp.id === experienceId
        )
        if (experienceIndex !== -1) {
          const positionIndex = state.workExperiences[
            experienceIndex
          ].positions.findIndex(pos => pos.id === positionId)
          if (positionIndex !== -1) {
            state.workExperiences[experienceIndex].positions[positionIndex] = {
              ...state.workExperiences[experienceIndex].positions[
                positionIndex
              ],
              ...positionData
            }
          }
        }
      })

      // Delete position from experience
      .addCase(deletePositionFromExperience.fulfilled, (state, action) => {
        const { experienceId, positionId } = action.payload
        const experienceIndex = state.workExperiences.findIndex(
          exp => exp.id === experienceId
        )
        if (experienceIndex !== -1) {
          state.workExperiences[experienceIndex].positions =
            state.workExperiences[experienceIndex].positions.filter(
              pos => pos.id !== positionId
            )
        }
      })
  }
})

export const { setWorkExperiences, clearError } = workExperienceSlice.actions
export default workExperienceSlice.reducer
