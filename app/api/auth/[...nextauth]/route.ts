import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth/options'

console.log('🔧 NextAuth starting up in:', process.env.NODE_ENV, 'mode')

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
