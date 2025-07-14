import type { NextApiRequest, NextApiResponse } from 'next';
import { twiml } from 'twilio';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { Digits, callerId } = req.query;

  const replayId = Digits || req.body.Digits;
  const caller = callerId || req.body.From;

  const response = new twiml.VoiceResponse();

  if (!replayId || !caller) {
    response.say('Missing replay information. Goodbye.');
    response.hangup();
    res.setHeader('Content-Type', 'text/xml');
    return res.status(400).send(response.toString());
  }

  response.say('Please say your first name after the beep.');

  response.record({
    action: `/api/webhook/record-last-name?replayId=${replayId}&callerId=${encodeURIComponent(caller)}&field=firstNameRecordingUrl`,
    method: 'POST',
    maxLength: 10,
    timeout: 5,
    playBeep: true,
    trim: 'do-not-trim',
  });

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(response.toString());
}
