'use client'

import { useCallback, useState, useEffect, useRef } from 'react'
import { useDebouncedCallback } from './use-debounced-callback'

interface ValidationResult {
  isValid: boolean
  message: string
  suggestions: string[]
}

export function useProfileIdValidation() {
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const validateProfileId = useCallback(async (profileId: string): Promise<ValidationResult> => {
    if (!profileId || profileId.length < 3) {
      const result = {
        isValid: false,
        message: 'Profile ID must be at least 3 characters',
        suggestions: []
      }
      if (isMountedRef.current) {
        setValidationResult(result)
      }
      return result
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()
    setIsValidating(true)
    
    try {
      const response = await fetch('/api/profile/validate-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileId }),
        signal: abortControllerRef.current.signal
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Validation failed')
      }

      const result = {
        isValid: data.isValid,
        message: data.message,
        suggestions: data.suggestions || []
      }

      if (isMountedRef.current) {
        setValidationResult(result)
        setIsValidating(false)
      }

      return result

    } catch (error) {
      console.error('Profile ID validation error:', error)
      
      let errorMessage = 'Validation failed'
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          // Request was cancelled, don't update state
          return { isValid: false, message: '', suggestions: [] }
        }
        errorMessage = error.message
      }

      const errorResult = {
        isValid: false,
        message: errorMessage,
        suggestions: []
      }

      if (isMountedRef.current) {
        setValidationResult(errorResult)
        setIsValidating(false)
      }

      return errorResult
    }
  }, [])

  const debouncedValidate = useDebouncedCallback(validateProfileId, 500)

  return {
    validateProfileId: debouncedValidate,
    isValidating,
    validationResult
  }
}
