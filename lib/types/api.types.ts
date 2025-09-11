export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface ApiError {
  code: string
  message: string
  details?: any
}

export interface SearchParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
}

export interface FilterParams {
  [key: string]: any
}

export interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url: string
  data?: any
  params?: Record<string, any>
  headers?: Record<string, string>
}

export interface ApiEndpoint {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  requiresAuth: boolean
  requiredRole?: string[]
  requiredSubscription?: boolean
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ApiValidationError extends ApiError {
  code: 'VALIDATION_ERROR'
  details: ValidationError[]
}
