import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

/**
 * Module augmentation for NextAuth session and user types
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: Number(number);
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string | null;
      fullName?: string | null;
      isAdmin: boolean;
      isSuspended: boolean;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: Number(number);
    role?: string | null;
    fullName?: string | null;
    isAdmin: boolean;
    isSuspended: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: Number(number);
    name?: string | null;
    email?: string | null;
    role?: string | null;
    isAdmin: boolean;
    isSuspended: boolean;
  }
}
