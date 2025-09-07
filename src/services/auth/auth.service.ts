import { signOut } from 'next-auth/react'
import { LoginInput, RegisterInput } from '@/src/utils/validators/auth.schema'

export class AuthService {
  static async login (input: LoginInput) {
    const response = await fetch('/api/auth/service', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        operation: 'login',
        data: input
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login failed')
    }

    const data = await response.json()

    const redirectUrls = {
      admin: '/dashboard/admin',
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
    const response = await fetch('/api/auth/service', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        operation: 'register',
        data: input
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Registration failed')
    }

    const data = await response.json()

    if (data.requiresApproval) {
      return { requiresApproval: true }
    }

    const redirectUrls = {
      admin: '/dashboard/admin',
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

    await signOut({
      redirect: true,
      callbackUrl: '/auth/signup?mode=signin'
    })
  } catch (error) {
    console.error('Sign out error:', error)
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/signup?mode=signin'
    }
  }
}
