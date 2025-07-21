import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { replayId } = req.query;
  const id = parseInt(replayId as string);

  if (req.method === 'GET') {
    try {
      const replay = await prisma.replay.findUnique({
        where: { replayId: id },
        include: {
          prompts: true,
          recordings: true,
          usageRecords: true,
        },
      });
      if (!replay) return res.status(404).json({ message: 'Replay not found' });
      res.status(200).json(replay);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching replay', error: err });
    }
  }

  else if (req.method === 'PUT') {
    const { title, startTime, endTime, promptOrder } = req.body;

    try {
      const updated = await prisma.replay.update({
        where: { replayId: id },
        data: {
          title,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          promptOrder,
        },
      });
      res.status(200).json(updated);
    } catch (err) {
      res.status(500).json({ message: 'Error updating replay', error: err });
    }
  }

  else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
