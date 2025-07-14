import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: Number(true),
        fullName: true,
        email: true,  // <-- change here from email to email
        role: true,
        isSuspended: true,
      },
      orderBy: { fullName: 'asc' },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}
