import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      roles?: string[];
      activeRole?: string;
      needsRoleSelection?: boolean;
      needsOnboarding?: boolean;
      provider?: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    roles?: string[];
    activeRole?: string;
    needsRoleSelection?: boolean;
    needsOnboarding?: boolean;
    provider?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    roles?: string[];
    activeRole?: string;
    needsRoleSelection?: boolean;
    needsOnboarding?: boolean;
    provider?: string;
  }
}