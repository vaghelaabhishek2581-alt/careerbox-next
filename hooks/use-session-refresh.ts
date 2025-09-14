import { useSession } from 'next-auth/react'
import { useCallback } from 'react'

export function useSessionRefresh() {
  const { update, data: session } = useSession()

  const refreshSession = useCallback(async () => {
    try {
      console.log('🔄 Refreshing session...')
      await update()
      console.log('✅ Session refreshed successfully')
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
