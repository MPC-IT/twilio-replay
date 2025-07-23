import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { replayId } = req.query;

  if (typeof replayId !== 'string') {
    return res.status(400).json({ error: 'Invalid replay ID' });
  }

  const { title, company, startTime, endTime, notes } = req.body;

  try {
    const updated = await prisma.replay.update({
      where: { id: parseInt(replayId, 10) },
      data: {
        title,
        notes,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        company,
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating replay:', error);
    res.status(500).json({ error: 'Failed to update replay' });
  }
}
