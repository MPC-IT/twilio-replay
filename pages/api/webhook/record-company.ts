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
    res.type('text/xml').send(voiceResponse.toString());
    return;
  }

  const replay = await prisma.replay.findFirst({
    where: { codeInt: parseInt(digits) },
  });

  if (!replay) {
    voiceResponse.say('Replay not found.');
    res.type('text/xml').send(voiceResponse.toString());
    return;
  }

  // Update or create usage with last name recording
  await prisma.usage.upsert({
    where: {
      replayId_callerId: {
        replayId: replay.id,
        callerId,
      },
    },
    update: {
      callerCompany: recordingUrl,
    },
    create: {
      replayId: replay.id,
      callerId,
      callerCompany: recordingUrl,
      durationSeconds: 0,
    },
  });

  // Prompt for company name
  voiceResponse.say('Thank you. Please say your company name after the beep. Then press the pound sign.');

  voiceResponse.record({
    action: `/api/webhook/record-phone?Digits=${digits}&callerId=${encodeURIComponent(callerId)}`,
    method: 'POST',
    finishOnKey: '#',
    maxLength: 10,
    trim: 'trim-silence',
  });

  res.type('text/xml').send(voiceResponse.toString());
}
