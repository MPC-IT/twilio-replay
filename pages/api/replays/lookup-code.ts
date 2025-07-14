// File: pages/api/replays/lookup.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;

  if (!code || typeof code !== 'string' || isNaN(parseInt(code))) {
    return res.status(400).json({ error: 'Missing or invalid replay code' });
  }

  try {
    const replay = await prisma.replay.findFirst({
      where: { codeInt: Number(parseInt)(code) }
    });

    if (!replay) {
      return res.status(404).json({ error: 'Replay not found' });
    }

    return res.status(200).json({ replayId: Number(replay).id });
  } catch (error) {
    console.error('Replay lookup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
