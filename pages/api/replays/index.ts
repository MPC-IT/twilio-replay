import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const replays = await prisma.replay.findMany({
      include: {
        prompts: true,
        recordings: true,
        usageRecords: true,
      },
    })

    const response = replays.map((replay: {
      id: string
      prompts: { type: string; audioUrl: string }[]
      [key: string]: any
    }) => {
      const promptMap = {
        firstName: replay.prompts.find(p => p.type === 'firstName')?.audioUrl || '',
        lastName: replay.prompts.find(p => p.type === 'lastName')?.audioUrl || '',
        company: replay.prompts.find(p => p.type === 'company')?.audioUrl || '',
        phone: replay.prompts.find(p => p.type === 'phone')?.audioUrl || '',
      }

      return {
        ...replay,
        prompts: promptMap,
      }
    })

    res.status(200).json(response)
  } catch (error) {
    console.error('❌ Error fetching replays:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
