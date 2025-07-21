import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { twiml } from 'twilio';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { Digits, callerId } = req.query;
  const replayId = parseInt(Digits as string);

  const voiceResponse = new twiml.VoiceResponse();

  try {
    const replay = await prisma.replay.findFirst({ where: { codeInt: replayId } });
    if (!replay) throw new Error('Replay not found');

    await prisma.usage.create({
      data: {
        replayId: replay.id,
        callerId: callerId as string,
        durationSeconds: 0,
      },
    });

    voiceResponse.say('Please say your first name after the beep and then press the pound sign.');
    voiceResponse.record({
      action: `/api/webhook/record-last-name?Digits=${replayId}&callerId=${encodeURIComponent(callerId as string)}`,
      method: 'POST',
      maxLength: 10,
      finishOnKey: '#',
    });

    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(voiceResponse.toString());
  } catch (err) {
    console.error(err);
    voiceResponse.say('An error occurred. Please try again later.');
    res.setHeader('Content-Type', 'text/xml');
    res.status(500).send(voiceResponse.toString());
  }
}
