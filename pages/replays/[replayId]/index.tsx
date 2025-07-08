import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '@/styles/ReplayDetail.module.css';

interface Replay {
  id: string;
  title: string;
  startTime?: string;
  endTime?: string;
  audioUrl?: string;
  prompts: {
    firstName: string;
    lastName: string;
    company: string;
    phone: string;
  };
}

export default function ReplayEditor() {
  const router = useRouter();
  const { replayId } = router.query;
  const [replay, setReplay] = useState<Replay | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof replayId === 'string') {
      fetch(`/api/replays/${replayId}`)
        .then(res => res.json())
        .then(setReplay)
        .catch(() => setError('Replay not found.'));
    }
  }, [replayId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!replay) return;
    const { name, value } = e.target;

    if (name.startsWith('prompts.')) {
      const key = name.split('.')[1] as keyof Replay['prompts'];
      setReplay({
        ...replay,
        prompts: { ...replay.prompts, [key]: value }
      });
    } else {
      setReplay({ ...replay, [name]: value });
    }
  };

  const handleSave = async () => {
    if (!replay || typeof replayId !== 'string') return;
    setSaving(true);
    setError('');

    const res = await fetch(`/api/replays/${replayId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(replay),
    });

    setSaving(false);
    if (!res.ok) {
      setError('Failed to save changes.');
    } else {
      alert('Replay updated successfully!');
    }
  };

  if (!replay) return <p style={{ padding: '2rem' }}>{error || 'Loading replay...'}</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{replay.title}</h2>

      <label className={styles.label}>
        Start Time:
        <input
          type="datetime-local"
          name="startTime"
          value={replay.startTime ?? ''}
          onChange={handleChange}
        />
      </label>

      <label className={styles.label}>
        End Time:
        <input
          type="datetime-local"
          name="endTime"
          value={replay.endTime ?? ''}
          onChange={handleChange}
        />
      </label>

      <h3 className={styles.subheading}>Caller Prompts</h3>
      <label className={styles.label}>
        First Name Prompt:
        <input name="prompts.firstName" value={replay.prompts.firstName} onChange={handleChange} />
      </label>
      <label className={styles.label}>
        Last Name Prompt:
        <input name="prompts.lastName" value={replay.prompts.lastName} onChange={handleChange} />
      </label>
      <label className={styles.label}>
        Company Prompt:
        <input name="prompts.company" value={replay.prompts.company} onChange={handleChange} />
      </label>
      <label className={styles.label}>
        Phone Prompt:
        <input name="prompts.phone" value={replay.prompts.phone} onChange={handleChange} />
      </label>

      <h3 className={styles.subheading}>Conference Recording</h3>
      {replay.audioUrl ? (
        <audio className={styles.audioPlayer} controls src={replay.audioUrl} />
      ) : (
        <p>No audio uploaded yet.</p>
      )}

      {error && <p className={styles.error}>{error}</p>}
      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}
