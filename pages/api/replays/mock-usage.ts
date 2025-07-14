import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

// This mock endpoint seeds a fake usage record for a given replay ID
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const replayId = req.query.replayId;

  if (!replayId || Array.isArray(replayId)) {
    return res.status(400).json({ error: 'Missing or invalid replayId' });
  }

  const codeInt = parseInt(replayId, 10);
  if (isNaN(codeInt)) {
    return res.status(400).json({ error: 'replayId must be a number' });
  }

  // Ensure the replay exists
  let replay = await prisma.replay.findUnique({ where: { codeInt } });

  if (!replay) {
    replay = await prisma.replay.create({
      data: {
        codeInt,
        title: 'Mock Replay',
        startTime: null,
        endTime: null,
        createdBy: 'mock-seeder',
      },
    });
  }

  // Create mock usage record
  const usage = await prisma.usage.create({
    data: {
      replayId: Number(replay).id,
      callerId: '1234567890',
      durationSeconds: 280,
      firstNameRecordingUrl: 'https://example.com/first.wav',
      lastNameRecordingUrl: 'https://example.com/last.wav',
      companyRecordingUrl: 'https://example.com/company.wav',
      phoneRecordingUrl: 'https://example.com/phone.wav',
    },
  });

  res.status(200).json({ success: true, usage });
}
