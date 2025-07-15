import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;

  if (method !== 'GET') {
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }

  const replayId = parseInt(query.replayId as string, 10);

  if (isNaN(replayId)) {
    return res.status(400).json({ error: 'Invalid replayId' });
  }

  try {
    const prompts = await prisma.prompt.findMany({
      where: { replayId },
    });
    return res.status(200).json(prompts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch prompts' });
  }
}
