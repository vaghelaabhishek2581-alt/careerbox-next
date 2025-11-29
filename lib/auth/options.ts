import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// This is a placeholder for your actual authOptions. 
// You should replace this with your real authentication configuration.
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        // Add your user authorization logic here
        const user = { id: '1', name: 'Test User', email: 'test@example.com', roles: ['institute'], ownedOrganizations: ['inst_123'] };

        if (user) {
          return user;
        } else {
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // The user object is available on initial sign-in
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
        token.ownedOrganizations = user.ownedOrganizations;
        token.activeRole = user.activeRole;
        token.needsOnboarding = user.needsOnboarding;
        token.needsRoleSelection = user.needsRoleSelection;
      }
      return token;
    },
    async session({ session, token }) {
      // The token object has the data we passed in the jwt callback
      if (session.user) {
        session.user.id = token.id as string;
        session.user.roles = token.roles as string[];
        session.user.ownedOrganizations = token.ownedOrganizations as string[];
        session.user.activeRole = token.activeRole as string | null;
        session.user.needsOnboarding = token.needsOnboarding as boolean;
        session.user.needsRoleSelection = token.needsRoleSelection as boolean;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
