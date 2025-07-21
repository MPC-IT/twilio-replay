import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

type Replay = {
  id: number;
  title: string;
  audioUrl?: string;
  startTime?: string;
  endTime?: string;
  phoneNumber?: string;
};

export default function PublicReplayPlayer() {
  const router = useRouter();
  const { codeInt } = router.query;
  const [replay, setReplay] = useState<Replay | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof codeInt === 'string') {
      fetch(`/api/replays/lookup?code=${codeInt}`)
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => setReplay(data))
        .catch(() => setError('Replay not found or access expired.'));
    }
  }, [codeInt]);

  if (error) return <p style={{ padding: '2rem' }}>{error}</p>;
  if (!replay) return <p style={{ padding: '2rem' }}>Loading replay...</p>;

  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>{replay.title}</h1>
      <p><strong>Start:</strong> {replay.startTime ?? 'N/A'}</p>
      <p><strong>End:</strong> {replay.endTime ?? 'N/A'}</p>
      <p><strong>Phone Playback:</strong> {replay.phoneNumber ?? 'N/A'}</p>

      {replay.audioUrl ? (
        <>
          <h3>Listen to Conference Recording</h3>
          <audio controls src={replay.audioUrl} style={{ width: '100%', maxWidth: '600px' }} />
        </>
      ) : (
        <p>No recording uploaded yet.</p>
      )}
    </main>
  );
}
