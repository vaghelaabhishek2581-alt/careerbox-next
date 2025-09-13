// Cross-Platform API Client for CareerBox
// This file provides JWT-based APIs that work in both Next.js (web) and React Native environments

import axios from 'axios'

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-api-domain.com/api'

// Cross-platform storage interface
interface StorageInterface {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
}

// Web storage implementation (for Next.js)
class WebStorage implements StorageInterface {
  async getItem(key: string): Promise<string | null> {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(key)
  }

  async setItem(key: string, value: string): Promise<void> {
    if (typeof window === 'undefined') return
    localStorage.setItem(key, value)
  }

  async removeItem(key: string): Promise<void> {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
  }
}

// React Native storage implementation
class ReactNativeStorage implements StorageInterface {
  private asyncStorage: any

  constructor() {
    // Dynamically import AsyncStorage only in React Native environment
    if (typeof window === 'undefined' && typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
      try {
        this.asyncStorage = require('@react-native-async-storage/async-storage').default
      } catch (error) {
        console.warn('AsyncStorage not available, falling back to web storage')
        this.asyncStorage = null
      }
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (!this.asyncStorage) return null
    return await this.asyncStorage.getItem(key)
  }

  async setItem(key: string, value: string): Promise<void> {
    if (!this.asyncStorage) return
    await this.asyncStorage.setItem(key, value)
  }

  async removeItem(key: string): Promise<void> {
    if (!this.asyncStorage) return
    await this.asyncStorage.removeItem(key)
  }
}

// Storage factory - automatically detects environment
function createStorage(): StorageInterface {
  // Check if we're in React Native environment
  if (typeof window === 'undefined' && typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return new ReactNativeStorage()
  }
  // Default to web storage
  return new WebStorage()
}

// Token management
class TokenManager {
  private static ACCESS_TOKEN_KEY = 'careerbox_access_token'
  private static REFRESH_TOKEN_KEY = 'careerbox_refresh_token'
  private static TOKEN_ID_KEY = 'careerbox_token_id'
  private static storage: StorageInterface = createStorage()

  static async getAccessToken(): Promise<string | null> {
    return await this.storage.getItem(this.ACCESS_TOKEN_KEY)
  }

  static async getRefreshToken(): Promise<string | null> {
    return await this.storage.getItem(this.REFRESH_TOKEN_KEY)
  }

  static async getTokenId(): Promise<string | null> {
    return await this.storage.getItem(this.TOKEN_ID_KEY)
  }

  static async setTokens(accessToken: string, refreshToken: string, tokenId: string): Promise<void> {
    await Promise.all([
      this.storage.setItem(this.ACCESS_TOKEN_KEY, accessToken),
      this.storage.setItem(this.REFRESH_TOKEN_KEY, refreshToken),
      this.storage.setItem(this.TOKEN_ID_KEY, tokenId)
    ])
  }

  static async clearTokens(): Promise<void> {
    await Promise.all([
      this.storage.removeItem(this.ACCESS_TOKEN_KEY),
      this.storage.removeItem(this.REFRESH_TOKEN_KEY),
      this.storage.removeItem(this.TOKEN_ID_KEY)
    ])
  }
}

// API Response types
interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  code?: string
  timestamp: string
}

interface LoginResponse {
  user: {
    _id: string
    name: string
    email: string
    role: string
    activeRole: string
    needsOnboarding: boolean
    needsRoleSelection: boolean
    provider: string
  }
  tokens: {
    accessToken: string
    refreshToken: string
    tokenId: string
  }
}

