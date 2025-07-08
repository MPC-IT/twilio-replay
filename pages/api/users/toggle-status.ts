// pages/api/users/toggle-status.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing user ID' });

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const updated = await prisma.user.update({
    where: { id },
    data: { isSuspended: !user.isSuspended },
  });

  res.status(200).json(updated);
}
