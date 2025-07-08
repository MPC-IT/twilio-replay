// pages/api/usage.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ message: 'Unauthorized' });

  const { replayId, startDate, endDate } = req.query;

  try {
    const filters: any = {};
    if (replayId) filters.replayId = replayId;
    if (startDate && endDate) {
      filters.accessedAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const logs = await prisma.usage.findMany({
      where: filters,
      orderBy: { accessedAt: 'desc' },
    });

    res.status(200).json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
}
