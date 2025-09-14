// export const dynamic = 'force-dynamic'

// import NextAuth, { AuthOptions } from 'next-auth'
// import GoogleProvider from 'next-auth/providers/google'
// import CredentialsProvider from 'next-auth/providers/credentials'
// import { connectToDatabase } from '@/lib/db/mongoose'
// import { User } from '@/src/models'
// import apiClient from '@/lib/api/client'

// // Validate environment variables
// console.log('🔧 NextAuth Environment Check:', {
//   hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
//   hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
//   hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
//   hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
//   nodeEnv: process.env.NODE_ENV
// })

// export const authOptions: AuthOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//       authorization: {
//         params: {
//           prompt: 'consent',
//           access_type: 'offline',
//           response_type: 'code'
//         }
//       }
//     }),
//     CredentialsProvider({
//       name: 'credentials',
//       credentials: {
//         email: { label: 'Email', type: 'email' },
//         password: { label: 'Password', type: 'password' }
//       },
//       async authorize (credentials) {
//         console.log('🔐 Credentials authorize called with:', { email: credentials?.email })
        
//         if (!credentials?.email || !credentials?.password) {
//           console.log('❌ Missing credentials')
//           return null
//         }

//         try {
//           console.log('📡 Making API call to /api/auth/login')
//           const response = await apiClient.post('/api/auth/login', {
//             email: credentials.email,
//             password: credentials.password
//           })

//           console.log('📡 API response:', { success: response.success })

//           if (!response.success) {
//             console.log('❌ API call failed')
//             return null
//           }

//           const userData = {
//             id: (response.data as any).user.id,
//             email: (response.data as any).user.email,
//             name: (response.data as any).user.name,
//             roles: (response.data as any).user.roles || [],
//             activeRole: (response.data as any).user.activeRole || null,
//             needsRoleSelection: (response.data as any).user.needsRoleSelection || false,
//             needsOnboarding: (response.data as any).user.needsOnboarding || false
//           }
          
//           console.log('✅ User authorized successfully:', userData)
//           return userData
//         } catch (error) {
//           console.error('❌ Auth error:', error)
//           return null
//         }
//       }
//     })
//   ],
//   session: {
//     strategy: 'jwt',
//     maxAge: 1 * 24 * 60 * 60, // 1 day
//     updateAge: 60 * 60 // Only update session once per hour instead of every 24 hours (default)
//   },
//   callbacks: {
//     async jwt ({ token, user, account }) {
//       console.log('🔄 JWT callback called with:', { 
//         hasAccount: !!account, 
//         hasUser: !!user, 
//         provider: account?.provider,
//         tokenSub: token.sub 
//       })
      
//       // If this is just a token refresh (no account or user), return early to prevent loops
//       if (!account && !user) {
//         console.log('🔄 JWT callback - token refresh only, returning early')
//         return token
//       }
      
//       if (account && user) {
//         const u = user as any
//         console.log('👤 JWT callback - user data:', {
//           id: u.id,
//           roles: u.roles,
//           activeRole: u.activeRole,
//           needsOnboarding: u.needsOnboarding,
//           needsRoleSelection: u.needsRoleSelection,
//           provider: account.provider
//         })
        
//         token.sub = (u.id as string) ?? token.sub
//         ;(token as any).roles = u.roles || []
//         ;(token as any).activeRole = u.activeRole ?? null
//         ;(token as any).needsRoleSelection = u.needsRoleSelection ?? false
//         ;(token as any).needsOnboarding = u.needsOnboarding ?? false
//         ;(token as any).provider = account.provider
//         ;(token as any).role = u.role || 'user'
        
//         console.log('✅ JWT token updated with user data')
//         return token
//       }

//       // Refresh flags from DB if needed
//       try {
//         const shouldRefresh =
//           (token as any).needsOnboarding === true ||
//           !(token as any).roles ||
//           (token as any).activeRole === undefined

//         console.log('🔄 Checking if token refresh needed:', { shouldRefresh })

//         if (shouldRefresh) {
//           console.log('🔄 Refreshing token from database')
//           await connectToDatabase()
//           let dbUser: any | null = null

//           if (token.sub) {
//             console.log('🔍 Looking up user by ID:', token.sub)
//             dbUser = await User.findById(token.sub)
//             console.log('🔍 User found by ID:', !!dbUser)
//           }

