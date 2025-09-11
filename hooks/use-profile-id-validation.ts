'use client'

import { useCallback, useState, useEffect, useRef } from 'react'
import { useSocket } from './use-socket'
import { useDebouncedCallback } from './use-debounced-callback'

interface ValidationResult {
  isValid: boolean
  message: string
  suggestions: string[]
}

export function useProfileIdValidation() {
  const { socket, isConnected } = useSocket()
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const validateProfileId = useCallback(async (profileId: string): Promise<ValidationResult> => {
    if (!socket || !isConnected || !profileId) {
      const result = {
        isValid: false,
        message: 'Connection not available',
        suggestions: []
      }
      if (isMountedRef.current) {
        setValidationResult(result)
      }
      return result
    }

    // Check if socket has emit function
    if (typeof socket.emit !== 'function') {
      const result = {
        isValid: false,
        message: 'Socket not properly initialized',
        suggestions: []
      }
      if (isMountedRef.current) {
        setValidationResult(result)
      }
      return result
    }

    setIsValidating(true)
    
    return new Promise<ValidationResult>((resolve) => {
      try {
        // Use the correct event name that matches the server
        socket.emit('validateProfileId', profileId, (result: ValidationResult) => {
          if (isMountedRef.current) {
            setValidationResult(result)
            setIsValidating(false)
          }
          resolve(result)
        })

        // Timeout after 5 seconds
        timeoutRef.current = setTimeout(() => {
          if (isValidating && isMountedRef.current) {
            const timeoutResult = {
              isValid: false,
              message: 'Validation timeout',
              suggestions: []
            }
            setValidationResult(timeoutResult)
            setIsValidating(false)
            resolve(timeoutResult)
          }
        }, 5000)
      } catch (error) {
        console.error('Socket emit error:', error)
        const errorResult = {
          isValid: false,
          message: 'Socket communication error',
          suggestions: []
        }
        if (isMountedRef.current) {
          setValidationResult(errorResult)
          setIsValidating(false)
        }
        resolve(errorResult)
      }
    })
  }, [socket, isConnected, isValidating])

  const debouncedValidate = useDebouncedCallback(validateProfileId, 500)

  return {
    validateProfileId: debouncedValidate,
    isValidating,
    validationResult
  }
}
