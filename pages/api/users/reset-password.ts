import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, password } = req.body;
  if (!id || !password) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const hashed = await new Promise<string>((resolve, reject) => {
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) reject(err);
        else resolve(hash);
      });
    });

    await prisma.user.update({
      where: { id },
      data: { password: hashed },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
}
