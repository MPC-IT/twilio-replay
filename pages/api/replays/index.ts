import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const replays = await prisma.replay.findMany({
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(replays);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch replays', error: err });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
