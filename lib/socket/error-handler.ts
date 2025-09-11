import { Socket } from 'socket.io'

export interface SocketError {
  code: string
  message: string
  details?: any
  timestamp: Date
}

export class SocketErrorHandler {
  /**
   * Handle socket errors with proper logging and user feedback
   */
  public static handleError(socket: Socket, error: Error, context: string): void {
    const socketError: SocketError = {
      code: this.getErrorCode(error),
      message: this.getUserFriendlyMessage(error),
      details: this.getErrorDetails(error),
      timestamp: new Date()
    }

    // Log error for debugging
    console.error(`Socket error in ${context}:`, {
      userId: socket.data.userId,
      userRole: socket.data.userRole,
      error: socketError,
      stack: error.stack
    })

    // Send error to client
    socket.emit('error', {
      code: socketError.code,
      message: socketError.message,
      timestamp: socketError.timestamp
    })

    // Send admin alert for critical errors
    if (this.isCriticalError(error)) {
      this.sendAdminAlert(socket, socketError, context)
    }
  }

  /**
   * Handle async operation errors
   */
  public static async handleAsyncError<T>(
    socket: Socket,
    operation: () => Promise<T>,
    context: string,
    fallbackValue?: T
  ): Promise<T | undefined> {
    try {
      return await operation()
    } catch (error) {
      this.handleError(socket, error as Error, context)
      return fallbackValue
    }
  }

  /**
   * Get error code based on error type
   */
  private static getErrorCode(error: Error): string {
    if (error.name === 'ValidationError') return 'VALIDATION_ERROR'
    if (error.name === 'AuthenticationError') return 'AUTH_ERROR'
    if (error.name === 'AuthorizationError') return 'AUTHZ_ERROR'
    if (error.name === 'DatabaseError') return 'DB_ERROR'
    if (error.name === 'NetworkError') return 'NETWORK_ERROR'
    if (error.name === 'RateLimitError') return 'RATE_LIMIT_ERROR'
    if (error.name === 'NotFoundError') return 'NOT_FOUND_ERROR'
    if (error.name === 'ConflictError') return 'CONFLICT_ERROR'
    
    return 'UNKNOWN_ERROR'
  }

  /**
   * Get user-friendly error message
   */
  private static getUserFriendlyMessage(error: Error): string {
    const code = this.getErrorCode(error)
    
    const messages: Record<string, string> = {
      VALIDATION_ERROR: 'Invalid input provided. Please check your data and try again.',
      AUTH_ERROR: 'Authentication failed. Please log in again.',
      AUTHZ_ERROR: 'You do not have permission to perform this action.',
      DB_ERROR: 'Database error occurred. Please try again later.',
      NETWORK_ERROR: 'Network error occurred. Please check your connection.',
      RATE_LIMIT_ERROR: 'Too many requests. Please wait a moment and try again.',
      NOT_FOUND_ERROR: 'The requested resource was not found.',
      CONFLICT_ERROR: 'A conflict occurred. The resource may have been modified.',
      UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
    }

    return messages[code] || messages.UNKNOWN_ERROR
  }

  /**
   * Get error details for logging
   */
  private static getErrorDetails(error: Error): any {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5) // First 5 lines of stack
    }
  }

  /**
   * Check if error is critical and requires admin attention
   */
  private static isCriticalError(error: Error): boolean {
    const criticalErrors = [
      'DatabaseError',
      'AuthenticationError',
      'SystemError'
    ]
    
    return criticalErrors.includes(error.name) || 
           error.message.includes('critical') ||
           error.message.includes('fatal')
  }

  /**
   * Send admin alert for critical errors
   */
  private static sendAdminAlert(socket: Socket, error: SocketError, context: string): void {
    try {
      // Import here to avoid circular dependency
      const { sendAdminAlert } = require('./notification-service')
      
      sendAdminAlert({
        type: 'error',
        data: {
          action: 'critical_socket_error',
          context,
          error: error,
          userId: socket.data.userId,
          userRole: socket.data.userRole
        },
        severity: 'critical'
      })
    } catch (alertError) {
      console.error('Failed to send admin alert:', alertError)
    }
  }

  /**
   * Validate socket data
   */
  public static validateSocketData(socket: Socket): boolean {
    const requiredFields = ['userId', 'userRole', 'session']
    
    for (const field of requiredFields) {
      if (!socket.data[field]) {
        this.handleError(socket, new Error(`Missing required field: ${field}`), 'validation')
        return false
      }
    }

    return true
  }

  /**
   * Validate user permissions
   */
  public static validatePermission(
    socket: Socket, 
    requiredPermission: string, 
    context: string
  ): boolean {
    try {
      const { hasPermission } = require('./auth')
      
      if (!hasPermission(socket.data.userRole, requiredPermission)) {
        this.handleError(socket, new Error(`Insufficient permissions for: ${requiredPermission}`), context)
        return false
      }

      return true
    } catch (error) {
      this.handleError(socket, error as Error, context)
      return false
    }
  }

  /**
   * Validate input parameters
   */
  public static validateInput(
    socket: Socket,
    input: any,
    schema: Record<string, any>,
    context: string
  ): boolean {
    try {
      for (const [key, rules] of Object.entries(schema)) {
        const value = input[key]
        
        if (rules.required && (value === undefined || value === null)) {
          this.handleError(socket, new Error(`Missing required parameter: ${key}`), context)
          return false
        }

        if (value !== undefined && rules.type && typeof value !== rules.type) {
          this.handleError(socket, new Error(`Invalid type for parameter ${key}: expected ${rules.type}`), context)
          return false
        }

        if (value !== undefined && rules.minLength && value.length < rules.minLength) {
          this.handleError(socket, new Error(`Parameter ${key} is too short: minimum ${rules.minLength} characters`), context)
          return false
        }

        if (value !== undefined && rules.maxLength && value.length > rules.maxLength) {
          this.handleError(socket, new Error(`Parameter ${key} is too long: maximum ${rules.maxLength} characters`), context)
          return false
        }
      }

      return true
    } catch (error) {
      this.handleError(socket, error as Error, context)
      return false
    }
  }

  /**
   * Create custom error
   */
  public static createError(code: string, message: string, details?: any): Error {
    const error = new Error(message)
    error.name = code
    ;(error as any).details = details
    return error
  }

  /**
   * Handle rate limiting
   */
  public static handleRateLimit(socket: Socket, context: string): void {
    const error = this.createError('RateLimitError', 'Too many requests. Please slow down.')
    this.handleError(socket, error, context)
  }

  /**
   * Handle timeout errors
   */
  public static handleTimeout(socket: Socket, context: string, timeout: number): void {
    const error = this.createError('TimeoutError', `Operation timed out after ${timeout}ms`)
    this.handleError(socket, error, context)
  }
}

// Common validation schemas
export const ValidationSchemas = {
  profileId: {
    profileId: {
      required: true,
      type: 'string',
      minLength: 3,
      maxLength: 30
    }
  },
  searchQuery: {
    query: {
      required: true,
      type: 'string',
      minLength: 2,
      maxLength: 100
    }
  },
  roomName: {
    room: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 100
    }
  },
  userStatus: {
    status: {
      required: true,
      type: 'string'
    }
  },
  typingData: {
    room: {
      required: true,
      type: 'string'
    },
    isTyping: {
      required: true,
      type: 'boolean'
    }
  }
}
