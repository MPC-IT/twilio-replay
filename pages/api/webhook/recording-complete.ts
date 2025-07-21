import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { twiml } from 'twilio';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const response = new twiml.VoiceResponse();

  const { replayId } = req.query;

  if (!replayId || typeof replayId !== 'string') {
    response.say('Missing replay ID. Goodbye.');
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(response.toString());
    return;
  }

  const {
    RecordingUrl,
    RecordingDuration,
    RecordingSid,
    RecordingStartTime
  } = req.body;

  if (!RecordingUrl || !RecordingSid) {
    response.say('Recording failed or was not received. Goodbye.');
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(response.toString());
    return;
  }

  try {
    await prisma.recording.create({
      data: {
        replayId: Number(replayId),
        audioUrl: `${RecordingUrl}.mp3`,
      },
    });

    response.say('Recording saved successfully. Goodbye.');
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(response.toString());
  } catch (error) {
    console.error('❌ Failed to save recording:', error);
    response.say('There was a problem saving your recording. Goodbye.');
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(response.toString());
  }
}
