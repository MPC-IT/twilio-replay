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
        replayId: String(replayCode),
        [`caller${capitalize(steps[stepIndex - 1])}`]: recordingUrl,
        durationSeconds: 0, // updated later
      },
    });
  }

  // All done
  if (stepIndex >= steps.length) {
    const response = new twiml.VoiceResponse();
    response.say('Thank you. Your information has been recorded. The replay will begin shortly.');
    return res.status(200).type('text/xml').send(response.toString());
  }

  // Prompt for next info
  const response = new twiml.VoiceResponse();
  response.say(`Please state your ${steps[stepIndex]}. Press any key when done.`);
  response.record({
    action: `/api/webhook/record-prompt?replayCode=${replayCode}&step=${steps[stepIndex + 1]}`,
    method: 'POST',
    finishOnKey: '#',
    maxLength: 10,
  });

  return res.status(200).type('text/xml').send(response.toString());
}

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
