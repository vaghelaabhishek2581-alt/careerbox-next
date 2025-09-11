import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import userReducer from './slices/userSlice'
import dashboardReducer from './slices/dashboardSlice'
import organizationReducer from './slices/organizationSlice'
import businessReducer from './slices/businessSlice'
import profileReducer from './slices/profileSlice'
import sessionReducer from './slices/sessionSlice'
import leadReducer from './slices/leadSlice'
import jobReducer from './slices/jobSlice'
import courseReducer from './slices/courseSlice'
import examReducer from './slices/examSlice'
import subscriptionReducer from './slices/subscriptionSlice'
import instituteReducer from './slices/instituteSlice'
import applicationReducer from './slices/applicationSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    dashboard: dashboardReducer,
    organization: organizationReducer,
    business: businessReducer,
    profile: profileReducer,
    session: sessionReducer,
    leads: leadReducer,
    jobs: jobReducer,
    courses: courseReducer,
    exams: examReducer,
    subscription: subscriptionReducer,
    institute: instituteReducer,
    applications: applicationReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
