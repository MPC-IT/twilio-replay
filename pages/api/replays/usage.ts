import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { replayId, from, to } = req.query;

  if (typeof replayId !== 'string') {
    return res.status(400).json({ error: 'replayId query parameter required' });
  }

  try {
    const filters: any = {
      replayId,
    };

    if (from || to) {
      filters.accessedAt = {};
      if (typeof from === 'string') {
        filters.accessedAt.gte = new Date(from);
      }
      if (typeof to === 'string') {
        // add one day to 'to' date to include full day usage
        const toDate = new Date(to);
        toDate.setDate(toDate.getDate() + 1);
        filters.accessedAt.lte = toDate;
      }
    }

    const usageRecords = await prisma.usage.findMany({
      where: filters,
      orderBy: { accessedAt: 'desc' },
    });

    res.status(200).json(usageRecords);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch usage data' });
  }
}
