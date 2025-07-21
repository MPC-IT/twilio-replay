import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface Recording {
  id: number;
  replayId: number;
  fileType: 'caller' | 'conference';
  recordingUrl: string;
  createdAt: string;
  transcription?: string;
}

export default function RecordingsPage() {
  const router = useRouter();
  const { replayId } = router.query;
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof replayId === 'string') {
      fetch(`/api/replays/${replayId}/recordings`)
        .then(res => res.json())
        .then(data => setRecordings(data))
        .catch(() => setError('Failed to load recordings.'));
    }
  }, [replayId]);

  if (error) return <p style={{ padding: '2rem' }}>{error}</p>;
  if (!recordings.length) return <p style={{ padding: '2rem' }}>Loading recordings...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Recordings for Replay {replayId}</h2>

      {recordings.map((rec) => (
        <div key={rec.id} style={{ marginBottom: '1.5rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
          <p><strong>Type:</strong> {rec.fileType}</p>
          <p><strong>Created:</strong> {new Date(rec.createdAt).toLocaleString()}</p>
          {rec.transcription && (
            <p><strong>Transcription:</strong> {rec.transcription}</p>
          )}
          <audio controls src={rec.recordingUrl} style={{ width: '100%' }} />
          <br />
          <a href={rec.recordingUrl} download>
            Download Recording
          </a>
        </div>
      ))}
    </div>
  );
}
