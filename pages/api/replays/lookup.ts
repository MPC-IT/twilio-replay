import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ message: 'Replay code is required' });
  }

  const replay = await prisma.replay.findUnique({
    where: { codeInt: Number(parseInt)(code, 10) },
  });

  if (!replay) {
    return res.status(404).json({ message: 'Replay not found' });
  }

  // Optional: Enforce scheduled access windows
  const now = new Date();
  if (replay.startTime && new Date(replay.startTime) > now) {
    return res.status(403).json({ message: 'Replay not yet available' });
  }
  if (replay.endTime && new Date(replay.endTime) < now) {
    return res.status(403).json({ message: 'Replay has expired' });
  }

  return res.status(200).json({
    title: replay.title,
    audioUrl: replay.audioUrl,
    date: replay.startTime?.toString() ?? null,
    phoneNumber: replay.phoneNumber ?? null,
  });
}
