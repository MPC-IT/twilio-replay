import path from 'path';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { prisma } from '@/lib/prisma';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const replayId = req.query.replayId as string;

  const form = formidable({
    uploadDir: path.join(process.cwd(), 'public', 'recordings'),
    keepExtensions: true,
    maxFileSize: 100 * 1024 * 1024, // 100MB
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ error: 'Failed to parse form data' });
    }

    const file = files.audio?.[0] || files.audio;
    if (!file || Array.isArray(file)) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const filename = path.basename(file.filepath);
    const audioUrl = `/recordings/${filename}`;

    try {
      await prisma.recording.upsert({
        where: { replayId: Number(replayId) },
        update: { audioUrl },
        create: {
          replayId: Number(replayId),
          audioUrl,
          name: fields.title?.toString() || 'Uploaded Conference',
        },
      });

      res.status(200).json({ audioUrl });
    } catch (dbError) {
      console.error('DB update error:', dbError);
      res.status(500).json({ error: 'Failed to save recording data' });
    }
  });
}
