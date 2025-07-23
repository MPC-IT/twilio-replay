import { GetServerSideProps } from 'next';
import { prisma } from '@/lib/prisma';
import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '@/styles/EditReplay.module.css';
import Link from 'next/link';

interface Replay {
  id: number;
  codeInt: number;
  title: string;
  company?: string | null;
  startTime: string;
  endTime: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  replay: Replay;
}

export default function EditReplayPage({ replay }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(replay.title);
  const [company, setCompany] = useState(replay.company || '');
  const [startTime, setStartTime] = useState(replay.startTime.slice(0, 16));
  const [endTime, setEndTime] = useState(replay.endTime?.slice(0, 16) || '');
  const [notes, setNotes] = useState(replay.notes || '');
  const [changeLog, setChangeLog] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/replays/${replay.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, company, startTime, endTime, notes }),
      });

      if (res.ok) {
        const changes = [];
        if (title !== replay.title) changes.push(`Title changed to "${title}"`);
        if (company !== replay.company) changes.push(`Company changed to "${company}"`);
        if (startTime !== replay.startTime.slice(0, 16)) changes.push(`Start Time updated`);
        if (endTime !== replay.endTime?.slice(0, 16)) changes.push(`End Time updated`);
        if (notes !== replay.notes) changes.push(`Notes updated`);

        setChangeLog(changes);
      } else {
        setError('Failed to save changes.');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Edit Replay</h1>

      <div className={styles.formGroup}>
        <label>Replay Code</label>
        <input type="text" value={replay.codeInt} readOnly className={styles.readonlyInput} />
      </div>

      <div className={styles.formGroup}>
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className={styles.formGroup}>
        <label>Company</label>
        <input value={company} onChange={(e) => setCompany(e.target.value)} />
      </div>

      <div className={styles.formGroup}>
        <label>Start Time</label>
        <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
      </div>

      <div className={styles.formGroup}>
        <label>End Time</label>
        <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
      </div>

      <div className={styles.formGroup}>
        <label>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.buttonRow}>
        <button className={styles.saveButton} onClick={handleSave}>Save Changes</button>
        <Link href="/replays" className={styles.cancelButton}>Cancel</Link>
        <button className={styles.deactivateButton}>Deactivate</button> {/* Placeholder */}
      </div>

      {changeLog.length > 0 && (
        <div className={styles.changeLog}>
          <h3>Change Log</h3>
          <ul>
            {changeLog.map((log, idx) => (
              <li key={idx}>{log}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = Number(context.params?.replayId);
  const replay = await prisma.replay.findUnique({ where: { id } });

  if (!replay) {
    return { notFound: true };
  }

  return {
    props: {
      replay: JSON.parse(JSON.stringify(replay)),
    },
  };
};
