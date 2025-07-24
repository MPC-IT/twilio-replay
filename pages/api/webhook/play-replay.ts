import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { twiml } from 'twilio';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const VoiceResponse = twiml.VoiceResponse;
  const response = new VoiceResponse();

  const digits = req.body.Digits || req.query.Digits;
  const codeInt = parseInt(digits);

  if (isNaN(codeInt)) {
    response.say('Invalid replay ID entered.');
    response.hangup();
    res.setHeader('Content-Type', 'text/xml');
    return res.status(400).send(response.toString());
  }

  const replay = await prisma.replay.findUnique({
    where: { codeInt },
    include: { 
      recordings: true, 
    },
  });

  const recording: { audioUrl: string } | undefined = replay?.recordings?.[0];

  if (!recording?.audioUrl) {
    response.say('The requested replay is not yet available.');
    response.hangup();
    res.setHeader('Content-Type', 'text/xml');
    return res.status(404).send(response.toString());
  }

  response.say('Please hold while your replay begins.');
  response.play(recording.audioUrl);
  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(response.toString());
}
