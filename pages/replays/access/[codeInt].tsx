import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

type Replay = {
  title: string;
  startTime?: string;
  recordings?: { url: string }[];
};

export default function PublicReplayPlayer() {
  const router = useRouter();
  const { codeInt } = router.query;
  const [replay, setReplay] = useState<Replay | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof codeInt === 'string') {
      fetch(`/api/replays/lookup-code?code=${codeInt}`)
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => setReplay(data))
        .catch(() => setError('Replay not found or access expired.'));
    }
  }, [codeInt]);

  if (error) return <p style={{ padding: '2rem' }}>{error}</p>;
  if (!replay) return <p style={{ padding: '2rem' }}>Loading replay...</p>;

  const audioUrl = replay.recordings?.[0]?.url;

  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>{replay.title}</h1>
      <p>
        <strong>Start Time:</strong>{' '}
        {replay.startTime ? new Date(replay.startTime).toLocaleString() : 'N/A'}
      </p>

      {audioUrl ? (
        <>
          <h3>Listen to Conference Recording</h3>
          <audio controls src={audioUrl} style={{ width: '100%', maxWidth: '600px' }} />
        </>
      ) : (
        <p>No recording uploaded yet.</p>
      )}
    </main>
  );
}
