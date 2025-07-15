import type { NextApiRequest, NextApiResponse } from 'next';
import { twiml } from 'twilio';
import { prisma } from '@/lib/prisma';
 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { replayId } = req.query;
 
  if (!replayId || typeof replayId !== 'string') {
    return res.status(400).send('Missing or invalid replay ID');
  }
 
  const codeInt = parseInt(replayId, 10);
  if (isNaN(codeInt)) {
    return res.status(400).send('Invalid replay ID');
  }
 
  const replay = await prisma.replay.findUnique({
    where: { code: codeInt },
  });
 
  if (!replay) {
    return res.status(404).send('Replay not found');
  }
 
  const promptOrder = replay.promptOrder || ['firstName', 'lastName', 'company', 'phone'];
 
  // Determine which prompt to collect first based on what's already recorded (optional logic)
  const stepMap: Record<string, string> = {
    firstName: 'record-first-name',
    lastName: 'record-last-name',
    company: 'record-company',
    phone: 'record-phone',
  };
 
  const redirectTo = stepMap[promptOrder[0]] || 'record-first-name';
 
  const response = new twiml.VoiceResponse();
  response.redirect(`/api/webhook/${redirectTo}?replayId=${codeInt}`);
  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(response.toString());
}