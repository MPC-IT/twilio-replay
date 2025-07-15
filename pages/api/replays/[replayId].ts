import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { replayId },
    method,
    body,
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

        if (!replay) return res.status(404).json({ error: 'Replay not found' });
        return res.status(200).json(replay);
      } catch (err) {
        return res.status(500).json({ error: 'Failed to retrieve replay' });
      }

    case 'PUT':
      try {
        const { title, startTime, endTime, promptOrder } = body;

        const updated = await prisma.replay.update({
          where: { id },
          data: {
            title,
            startTime: startTime ? new Date(startTime) : undefined,
            endTime: endTime ? new Date(endTime) : undefined,
            promptOrder: Array.isArray(promptOrder) ? promptOrder : undefined,
          },
        });

        return res.status(200).json(updated);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to update replay' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
