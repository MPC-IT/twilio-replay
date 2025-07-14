import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { replayId } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const id = parseInt(replayId as string, 10)
  if (isNaN(id)) {
    return res.status(400).json({ message: 'Invalid replayId' })
  }

  try {
    const replay = await prisma.replay.findUnique({
      where: { codeInt: Number(id) },
      include: {
        prompts: true,
        recordings: true,
        usageRecords: true,
      },
    })

    if (!replay) {
      return res.status(404).json({ message: 'Replay not found' })
    }

    // Convert prompts array to key-value map
    const promptMap: Record<string, string> = {}
    replay.prompts.forEach((p) => {
      if (p.type && p.recordingUrl) {
        promptMap[p.type] = p.recordingUrl
      }
    })

    return res.status(200).json({
      ...replay,
      prompts: promptMap,
    })
  } catch (error: any) {
    console.error('Replay fetch error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
