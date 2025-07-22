import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { verifyPassword } from '@/lib/bcrypt';
import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('🔐 Login attempt:', credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log('⛔ Missing email or password');
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          console.log('⛔ User not found or no password set');
          return null;
        }

        const isValid = await verifyPassword(credentials.password, user.password);
        console.log('🔑 Password valid:', isValid);

        if (!isValid) {
          console.log('⛔ Invalid password for:', credentials.email);
          return null;
        }

        console.log('✅ Login successful for:', user.email);

        return {
          id: Number(user.id),
          email: user.email,
          name: user.name || '',
          isAdmin: user.isAdmin,
          isSuspended: user.isSuspended,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin;
        token.isSuspended = user.isSuspended;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.isSuspended = token.isSuspended as boolean;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, authOptions);
}
