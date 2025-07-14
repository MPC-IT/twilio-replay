import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const replayId = parseInt(req.query.replayId as string, 10);

  if (!replayId || isNaN(replayId)) {
    return res.status(400).json({ error: 'Invalid replay ID' });
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.recording.deleteMany({
        where: { replayId },
      });

      return res.status(200).json({ message: 'Recording deleted' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to delete recording' });
    }
  }

  return res.status(405).json({ error: `Method '${req.method}' not allowed.` });
}
