import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ message: 'Unauthorized' });

  if (req.method === 'GET') {
    const { replayId, startDate, endDate } = req.query;

    try {
      const filters: any = {};
      if (replayId) filters.replayId = Number(replayId);
      if (startDate && endDate) {
        filters.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }

      const logs = await prisma.usage.findMany({
        where: filters,
        orderBy: { createdAt: 'desc' }, // ✅ corrected field
      });

      return res.status(200).json(logs);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal error' });
    }
  }

  if (req.method === 'PUT') {
    const { id, transcription } = req.body;
    if (!id || !transcription) {
      return res.status(400).json({ message: 'Missing transcription data' });
    }

    try {
      await prisma.usage.update({
        where: { id },
        data: {
          ...(transcription.firstName && { firstName: transcription.firstName }),
          ...(transcription.lastName && { lastName: transcription.lastName }),
          ...(transcription.company && { company: transcription.company }),
          ...(transcription.phone && { phone: transcription.phone }),
        },
      });

      return res.status(200).json({ message: 'Transcription saved' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to save transcription' });
    }
  }

  return res.status(405).end();
}