//           if (!dbUser && token.email) {
//             console.log('🔍 Looking up user by email:', token.email)
//             dbUser = await User.findOne({ email: token.email.toLowerCase() })
//             console.log('🔍 User found by email:', !!dbUser)
//           }

//           if (dbUser) {
//             console.log('✅ Updating token with fresh user data:', {
//               id: dbUser._id?.toString(),
//               roles: dbUser.roles,
//               activeRole: dbUser.activeRole,
//               needsOnboarding: dbUser.needsOnboarding,
//               needsRoleSelection: dbUser.needsRoleSelection
//             })
            
//             token.sub = dbUser._id?.toString?.() ?? token.sub
//             ;(token as any).roles = dbUser.roles || [dbUser.role]
//             ;(token as any).activeRole = dbUser.activeRole ?? dbUser.role ?? null
//             ;(token as any).needsRoleSelection = dbUser.needsRoleSelection ?? false
//             ;(token as any).needsOnboarding = dbUser.needsOnboarding ?? false
//           } else {
//             console.log('❌ No user found in database for token refresh')
//           }
//         }
//       } catch (e) {
//         console.error('❌ JWT refresh error:', e)
//       }

//       console.log('🔄 JWT callback returning token')
//       return token
//     },
//     async session ({ session, token }) {
//       console.log('📋 Session callback called with token:', {
//         sub: token.sub,
//         roles: token.roles,
//         activeRole: token.activeRole,
//         needsOnboarding: token.needsOnboarding,
//         needsRoleSelection: token.needsRoleSelection,
//         provider: token.provider
//       })
      
//       if (session?.user) {
//         session.user.id = token.sub!
//         session.user.roles = token.roles as string[]
//         session.user.activeRole = token.activeRole as string
//         session.user.needsRoleSelection = token.needsRoleSelection as boolean
//         session.user.needsOnboarding = token.needsOnboarding as boolean
//         session.user.provider = token.provider as string
        
//         console.log('✅ Session updated with user data:', {
//           id: session.user.id,
//           email: session.user.email,
//           roles: session.user.roles,
//           activeRole: session.user.activeRole,
//           needsOnboarding: session.user.needsOnboarding,
//           needsRoleSelection: session.user.needsRoleSelection
//         })
//       }
      
//       console.log('📋 Session callback returning session')
//       return session
//     },
//     async signIn ({ user, account, profile }) {
//       console.log('🚪 SignIn callback called with:', {
//         provider: account?.provider,
//         userEmail: user.email,
//         userName: user.name
//       })
      
//       if (account?.provider === 'google') {
//         try {
//           console.log('🔍 Google sign-in attempt for:', user.email)
          
//           // Import the user creation utility
//           const { createUserWithProfile } = await import('@/lib/utils/user-creation')
//           await connectToDatabase()
          
//           // Check if user already exists using Mongoose
//           console.log('🔍 Checking if user exists in database')
//           const existingUser = await User.findOne({
//             email: user.email?.toLowerCase()
//           }).maxTimeMS(5000) // 5 second timeout
          
//           if (existingUser) {
//             console.log('✅ Existing user found:', user.email)
//             console.log('👤 User onboarding status:', {
//               needsOnboarding: existingUser.needsOnboarding,
//               needsRoleSelection: existingUser.needsRoleSelection,
//               activeRole: existingUser.activeRole,
//               roles: existingUser.roles
//             })
            
//             // Update user data in NextAuth session
//             const u = user as any
//             u.id = existingUser._id.toString()
//             u.roles = existingUser.roles || []
//             u.activeRole = existingUser.activeRole || null
//             u.needsOnboarding = existingUser.needsOnboarding || false
//             u.needsRoleSelection = existingUser.needsRoleSelection || false
//             u.provider = 'google'
//             u.role = existingUser.role || 'user'
            
//             console.log('✅ User data updated for existing user')
//             return true
//           }
          
//           // Create new user
//           console.log('🆕 Creating new user for:', user.email)
//           const result = await Promise.race([
//             createUserWithProfile({
//               name: user.name || '',
//               email: user.email || '',
//               provider: 'google',
//               image: user.image || undefined
//             }),
//             new Promise((_, reject) => 
//               setTimeout(() => reject(new Error('User creation timeout')), 10000)
//             )
//           ]) as any
          
//           if (result.success && result.user) {
//             console.log('✅ New user created successfully:', user.email)
//             console.log('👤 New user onboarding status:', {
//               needsOnboarding: result.user.needsOnboarding,
//               needsRoleSelection: result.user.needsRoleSelection,
//               activeRole: result.user.activeRole,
//               roles: result.user.roles
//             })
            
