import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { replayId } = req.query

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  if (!replayId || typeof replayId !== 'string') {
    return res.status(400).json({ message: 'Invalid replay ID' })
  }

  const form = formidable({
    uploadDir: path.join(process.cwd(), 'public', 'recordings'),
    keepExtensions: true,
    maxFileSize: 100 * 1024 * 1024, // 100 MB
  })

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: 'File upload failed', error: err.message })
    }

    const file = files.file?.[0] || files.recording?.[0]

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const fileName = path.basename(file.filepath)
    const audioUrl = `/recordings/${fileName}`

    try {
      await prisma.recording.upsert({
        where: { replayId: Number(replayId) },
        update: { audioUrl },
        create: {
          replayId: Number(replayId),
          label: 'Main Recording',
          audioUrl,
        },
      })

      res.status(200).json({ success: true, audioUrl })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Database error', error })
    }
  })
}
