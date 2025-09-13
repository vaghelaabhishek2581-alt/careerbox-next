# Redux Integration with API Client

This directory contains Redux slices that integrate with the centralized Axios API client, providing a robust state management solution for the CareerBox application.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Components    │───▶│  Redux Slices   │───▶│  API Client     │
│                 │    │                 │    │  (Axios)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI State      │    │  Global State   │    │  HTTP Requests  │
│   (Loading,     │    │  (Data, Cache,  │    │  (Retry, Auth,  │
│    Errors)      │    │   Pagination)   │    │   Headers)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Features

- **Centralized State Management**: All API data stored in Redux store
- **Automatic Loading States**: Built-in loading indicators for all operations
- **Error Handling**: Consistent error management across the application
- **Caching**: Automatic data caching and state persistence
- **Type Safety**: Full TypeScript support with proper typing
- **Optimistic Updates**: Immediate UI updates with rollback on failure
- **Pagination**: Built-in pagination state management

## Slices Overview

### Auth Slice (`authSlice.ts`)
Manages authentication state and user session.

**Actions:**
- `loginUser(credentials)` - User login
- `registerUser(userData)` - User registration
- `logoutUser()` - User logout
- `completeOnboarding(data)` - Complete user onboarding with profile creation
- `refreshToken()` - Refresh authentication token

**State:**
```typescript
{
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
```

### Profile Slice (`profileSlice.ts`)
Manages user profile data and updates.

**Actions:**
- `fetchProfile()` - Get current user profile
- `updateProfile(data)` - Update user profile
- `uploadProfileImage(file)` - Upload profile image
- `getProfileById(id)` - Get profile by ID

**State:**
```typescript
{
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  isDirty: boolean
}
```

### Job Slice (`jobSlice.ts`)
Manages job listings, applications, and job-related operations.

**Actions:**
- `fetchJobs(params)` - Get job listings
- `fetchJobById(id)` - Get specific job
- `createJob(data)` - Create new job
- `updateJob(id, data)` - Update job
- `deleteJob(id)` - Delete job
- `applyToJob(id, data)` - Apply to job
- `fetchApplications(jobId?)` - Get job applications

**State:**
```typescript
{
  jobs: Job[]
  currentJob: Job | null
  applications: JobApplication[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
  searchFilters: any
}
```

## Usage Examples

### Basic Component Setup

```typescript
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { loginUser } from '@/lib/redux/slices/authSlice'

export const LoginComponent = () => {
  const dispatch = useAppDispatch()
  const { isLoading, error, user } = useAppSelector((state) => state.auth)

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await dispatch(loginUser({ email, password })).unwrap()
      // Handle success
    } catch (error) {
      // Error is automatically stored in Redux state
    }
  }

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <button onClick={() => handleLogin('user@example.com', 'password')} disabled={isLoading}>
        {isLoading ? 'Signing In...' : 'Sign In'}
      </button>
    </div>
  )
}
```

### Onboarding with Profile Creation

```typescript
import { completeOnboarding } from '@/lib/redux/slices/authSlice'

export const OnboardingComponent = () => {
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector((state) => state.auth)

  const handleCompleteOnboarding = async (role: string) => {
    try {
      const result = await dispatch(completeOnboarding({
        userId: 'user123',
        role: role,
        userType: role === 'student' ? 'student' : 'professional',
        bio: 'Experienced developer...',
        skills: ['JavaScript', 'React', 'Node.js']
      })).unwrap()

      if (result) {
        // Redirect to dashboard
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Onboarding failed:', error)
    }
  }

  return (
    <button onClick={() => handleCompleteOnboarding('professional')} disabled={isLoading}>
      {isLoading ? 'Completing...' : 'Complete Onboarding'}
    </button>
  )
}
```

### Job Management

