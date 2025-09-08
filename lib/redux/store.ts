import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import userReducer from './slices/userSlice'
import dashboardReducer from './slices/dashboardSlice'
import organizationReducer from './slices/organizationSlice'
import businessReducer from './slices/businessSlice'
import profileReducer from './slices/profileSlice'
import sessionReducer from './slices/sessionSlice'
import workExperienceReducer from './slices/workExperienceSlice'
import educationReducer from './slices/educationSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    dashboard: dashboardReducer,
    organization: organizationReducer,
    business: businessReducer,
    profile: profileReducer,
    workExperience: workExperienceReducer,
    education: educationReducer,
    session: sessionReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
