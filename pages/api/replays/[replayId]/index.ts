import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { replayId },
    method,
  } = req;

  const id = parseInt(replayId as string, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid replay ID' });
  }

  switch (method) {
    case 'GET':
      try {
        const replay = await prisma.replay.findUnique({
          where: { id },
          include: {
            recordings: true,
            prompts: true,
          },
        });

        if (!replay) {
          return res.status(404).json({ error: 'Replay not found' });
        }

        res.status(200).json(replay);
      } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve replay' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