```typescript
import { fetchJobs, applyToJob } from '@/lib/redux/slices/jobSlice'

export const JobsComponent = () => {
  const dispatch = useAppDispatch()
  const { jobs, loading, error, pagination } = useAppSelector((state) => state.jobs)

  useEffect(() => {
    // Fetch jobs on component mount
    dispatch(fetchJobs({ page: 1, limit: 10 }))
  }, [dispatch])

  const handleApply = async (jobId: string) => {
    try {
      await dispatch(applyToJob({
        jobId,
        applicationData: { coverLetter: 'I am interested in this position.' }
      })).unwrap()
      
      alert('Application submitted successfully!')
    } catch (error) {
      alert('Failed to submit application')
    }
  }

  return (
    <div>
      {loading && <div>Loading jobs...</div>}
      {error && <div className="error">{error}</div>}
      
      {jobs.map(job => (
        <div key={job._id}>
          <h3>{job.title}</h3>
          <p>{job.company}</p>
          <button onClick={() => handleApply(job._id)}>Apply</button>
        </div>
      ))}
    </div>
  )
}
```

## Store Configuration

The Redux store is configured in `store.ts`:

```typescript
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import profileReducer from './slices/profileSlice'
import jobReducer from './slices/jobSlice'
// ... other reducers

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    jobs: jobReducer,
    // ... other reducers
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

## Hooks

Custom hooks are provided in `hooks.ts`:

```typescript
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './store'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
```

## Error Handling

All slices include comprehensive error handling:

1. **Automatic Error Storage**: Errors are automatically stored in Redux state
2. **Error Clearing**: Errors are cleared when new operations start
3. **User Feedback**: Components can display errors from Redux state
4. **Retry Logic**: Built into the API client layer

```typescript
// Error handling in components
const { error } = useAppSelector((state) => state.auth)

if (error) {
  return <div className="error-message">{error}</div>
}
```

## Loading States

Loading states are automatically managed:

```typescript
const { isLoading } = useAppSelector((state) => state.auth)

<button disabled={isLoading}>
  {isLoading ? 'Processing...' : 'Submit'}
</button>
```

## Best Practices

1. **Always use `.unwrap()`** with async thunks to get the actual result
2. **Handle errors in try-catch blocks** around dispatch calls
3. **Use loading states from Redux** instead of local component state
4. **Clear errors when starting new operations** using the clearError action
5. **Use selectors to access specific parts of state** for better performance
6. **Dispatch actions in useEffect** for data fetching on component mount

## Migration from Direct API Calls

### Before (Direct API calls)
```typescript
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')

const handleLogin = async () => {
  setLoading(true)
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await response.json()
    // Handle success
  } catch (error) {
    setError('Login failed')
  } finally {
    setLoading(false)
  }
}
```

### After (Redux actions)
```typescript
const dispatch = useAppDispatch()
const { isLoading, error } = useAppSelector((state) => state.auth)

const handleLogin = async () => {
  try {
    const result = await dispatch(loginUser({ email, password })).unwrap()
    // Handle success
  } catch (error) {
    // Error is automatically handled by Redux
  }
}
```

## Benefits

1. **Centralized State**: All application state in one place
2. **Predictable Updates**: State changes follow strict patterns
3. **Time Travel Debugging**: Redux DevTools for debugging
4. **Performance**: Optimized re-renders with selectors
5. **Consistency**: Same patterns across all components
6. **Testing**: Easy to test with predictable state changes
7. **Caching**: Automatic data caching and persistence
8. **Error Recovery**: Built-in error handling and recovery

## File Structure

```
lib/redux/
├── store.ts              # Store configuration
├── hooks.ts              # Typed Redux hooks
├── slices/
│   ├── authSlice.ts      # Authentication state
│   ├── profileSlice.ts   # User profile state
│   ├── jobSlice.ts       # Job management state
│   ├── courseSlice.ts    # Course management state
│   └── ...               # Other slices
├── examples.ts           # Usage examples
└── README.md            # This documentation
```
