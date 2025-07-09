import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { twiml } from 'twilio';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const voiceResponse = new twiml.VoiceResponse();

  const digits = req.query.Digits as string;
  const callerId = req.query.callerId as string;
  const recordingUrl = req.body.RecordingUrl as string;

  if (!digits || !callerId || !recordingUrl) {
    voiceResponse.say('Missing information. Ending the call.');
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(voiceResponse.toString());
    return;
  }

  const replay = await prisma.replay.findFirst({
    where: { codeInt: parseInt(digits) },
  });

  if (!replay) {
    voiceResponse.say('Replay not found.');
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(voiceResponse.toString());
    return;
  }

  await prisma.usage.upsert({
    where: {
      replayId_callerId: {
        replayId: replay.id,
        callerId,
      },
    },
    update: {
      callerPhone: recordingUrl,
    },
    create: {
      replayId: replay.id,
      callerId,
      callerPhone: recordingUrl,
      durationSeconds: 0,
    },
  });

  voiceResponse.say('Thank you. Please hold while we play the recording.');
  voiceResponse.redirect(`/api/webhook/play-replay?Digits=${digits}`);

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(voiceResponse.toString());
}
