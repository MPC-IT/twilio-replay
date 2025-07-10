import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/utils/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { replayId, callerId, type, recordingUrl } = req.body
    if (!replayId || !callerId || !type || !recordingUrl) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const response = await fetch(recordingUrl)
    const buffer = Buffer.from(await response.arrayBuffer())

    const ext = 'mp3'
    const filename = `usage/${replayId}/${callerId}_${type}_${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('replay-files')
      .upload(filename, buffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      })

    if (uploadError) {
      console.error(uploadError)
      return res.status(500).json({ message: 'Upload to Supabase failed' })
    }

    const { data: publicUrl } = supabase.storage.from('replay-files').getPublicUrl(filename)

    const columnMap: Record<string, keyof typeof updateData> = {
      firstName: 'firstNameRecordingUrl',
      lastName: 'lastNameRecordingUrl',
      company: 'companyRecordingUrl',
      phone: 'phoneRecordingUrl',
    }

    const column = columnMap[type]
    if (!column) return res.status(400).json({ message: 'Invalid prompt type' })

    const updateData: any = {
      [column]: publicUrl.publicUrl,
    }

    const existing = await prisma.usage.findFirst({
      where: { replayId: parseInt(replayId), callerId },
    })

    if (!existing) {
      await prisma.usage.create({
        data: {
          replayId: parseInt(replayId),
          callerId,
          durationSeconds: 0,
          ...updateData,
        },
      })
    } else {
      await prisma.usage.update({
        where: { id: existing.id },
        data: updateData,
      })
    }

    return res.status(200).json({ url: publicUrl.publicUrl })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
