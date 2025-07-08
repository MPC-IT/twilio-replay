import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '@/lib/withAuth';
import styles from '@/styles/EditReplay.module.css';

type Replay = {
  id: string;
  title: string;
  codeInt: number;
  startTime: string | null;
  endTime: string | null;
  prompts: {
    firstName?: string;
    lastName?: string;
    company?: string;
    phone?: string;
  };
};

function EditReplayPage() {
  const router = useRouter();
  const { replayId } = router.query;
  const [replay, setReplay] = useState<Replay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    if (!replayId) return;
    fetch(`/api/replays/${replayId}`)
      .then(res => res.json())
      .then(data => {
        setReplay(data);
        setForm({
          title: data.title || '',
          startTime: data.startTime ? data.startTime.slice(0, 16) : '',
          endTime: data.endTime ? data.endTime.slice(0, 16) : '',
        });
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load replay data.');
        setLoading(false);
      });
  }, [replayId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (field: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('field', field);

    await fetch(`/api/replays/${replayId}/upload`, {
      method: 'POST',
      body: formData,
    });

    // Refresh
    const updated = await fetch(`/api/replays/${replayId}`).then(res => res.json());
    setReplay(updated);
  };

  const handleSave = async () => {
    const res = await fetch(`/api/replays/${replayId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        startTime: form.startTime,
        endTime: form.endTime,
      }),
    });

    if (res.ok) {
      alert('Replay updated.');
    } else {
      setError('Failed to save changes.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!replay) return <p>Replay not found.</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Edit Replay: {replay.codeInt}</h2>

      <label className={styles.label}>Title</label>
      <input
        className={styles.input}
        name="title"
        value={form.title}
        onChange={handleChange}
      />

      <label className={styles.label}>Start Time</label>
      <input
        className={styles.input}
        type="datetime-local"
        name="startTime"
        value={form.startTime}
        onChange={handleChange}
      />

      <label className={styles.label}>End Time</label>
      <input
        className={styles.input}
        type="datetime-local"
        name="endTime"
        value={form.endTime}
        onChange={handleChange}
      />

      <h3 className={styles.subheading}>Audio Prompts</h3>

      {['firstName', 'lastName', 'company', 'phone'].map((field) => (
        <div key={field} className={styles.promptRow}>
          <label className={styles.label}>{field.replace(/^\w/, c => c.toUpperCase())} Prompt:</label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(field, e.target.files[0])}
          />
          {replay.prompts[field as keyof Replay['prompts']] && (
            <audio
              controls
              src={replay.prompts[field as keyof Replay['prompts']]}
              className={styles.audioPlayer}
            />
          )}
        </div>
      ))}

      <button onClick={handleSave} className={styles.saveButton}>Save Changes</button>
    </div>
  );
}

EditReplayPage.pageTitle = 'Edit Replay';
export default withAuth(EditReplayPage, ['user', 'admin']);
