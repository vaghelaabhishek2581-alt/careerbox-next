import apiClient from './client'
import { ApiResponse } from './client'

// Auth API
export class AuthAPI {
  static async login(email: string, password: string): Promise<ApiResponse<any>> {
    return apiClient.post('/api/auth/login', { email, password })
  }

  static async register(name: string, email: string, password: string, phone?: string): Promise<ApiResponse<any>> {
    return apiClient.post('/api/auth/register', { name, email, password, phone })
  }

  static async logout(): Promise<ApiResponse<any>> {
    return apiClient.post('/api/auth/logout')
  }

  static async verifyEmail(token: string): Promise<ApiResponse<any>> {
    return apiClient.post('/api/auth/verify-email', { token })
  }

  static async resendVerification(): Promise<ApiResponse<any>> {
    return apiClient.post('/api/auth/resend-verification')
  }

  static async forgotPassword(email: string): Promise<ApiResponse<any>> {
    return apiClient.post('/api/auth/forgot-password', { email })
  }

  static async resetPassword(token: string, password: string): Promise<ApiResponse<any>> {
    return apiClient.post('/api/auth/reset-password', { token, password })
  }

  static async verifyResetToken(token: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/auth/reset-password?token=${token}`)
  }
}

// User Profile API
export class ProfileAPI {
  static async getProfile(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/user/profile')
  }

  static async updateProfile(data: any): Promise<ApiResponse<any>> {
    return apiClient.patch('/api/user/profile', data)
  }

  static async uploadProfileImage(file: File): Promise<ApiResponse<any>> {
    return apiClient.uploadFile('/api/user/profile/image', file)
  }

  static async getProfileById(profileId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/profile/${profileId}`)
  }
}

// User API
export class UserAPI {
  static async switchRole(activeRole: string): Promise<ApiResponse<any>> {
    return apiClient.post('/api/user/switch-role', { activeRole })
  }

  static async getCurrentUser(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/user/me')
  }

  static async updatePreferences(preferences: any): Promise<ApiResponse<any>> {
    return apiClient.patch('/api/user/preferences', preferences)
  }
}

// Jobs API
export class JobsAPI {
  static async getJobs(page: number = 1, limit: number = 10, filters?: any): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    })
    return apiClient.get(`/api/jobs?${params}`)
  }

  static async getJob(jobId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/jobs/${jobId}`)
  }

  static async createJob(data: any): Promise<ApiResponse<any>> {
    return apiClient.post('/api/jobs', data)
  }

  static async updateJob(jobId: string, data: any): Promise<ApiResponse<any>> {
    return apiClient.patch(`/api/jobs/${jobId}`, data)
  }

  static async deleteJob(jobId: string): Promise<ApiResponse<any>> {
    return apiClient.delete(`/api/jobs/${jobId}`)
  }

  static async applyToJob(jobId: string, applicationData: any): Promise<ApiResponse<any>> {
    return apiClient.post(`/api/jobs/${jobId}/apply`, applicationData)
  }

  static async getApplications(jobId?: string): Promise<ApiResponse<any>> {
    const url = jobId ? `/api/jobs/${jobId}/applications` : '/api/user/applications'
    return apiClient.get(url)
  }
}

// Courses API
export class CoursesAPI {
  static async getCourses(page: number = 1, limit: number = 10, filters?: any): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    
    // Only add filters that have actual values (not undefined/null)
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })
    }
    
    return apiClient.get(`/api/courses?${params}`)
  }

  static async getCourse(courseId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/courses/${courseId}`)
  }

  static async createCourse(data: any): Promise<ApiResponse<any>> {
    return apiClient.post('/api/courses', data)
  }

  static async updateCourse(courseId: string, data: any): Promise<ApiResponse<any>> {
    return apiClient.patch(`/api/courses/${courseId}`, data)
  }

  static async deleteCourse(courseId: string): Promise<ApiResponse<any>> {
    return apiClient.delete(`/api/courses/${courseId}`)
  }

  static async enrollInCourse(courseId: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/api/courses/${courseId}/enroll`)
  }

  static async getEnrollments(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/user/courses')
  }
}

// Institutes API
export class InstitutesAPI {
  static async getInstitutes(page: number = 1, limit: number = 10, filters?: any): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    })
    return apiClient.get(`/api/institutes?${params}`)
  }

  static async getInstitute(instituteId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/institutes/${instituteId}`)
  }

  static async createInstitute(data: any): Promise<ApiResponse<any>> {
    return apiClient.post('/api/institutes', data)
  }

  static async updateInstitute(instituteId: string, data: any): Promise<ApiResponse<any>> {
    return apiClient.patch(`/api/institutes/${instituteId}`, data)
  }

  static async deleteInstitute(instituteId: string): Promise<ApiResponse<any>> {
    return apiClient.delete(`/api/institutes/${instituteId}`)
  }

  // Get all institutes belonging to the current user
  static async getUserInstitutes(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/institutes/user')
  }

  // Select an institute as the active one
  static async selectInstitute(instituteId: string): Promise<ApiResponse<any>> {
    return apiClient.post('/api/institutes/user', { instituteId })
  }

  // Get the active institute for the current user
  static async getActiveInstitute(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/institutes/active')
  }
}

