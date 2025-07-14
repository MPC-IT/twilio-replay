// pages/api/upload-replay.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { uploadReplayRecording } from '@/utils/supabase';
import { prisma } from '@/lib/prisma';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Upload failed' });

    const replayId = fields.replayId?.toString();
    const file = files.file?.[0];

    if (!replayId || !file) return res.status(400).json({ error: 'Missing replay ID or file' });

    const buffer = fs.readFileSync(file.filepath);
    const filename = `${replayId}.mp3`;

    try {
      const publicUrl = await uploadReplayRecording(buffer, filename);

      // Save to Recording table
      await prisma.recording.upsert({
        where: { replayId: parseInt(replayId, 10) },
        update: { url: publicUrl },
        create: {
          id: replayId,
          replayId: parseInt(replayId, 10),
          label: 'Main Conference Recording',
          url: publicUrl,
        },
      });

      return res.status(200).json({ message: 'Upload successful', url: publicUrl });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to upload to Supabase' });
    }
  });
}