//             const u = user as any
//             u.id = result.user._id.toString()
//             u.roles = result.user.roles || []
//             u.activeRole = result.user.activeRole || null
//             u.needsOnboarding = result.user.needsOnboarding || false
//             u.needsRoleSelection = result.user.needsRoleSelection || false
//             u.provider = 'google'
//             u.role = result.user.role || 'user'
            
//             console.log('✅ User data updated for new user')
//             return true
//           } else {
//             console.error('❌ User creation failed:', result.error)
//             return false
//           }
//         } catch (error) {
//           console.error('❌ Google sign-in error:', error)
//           return false
//         }
//       }
      
//       console.log('✅ SignIn callback returning true for non-Google provider')
//       return true
//     },
//     async redirect ({ url, baseUrl }) {
//       // Use static URL cache to prevent repeated redirects to the same URL
//       const staticCache: Record<string, string> = {}
//       const cacheKey = `${url}:${baseUrl}`
      
//       if (staticCache[cacheKey]) {
//         return staticCache[cacheKey]
//       }
      
//       console.log('🔄 NextAuth redirect called with:', { url, baseUrl })
      
//       let redirectUrl = url
      
//       // Check if the redirect URL is to onboarding but user doesn't need onboarding
//       if (url.includes('/onboarding')) {
//         console.log('🔄 Redirect to onboarding detected, redirecting to dashboard')
//         // Always redirect to dashboard instead of onboarding to prevent loops
//         // The middleware will handle redirecting to onboarding if actually needed
//         redirectUrl = `${baseUrl}/dashboard`
//       }
//       // If redirecting to a relative path, prepend baseUrl
//       else if (url.startsWith('/')) {
//         console.log('🔄 Redirecting to relative path')
//         redirectUrl = `${baseUrl}${url}`
//       }
//       // If URL has same origin as baseUrl, allow it
//       else {
//         try {
//           if (new URL(url).origin === baseUrl) {
//             console.log('🔄 Redirecting to same origin URL')
//             redirectUrl = url
//           } else {
//             // Default fallback to dashboard for external URLs
//             console.log('🔄 External URL detected, redirecting to dashboard')
//             redirectUrl = `${baseUrl}/dashboard`
//           }
//         } catch (e) {
//           console.log('🔄 Invalid URL, using default redirect')
//           redirectUrl = `${baseUrl}/dashboard`
//         }
//       }
      
//       // Cache the result
//       staticCache[cacheKey] = redirectUrl
      
//       return redirectUrl
//     }
//   },
//   pages: {
//     signIn: '/auth/signup',
//     error: '/auth/error'
//   },
//   debug: process.env.NODE_ENV === 'development',
//   logger: {
//     error: (code, metadata) => {
//       console.error('🚨 NextAuth Error:', { code, metadata })
//     },
//     warn: (code) => {
//       console.warn('⚠️ NextAuth Warning:', code)
//     },
//     debug: (code, metadata) => {
//       console.log('🐛 NextAuth Debug:', { code, metadata })
//     }
//   }
// }

// const handler = NextAuth(authOptions)
// export { handler as GET, handler as POST }
export const dynamic = 'force-dynamic'

import NextAuth, { AuthOptions, Profile } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectToDatabase } from '@/lib/db/mongoose'
import { User } from '@/src/models' // Ensure this is the correct Mongoose model import
import { createUserWithProfile } from '@/lib/utils/user-creation' // Ensure this path is correct
import apiClient from '@/lib/api/client'

// Environment variable validation at startup
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing Google OAuth environment variables (GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)')
}
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Missing NEXTAUTH_SECRET environment variable')
}

console.log('🔧 NextAuth starting up in:', process.env.NODE_ENV, 'mode')

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
          const response = await apiClient.post('/api/auth/login', {
            email: credentials.email,
            password: credentials.password
          })

           if (response.success && (response.data as any)?.user) {
             console.log(`✅ [Authorize] User authenticated successfully: ${credentials.email}`)
             // The object returned here is passed to the `jwt` callback's `user` parameter
             return (response.data as any).user
           } else {
             console.log(`❌ [Authorize] API authentication failed for: ${credentials.email}`)
             return null
           }
        } catch (error) {
          console.error('❌ [Authorize] Credentials auth error:', error)
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
    async jwt ({ token, user, account }) {
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
      return `${baseUrl}/dashboard`
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

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
