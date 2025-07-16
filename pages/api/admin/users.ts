import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Allow', ['GET', 'POST']);

  try {
    if (req.method === 'GET') {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      return res.status(200).json(users);
    }

    if (req.method === 'POST') {
      const { name, email, password, isAdmin = false, role = 'user' } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const passwordHash = await hashPassword(password);

      await prisma.user.create({
        data: {
          name,
          email,
          password: passwordHash,
          isAdmin,
          role,
          isSuspended: false,
        },
      });

      return res.status(201).json({ success: true });
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error('User API error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
