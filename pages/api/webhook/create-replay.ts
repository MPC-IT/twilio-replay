// pages/api/webhook/create-replay.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { twiml } from 'twilio';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const voiceResponse = new twiml.VoiceResponse();

  if (req.method !== 'POST') {
    // Prompt for a 5-digit Replay ID
    const gather = voiceResponse.gather({
      numDigits: 5,
      action: '/api/webhook/create-replay',
      method: 'POST',
      finishOnKey: '#',
    });

    gather.say('Please enter your five digit replay code, followed by the pound sign.');
    res.type('text/xml').send(voiceResponse.toString());
    return;
  }

  const digits = req.body.Digits;

  if (!digits || isNaN(parseInt(digits))) {
    voiceResponse.say('Invalid replay code. Please try again.');
    voiceResponse.redirect('/api/webhook/create-replay');
    res.type('text/xml').send(voiceResponse.toString());
    return;
  }

  const replay = await prisma.replay.findFirst({
    where: { codeInt: parseInt(digits) }
  });

  if (!replay) {
    voiceResponse.say('Replay not found. Please check your code and try again.');
    voiceResponse.redirect('/api/webhook/create-replay');
    res.type('text/xml').send(voiceResponse.toString());
    return;
  }

  // Valid Replay code entered
  voiceResponse.say('Thank you. Your conference is now being recorded.');
  voiceResponse.redirect(`/api/webhook/record-conference?replayId=${replay.id}`);

  res.type('text/xml').send(voiceResponse.toString());
}
