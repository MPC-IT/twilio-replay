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
    case 'PUT':
      try {
        const { startDate, endDate } = body;

        const updatedReplay = await prisma.replay.update({
          where: { id },
          data: {
            startTime: startDate ? new Date(startDate) : undefined,
            endTime: endDate ? new Date(endDate) : undefined,
          },
        });

        return res.status(200).json(updatedReplay);
      } catch (error) {
        console.error('Error updating replay:', error);
        return res.status(500).json({ error: 'Failed to update replay' });
      }

    default:
      res.setHeader('Allow', ['PUT']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
