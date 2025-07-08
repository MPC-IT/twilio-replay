// pages/api/webhook/start-replay.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { twiml } from 'twilio';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const voiceResponse = new twiml.VoiceResponse();

  if (req.method === 'POST') {
    const digits = req.body.Digits;
    const callerId = req.body.From || '';

    if (!digits || isNaN(parseInt(digits))) {
      voiceResponse.say('Invalid input. Please enter a numeric replay ID followed by the pound sign.');
      voiceResponse.redirect('/api/webhook/start-replay');
      res.type('text/xml').send(voiceResponse.toString());
      return;
    }

    const replay = await prisma.replay.findFirst({
      where: { codeInt: parseInt(digits) }
    });

    if (!replay) {
      voiceResponse.say('Replay not found. Please check your code and try again.');
      voiceResponse.redirect('/api/webhook/start-replay');
      res.type('text/xml').send(voiceResponse.toString());
      return;
    }

    // Replay found — pass code and caller ID to next step
    voiceResponse.redirect(`/api/webhook/collect-participant?Digits=${digits}&callerId=${encodeURIComponent(callerId)}`);
    res.type('text/xml').send(voiceResponse.toString());
  } else {
    // Initial prompt for replay code
    const gather = voiceResponse.gather({
      numDigits: 10,
      action: '/api/webhook/start-replay',
      method: 'POST',
      finishOnKey: '#',
    });

    gather.say('Welcome to the replay system. Please enter your replay pin followed by the pound sign.');
    res.type('text/xml').send(voiceResponse.toString());
  }
}
