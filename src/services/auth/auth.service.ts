import { signOut } from 'next-auth/react'
import { LoginInput, RegisterInput } from '@/src/utils/validators/auth.schema'
import { API } from '@/lib/api/services'

export class AuthService {
  static async login (input: LoginInput) {
    const response = await API.auth.login(input.email || '', input.password || '')

    if (!response.success) {
      throw new Error(response.error || 'Login failed')
    }

    const data = response.data

    const redirectUrls = {
      admin: '/admin',
      organization: '/dashboard/organization',
      business: '/dashboard/business',
      user: '/dashboard/user'
    } as const

    return {
      ...data,
      redirectUrl:
        redirectUrls[data.user.role as keyof typeof redirectUrls] ||
        '/dashboard/user'
    }
  }

  static async register (input: RegisterInput) {
    const response = await API.auth.register(input.name || '', input.email || '', input.password || '')

    if (!response.success) {
      throw new Error(response.error || 'Registration failed')
    }

    const data = response.data

    if (data.requiresApproval) {
      return { requiresApproval: true }
    }

    const redirectUrls = {
      admin: '/admin',
      organization: '/dashboard/organization',
      business: '/dashboard/business',
      user: '/dashboard/user'
    } as const

    return {
      ...data,
      redirectUrl:
        redirectUrls[data.user.role as keyof typeof redirectUrls] ||
        '/dashboard/user'
    }
  }
}

export const handleUserSignOut = async () => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
    }

    // Sign out without redirect - stay on current page
    await signOut({
      redirect: false
    })
    
    // Optionally reload the page to update the UI
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  } catch (error) {
    console.error('Sign out error:', error)
  }
}
