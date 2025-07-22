import { env } from 'process';
import { PrismaClient } from '@prisma/client'

// Extend globalThis to cache the Prisma instance during development
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

// Create a new PrismaClient or reuse the existing one
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'], // You can remove this line if you don’t want query logs
  })

// Cache the Prisma client on the global object in development
if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