// Businesses API
export class BusinessesAPI {
  static async getBusinesses(page: number = 1, limit: number = 10, filters?: any): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    })
    return apiClient.get(`/api/businesses?${params}`)
  }

  static async getBusiness(businessId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/businesses/${businessId}`)
  }

  static async createBusiness(data: any): Promise<ApiResponse<any>> {
    return apiClient.post('/api/businesses', data)
  }

  static async updateBusiness(businessId: string, data: any): Promise<ApiResponse<any>> {
    return apiClient.patch(`/api/businesses/${businessId}`, data)
  }

  static async deleteBusiness(businessId: string): Promise<ApiResponse<any>> {
    return apiClient.delete(`/api/businesses/${businessId}`)
  }
}

// Search API
export class SearchAPI {
  static async search(query: string, filters?: any): Promise<ApiResponse<any>> {
    return apiClient.post('/api/search', { query, filters })
  }

  static async getSuggestions(query: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/search/suggestions?q=${encodeURIComponent(query)}`)
  }
}

// Notifications API
export class NotificationsAPI {
  static async getNotifications(page: number = 1, limit: number = 20): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/notifications?page=${page}&limit=${limit}`)
  }

  static async markAsRead(notificationId: string): Promise<ApiResponse<any>> {
    return apiClient.patch(`/api/notifications/${notificationId}/read`)
  }

  static async markAllAsRead(): Promise<ApiResponse<any>> {
    return apiClient.patch('/api/notifications/read-all')
  }

  static async updatePreferences(preferences: any): Promise<ApiResponse<any>> {
    return apiClient.patch('/api/notifications/preferences', preferences)
  }
}

// Payment API
export class PaymentAPI {
  static async createOrder(planType: string, billingCycle: string): Promise<ApiResponse<any>> {
    return apiClient.post('/api/payment/create-order', { planType, billingCycle })
  }

  static async verifyPayment(paymentData: any): Promise<ApiResponse<any>> {
    return apiClient.post('/api/payment/verify', paymentData)
  }

  static async getSubscriptions(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/subscriptions')
  }

  static async cancelSubscription(subscriptionId: string): Promise<ApiResponse<any>> {
    return apiClient.delete(`/api/subscriptions/${subscriptionId}`)
  }
}

// Admin API
export class AdminAPI {
  static async getSystemHealth(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/admin/system-health')
  }

  static async getPlatformStats(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/admin/platform-stats')
  }

  static async getSessions(page: number = 1, limit: number = 20): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/admin/sessions?page=${page}&limit=${limit}`)
  }

  static async terminateSession(tokenId: string): Promise<ApiResponse<any>> {
    return apiClient.post('/api/admin/sessions', { tokenId })
  }

  static async terminateAllUserSessions(userId: string): Promise<ApiResponse<any>> {
    return apiClient.delete(`/api/admin/sessions/${userId}`)
  }

  static async getUsers(page: number = 1, limit: number = 20, filters?: any): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    })
    return apiClient.get(`/api/admin/users?${params}`)
  }

  static async updateUser(userId: string, data: any): Promise<ApiResponse<any>> {
    return apiClient.patch(`/api/admin/users/${userId}`, data)
  }

  static async deleteUser(userId: string): Promise<ApiResponse<any>> {
    return apiClient.delete(`/api/admin/users/${userId}`)
  }
}

// Activity Logs API
export class ActivityAPI {
  static async getActivities(page: number = 1, limit: number = 10, filters?: any): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    })
    return apiClient.get(`/api/activities?${params}`)
  }

  static async logActivity(activity: any): Promise<ApiResponse<any>> {
    return apiClient.post('/api/activities', activity)
  }
}

// Applications API
export class ApplicationsAPI {
  static async getApplications(page: number = 1, limit: number = 10, filters?: any): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    })
    return apiClient.get(`/api/applications?${params}`)
  }

  static async getApplication(applicationId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/applications/${applicationId}`)
  }

  static async createApplication(applicationData: any): Promise<ApiResponse<any>> {
    return apiClient.post('/api/applications', applicationData)
  }

  static async updateApplication(applicationId: string, applicationData: any): Promise<ApiResponse<any>> {
    return apiClient.patch(`/api/applications/${applicationId}`, applicationData)
  }

  static async deleteApplication(applicationId: string): Promise<ApiResponse<any>> {
    return apiClient.delete(`/api/applications/${applicationId}`)
  }
}

// Exams API
export class ExamsAPI {
  static async getExams(page: number = 1, limit: number = 10, filters?: any): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    })
    return apiClient.get(`/api/exams?${params}`)
  }
}

  // Export all APIs
export const API = {
  auth: AuthAPI,
  profile: ProfileAPI,
  user: UserAPI,
  jobs: JobsAPI,
  courses: CoursesAPI,
  institutes: InstitutesAPI,
  businesses: BusinessesAPI,
  search: SearchAPI,
  notifications: NotificationsAPI,
  payment: PaymentAPI,
  admin: AdminAPI,
  activity: ActivityAPI,
  applications: ApplicationsAPI
}

export default API
