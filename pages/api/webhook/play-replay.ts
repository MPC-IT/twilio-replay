import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { twiml } from "twilio";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const VoiceResponse = twiml.VoiceResponse;
  const response = new VoiceResponse();

  const codeParam = req.query?.code as string;

  if (!codeParam || isNaN(Number(codeParam))) {
    response.say("Invalid replay code provided.");
    res.setHeader("Content-Type", "text/xml");
    res.status(400).send(response.toString());
    return;
  }

  const codeInt = parseInt(codeParam);

  try {
    const replay = await prisma.replay.findUnique({
      where: { codeInt },
      include: {
        recordings: true, // Make sure we pull the related recording(s)
      },
    });

    if (!replay || !Array.isArray(replay.recordings) || replay.recordings.length === 0) {
      response.say("The requested replay is not yet available.");
      res.setHeader("Content-Type", "text/xml");
      res.status(404).send(response.toString());
      return;
    }

    const recording = replay.recordings[0]; // Use the first available recording

    if (!recording.audioUrl) {
      response.say("The requested replay is missing its audio.");
      res.setHeader("Content-Type", "text/xml");
      res.status(500).send(response.toString());
      return;
    }

    response.say("Please listen carefully to the following conference replay.");
    response.play(recording.audioUrl);

    res.setHeader("Content-Type", "text/xml");
    res.status(200).send(response.toString());
  } catch (error) {
    console.error("Error in /play-replay:", error);
    response.say("An internal error occurred. Please try again later.");
    res.setHeader("Content-Type", "text/xml");
    res.status(500).send(response.toString());
  }
}
