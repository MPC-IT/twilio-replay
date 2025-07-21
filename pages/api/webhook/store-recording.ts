import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { RecordingUrl, callerId, replayId, field } = req.body;

  if (!RecordingUrl || !callerId || !replayId || !field) {
    return res.status(400).send('<Response><Say>Missing data. Goodbye.</Say></Response>');
  }

  const validFields = [
    'firstNameRecordingUrl',
    'lastNameRecordingUrl',
    'companyRecordingUrl',
    'phoneRecordingUrl'
  ];

  if (!validFields.includes(field)) {
    return res.status(400).send(`<Response><Say>Invalid field ${field}. Goodbye.</Say></Response>`);
  }

  try {
    const replayIdNum = parseInt(replayId.toString(), 10);

    // Find existing usage or create it
    const existing = await prisma.usage.findFirst({
      where: {
        replayId: Number(replayIdNum),
        callerId,
      },
    });

    if (existing) {
      await prisma.usage.update({
        where: { id: Number(existing.id) },
        data: {
          [field]: RecordingUrl,
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.usage.create({
        data: {
          replayId: Number(replayIdNum),
          callerId,
          [field]: RecordingUrl,
          durationSeconds: 0, // Will be updated later
        },
      });
    }

    const VoiceResponse = require('twilio').twiml.VoiceResponse;
    const response = new VoiceResponse();
    response.say('Thank you.');
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(response.toString());
  } catch (err) {
    console.error(err);
    return res.status(500).send('<Response><Say>Internal error occurred. Goodbye.</Say></Response>');
  }
}
