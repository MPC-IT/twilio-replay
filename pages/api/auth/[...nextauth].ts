import { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import * as bcryptjs from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password || user.isSuspended) return null;

        const isValid = bcryptjs.compareSync(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
          isSuspended: user.isSuspended,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
        token.isSuspended = user.isSuspended;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;
        session.user.isSuspended = token.isSuspended;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

export default NextAuth(authOptions);