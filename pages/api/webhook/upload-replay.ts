import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const recordingUrl = req.body.RecordingUrl || req.query.RecordingUrl;
  const replayId = parseInt(req.query.replayId as string);

  if (!recordingUrl || isNaN(replayId)) {
    return res.status(400).json({ error: 'Missing recording URL or replayId.' });
  }

  const publicUrl = `${recordingUrl}.mp3`;

  try {
    await prisma.recording.upsert({
      where: { replayId },
      update: {
        audioUrl: publicUrl,
        label: 'Conference Recording',
      },
      create: {
        replayId,
        audioUrl: publicUrl,
        label: 'Conference Recording',
      },
    });

    return res.status(200).json({ message: 'Recording uploaded.' });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Failed to upload replay recording.' });
  }
}
