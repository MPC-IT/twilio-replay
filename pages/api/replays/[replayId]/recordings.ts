import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { replayId } = req.query;
  if (!replayId || typeof replayId !== 'string') {
    return res.status(400).json({ error: 'Invalid replay ID' });
  }

  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(process.cwd(), 'public', 'recordings');
  form.keepExtensions = true;
  form.maxFileSize = 100 * 1024 * 1024; // 100 MB

  form.parse(req, async (err, fields, files) => {
    if (err || !files.audio || Array.isArray(files.audio)) {
      return res.status(500).json({ error: 'Failed to upload file' });
    }

    const file = files.audio;
    const filePath = file.filepath || file.path;
    const filename = `${replayId}.mp3`;
    const destination = path.join('public', 'recordings', filename);

    fs.renameSync(filePath, destination);
    const audioUrl = `/recordings/${filename}`;

    await prisma.recording.upsert({
      where: { replayId },
      update: { audioUrl },
      create: {
        replayId,
        name: `Recording for ${replayId}`,
        audioUrl,
      },
    });

    return res.status(200).json({ audioUrl });
  });
}
