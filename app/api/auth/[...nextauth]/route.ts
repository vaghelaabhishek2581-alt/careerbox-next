export const dynamic = 'force-dynamic'

import NextAuth, { AuthOptions } from 'next-auth'
import { getToken } from 'next-auth/jwt'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getUserByEmail, connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'

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
          // Use your existing login API
          const response = await fetch(
            `${process.env.NEXTAUTH_URL}/api/auth/login`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password
              })
            }
          )

          const data = await response.json()

          if (!response.ok || !data.success) {
            return null
          }

          // Return user data from your login API
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            roles: data.user.roles || [],
            activeRole: data.user.activeRole || null,
            needsRoleSelection: data.user.needsRoleSelection || false,
            needsOnboarding: data.user.needsOnboarding || false
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
        // Ensure JWT subject is our DB user id (needed for onboarding API)
        token.sub = (u.id as string) ?? token.sub
        ;(token as any).roles = u.roles
        ;(token as any).activeRole = u.activeRole ?? null
        ;(token as any).needsRoleSelection = u.needsRoleSelection
        ;(token as any).needsOnboarding = u.needsOnboarding
        ;(token as any).provider = account.provider
        return token
      }

      // Refresh flags from DB if needed (e.g., right after onboarding completes)
      try {
        const shouldRefresh =
          (token as any).needsOnboarding === true ||
          !(token as any).roles ||
          (token as any).activeRole === undefined

        if (shouldRefresh) {
          const { db } = await connectToDatabase()
          let dbUser: any | null = null

          // Prefer looking up by token.sub as ObjectId when possible
          if (token.sub && /^[a-f\d]{24}$/i.test(token.sub)) {
            dbUser = await db
              .collection('users')
              .findOne({ _id: new ObjectId(token.sub) })
          }

          // Fallback to email lookup
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
        session.user.id = token.sub!
        session.user.roles = token.roles as string[]
        session.user.activeRole = token.activeRole as string
        session.user.needsRoleSelection = token.needsRoleSelection as boolean
        session.user.needsOnboarding = token.needsOnboarding as boolean
        session.user.provider = token.provider as string
      }
      return session
    },
    async signIn ({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          console.log('Google sign-in')
          // Compute base URL with safe fallback
          const baseUrl =
            process.env.NEXTAUTH_URL ||
            (process.env.VERCEL_URL
              ? `https://${process.env.VERCEL_URL}`
              : 'http://localhost:3000')

          // Use your existing register API for Google users
          const response = await fetch(`${baseUrl}/api/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              role: 'user', // Default role for Google users
              provider: 'google',
              image: user.image
            })
          })
          console.log('response', response)
          const data = await response.json()

          if (response.ok && data.success) {
            const u = user as any
            u.id = data.user.id
            u.roles = data.user.roles || []
            u.activeRole = data.user.activeRole || null
            u.needsOnboarding = data.user.needsOnboarding || false
            u.needsRoleSelection = data.user.needsRoleSelection || false
            return true
          } else if (
            response.status === 400 &&
            data.message?.includes('already exists')
          ) {
            // User already exists, try to log them in to get their data
            try {
              const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  email: user.email,
                  provider: 'google'
                })
              })

              const loginData = await loginResponse.json()

              if (loginResponse.ok && loginData.success) {
                const u = user as any
                u.id = loginData.user.id
                u.roles = loginData.user.roles || []
                u.activeRole = loginData.user.activeRole || null
                u.needsOnboarding = loginData.user.needsOnboarding || false
                u.needsRoleSelection =
                  loginData.user.needsRoleSelection || false
                return true
              }
            } catch (loginError) {
              console.error('Login error during Google sign-in:', loginError)
              return false
            }
          } else {
            console.error('Google sign-up error:', data)
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
      // Let middleware handle auth-specific redirects
      if (url.startsWith('/')) return `${baseUrl}${url}`

      // Default NextAuth redirect logic
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  pages: {
    signIn: '/auth/signup',
    error: '/auth/error' // Add custom error page
  },
  debug: process.env.NODE_ENV === 'development'
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
