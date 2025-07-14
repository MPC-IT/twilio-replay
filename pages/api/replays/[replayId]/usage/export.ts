// pages/api/replays/[replayId]/usage/export.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { replayId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (typeof replayId !== 'string') {
    return res.status(400).json({ error: 'Invalid replay ID' });
  }

  try {
    const usageRecords = await prisma.usage.findMany({
      where: { replayId },
      orderBy: { createdAt: 'asc' },
    });

    const headers = [
      'Caller ID',
      'Created At',
      'First Name Transcription',
      'Last Name Transcription',
      'Company Transcription',
      'Phone Transcription',
    ];

    const rows = usageRecords.map(u => [
      u.callerId,
      format(new Date(u.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      u.transcriptionFirstName || '',
      u.transcriptionLastName || '',
      u.transcriptionCompany || '',
      u.transcriptionPhone || '',
    ]);

    const csvContent = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="replay-${replayId}-usage.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('CSV Export Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
