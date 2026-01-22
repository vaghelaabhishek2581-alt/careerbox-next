import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError
} from 'axios'
import axiosRetry from 'axios-retry'
import type { Session } from 'next-auth'

// Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  code?: string
  timestamp: string
}

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: any
}

// Retry configuration
const RETRY_CONFIG = {
  retries: 3,
  retryDelay: (retryCount: number) => Math.pow(2, retryCount) * 1000, // Exponential backoff
  retryCondition: (error: AxiosError) => {
    // Retry on network errors or 5xx status codes
    return (
      !error.response ||
      (error.response.status >= 500 && error.response.status < 600) ||
      error.code === 'NETWORK_ERROR' ||
      error.code === 'ECONNABORTED'
    )
  }
}

// Session cache to avoid calling getSession() on every request
// This is updated by the SessionProvider via the setSession method
let cachedSession: Session | null = null

// Export a function to update the cached session from SessionProvider
export function setApiClientSession(session: Session | null) {
  cachedSession = session
}

// Export a function to get the current cached session
export function getApiClientSession(): Session | null {
  return cachedSession
}

class ApiClient {
  private instance: AxiosInstance
  private baseURL: string

  constructor () {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || ''

    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
    this.setupRetry()
  }

  private setupRetry () {
    axiosRetry(this.instance, {
      retries: RETRY_CONFIG.retries,
      retryDelay: RETRY_CONFIG.retryDelay,
      retryCondition: RETRY_CONFIG.retryCondition,
      onRetry: (retryCount, error, requestConfig) => {
        console.log(
          `Retry attempt ${retryCount} for ${requestConfig.url}:`,
          error.message
        )
      }
    })
  }

  private setupInterceptors () {
    // Request interceptor to add auth headers
    // Uses cached session instead of calling getSession() on every request
    this.instance.interceptors.request.use(
      config => {
        try {
          // Use cached session instead of fetching - prevents /api/auth/session spam
          const session = cachedSession
          if (session?.user?.id) {
            config.headers['X-User-ID'] = session.user.id
            config.headers['X-User-Email'] = session.user.email
            config.headers['X-User-Role'] = (session.user as any).activeRole || 'user'
          }

          // Add CSRF token if available (only in browser)
          if (typeof document !== 'undefined') {
            const csrfToken = document
              .querySelector('meta[name="csrf-token"]')
              ?.getAttribute('content')
            if (csrfToken) {
              config.headers['X-CSRF-Token'] = csrfToken
            }
          }

          // Add request timestamp
          config.headers['X-Request-Time'] = new Date().toISOString()

          return config
        } catch (error) {
          console.error('Request interceptor error:', error)
          return config
        }
      },
      error => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean
        }

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            // Try to refresh session or redirect to login
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/signup?mode=signin'
            }
          } catch (refreshError) {
            console.error('Session refresh failed:', refreshError)
          }
        }

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
          console.error('Access forbidden:', error.response.data)
          if (typeof window !== 'undefined') {
            // Redirect to unauthorized page or show error
            window.location.href = '/unauthorized'
          }
        }

        return Promise.reject(this.formatError(error))
      }
    )
  }

  private formatError (error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const responseData = error.response.data as any
      return {
        message:
          responseData?.message ||
          responseData?.error ||
          'Server error occurred',
        code: responseData?.code || `HTTP_${error.response.status}`,
        status: error.response.status,
        details: responseData?.details || responseData
      }
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error - please check your connection',
        code: 'NETWORK_ERROR',
        details: error.request
      }
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        details: error
      }
    }
  }

  private async makeRequest<T> (
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.request({
        method,
        url,
        data,
        ...config
      })

      return {
        success: true,
        data: response.data,
        message: response.data?.message,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      const apiError = error as ApiError
      return {
        success: false,
        error: apiError.message,
        code: apiError.code,
        data: apiError.details, // Preserve the original response data
        timestamp: new Date().toISOString()
      }
    }
  }

  // HTTP Methods
  async get<T> (
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('GET', url, undefined, config)
  }

  async post<T> (
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('POST', url, data, config)
  }

  async put<T> (
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PUT', url, data, config)
  }

  async patch<T> (
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PATCH', url, data, config)
  }

  async delete<T> (
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', url, undefined, config)
  }

  // File upload method
  async uploadFile<T> (
    url: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    return this.makeRequest<T>('POST', url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  // Download file method
  async downloadFile (url: string, filename?: string): Promise<void> {
    try {
      const response = await this.instance.get(url, {
        responseType: 'blob'
      })

      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Download failed:', error)
      throw error
    }
  }

  // Health check method
  async healthCheck (): Promise<boolean> {
    try {
      const response = await this.get('/api/health')
      return response.success
    } catch (error) {
      return false
    }
  }

  // Get base URL
  getBaseURL (): string {
    return this.baseURL
  }

  // Update base URL
  setBaseURL (url: string): void {
    this.baseURL = url
    this.instance.defaults.baseURL = url
  }
}

// Create singleton instance
const apiClient = new ApiClient()

// Export the instance and class
export default apiClient
export { ApiClient }
