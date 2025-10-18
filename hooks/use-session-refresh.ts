import { useSession } from 'next-auth/react'
import { useCallback } from 'react'

export function useSessionRefresh() {
  const { update, data: session } = useSession()

  const refreshSession = useCallback(async () => {
    try {
      console.log('🔄 Refreshing session...')
      // Force session update by passing an empty object
      // This triggers the JWT callback with trigger: 'update'
      const result = await update({})
      console.log('✅ Session refreshed successfully', result)
      return true
    } catch (error) {
      console.error('❌ Failed to refresh session:', error)
      return false
    }
  }, [update])

  const checkOnboardingStatus = useCallback(() => {
    if (!session?.user) return { needsOnboarding: false, needsRoleSelection: false }
    
    return {
      needsOnboarding: session.user.needsOnboarding || false,
      needsRoleSelection: session.user.needsRoleSelection || false
    }
  }, [session])

  return {
    refreshSession,
    checkOnboardingStatus,
    session
  }
}
