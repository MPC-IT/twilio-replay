import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '@/styles/EditReplay.module.css';
import { withAuth } from '@/lib/withAuth';

function NewReplayPage() {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/replays', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, title, startTime, endTime }),
    });

    if (res.ok) {
      const newReplay = await res.json();
      router.push(`/replays/${newReplay.id}`);
    } else {
      const data = await res.json();
      setError(data.message || 'Replay creation failed.');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Create New Replay</h2>
      <form onSubmit={handleSubmit}>
        <label className={styles.label}>
          Replay Code (numeric only)
          <input
            type="number"
            value={code}
            onChange={e => setCode(e.target.value)}
            className={styles.input}
            required
          />
        </label>
        <label className={styles.label}>
          Title
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className={styles.input}
            required
          />
        </label>
        <label className={styles.label}>
          Start Time (optional)
          <input
            type="datetime-local"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            className={styles.input}
          />
        </label>
        <label className={styles.label}>
          End Time (optional)
          <input
            type="datetime-local"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            className={styles.input}
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.saveButton}>
          Create Replay
        </button>
      </form>
    </div>
  );
}

NewReplayPage.pageTitle = 'New Replay';
export default withAuth(NewReplayPage, ['admin']);
