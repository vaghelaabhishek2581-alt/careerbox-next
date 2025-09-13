# CareerBox API Documentation

## Overview

The CareerBox API is designed to work seamlessly with both web applications (using NextAuth) and React Native applications (using JWT authentication). All API routes support JWT authentication for cross-platform compatibility.

## Authentication

### JWT Authentication (Recommended for React Native)

All API routes support JWT authentication via the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Authentication Flow

1. **Login/Register** → Get access token and refresh token
2. **Use access token** for API requests
3. **Refresh token** when access token expires
4. **Logout** to revoke tokens

## Base URL

```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

## Authentication Endpoints

### POST /auth/jwt/login

Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "user",
      "activeRole": "student",
      "needsOnboarding": false,
      "needsRoleSelection": false,
      "provider": "credentials"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token",
      "tokenId": "token_id"
    }
  }
}
```

### POST /auth/jwt/register

Register a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "role": "student"
}
```

**Response:** Same as login response.

### POST /auth/jwt/refresh

Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "new_jwt_access_token",
      "refreshToken": "new_jwt_refresh_token",
      "tokenId": "new_token_id"
    }
  }
}
```

### POST /auth/jwt/logout

Logout and revoke refresh token.

**Request:**
```json
{
  "tokenId": "token_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## User Profile Endpoints

### GET /user/profile/jwt

Get current user's profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user",
    "activeRole": "student",
    "profileImage": "image_url",
    "personalDetails": {
      "firstName": "John",
      "lastName": "Doe",
      "professionalHeadline": "Student",
      "publicProfileId": "john_doe",
      "aboutMe": "Welcome to my profile!",
      "phone": "+1234567890"
    },
    "skills": [
      {
        "id": "skill_1",
        "name": "JavaScript",
        "level": "INTERMEDIATE"
      }
    ],
    "workExperiences": [],
    "education": [],
    "stats": {
      "completedCourses": 0,
      "skillsAssessed": 0,
      "careerGoals": 0,
      "networkSize": 0
    }
  }
}
```

### PATCH /user/profile/jwt

Update user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "personalDetails": {
    "firstName": "John",
    "lastName": "Doe",
    "aboutMe": "Updated bio"
  },
  "skills": [
    {
      "name": "React",
      "level": "ADVANCED"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

## Job Endpoints

### GET /jobs

Get list of jobs with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search query
- `location` (optional): Filter by location
- `salary_min` (optional): Minimum salary
- `salary_max` (optional): Maximum salary

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job_id",
        "title": "Frontend Developer",
        "company": "Tech Corp",
        "location": "Remote",
        "salary": "$50,000 - $70,000",
        "description": "Job description...",
        "requirements": ["React", "JavaScript"],
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

### GET /jobs/{jobId}

Get specific job details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "job_id",
    "title": "Frontend Developer",
    "company": "Tech Corp",
    "location": "Remote",
    "salary": "$50,000 - $70,000",
    "description": "Detailed job description...",
    "requirements": ["React", "JavaScript", "TypeScript"],
    "benefits": ["Health insurance", "Remote work"],
    "applicationDeadline": "2024-12-31T23:59:59Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### POST /jobs/{jobId}/apply

Apply to a job.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "coverLetter": "I am interested in this position...",
  "resume": "resume_file_id",
  "additionalInfo": "Any additional information"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully"
}
```

## Course Endpoints

### GET /courses

Get list of courses with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search query
- `category` (optional): Filter by category
- `institute` (optional): Filter by institute

**Response:**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "course_id",
        "title": "Web Development Bootcamp",
        "institute": "Tech Institute",
        "duration": "6 months",
        "fees": "$2,000",
        "description": "Comprehensive web development course...",
        "requirements": ["Basic programming knowledge"],
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

### GET /courses/{courseId}

Get specific course details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "course_id",
    "title": "Web Development Bootcamp",
    "institute": "Tech Institute",
    "duration": "6 months",
    "fees": "$2,000",
    "description": "Detailed course description...",
    "curriculum": ["HTML/CSS", "JavaScript", "React"],
    "instructor": "John Smith",
    "startDate": "2024-02-01T00:00:00Z",
    "endDate": "2024-08-01T00:00:00Z"
  }
}
```

## Search Endpoints

### POST /search

Universal search across all entities.

**Request:**
```json
{
  "query": "web development",
  "filters": {
    "type": ["jobs", "courses"],
    "location": "Remote",
    "category": "Technology"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": {
      "jobs": [
        {
          "id": "job_id",
          "title": "Web Developer",
          "company": "Tech Corp",
          "type": "job"
        }
      ],
      "courses": [
        {
          "id": "course_id",
          "title": "Web Development Course",
          "institute": "Tech Institute",
          "type": "course"
        }
      ]
    },
    "totalResults": 25
  }
}
```

## Notification Endpoints

### GET /notifications

Get user notifications.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `unread_only` (optional): Only unread notifications (default: false)

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notification_id",
        "title": "New Job Match",
        "message": "A new job matches your profile",
        "type": "job_match",
        "read": false,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "pages": 1
    }
  }
}
```

### PATCH /notifications/{notificationId}/read

Mark notification as read.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

## Admin Endpoints

### GET /admin/sessions

Get all active user sessions (Admin only).

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "tokenId": "token_id",
        "userId": "user_id",
        "email": "user@example.com",
        "createdAt": "2024-01-01T00:00:00Z",
        "expiresAt": "2024-01-08T00:00:00Z",
        "user": {
          "name": "John Doe",
          "role": "user",
          "activeRole": "student",
          "provider": "credentials"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

### POST /admin/sessions

Terminate a specific session (Admin only).

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Request:**
```json
{
  "tokenId": "token_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Session terminated successfully"
}
```

### DELETE /admin/sessions/{userId}

Terminate all sessions for a user (Admin only).

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "All sessions terminated for user@example.com"
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Common Error Codes

- `AUTH_REQUIRED`: Authentication required
- `INVALID_CREDENTIALS`: Invalid email or password
- `TOKEN_EXPIRED`: Access token expired
- `INSUFFICIENT_PERMISSIONS`: User doesn't have required permissions
- `USER_NOT_FOUND`: User not found
- `VALIDATION_ERROR`: Request validation failed
- `INTERNAL_ERROR`: Internal server error

## Rate Limiting

API requests are rate limited:
- **Authenticated users**: 1000 requests per hour
- **Unauthenticated users**: 100 requests per hour

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Dynamic Routes with JWT

For dynamic routes (like `/api/profile/[profileId]`), use the `withJWTAuthDynamic` wrapper:

```typescript
import { withJWTAuthDynamic } from '@/lib/middleware/jwt-auth'

async function handler(
  request: NextRequest,
  user: any,
  { params }: { params: { profileId: string } }
) {
  // Access params.profileId
  // user is the authenticated user
}

export const GET = withJWTAuthDynamic(handler, { requireAdmin: true })
```

## React Native Integration

See `lib/api/react-native-client.ts` for a complete React Native API client implementation.

### Example Usage

```typescript
import { api } from './lib/api/react-native-client'

// Login
const result = await api.login('user@example.com', 'password123')

// Get profile
const profile = await api.getProfile()

// Search jobs
const jobs = await api.search('web developer', { type: ['jobs'] })

// Apply to job
await api.applyToJob('job_id', { coverLetter: 'I am interested...' })
```

## Web Integration

For web applications using NextAuth, the same API endpoints work with session-based authentication. The JWT endpoints provide an alternative authentication method for enhanced security and cross-platform compatibility.