// API Client class
class CareerBoxAPI {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    // Add authorization header if token exists
    const accessToken = await TokenManager.getAccessToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    }

    try {
      const response = await axios({
        url,
        method: options.method as any || 'GET',
        headers,
        data: options.body,
      })

      const data = response.data

      // If token expired, try to refresh
      if (response.status === 401 && data.code === 'AUTH_REQUIRED') {
        const refreshed = await this.refreshToken()
        if (refreshed) {
          // Retry the original request
          return this.request<T>(endpoint, options)
        } else {
          // Refresh failed, redirect to login
          await this.logout()
          throw new Error('Session expired. Please login again.')
        }
      }

      return data
    } catch (error) {
      console.error('API request error:', error)
      throw error
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/jwt/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    if (response.success && response.data) {
      const { user, tokens } = response.data
      await TokenManager.setTokens(tokens.accessToken, tokens.refreshToken, tokens.tokenId)
      return response.data
    }

    throw new Error(response.message || 'Login failed')
  }

  async register(name: string, email: string, password: string, role?: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/jwt/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    })

    if (response.success && response.data) {
      const { user, tokens } = response.data
      await TokenManager.setTokens(tokens.accessToken, tokens.refreshToken, tokens.tokenId)
      return response.data
    }

    throw new Error(response.message || 'Registration failed')
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await TokenManager.getRefreshToken()
      if (!refreshToken) return false

      const response = await this.request<{ tokens: { accessToken: string; refreshToken: string; tokenId: string } }>('/auth/jwt/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      })

      if (response.success && response.data) {
        const { tokens } = response.data
        await TokenManager.setTokens(tokens.accessToken, tokens.refreshToken, tokens.tokenId)
        return true
      }

      return false
    } catch (error) {
      console.error('Token refresh error:', error)
      return false
    }
  }

  async logout(): Promise<void> {
    try {
      const tokenId = await TokenManager.getTokenId()
      if (tokenId) {
        await this.request('/auth/jwt/logout', {
          method: 'POST',
          body: JSON.stringify({ tokenId }),
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      await TokenManager.clearTokens()
    }
  }

  // User profile methods
  async getProfile(): Promise<any> {
    const response = await this.request('/user/profile/jwt')
    if (response.success) return response.data
    throw new Error(response.message || 'Failed to fetch profile')
  }

  async updateProfile(profileData: any): Promise<void> {
    const response = await this.request('/user/profile/jwt', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    })

    if (!response.success) {
      throw new Error(response.message || 'Failed to update profile')
    }
  }

  // Jobs methods
  async getJobs(page: number = 1, limit: number = 10): Promise<any> {
    const response = await this.request(`/jobs?page=${page}&limit=${limit}`)
    if (response.success) return response.data
    throw new Error(response.message || 'Failed to fetch jobs')
  }

  async getJob(jobId: string): Promise<any> {
    const response = await this.request(`/jobs/${jobId}`)
    if (response.success) return response.data
    throw new Error(response.message || 'Failed to fetch job')
  }

  async applyToJob(jobId: string, applicationData: any): Promise<void> {
    const response = await this.request(`/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    })

    if (!response.success) {
      throw new Error(response.message || 'Failed to apply to job')
    }
  }

  // Courses methods
  async getCourses(page: number = 1, limit: number = 10): Promise<any> {
    const response = await this.request(`/courses?page=${page}&limit=${limit}`)
    if (response.success) return response.data
    throw new Error(response.message || 'Failed to fetch courses')
  }

  async getCourse(courseId: string): Promise<any> {
    const response = await this.request(`/courses/${courseId}`)
    if (response.success) return response.data
    throw new Error(response.message || 'Failed to fetch course')
  }

  // Search methods
  async search(query: string, filters?: any): Promise<any> {
    const response = await this.request('/search', {
      method: 'POST',
      body: JSON.stringify({ query, filters }),
    })

    if (response.success) return response.data
    throw new Error(response.message || 'Search failed')
  }

  // Notifications methods
  async getNotifications(page: number = 1, limit: number = 20): Promise<any> {
    const response = await this.request(`/notifications?page=${page}&limit=${limit}`)
    if (response.success) return response.data
    throw new Error(response.message || 'Failed to fetch notifications')
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const response = await this.request(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    })

    if (!response.success) {
      throw new Error(response.message || 'Failed to mark notification as read')
    }
  }
}

// Export singleton instance
export const api = new CareerBoxAPI()

// Export types for use in React Native components
export type { ApiResponse, LoginResponse }

// Example usage in React Native component:
/*
import { api } from './lib/api/react-native-client'

// In your React Native component:
const handleLogin = async () => {
  try {
    const result = await api.login(email, password)
    console.log('Login successful:', result.user)
    // Navigate to main app
  } catch (error) {
    console.error('Login failed:', error.message)
    // Show error to user
  }
}

const handleGetProfile = async () => {
  try {
    const profile = await api.getProfile()
    console.log('Profile:', profile)
  } catch (error) {
    console.error('Failed to get profile:', error.message)
  }
}
*/
