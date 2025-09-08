'use client'

import { useCallback, useState } from 'react'
import { useSocket } from './use-socket'
import { useDebounce } from './use-debounce'

interface ValidationResult {
  isValid: boolean
  message: string
}

export function useProfileIdValidation() {
  const socket = useSocket()
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

  const validateProfileId = useCallback(async (profileId: string) => {
    if (!socket || !profileId) {
      setValidationResult(null)
      return
    }

    setIsValidating(true)
    
    return new Promise<ValidationResult>((resolve) => {
      socket.emit('validate-profile-id', profileId, (result: ValidationResult) => {
        setValidationResult(result)
        setIsValidating(false)
        resolve(result)
      })
    })
  }, [socket])

  const debouncedValidate = useDebounce(validateProfileId, 500)

  return {
    validateProfileId: debouncedValidate,
    isValidating,
    validationResult
  }
}
