import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { replayId } = req.query;
  if (!replayId) return res.status(400).send('Missing replayId');

  try {
    const usage = await prisma.usage.findMany({
      where: { replayId: parseInt(replayId as string) },
      orderBy: { createdAt: 'desc' },
    });

    const csv = [
      'Caller ID,First Name,Last Name,Company,Phone,Duration (sec),Created At',
      ...usage.map(u => [
        u.callerId,
        u.firstName ?? '',
        u.lastName ?? '',
        u.company ?? '',
        u.phone ?? '',
        u.durationSeconds,
        new Date(u.createdAt).toISOString(),
      ].join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="usage_${replayId}.csv"`);
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Failed to export usage', error: err });
  }
}
