import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const replays = await prisma.replay.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        prompts: true,
        recordings: true,
      },
    });

    const response = replays.map((replay) => {
      const promptMap = {
        firstName: replay.prompts.find(p => p.type === 'firstName')?.audioUrl || '',
        lastName: replay.prompts.find(p => p.type === 'lastName')?.audioUrl || '',
        company: replay.prompts.find(p => p.type === 'company')?.audioUrl || '',
        phone: replay.prompts.find(p => p.type === 'phone')?.audioUrl || '',
      };

      return {
        ...replay,
        prompts: promptMap,
      };
    });

    return res.status(200).json(response);
  }

  if (req.method === 'POST') {
    const { code, title, startTime, endTime } = req.body;

    try {
      const newReplay = await prisma.replay.create({
        data: {
          code: code.toString(),
          codeInt: parseInt(code),
          title,
          startTime: startTime ? new Date(startTime) : null,
          endTime: endTime ? new Date(endTime) : null,
          createdBy: session.user.email!,
        },
      });

      return res.status(201).json(newReplay);
    } catch (error) {
      console.error('Error creating replay:', error);
      return res.status(500).json({ message: 'Failed to create replay' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
