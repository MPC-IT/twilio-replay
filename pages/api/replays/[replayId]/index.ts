import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { replayId } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  if (!replayId || typeof replayId !== 'string') {
    return res.status(400).json({ message: 'Invalid or missing replayId' })
  }

  try {
    const replay = await prisma.replay.findUnique({
      where: { id: replayId },
      include: {
        recordings: true,
        prompts: true,
        usageRecords: true,
      },
    })

    if (!replay) {
      return res.status(404).json({ message: 'Replay not found' })
    }

    // Convert prompts array into a key-value map
    const promptMap: Record<string, string> = {}
    replay.prompts?.forEach((prompt) => {
      promptMap[prompt.type] = prompt.audioUrl
    })

    res.status(200).json({
      ...replay,
      prompts: {
        firstName: promptMap['firstName'] || '',
        lastName: promptMap['lastName'] || '',
        company: promptMap['company'] || '',
        phone: promptMap['phone'] || '',
      },
    })
  } catch (error) {
    console.error('❌ Error fetching replay:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
