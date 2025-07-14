import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '@/lib/prisma';

export const config = {
  api: {
    bodyParser: false, // Required for multer
  },
};

const uploadDir = path.join(process.cwd(), 'public/uploads');

// Ensure the uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const replayId = (req.query.replayId as string).replace(/[^a-zA-Z0-9_-]/g, '');
    const ext = path.extname(file.originalname);
    cb(null, `replay-${replayId}${ext}`);
  },
});

const upload = multer({ storage });
const apiRoute = nextConnect<NextApiRequest, NextApiResponse>();

apiRoute.use(upload.single('audio'));

apiRoute.post(async (req: any, res: NextApiResponse) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const replayId = req.query.replayId as string;
  const filePath = `/uploads/${req.file.filename}`;

  try {
    await prisma.replay.update({
      where: { id: Number(Number)(replayId) },
      data: { audioUrl: filePath },
    });

    return res.status(200).json({ success: true, file: filePath });
  } catch (error) {
    console.error('Error updating audioUrl:', error);
    return res.status(500).json({ error: 'Failed to save audio path to database' });
  }
});

export default apiRoute;
