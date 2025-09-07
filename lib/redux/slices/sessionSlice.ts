import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface SessionUser {
  id: string
  email: string
  name?: string
  role?: string
  lastActive: string
  socketId: string
}

interface SessionState {
  activeSessions: SessionUser[]
  isConnected: boolean
  error: string | null
}

const initialState: SessionState = {
  activeSessions: [],
  isConnected: false,
  error: null
}

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setActiveSessions: (state, action: PayloadAction<SessionUser[]>) => {
      state.activeSessions = action.payload
    },
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    }
  }
})

export const { setActiveSessions, setConnectionStatus, setError } =
  sessionSlice.actions
export default sessionSlice.reducer
