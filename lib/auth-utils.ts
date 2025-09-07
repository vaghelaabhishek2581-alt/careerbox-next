// lib/auth-utils.ts
import { signOut } from 'next-auth/react'

/**
 * Clean signout function that only uses NextAuth
 * No database imports or server actions
 */
export const handleUserSignOut = async () => {
  try {
    // Clear client-side storage
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
    }

    // Use NextAuth's signOut with redirect
    await signOut({
      redirect: true,
      callbackUrl: '/auth/signup?mode=signin'
    })
  } catch (error) {
    console.error('Sign out error:', error)
    // Fallback: force redirect
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/signup?mode=signin'
    }
  }
}

/**
 * Get user data from session only
 */
export const getUserFromSession = (session: any) => {
  if (!session?.user) return null

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    roles: session.user.roles || [],
    activeRole: session.user.activeRole,
    needsOnboarding: session.user.needsOnboarding || false,
    needsRoleSelection: session.user.needsRoleSelection || false
  }
}
