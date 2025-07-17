// pages/api/replays/lookup-code.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { code } = req.query;

    if (!code || Array.isArray(code)) {
      return res.status(400).json({ error: 'Invalid replay code' });
    }

    const replay = await prisma.replay.findUnique({
      where: { codeInt: parseInt(code, 10) }
    });

    if (!replay) {
      return res.status(404).json({ error: 'Replay not found' });
    }

    return res.status(200).json({ replayId: replay.id });
  } catch (error) {
    console.error('Replay lookup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
