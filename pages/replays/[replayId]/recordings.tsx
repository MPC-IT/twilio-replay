import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

type Recording = {
  id: number;
  name?: string | null;
  audioUrl: string;
  transcription?: string | null;
};

export default function ReplayRecordingsPage() {
  const router = useRouter();
  const { replayId } = router.query;

  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!replayId) return;
    fetch(`/api/replays/${replayId}/recordings`)
      .then(res => res.json())
      .then((data: Recording[]) => setRecordings(data))
      .finally(() => setLoading(false));
  }, [replayId]);

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Caller Recordings for Replay {replayId}</h1>
      {loading ? (
        <p>Loading...</p>
      ) : recordings.length === 0 ? (
        <p>No recordings found.</p>
      ) : (
        <ul>
          {recordings.map((rec) => (
            <li key={rec.id} style={{ marginBottom: '1rem' }}>
              <p><strong>Caller:</strong> {rec.name || '(Unknown)'}</p>
              <audio controls src={rec.audioUrl}></audio>
              <div>
                <label>Transcription:</label><br />
                <textarea
                  value={rec.transcription || ''}
                  onChange={(e) => {
                    const updated = recordings.map((r) =>
                      r.id === rec.id ? { ...r, transcription: e.target.value } : r
                    );
                    setRecordings(updated);
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
