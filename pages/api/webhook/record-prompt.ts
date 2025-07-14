import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { twiml } from 'twilio';

const steps = ['firstName', 'lastName', 'company', 'phone'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { step, replayCode } = req.query;
  const recordingUrl = req.body.RecordingUrl;

  const stepIndex = steps.indexOf(step as string);

  // Save prior step’s recording
  if (stepIndex > 0 && recordingUrl && replayCode) {
    await prisma.usage.create({
      data: {
        replayId: Number(String)(replayCode),
        [`caller${capitalize(steps[stepIndex - 1])}`]: recordingUrl,
        durationSeconds: 0, // updated later
      },
    });
  }

  const response = new twiml.VoiceResponse();

  // All done
  if (stepIndex >= steps.length) {
    response.say('Thank you. Your information has been recorded. The replay will begin shortly.');
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(response.toString());
    return;
  }

  // Prompt for next info
  response.say(`Please state your ${steps[stepIndex]}. Press any key when done.`);
  response.record({
    action: `/api/webhook/record-prompt?replayCode=${replayCode}&step=${steps[stepIndex + 1]}`,
    method: 'POST',
    finishOnKey: '#',
    maxLength: 10,
  });

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(response.toString());
}

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
