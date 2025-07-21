import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { twiml } from 'twilio';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { replayId } = req.query;
  const response = new twiml.VoiceResponse();

  if (!replayId) {
    response.say('Missing replay ID. Goodbye.');
    response.hangup();
    res.setHeader('Content-Type', 'text/xml');
    return res.status(400).send(response.toString());
  }

  const id = parseInt(replayId as string, 10);
  const replay = await prisma.replay.findFirst({
    where: { replayId: Number(id) },
  });

  if (!replay) {
    response.say('Replay not found.');
    response.hangup();
    res.setHeader('Content-Type', 'text/xml');
    return res.status(404).send(response.toString());
  }

  const now = new Date();
  if (replay.endTime < now) {
    response.say('This replay has expired and is no longer available.');
    response.hangup();
    res.setHeader('Content-Type', 'text/xml');
    return res.status(403).send(response.toString());
  }

  const recording = await prisma.recording.findFirst({
    where: { replayId: Number(id) },
  });

  if (!recording?.audioUrl) {
    response.say('The requested replay is not yet available.');
    response.hangup();
    res.setHeader('Content-Type', 'text/xml');
    return res.status(404).send(response.toString());
  }

  response.say('Please hold while we play back your replay.');
  response.play(recording.audioUrl);
  response.say('The replay has ended. Thank you for calling.');
  response.hangup();

  res.setHeader('Content-Type', 'text/xml');
  return res.status(200).send(response.toString());
}
