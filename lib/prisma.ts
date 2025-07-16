// lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import '@/types/global' // Ensures process.env typings are available globally

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'], // Useful for debugging, remove or limit in production
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
