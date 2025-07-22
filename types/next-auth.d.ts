import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: number;
      email: string;
      name?: string;
      isAdmin: boolean;
      isSuspended: boolean;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: number;
    email: string;
    name?: string;
    isAdmin: boolean;
    isSuspended: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: number;
    email?: string;
    name?: string;
    isAdmin: boolean;
    isSuspended: boolean;
  }
}
