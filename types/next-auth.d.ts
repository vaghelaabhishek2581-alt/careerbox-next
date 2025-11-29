import 'next-auth';
import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface User extends DefaultUser {
    roles?: string[];
    ownedOrganizations?: string[];
  }

  interface Session extends DefaultSession {
    user?: {
      id?: string;
      roles?: string[];
      ownedOrganizations?: string[];
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    roles?: string[];
    ownedOrganizations?: string[];
  }
}
