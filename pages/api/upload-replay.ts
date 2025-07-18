import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { IncomingForm } from 'formidable';
import { prisma } from '@/lib/prisma';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm({
    uploadDir: path.join(process.cwd(), '/public/recordings'),
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Formidable error:', err);
      return res.status(500).json({ error: 'File parsing error' });
    }

    try {
      const replayId = Number(fields.replayId?.[0] || fields.replayId);
      const file = files.file?.[0] || files.file;
      const publicUrl = `/recordings/${path.basename(file.filepath)}`;

      await prisma.recording.upsert({
        where: { id: replayId },
        update: { url: publicUrl },
        create: {
          id: replayId,
          url: publicUrl,
        },
      });

      return res.status(200).json({ message: 'Upload successful', url: publicUrl });
    } catch (error) {
      console.error('Upload handler error:', error);
      return res.status(500).json({ error: 'Upload failed' });
    }
  });
}
