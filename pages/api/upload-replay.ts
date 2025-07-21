import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma'; // ✅ FIXED: use named import

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const uploadDir = path.join(process.cwd(), 'public', 'recordings');
  fs.mkdirSync(uploadDir, { recursive: true });

  const form = formidable({
    multiples: false,
    uploadDir,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ message: 'File upload error' });
    }

    try {
      const replayIdRaw = Array.isArray(fields.replayId) ? fields.replayId[0] : fields.replayId;
      const replayId = Number(replayIdRaw);
      if (isNaN(replayId)) throw new Error('Invalid replayId');

      const labelRaw = Array.isArray(fields.label) ? fields.label[0] : fields.label;
      const label = labelRaw || 'Uploaded';

      const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
      if (!uploadedFile || !uploadedFile.filepath) {
        throw new Error('No file uploaded');
      }

      const filename = path.basename(uploadedFile.filepath);
      const publicUrl = `/recordings/${filename}`;

      await prisma.recording.create({
        data: {
          replayId,
          label,
          audioUrl: publicUrl,
        },
      });

      return res.status(200).json({ message: 'Upload successful', url: publicUrl });
    } catch (error: any) {
      console.error('Upload error:', error);
      return res.status(400).json({ message: error.message || 'Upload failed' });
    }
  });
}
