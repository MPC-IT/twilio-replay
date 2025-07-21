import fs from 'fs';
import path from 'path';
import { IncomingForm } from 'formidable';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm({
    uploadDir: path.join(process.cwd(), '/public/recordings'),
    keepExtensions: true,
    filename: (_name, _ext, part) => {
      const ext = path.extname(part.originalFilename || '');
      return `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`;
    },
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ error: 'File upload error' });
    }

    try {
      const replayIdRaw = fields.replayId?.[0] || fields.replayId;
      const labelRaw = fields.label?.[0] || fields.label || 'Conference Replay';
      const replayId = Number(replayIdRaw);

      const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
      const filename = path.basename(uploadedFile?.filepath || '');
      const publicUrl = `/recordings/${filename}`;

      if (!replayId || !publicUrl) {
        return res.status(400).json({ error: 'Missing replayId or file' });
      }

      // Save new recording
      const recording = await prisma.recording.create({
        data: {
          replayId,
          label: labelRaw,
          url: publicUrl,
        },
      });

      res.status(200).json({ message: 'Recording uploaded', url: publicUrl, recording });
    } catch (e) {
      console.error('Upload handler error:', e);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}
