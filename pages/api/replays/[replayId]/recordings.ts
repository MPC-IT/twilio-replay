import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { prisma } from '@/lib/prisma';
import { uploadToSupabase } from '@/lib/supabase';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ message: 'Form parsing error' });

    const replayId = parseInt(req.query.replayId as string);
    const file = files.audio as formidable.File;

    try {
      const audioUrl = await uploadToSupabase(file, `recordings/${replayId}.mp3`);
      await prisma.recording.create({
        data: {
          replayId,
          label: 'Main Recording',
          url: audioUrl,
        },
      });

      res.status(200).json({ audioUrl });
    } catch (err) {
      res.status(500).json({ message: 'Upload failed', error: err });
    }
  });
}
