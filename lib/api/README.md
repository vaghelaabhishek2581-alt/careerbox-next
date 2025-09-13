# API Client Documentation

This directory contains a centralized API client built with Axios that provides robust, retry-enabled HTTP communication between the frontend and backend.

## Features

- **Automatic Retry**: Built-in retry logic with exponential backoff for failed requests
- **Authentication**: Automatic session-based authentication headers
- **Error Handling**: Consistent error formatting and handling
- **Type Safety**: Full TypeScript support with proper typing
- **File Upload**: Built-in file upload capabilities
- **Health Checks**: System health monitoring
- **CSRF Protection**: Automatic CSRF token handling

## Files

- `client.ts` - Main API client with Axios configuration
- `services.ts` - Organized API service classes for different domains
- `onboarding.ts` - Specialized onboarding API with profile creation
- `examples.ts` - Migration examples from fetch to API client

## Quick Start

### Basic Usage

```typescript
import { API } from '@/lib/api/services'

// Get user profile
const profile = await API.profile.getProfile()

// Search for jobs
const jobs = await API.jobs.getJobs(1, 10, { location: 'Remote' })

// Upload a file
const uploadResult = await API.profile.uploadProfileImage(file)
```

### Onboarding with Profile Creation

```typescript
import { OnboardingAPI } from '@/lib/api/onboarding'

// Complete onboarding in one call (includes profile creation)
const result = await OnboardingAPI.completeOnboarding({
  userId: 'user123',
  role: 'professional',
  userType: 'professional',
  bio: 'Experienced developer...',
  skills: ['JavaScript', 'React', 'Node.js'],
  interests: ['Web Development', 'AI']
})
```

## API Services

### Authentication (`API.auth`)
- `login(email, password)` - User login
- `register(name, email, password)` - User registration
- `logout()` - User logout
- `verifyEmail(token)` - Email verification
- `forgotPassword(email)` - Password reset request
- `resetPassword(token, password)` - Password reset

### Profile (`API.profile`)
- `getProfile()` - Get current user profile
- `updateProfile(data)` - Update user profile
- `uploadProfileImage(file)` - Upload profile image
- `getProfileById(profileId)` - Get profile by ID

### Jobs (`API.jobs`)
- `getJobs(page, limit, filters)` - Get job listings
- `getJob(jobId)` - Get specific job
- `createJob(data)` - Create new job
- `updateJob(jobId, data)` - Update job
- `deleteJob(jobId)` - Delete job
- `applyToJob(jobId, applicationData)` - Apply to job
- `getApplications(jobId?)` - Get job applications

### Courses (`API.courses`)
- `getCourses(page, limit, filters)` - Get course listings
- `getCourse(courseId)` - Get specific course
- `createCourse(data)` - Create new course
- `updateCourse(courseId, data)` - Update course
- `deleteCourse(courseId)` - Delete course
- `enrollInCourse(courseId)` - Enroll in course
- `getEnrollments()` - Get user enrollments

### Search (`API.search`)
- `search(query, filters)` - Universal search
- `getSuggestions(query)` - Get search suggestions

### Notifications (`API.notifications`)
- `getNotifications(page, limit)` - Get user notifications
- `markAsRead(notificationId)` - Mark notification as read
- `markAllAsRead()` - Mark all notifications as read
- `updatePreferences(preferences)` - Update notification preferences

### Payment (`API.payment`)
- `createOrder(planType, billingCycle)` - Create payment order
- `verifyPayment(paymentData)` - Verify payment
- `getSubscriptions()` - Get user subscriptions
- `cancelSubscription(subscriptionId)` - Cancel subscription

### Admin (`API.admin`)
- `getSystemHealth()` - Get system health status
- `getPlatformStats()` - Get platform statistics
- `getSessions(page, limit)` - Get active sessions
- `terminateSession(tokenId)` - Terminate specific session
- `terminateAllUserSessions(userId)` - Terminate all user sessions
- `getUsers(page, limit, filters)` - Get user list
- `updateUser(userId, data)` - Update user
- `deleteUser(userId)` - Delete user

## Configuration

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Retry Configuration

The API client automatically retries failed requests with the following configuration:

- **Retries**: 3 attempts
- **Delay**: Exponential backoff (1s, 2s, 4s)
- **Conditions**: Network errors, 5xx status codes, timeouts

### Authentication

The client automatically includes authentication headers:

- `X-User-ID`: Current user ID from session
- `X-User-Email`: Current user email from session
- `X-User-Role`: Current user role from session
- `X-CSRF-Token`: CSRF protection token

## Error Handling

All API methods return a consistent response format:

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  code?: string
  timestamp: string
}
```

### Success Response
```typescript
{
  success: true,
  data: { /* response data */ },
  message: "Operation successful",
  timestamp: "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```typescript
{
  success: false,
  error: "User not found",
  code: "USER_NOT_FOUND",
  timestamp: "2024-01-01T00:00:00.000Z"
}
```

## Migration from Fetch

### Before (using fetch)
```typescript
const response = await fetch('/api/jobs', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})

if (!response.ok) {
  throw new Error('Request failed')
}

const data = await response.json()
```

### After (using API client)
```typescript
const response = await API.jobs.getJobs()

if (!response.success) {
  throw new Error(response.error)
}

const data = response.data
```

## Benefits

1. **Reliability**: Automatic retry on network failures
2. **Consistency**: Standardized error handling and response format
3. **Security**: Automatic authentication and CSRF protection
4. **Developer Experience**: Type safety and IntelliSense support
5. **Maintainability**: Centralized configuration and logging
6. **Performance**: Optimized request handling and caching

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Ensure user is logged in and session is valid
2. **Network Timeouts**: Check network connectivity and server status
3. **CSRF Errors**: Verify CSRF token is properly configured
4. **Retry Failures**: Check server logs for underlying issues

### Debug Mode

Enable debug logging by setting the environment variable:
```env
NODE_ENV=development
```

This will log retry attempts and request details to the console.

## Best Practices

1. **Always check response.success** before accessing response.data
2. **Handle errors gracefully** with proper user feedback
3. **Use appropriate API methods** for different operations
4. **Leverage TypeScript** for better development experience
5. **Monitor retry patterns** to identify systemic issues
