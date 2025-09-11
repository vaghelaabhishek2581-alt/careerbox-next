import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import userReducer from './slices/userSlice'
import dashboardReducer from './slices/dashboardSlice'
import organizationReducer from './slices/organizationSlice'
import businessReducer from './slices/businessSlice'
import profileReducer from './slices/profileSlice'
import sessionReducer from './slices/sessionSlice'


export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    dashboard: dashboardReducer,
    organization: organizationReducer,
    business: businessReducer,
    profile: profileReducer,
    session: sessionReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
