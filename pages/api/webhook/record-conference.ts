import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { Twilio } from 'twilio';
import { twiml } from 'twilio';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const VoiceResponse = twiml.VoiceResponse;
  const response = new VoiceResponse();

  const digits = req.body.Digits || req.query.Digits;
  if (!digits) {
    response.say('Invalid replay ID entered.');
    response.hangup();
    res.setHeader('Content-Type', 'text/xml');
    return res.status(400).send(response.toString());
  }

  const codeInt = parseInt(digits);
  if (isNaN(codeInt)) {
    response.say('Invalid code format.');
    response.hangup();
    res.setHeader('Content-Type', 'text/xml');
    return res.status(400).send(response.toString());
  }

  const replay = await prisma.replay.findFirst({
    where: { codeInt },
  });

  if (!replay) {
    response.say('Replay not found.');
    response.hangup();
    res.setHeader('Content-Type', 'text/xml');
    return res.status(404).send(response.toString());
  }

  response.say('Recording has started.');
  response.record({
    action: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook/upload-replay?replayId=${replay.id}`,
    method: 'POST',
    maxLength: 3600,
    transcribe: false,
    playBeep: true,
  });

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(response.toString());
}
