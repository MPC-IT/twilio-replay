import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const form = new IncomingForm();
  form.uploadDir = path.join(process.cwd(), '/public/recordings');
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parsing error:', err);
      return res.status(500).json({ message: 'Error parsing form data' });
    }

    const replayId = fields.replayId?.[0];
    const label = fields.label?.[0] || 'Uploaded';
    const file = files.file?.[0];

    if (!replayId || !file) {
      return res.status(400).json({ message: 'Missing replayId or file' });
    }

    const ext = path.extname(file.originalFilename || '');
    const newFilename = `${uuidv4()}${ext}`;
    const newFilePath = path.join(form.uploadDir, newFilename);

    try {
      await fs.promises.rename(file.filepath, newFilePath);

      const publicUrl = `/recordings/${newFilename}`;

      // ✅ Create a new recording (not upsert)
      await prisma.recording.create({
        data: {
          replayId: Number(replayId),
          label,
          url: publicUrl,
        },
      });

      return res.status(200).json({ message: 'Recording uploaded successfully', url: publicUrl });
    } catch (error) {
      console.error('File save error:', error);
      return res.status(500).json({ message: 'Failed to save file' });
    }
  });
}
