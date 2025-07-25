import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import formidable from 'formidable';
import fs from 'fs';
import { IncomingForm } from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // use service role key for upload
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { replayId } = req.query;
  const replayCode = parseInt(replayId as string);
  if (!replayCode) return res.status(400).json({ error: 'Invalid replay ID' });

  const form = new IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.audio || !fields.type) {
      return res.status(400).json({ error: 'Missing audio file or prompt type' });
    }

    const promptType = fields.type.toString();
    const file = Array.isArray(files.audio) ? files.audio[0] : files.audio;

    const filePath = file.filepath;
    const fileBuffer = fs.readFileSync(filePath);
    const filename = `prompts/${replayCode}-${promptType}.mp3`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('prompts')
      .upload(filename, fileBuffer, {
        upsert: true,
        contentType: 'audio/mpeg',
      });

    if (uploadError) {
      return res.status(500).json({ error: 'Failed to upload to Supabase' });
    }

    const { data: urlData } = supabase.storage.from('prompts').getPublicUrl(filename);
    const publicUrl = urlData.publicUrl;

    // Upsert into Prompt table
    try {
      const replay = await prisma.replay.findUnique({ where: { codeInt: replayCode } });
      if (!replay) return res.status(404).json({ error: 'Replay not found' });

      await prisma.prompt.upsert({
        where: {
          replayId_type: {
            replayId: replay.id,
            type: promptType,
          },
        },
        update: {
          audioUrl: publicUrl,
        },
        create: {
          replayId: replay.id,
          type: promptType,
          audioUrl: publicUrl,
        },
      });

      return res.status(200).json({ message: 'Prompt uploaded successfully', url: publicUrl });
    } catch (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
  });
}
