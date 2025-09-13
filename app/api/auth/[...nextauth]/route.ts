export const dynamic = 'force-dynamic'

import NextAuth, { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getUserByEmail, connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'
import apiClient from '@/lib/api/client'

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize (credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const response = await apiClient.post('/api/auth/login', {
            email: credentials.email,
            password: credentials.password
          })

          if (!response.success) {
            return null
          }

          return {
            id: (response.data as any).user.id,
            email: (response.data as any).user.email,
            name: (response.data as any).user.name,
            roles: (response.data as any).user.roles || [],
            activeRole: (response.data as any).user.activeRole || null,
            needsRoleSelection: (response.data as any).user.needsRoleSelection || false,
            needsOnboarding: (response.data as any).user.needsOnboarding || false
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 1 * 24 * 60 * 60 // 1 day
  },
  callbacks: {
    async jwt ({ token, user, account }) {
      if (account && user) {
        const u = user as any
        console.log('JWT callback - user data:', {
          id: u.id,
          roles: u.roles,
          activeRole: u.activeRole,
          needsOnboarding: u.needsOnboarding,
          needsRoleSelection: u.needsRoleSelection,
          provider: account.provider
        })
        
        token.sub = (u.id as string) ?? token.sub
        ;(token as any).roles = u.roles || []
        ;(token as any).activeRole = u.activeRole ?? null
        ;(token as any).needsRoleSelection = u.needsRoleSelection ?? false
        ;(token as any).needsOnboarding = u.needsOnboarding ?? false
        ;(token as any).provider = account.provider
        ;(token as any).role = u.role || 'user'
        return token
      }

      // Refresh flags from DB if needed
      try {
        const shouldRefresh =
          (token as any).needsOnboarding === true ||
          !(token as any).roles ||
          (token as any).activeRole === undefined

        if (shouldRefresh) {
          const { db } = await connectToDatabase()
          let dbUser: any | null = null

          if (token.sub && /^[a-f\d]{24}$/i.test(token.sub)) {
            dbUser = await db
              .collection('users')
              .findOne({ _id: new ObjectId(token.sub) })
          }

          if (!dbUser && token.email) {
            dbUser = await getUserByEmail(token.email.toLowerCase())
          }

          if (dbUser) {
            token.sub = dbUser._id?.toString?.() ?? token.sub
            ;(token as any).roles = dbUser.roles || [dbUser.role]
            ;(token as any).activeRole =
              dbUser.activeRole ?? dbUser.role ?? null
            ;(token as any).needsRoleSelection =
              dbUser.needsRoleSelection ?? false
            ;(token as any).needsOnboarding = dbUser.needsOnboarding ?? false
          }
        }
      } catch (e) {
        console.error('JWT refresh error:', e)
      }

      return token
    },
    async session ({ session, token }) {
      if (session?.user) {
        console.log('Session callback - token data:', {
          sub: token.sub,
          roles: token.roles,
          activeRole: token.activeRole,
          needsOnboarding: token.needsOnboarding,
          needsRoleSelection: token.needsRoleSelection,
          provider: token.provider
        })
        
        session.user.id = token.sub!
        session.user.roles = token.roles as string[]
        session.user.activeRole = token.activeRole as string
        session.user.needsRoleSelection = token.needsRoleSelection as boolean
        session.user.needsOnboarding = token.needsOnboarding as boolean
        session.user.provider = token.provider as string
        // session.user.role is not part of the session type, using activeRole instead 
      }
      return session
    },
    async signIn ({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          console.log('Google sign-in attempt for:', user.email)
          
          // Import the user creation utility
          const { createUserWithProfile } = await import('@/lib/utils/user-creation')
          const { connectToDatabase } = await import('@/lib/db/mongodb')
          
          const { db } = await connectToDatabase()
          
          // Check if user already exists
          const existingUser = await db.collection('users').findOne({
            email: user.email?.toLowerCase()
          })
          
          if (existingUser) {
            console.log('Existing user found:', user.email)
            console.log('User onboarding status:', {
              needsOnboarding: existingUser.needsOnboarding,
              needsRoleSelection: existingUser.needsRoleSelection,
              activeRole: existingUser.activeRole
            })
            
            // Update user data in NextAuth session
            const u = user as any
            u.id = existingUser._id.toString()
            u.roles = existingUser.roles || []
            u.activeRole = existingUser.activeRole || null
            u.needsOnboarding = existingUser.needsOnboarding || false
            u.needsRoleSelection = existingUser.needsRoleSelection || false
            u.provider = existingUser.provider || 'google'
            u.role = existingUser.role || 'user'
            
            return true
          }
          
          // Create new user
          console.log('Creating new user for:', user.email)
          const result = await createUserWithProfile({
            name: user.name || '',
            email: user.email || '',
            provider: 'google',
            image: user.image || undefined
          })
          
          if (result.success && result.user) {
            console.log('New user created successfully:', user.email)
            console.log('New user onboarding status:', {
              needsOnboarding: result.user.needsOnboarding,
              needsRoleSelection: result.user.needsRoleSelection,
              activeRole: result.user.activeRole
            })
            
            const u = user as any
            u.id = result.user._id.toString()
            u.roles = result.user.roles || []
            u.activeRole = result.user.activeRole || null
            u.needsOnboarding = result.user.needsOnboarding || false
            u.needsRoleSelection = result.user.needsRoleSelection || false
            u.provider = result.user.provider || 'google'
            u.role = result.user.role || 'user'
            
            return true
          } else {
            console.error('User creation failed:', result.error)
            return false
          }
        } catch (error) {
          console.error('Google sign-in error:', error)
          return false
        }
      }
      return true
    },
    async redirect ({ url, baseUrl }) {
      console.log('NextAuth redirect called with:', { url, baseUrl })
      
      // Handle onboarding redirection
      if (url.includes('/auth/onboarding') || url.includes('/onboarding')) {
        return `${baseUrl}/onboarding`
      }

      // If redirecting to a relative path, prepend baseUrl
      if (url.startsWith('/')) return `${baseUrl}${url}`

      // If URL has same origin as baseUrl, allow it
      if (new URL(url).origin === baseUrl) return url

      // Default fallback to dashboard
      return `${baseUrl}/dashboard`
    }
  },
  pages: {
    signIn: '/auth/signup',
    error: '/auth/error'
  },
  debug: process.env.NODE_ENV === 'development'
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
