export const dynamic = 'force-dynamic';

import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const { db } = await connectToDatabase();
          const user = await db.collection('users').findOne({ email: credentials.email });

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) {
            return null;
          }

          // Update last login
          await db.collection('users').updateOne(
            { _id: user._id },
            { $set: { lastLogin: new Date() } }
          );

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            roles: user.roles || [],
            activeRole: user.activeRole || null,
            needsRoleSelection: user.needsRoleSelection || false,
            needsOnboarding: user.needsOnboarding || false,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.roles = user.roles;
        token.activeRole = user.activeRole;
        token.needsRoleSelection = user.needsRoleSelection;
        token.needsOnboarding = user.needsOnboarding;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub!;
        session.user.roles = token.roles as string[];
        session.user.activeRole = token.activeRole as string;
        session.user.needsRoleSelection = token.needsRoleSelection as boolean;
        session.user.needsOnboarding = token.needsOnboarding as boolean;
        session.user.provider = token.provider as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          const { db } = await connectToDatabase();
          
          const existingUser = await db.collection('users').findOne({ email: user.email });
          
          if (!existingUser) {
            // Create new user with Google account
            const newUser = await db.collection('users').insertOne({
              email: user.email,
              name: user.name,
              image: user.image,
              provider: 'google',
              roles: [],
              activeRole: null,
              needsOnboarding: true,
              needsRoleSelection: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            user.id = newUser.insertedId.toString();
            user.needsOnboarding = true;
            user.roles = [];
            user.activeRole = null;
            user.needsRoleSelection = false;
          } else {
            user.id = existingUser._id.toString();
            user.roles = existingUser.roles || [];
            user.activeRole = existingUser.activeRole || null;
            user.needsOnboarding = existingUser.needsOnboarding || false;
            user.needsRoleSelection = existingUser.needsRoleSelection || false;
          }
        } catch (error) {
          console.error('Google sign-in error:', error);
          return false;
        }
      }
      return true;
    }
  },
  pages: {
    signIn: '/auth/signup',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };