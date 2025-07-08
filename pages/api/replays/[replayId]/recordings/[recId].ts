import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { recId } = req.query;
    const { transcription } = req.body;
    console.log(`Saved transcription for ${recId}:`, transcription);
    res.status(200).json({ success: true });
  } else {
    res.status(405).end();
  }
}
