import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '@/lib/prisma';

// Set upload destination folder inside the project (e.g. /public/uploads)
const uploadDir = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

// ✅ Explicitly type req/res here to avoid ServerResponse errors
const apiRoute = nextConnect<NextApiRequest, NextApiResponse>({
  onError(error, req, res) {
    res.status(501).json({ error: `Something went wrong! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

// Accept only POST requests with single 'audio' file
apiRoute.use(upload.single('audio'));

apiRoute.post(async (req: NextApiRequest & { file: Express.Multer.File }, res: NextApiResponse) => {
  const { replayId } = req.query;

  if (typeof replayId !== 'string') {
    return res.status(400).json({ error: 'Invalid replay ID' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const audioUrl = `/uploads/${req.file.filename}`; // Public path

    await prisma.recording.create({
      data: {
        replayId,
        audioUrl,
      },
    });

    const updatedReplay = await prisma.replay.findUnique({
      where: { id: replayId },
      include: { recordings: true, prompts: true },
    });

    if (!updatedReplay) {
      return res.status(404).json({ error: 'Replay not found' });
    }

    res.status(201).json(updatedReplay);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save recording' });
  }
});

export const config = {
  api: {
    bodyParser: false, // Disallow built-in body parsing; multer handles it
  },
};

export default apiRoute;
