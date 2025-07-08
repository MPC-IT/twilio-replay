// pages/api/healthcheck.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.status(200).json({ status: 'ok' })
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'DB unreachable' })
  }
}
