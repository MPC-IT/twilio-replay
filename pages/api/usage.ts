import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { replayId, startDate, endDate } = req.query;

    const filters: any = {};
    if (replayId) filters.replayId = parseInt(replayId as string);
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.gte = new Date(startDate as string);
      if (endDate) filters.createdAt.lte = new Date(endDate as string);
    }

    const usage = await prisma.usage.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(usage);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load usage records', error });
  }
}
