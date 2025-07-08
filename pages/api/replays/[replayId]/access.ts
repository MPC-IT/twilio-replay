import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { replayId } = req.query;

  if (req.method === 'POST') {
    const { startDate, endDate } = req.body;
    try {
      const replay = await prisma.replay.update({
        where: { id: replayId as string },
        data: {
          startTime: startDate ? new Date(startDate) : null,
          endTime: endDate ? new Date(endDate) : null,
        },
      });
      return res.status(200).json(replay);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to update replay dates' });
    }
  }

  if (req.method === 'GET') {
    try {
      const replay = await prisma.replay.findUnique({
        where: { id: replayId as string },
        select: { startTime: true, endTime: true },
      });
      return res.status(200).json(replay);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to fetch replay dates' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
