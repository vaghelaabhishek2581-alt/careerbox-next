import { AuthOptions, Profile } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectToDatabase } from '@/lib/db/mongoose'
import { User } from '@/src/models'
import { createUserWithProfile } from '@/lib/utils/user-creation'

// Environment variable validation at startup
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  // We can't throw here if we want the build to pass in CI environments without these vars
  console.warn('Missing Google OAuth environment variables (GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)')
}
if (!process.env.NEXTAUTH_SECRET) {
  console.warn('Missing NEXTAUTH_SECRET environment variable')
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
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
          console.log('❌ [Authorize] Missing credentials')
          return null
        }

        try {
          console.log(`📡 [Authorize] Authenticating user: ${credentials.email}`)
          
          // Use direct fetch to match the frontend approach
          const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          const data = await response.json()
          console.log('Login API response:', { success: data.success, hasUser: !!data.user })

           if (data.success && data.user) {
             console.log(`✅ [Authorize] User authenticated successfully: ${credentials.email}`)
             // The object returned here is passed to the `jwt` callback's `user` parameter
             return data.user
           } else {
             console.log(`❌ [Authorize] API authentication failed for: ${credentials.email}`)
             
             // Check if it's an email verification error
             if (data.needsEmailVerification) {
               console.log(`📧 [Authorize] Email verification required for: ${credentials.email}`)
               // Throw a specific error that NextAuth can catch
               throw new Error('EmailNotVerified')
             }
             
             return null
           }
        } catch (error) {
          console.error('❌ [Authorize] Credentials auth error:', error)
          
          // Handle email verification error specifically
          if (error instanceof Error && error.message === 'EmailNotVerified') {
            throw new Error('EmailNotVerified')
          }
          
          return null // Returning null will trigger the `error` page
        }
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 1 * 24 * 60 * 60 // 1 day in seconds
  },

  callbacks: {
    /**
     * Controls if a user is allowed to sign in.
     * This is the gatekeeper. Database logic should be minimal here.
     */
    async signIn ({ account, profile }) {
      if (account?.provider === 'google') {
        // For Google, we allow sign-in if the email is verified.
        // The actual user creation/lookup is handled in the `jwt` callback.
        const googleProfile = profile as { email_verified?: boolean }
        if (googleProfile?.email_verified) {
          console.log(`🚪 [SignIn] Allowing verified Google user: ${profile?.email}`)
          return true
        }
        console.log(`🚪 [SignIn] Denying unverified Google user: ${profile?.email}`)
        return '/auth/error?error=EmailNotVerified' // Redirect to an error page
      }
      // For credentials, the `authorize` function already did the validation.
      console.log('🚪 [SignIn] Allowing credentials user.')
      return true
    },

    /**
     * This is the core callback for managing the session token.
     * It runs on every session check, but we only perform DB actions on the initial sign-in.
     */
    async jwt ({ token, user, account, trigger }) {
      // The `user` and `account` objects are only passed on the initial sign-in.
      if (account && user) {
        console.log(`🔄 [JWT] Initial sign-in with provider: ${account.provider}`)

        try {
          await connectToDatabase()
          let dbUser = await User.findOne({ email: user.email?.toLowerCase() })

          // If user doesn't exist and the provider is Google, create a new user.
          if (!dbUser && account.provider === 'google') {
            console.log(`🆕 [JWT] User not found. Creating new Google user for: ${user.email}`)
            const creationResult = await createUserWithProfile({
              name: user.name || '',
              email: user.email || '',
              image: user.image || undefined,
              provider: 'google'
            })

             if (creationResult.success && creationResult.user) {
               dbUser = creationResult.user
               console.log(`✅ [JWT] New user created successfully: ${dbUser?.email}`)
             } else {
               throw new Error('Failed to create new user in JWT callback.')
             }
          }

           // If we have a user from the DB (either found or newly created), enrich the token.
           if (dbUser) {
             console.log(`👤 [JWT] Enriching token for user: ${dbUser.email}`)
             // This is the single source of truth for the token's user data.
             token.sub = dbUser._id.toString()
             token.email = dbUser.email
             token.roles = dbUser.roles || [dbUser.role || 'user']
             token.activeRole = dbUser.activeRole || dbUser.role || 'user'
             token.needsOnboarding = dbUser.needsOnboarding
             token.needsRoleSelection = dbUser.needsRoleSelection
             token.provider = account.provider
             token.subscriptionActive = !!dbUser.subscriptionActive
           } else {
             console.error('❌ [JWT] No user found in database after sign-in attempt')
             token.error = 'UserNotFound'
           }
        } catch (error) {
          console.error('❌ [JWT] Error during initial sign-in DB operations:', error)
          // Return a token with an error to handle it in the session or client-side
          token.error = 'SignInError'
          return token
        }
      }
      // Handle session updates (e.g., when session.update() is called)
      else if (trigger === 'update' && token.sub) {
        console.log(`🔄 [JWT] Session update triggered, refreshing user data from DB`)
        
        try {
          await connectToDatabase()
          const dbUser = await User.findById(token.sub)
          
          if (dbUser) {
            console.log(`👤 [JWT] Updating token with fresh user data: ${dbUser.email}`)
            token.roles = dbUser.roles || [dbUser.role || 'user']
            token.activeRole = dbUser.activeRole || dbUser.role || 'user'
            token.needsOnboarding = dbUser.needsOnboarding
            token.needsRoleSelection = dbUser.needsRoleSelection
            token.subscriptionActive = !!dbUser.subscriptionActive
          } else {
            console.error('❌ [JWT] User not found during session update')
          }
        } catch (error) {
          console.error('❌ [JWT] Error during session update:', error)
        }
      }

      // On subsequent requests, the token will already be populated. We just return it.
      // This is the key to preventing the infinite loop.
      return token
    },

    /**
     * This callback creates the session object that is sent to the client.
     * It should only read from the token and not perform DB lookups.
     */
    async session ({ session, token }) {
      if (token.sub && session.user) {
        // Transfer the enriched data from the JWT to the session object.
        session.user.id = token.sub
        session.user.roles = token.roles as string[]
        session.user.activeRole = token.activeRole as string
        session.user.needsOnboarding = token.needsOnboarding as boolean
        session.user.needsRoleSelection = token.needsRoleSelection as boolean
        session.user.provider = token.provider as string
        // Add subscriptionActive for subscription-gated routes in middleware
        ;(session.user as any).subscriptionActive = token.subscriptionActive as boolean
      } else {
        // If the token is missing critical data, the session is invalid.
        // This can be handled client-side by signing the user out.
        console.warn('📋 [Session] Token is missing `sub`. Session may be incomplete.')
      }
      
      return session
    },

    /**
     * Handles where the user is sent after an action.
     * A simpler implementation is more robust.
     */
    async redirect ({ url, baseUrl }) {
      console.log(`↪️ [Redirect] Attempting redirect. URL: ${url}, BaseURL: ${baseUrl}`)
      // Allows relative callback URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        return url
      }
      // For all other cases (e.g., after login), default to a safe page.
      // Your middleware should handle routing to onboarding/dashboard based on session flags.
      return `${baseUrl}/recommendation-collections`
    }
  },

  pages: {
    signIn: '/auth/signup', // Your custom sign-in page
    error: '/auth/error'    // Page to display authentication errors (e.g., EmailNotVerified)
  },

  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error(`🚨 NextAuth Error:`, { code, ...metadata })
    },
    warn(code) {
      console.warn(`⚠️ NextAuth Warning:`, code)
    }
  }
}
