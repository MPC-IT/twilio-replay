import type { NextApiRequest, NextApiResponse } from 'next';
import { twiml } from 'twilio';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { replayId, callerId } = req.query;

  const response = new twiml.VoiceResponse();

  if (!replayId || !callerId) {
    response.say('Missing replay information. Goodbye.');
    response.hangup();
    res.setHeader('Content-Type', 'text/xml');
    return res.status(400).send(response.toString());
  }

  response.say('Please say your phone number after the beep.');

  response.record({
    action: `/api/webhook/store-recording?replayId=${replayId}&callerId=${encodeURIComponent(
      callerId as string
    )}&field=phoneRecordingUrl`,
    method: 'POST',
    maxLength: 10,
    timeout: 5,
    playBeep: true,
    trim: 'do-not-trim',
    recordingStatusCallback: `/api/webhook/play-replay?replayId=${replayId}`,
    recordingStatusCallbackMethod: 'POST',
  });

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(response.toString());
}
