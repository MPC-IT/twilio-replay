// pages/api/webhook/play-replay.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { twiml } from 'twilio';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const voiceResponse = new twiml.VoiceResponse();

  const digits = req.query.Digits as string;

  if (!digits || isNaN(parseInt(digits))) {
    voiceResponse.say('Invalid input. Ending the call.');
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(voiceResponse.toString());
    return;
  }

  const replay = await prisma.replay.findFirst({
    where: { codeInt: parseInt(digits) },
    include: { recordings: true },
  });

  if (!replay || replay.recordings.length === 0) {
    voiceResponse.say('No conference recording is available at this time.');
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(voiceResponse.toString());
    return;
  }

  const mainRecording = replay.recordings[0]; // Optional: choose based on name/type later

  voiceResponse.say('Now playing the recorded conference.');
  voiceResponse.play(mainRecording.audioUrl);

  // Optional farewell message
  voiceResponse.say('Thank you for listening. Goodbye.');
  voiceResponse.hangup();

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(voiceResponse.toString());
}
