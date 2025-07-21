import fs from 'fs';
import path from 'path';
import { IncomingForm } from 'formidable';
import { v4 as uuidv4 } from 'uuid';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm({
    uploadDir: path.join(process.cwd(), 'public/recordings'),
    keepExtensions: true,
    filename: (_name, _ext, part) => {
      const ext = path.extname(part.originalFilename || '');
      return `${uuidv4()}${ext}`;
    },
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ error: 'File upload error' });
    }

    try {
      const uploadedFile = Array.isArray(files.audio)
        ? files.audio[0]
        : files.audio;

      const filename = path.basename(uploadedFile?.filepath || '');
      const publicUrl = `/recordings/${filename}`;

      const replayIdParam = req.query.replayId;
      const replayId = parseInt(
        Array.isArray(replayIdParam) ? replayIdParam[0] : replayIdParam || '',
        10
      );

      if (isNaN(replayId)) {
        return res.status(400).json({ error: 'Invalid replayId' });
      }

      // ✅ Save or update the recording in the DB
      await prisma.recording.upsert({
        where: { id: replayId },
        update: { url: publicUrl },
        create: {
          id: replayId,
          url: publicUrl,
        },
      });

      return res.status(200).json({ message: 'Recording uploaded', url: publicUrl });
    } catch (e) {
      console.error('Upload handler error:', e);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
}
