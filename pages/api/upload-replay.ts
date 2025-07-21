import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import formidable, { File } from 'formidable';
import prisma from '@/lib/prisma';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'recordings');
const mkdir = promisify(fs.mkdir);
const rename = promisify(fs.rename);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await mkdir(uploadDir, { recursive: true });

    const form = formidable({
      multiples: false,
      uploadDir,
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ message: 'Error parsing form' });
      }

      try {
        const replayIdRaw = fields.replayId?.[0] || fields.replayId;
        const replayId = Number(replayIdRaw);
        if (isNaN(replayId)) {
          throw new Error('Invalid replayId');
        }

        const labelRaw = fields.label?.[0] || fields.label;
        const label = Array.isArray(labelRaw) ? labelRaw[0] : labelRaw || 'Uploaded';

        const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
        if (!uploadedFile || !(uploadedFile as File).filepath) {
          throw new Error('No file uploaded');
        }

        const filename = path.basename((uploadedFile as File).filepath || '');
        const publicUrl = `/recordings/${filename}`;

        await prisma.recording.create({
          data: {
            replayId,
            label,
            url: publicUrl,
          },
        });

        return res.status(200).json({ message: 'File uploaded and recording saved', publicUrl });
      } catch (uploadError) {
        console.error('Upload processing error:', uploadError);
        return res.status(400).json({ message: 'Upload failed', error: String(uploadError) });
      }
    });
  } catch (fsError) {
    console.error('Filesystem error:', fsError);
    return res.status(500).json({ message: 'Server error', error: String(fsError) });
  }
}
