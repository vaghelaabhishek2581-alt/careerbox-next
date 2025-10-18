'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export type UserRole = 'admin' | 'business' | 'institute' | 'user'

interface UseAuthOptions {
  requiredRole?: UserRole
  redirectTo?: string
  skipOnboarding?: boolean
}

export function useAuth (options: UseAuthOptions = {}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading'
  const user = session?.user
  const userRole = user?.roles as unknown as UserRole

  useEffect(() => {
    if (isLoading) return

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push(`/auth/signup?mode=signin&callbackUrl=${pathname}`)
      return
    }

    // If role is required and user doesn't have it, redirect
    if (options.requiredRole && userRole !== options.requiredRole) {
      router.push(options.redirectTo || '/recommendation-collections')
      return
    }

    // Only check onboarding if not explicitly skipped
    if (
      !options.skipOnboarding &&
      user?.needsOnboarding &&
      pathname !== '/onboarding'
    ) {
      router.push('/onboarding')
      return
    }
  }, [
    isAuthenticated,
    isLoading,
    options.requiredRole,
    options.redirectTo,
    options.skipOnboarding,
    pathname,
    router,
    user,
    userRole
  ])

  return {
    isAuthenticated,
    isLoading,
    user,
    userRole,
    session
  }
}
