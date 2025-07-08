import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) return res.status(401).json({ message: 'Unauthorized' });

  const uploadDir = path.join(process.cwd(), 'public', 'prompts');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new formidable.IncomingForm({
    uploadDir,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Form parsing failed' });

    const { type, replayId } = fields;
    const file = files.file?.[0];

    if (!type || !replayId || !file) {
      return res.status(400).json({ error: 'Missing type, replayId, or file' });
    }

    const promptType = type.toString();
    const replayIdStr = replayId.toString();
    const filename = `${replayIdStr}_${promptType}.mp3`;
    const newPath = path.join(uploadDir, filename);

    try {
      fs.renameSync(file.filepath, newPath);

      // Upsert prompt: update if exists, otherwise create
      await prisma.prompt.upsert({
        where: {
          replayId_type: {
            replayId: replayIdStr,
            type: promptType,
          },
        },
        update: {
          audioUrl: `/prompts/${filename}`,
        },
        create: {
          replayId: replayIdStr,
          type: promptType,
          audioUrl: `/prompts/${filename}`,
        },
      });

      return res.status(200).json({ message: 'Prompt uploaded', path: `/prompts/${filename}` });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to save file or update prompt' });
    }
  });
}
