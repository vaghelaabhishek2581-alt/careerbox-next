'use client'

import { useCallback, useState, useEffect, useRef } from 'react'
import { useSocket } from './use-socket'
import { useDebouncedCallback } from './use-debounced-callback'

interface ValidationResult {
  profileId: string
  isValid: boolean
  message: string
  suggestions: string[]
  isOwnProfile?: boolean
}

export function useProfileIdSocketValidation() {
  const { socket, isConnected, validateProfileId: socketValidateProfileId } = useSocket()
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)
  const pendingValidationRef = useRef<string | null>(null)

  // Update socket connection status
  useEffect(() => {
    setIsSocketConnected(isConnected)
  }, [isConnected])

  // Set mounted state and cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true
    console.log('🔍 Socket validation hook mounted, isMounted set to true')

    return () => {
      console.log('🔍 Socket validation hook unmounting, setting isMounted to false')
      isMountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Listen for validation responses from socket
  useEffect(() => {
    console.log('🔍 Setting up socket validation listener, socket:', !!socket)

    if (socket) {
      const handleValidationResponse = (data: ValidationResult) => {
        console.log('🔍 Profile validation response received:', {
          data,
          pendingValidation: pendingValidationRef.current,
          isMounted: isMountedRef.current,
          matches: pendingValidationRef.current === data.profileId
        })

        // Process the response regardless of pending validation to update UI
        console.log('✅ Processing validation response for:', data.profileId)
        setValidationResult(data)

        // Only clear loading state if this matches the current pending validation
        if (pendingValidationRef.current === data.profileId) {
          console.log('✅ Clearing loading state for matching validation:', data.profileId)
          setIsValidating(false)
          pendingValidationRef.current = null

          // Clear timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
          }
        } else {
          console.log('⚠️ Response received but not clearing loading state - different pending validation', {
            received: data.profileId,
            expected: pendingValidationRef.current
          })
        }
      }

      console.log('🔍 Registering profileId:validation listener')
      socket.on('profileId:validation', handleValidationResponse)

      return () => {
        console.log('🔍 Removing profileId:validation listener')
        socket.off('profileId:validation', handleValidationResponse)
      }
    } else {
      console.log('❌ No socket available for validation listener')
    }
  }, [socket])

  // API fallback validation
  const validateViaAPI = useCallback(async (profileId: string): Promise<ValidationResult> => {
    try {
      const response = await fetch('/api/profile/validate-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileId })
      })

      const data = await response.json()
      console.log('🔍 API validation response:', data)

      if (!response.ok) {
        throw new Error(data.message || 'Validation failed')
      }

      // The API returns success: true/false, but we need to handle both cases
      return {
        profileId,
        isValid: data.isValid,
        message: data.message,
        suggestions: data.suggestions || [],
        isOwnProfile: data.isOwnProfile || false
      }
    } catch (error) {
      console.error('API validation error:', error)

      // If it's a network error or fetch error, provide a more specific message
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          profileId,
          isValid: false,
          message: 'Network error - please check your connection',
          suggestions: [],
          isOwnProfile: false
        }
      }

      return {
        profileId,
        isValid: false,
        message: error instanceof Error ? error.message : 'Validation failed',
        suggestions: [],
        isOwnProfile: false
      }
    }
  }, [])

  const validateProfileId = useCallback(async (profileId: string): Promise<ValidationResult> => {
    console.log('🔍 validateProfileId called with:', {
      profileId,
      isConnected,
      hasSocketValidateFunction: !!socketValidateProfileId,
      currentPending: pendingValidationRef.current
    })

    if (!profileId || profileId.length < 3) {
      console.log('❌ Profile ID too short:', profileId)
      const result: ValidationResult = {
        profileId,
        isValid: false,
        message: 'Profile ID must be at least 3 characters',
        suggestions: [],
        isOwnProfile: false
      }
      if (isMountedRef.current) {
        setValidationResult(result)
        setIsValidating(false)
      }
      return result
    }

    console.log('🔄 Starting validation for:', profileId)
    setIsValidating(true)
    pendingValidationRef.current = profileId

    // Try socket validation first if connected
    if (isConnected && socketValidateProfileId) {
      console.log('🔍 Using socket validation for:', profileId)

      // Set timeout for socket response
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(async () => {
        if (pendingValidationRef.current === profileId) {
          console.log('⏰ Socket validation timeout, falling back to API for:', profileId)
          const result = await validateViaAPI(profileId)
          console.log('✅ API fallback result:', result)
          setValidationResult(result)
          setIsValidating(false)
          pendingValidationRef.current = null
        }
      }, 5000) // 5 second timeout

      // Send socket validation request
      console.log('📤 Sending socket validation request for:', profileId)
      socketValidateProfileId(profileId)

      // For socket validation, we don't return a promise since the response comes via event listener
      // The UI will update when the socket response is received
      return Promise.resolve({
        profileId,
        isValid: false,
        message: 'Validating via socket...',
        suggestions: [],
        isOwnProfile: false
      })
    } else {
      // Fallback to API validation
      console.log('🔍 Using API validation for:', profileId, 'isConnected:', isConnected, 'hasSocketFunction:', !!socketValidateProfileId)
      const result = await validateViaAPI(profileId)
      if (isMountedRef.current) {
        console.log('✅ API validation result:', result)
        setValidationResult(result)
        setIsValidating(false)
        pendingValidationRef.current = null
      }
      return result
    }
  }, [isConnected, socketValidateProfileId, validateViaAPI])

  const debouncedValidate = useDebouncedCallback(validateProfileId, 500)

  // Subscription management (placeholder for future enhancement)
  const subscribeToProfileId = useCallback((profileId: string) => {
    if (socket && isConnected) {
      console.log('🔔 Subscribing to profile ID updates:', profileId)
      // This would be implemented when we add subscription events to the socket server
    }
  }, [socket, isConnected])

  const unsubscribeFromProfileId = useCallback((profileId: string) => {
    if (socket && isConnected) {
      console.log('🔕 Unsubscribing from profile ID updates:', profileId)
      // This would be implemented when we add subscription events to the socket server
    }
  }, [socket, isConnected])

  return {
    validateProfileId: debouncedValidate,
    isValidating,
    validationResult,
    isSocketConnected,
    subscribeToProfileId,
    unsubscribeFromProfileId
  }
}
