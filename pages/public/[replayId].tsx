import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface Replay {
  title: string;
  date?: string;
  phoneNumber?: string;
  audioUrl?: string;
}

// Typed fetch function that returns a Promise of Replay or null if error
async function fetchReplay(replayId: string): Promise<Replay | null> {
  try {
    const res = await fetch(`/api/replays/${replayId}`);
    if (!res.ok) {
      console.error("Failed to fetch replay:", res.statusText);
      return null;
    }
    const data = (await res.json()) as Replay;
    return data;
  } catch (err) {
    console.error("Error fetching replay:", err);
    return null;
  }
}

export default function PublicReplayPage() {
  const router = useRouter();
  const { replayId } = router.query;
  const [replay, setReplay] = useState<Replay | null>(null);

  useEffect(() => {
    if (typeof replayId === "string") {
      fetchReplay(replayId).then(setReplay);
    }
  }, [replayId]);

  if (!replay) return <div>Loading...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>{replay.title || "Replay"}</h1>
      <p><strong>Date:</strong> {replay.date ?? "N/A"}</p>
      <p><strong>Phone Playback:</strong> {replay.phoneNumber ?? "N/A"}</p>

      <h3>Caller Prompts</h3>
      <ol>
        <li>State and spell your first name</li>
        <li>State and spell your last name</li>
        <li>State and spell your company affiliation</li>
        <li>State your phone number</li>
      </ol>

      {replay.audioUrl ? (
        <div>
          <h3>Listen to Replay</h3>
          <audio controls src={replay.audioUrl} />
        </div>
      ) : (
        <p>No replay uploaded yet.</p>
      )}
    </div>
  );
}
