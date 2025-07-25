import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import formidable, { IncomingForm } from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Server-side only
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { replayId } = req.query;
  const codeInt = parseInt(replayId as string);
  if (!codeInt) return res.status(400).json({ error: 'Invalid replay ID' });

  const form = new IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.audio) {
      return res.status(400).json({ error: 'Missing audio file' });
    }

    const file = Array.isArray(files.audio) ? files.audio[0] : files.audio;
    const filePath = file.filepath;
    const fileBuffer = fs.readFileSync(filePath);
    const filename = `recordings/${codeInt}-recording.mp3`;

    // Upload to Supabase
    const { error: uploadError } = await supabase.storage
      .from('recordings')
      .upload(filename, fileBuffer, {
        upsert: true,
        contentType: 'audio/mpeg',
      });

    if (uploadError) {
      return res.status(500).json({ error: 'Failed to upload to Supabase' });
    }

    const { data: urlData } = supabase.storage.from('recordings').getPublicUrl(filename);
    const publicUrl = urlData.publicUrl;

    // Save to database
    try {
      const replay = await prisma.replay.findUnique({ where: { codeInt } });
      if (!replay) return res.status(404).json({ error: 'Replay not found' });

      await prisma.recording.upsert({
        where: { replayId: replay.id },
        update: { audioUrl: publicUrl },
        create: {
          replayId: replay.id,
          audioUrl: publicUrl,
          label: 'Main Recording',
        },
      });

      return res.status(200).json({ message: 'Recording uploaded successfully', url: publicUrl });
    } catch (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
  });
}
