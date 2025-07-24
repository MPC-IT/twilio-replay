import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '@/styles/ReplayDetail.module.css';

interface Replay {
  id: number;
  codeInt: number;
  title: string;
  startTime?: string;
  endTime?: string;
  promptFlags: {
    firstName: boolean;
    lastName: boolean;
    company: boolean;
    phone: boolean;
  };
  recordings: { id: number; url: string }[];
}

export default function ReplayEditor() {
  const router = useRouter();
  const { replayId } = router.query;
  const [replay, setReplay] = useState<Replay | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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
    const { name, value, type, checked } = e.target;

    if (name.startsWith('promptFlags.')) {
      const key = name.split('.')[1] as keyof Replay['promptFlags'];
      setReplay({ ...replay, promptFlags: { ...replay.promptFlags, [key]: checked } });
    } else {
      setReplay({ ...replay, [name]: type === 'number' ? Number(value) : value });
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

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !replay || typeof replayId !== 'string') return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('audio', file);

    try {
      setUploading(true);
      const res = await fetch(`/api/replays/${replayId}/recording`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setUploading(false);

      if (res.ok && data.recordings) {
        setReplay({ ...replay, recordings: data.recordings });
      } else {
        alert(data.error || 'Upload failed.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while uploading.');
    }
  };

  const handleDownload = () => {
    const firstUrl = replay?.recordings?.[0]?.url;
    if (!firstUrl) return;
    const link = document.createElement('a');
    link.href = firstUrl;
    link.download = 'conference-recording.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!replay) return <p style={{ padding: '2rem' }}>{error || 'Loading replay...'}</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{replay.title}</h2>

      <label className={styles.label}>
        Replay Code:
        <input
          type="number"
          name="codeInt"
          value={replay.codeInt}
          onChange={handleChange}
        />
      </label>

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
      {[
        { key: 'firstName', label: '1. State and spell your first name (firstName.wav)' },
        { key: 'lastName', label: '2. State and spell your last name (lastName.wav)' },
        { key: 'company', label: '3. State and spell your company name (company.wav)' },
        { key: 'phone', label: '4. State your phone number (phone.wav)' },
      ].map(({ key, label }) => (
        <label key={key} className={styles.label}>
          <input
            type="checkbox"
            name={`promptFlags.${key}`}
            checked={replay.promptFlags?.[key as keyof Replay['promptFlags']]}
            onChange={handleChange}
          />
          &nbsp;{label}
        </label>
      ))}

      <h3 className={styles.subheading}>Conference Recording</h3>
      {replay.recordings?.length > 0 ? (
        <div>
          <audio className={styles.audioPlayer} controls src={replay.recordings[0].url} />
          <button onClick={handleDownload}>Download</button>
        </div>
      ) : (
        <p>No audio uploaded yet.</p>
      )}

      <input type="file" accept="audio/*" onChange={handleAudioUpload} className={styles.uploadInput} disabled={uploading} />

      {error && <p className={styles.error}>{error}</p>}
      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}
