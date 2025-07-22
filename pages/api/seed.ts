import type { NextApiRequest, NextApiResponse } from 'next';
import { runSeed } from '@/lib/seed';
 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ message: 'Forbidden in production' });
  }
 
  try {
    await runSeed();
    res.status(200).json({ message: 'Seed complete' });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Seed failed' });
  }
}
 