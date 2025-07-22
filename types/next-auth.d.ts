import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      name: string;
      email: string;
      isAdmin: boolean;
      isSuspended: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: number;
    isAdmin: boolean;
    isSuspended: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    name: string;
    email: string;
    isAdmin: boolean;
    isSuspended: boolean;
  }
}
