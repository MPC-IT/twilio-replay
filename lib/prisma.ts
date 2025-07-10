// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// This type assertion ensures global.prisma is typed correctly
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Optional: helpful log
if (!globalForPrisma.prisma) {
  console.log('Creating new PrismaClient instance');
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'], // optional, useful for debugging DB issues
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
