import { writeFile, mkdir, readFile } from "fs/promises";
import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import { prisma } from "@/lib/prisma";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const replayId = req.query.replayId as string;
  if (!replayId) return res.status(400).json({ error: 'Missing replayId' });

  if (req.method === 'POST') {
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: "Failed to parse form" });

      const file = files.prompt?.[0];
      if (!file) return res.status(400).json({ error: "No file uploaded" });

      const dir = path.join(process.cwd(), "public", "recordings", "prompts", replayId);
      await mkdir(dir, { recursive: true });

      const dest = path.join(dir, "prompt.mp3");

      const data = await readFile(file.filepath);
      await writeFile(dest, data);

      return res.status(200).json({ ok: true });
    });
  }

  if (req.method === 'PUT') {
    const { firstName, lastName, company, phone } = req.body;

    try {
      await prisma.replay.update({
        where: { id: replayId },
        data: {
          prompts: {
            update: {
              firstName: { set: firstName },
              lastName: { set: lastName },
              company: { set: company },
              phone: { set: phone },
            },
          },
        },
      });

      return res.status(200).json({ message: 'Prompts updated' });
    } catch (error) {
      console.error('Failed to update prompts:', error);
      return res.status(500).json({ message: 'Prompt update failed' });
    }
  }

  return res.status(405).end();
}
