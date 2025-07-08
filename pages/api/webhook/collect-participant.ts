import type { NextApiRequest, NextApiResponse } from 'next';
import { twiml } from 'twilio';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const voiceResponse = new twiml.VoiceResponse();

  const digits = req.query.Digits as string;
  const callerId = req.query.callerId as string;

  if (!digits) {
    voiceResponse.say('Missing replay code. Returning to main menu.');
    voiceResponse.redirect('/api/webhook/start-replay');
    res.type('text/xml').send(voiceResponse.toString());
    return;
  }

  // Start the participant info collection flow with First Name
  voiceResponse.say('Please say your first name after the beep. Then press the pound sign.');

  voiceResponse.record({
    action: `/api/webhook/record-last-name?Digits=${digits}&callerId=${encodeURIComponent(callerId)}`,
    method: 'POST',
    finishOnKey: '#',
    maxLength: 10,
    trim: 'trim-silence',
  });

  res.type('text/xml').send(voiceResponse.toString());
}
