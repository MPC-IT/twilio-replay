import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '@/styles/Usage.module.css';

interface UsageEntry {
  id: number;
  replayId: number;
  callerId: string;
  firstNameRecordingUrl?: string | null;
  lastNameRecordingUrl?: string | null;
  companyRecordingUrl?: string | null;
  phoneRecordingUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  phone?: string | null;
  durationSeconds: number;
  createdAt: string;
}

export default function ReplayUsagePage() {
  const router = useRouter();
  const { replayId } = router.query;
  const [usageList, setUsageList] = useState<UsageEntry[]>([]);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    if (!replayId) return;
    fetch(`/api/usage?replayId=${replayId}`)
      .then(res => res.json())
      .then(setUsageList)
      .catch(() => setError('Failed to load usage data.'));
  }, [replayId]);

  const handleChange = (id: number, field: keyof UsageEntry, value: string) => {
    setUsageList(prev =>
      prev.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleSave = async (entry: UsageEntry) => {
    setSavingId(entry.id);
    try {
      await fetch(`/api/usage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: entry.id,
          firstName: entry.firstName,
          lastName: entry.lastName,
          company: entry.company,
          phone: entry.phone
        }),
      });
    } catch {
      alert('Failed to save transcription.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Replay Caller Transcriptions</h1>
      {error && <p className={styles.error}>{error}</p>}
      {usageList.length === 0 ? (
        <p>No caller records found for Replay ID {replayId}.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Company</th>
              <th>Phone</th>
              <th>Audio Clips</th>
              <th>Save</th>
            </tr>
          </thead>
          <tbody>
            {usageList.map(entry => (
              <tr key={entry.id}>
                <td>
                  <input
                    value={entry.firstName ?? ''}
                    onChange={e => handleChange(entry.id, 'firstName', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    value={entry.lastName ?? ''}
                    onChange={e => handleChange(entry.id, 'lastName', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    value={entry.company ?? ''}
                    onChange={e => handleChange(entry.id, 'company', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    value={entry.phone ?? ''}
                    onChange={e => handleChange(entry.id, 'phone', e.target.value)}
                  />
                </td>
                <td>
                  <div className={styles.audioGroup}>
                    {entry.firstNameRecordingUrl && <audio controls src={entry.firstNameRecordingUrl} />}
                    {entry.lastNameRecordingUrl && <audio controls src={entry.lastNameRecordingUrl} />}
                    {entry.companyRecordingUrl && <audio controls src={entry.companyRecordingUrl} />}
                    {entry.phoneRecordingUrl && <audio controls src={entry.phoneRecordingUrl} />}
                  </div>
                </td>
                <td>
                  <button onClick={() => handleSave(entry)} disabled={savingId === entry.id}>
                    {savingId === entry.id ? 'Saving...' : 'Save'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
