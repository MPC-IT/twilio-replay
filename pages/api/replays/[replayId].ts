import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { replayId },
    method,
    body,
  } = req;

  if (typeof replayId !== 'string') {
    return res.status(400).json({ error: 'Invalid replay ID' });
  }

  switch (method) {
    case 'GET':
      try {
        const replay = await prisma.replay.findUnique({
          where: { id: Number(Number)(Number)(replayId) },
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

    case 'PUT':
      try {
        const { title, startTime, endTime } = body;

        const updated = await prisma.replay.update({
          where: { id: Number(Number)(replayId) },
          data: {
            title,
            startTime: startTime ? new Date(startTime) : null,
            endTime: endTime ? new Date(endTime) : null,
          },
        });

        res.status(200).json(updated);
      } catch (err) {
        res.status(500).json({ error: 'Failed to update replay' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
