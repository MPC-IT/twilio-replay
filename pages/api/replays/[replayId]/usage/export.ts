import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { replayId } = req.query;
 
  if (!replayId || typeof replayId !== 'string') {
    return res.status(400).json({ error: 'Invalid replayId' });
  }
 
  try {
    const usageRecords = await prisma.usage.findMany({
      where: { replayId: Number(replayId) },
      orderBy: { createdAt: 'asc' },
    });
 
    const csvRows = [
      ['First Name', 'Last Name', 'Company', 'Phone', 'Duration (s)', 'Created At'],
      ...usageRecords.map((record) => [
        record.firstName ?? '',
        record.lastName ?? '',
        record.company ?? '',
        record.phone ?? '',
        record.durationSeconds?.toString() ?? '',
        format(new Date(record.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      ]),
    ];
 
    const csvContent = csvRows.map((row) => row.join(',')).join('\n');
 
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="usage-${replayId}.csv"`);
    res.status(200).send(csvContent);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Failed to generate CSV export' });
  }
}