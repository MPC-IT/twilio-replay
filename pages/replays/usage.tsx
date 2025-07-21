import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import RequireAuth from '@/components/RequireAuth';
import styles from '@/styles/Usage.module.css';

type UsageRecord = {
  id: number;
  replayId: number;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  phone?: string | null;
  durationSeconds: number;
  createdAt: string;
};

function UsagePage() {
  const router = useRouter();
  const { replayId } = router.query;

  const [usage, setUsage] = useState<UsageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    if (!replayId) return;

    async function fetchUsage() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        params.append('replayId', replayId as string);
        if (fromDate) params.append('startDate', fromDate);
        if (toDate) params.append('endDate', toDate);

        const res = await fetch(`/api/usage?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch usage data');

        const data: UsageRecord[] = await res.json();
        setUsage(data);
      } catch (err) {
        setError((err as Error).message || 'Error fetching usage');
      } finally {
        setLoading(false);
      }
    }

    fetchUsage();
  }, [replayId, fromDate, toDate]);

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const exportToCSV = () => {
    const header = 'Replay ID,Caller Name,Company,Phone,Duration,Accessed At\n';
    const rows = usage.map(u =>
      `${u.replayId},"${u.firstName ?? ''} ${u.lastName ?? ''}","${u.company ?? ''}","${u.phone ?? ''}",${formatDuration(u.durationSeconds)},"${new Date(u.createdAt).toLocaleString()}"`
    );
    const csvContent = header + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `usage_${replayId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Usage for Replay: {replayId}</h1>

      <div className={styles.filters}>
        <label className={styles.filterLabel}>
          From:
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className={styles.filterInput}
          />
        </label>
        <label className={styles.filterLabel}>
          To:
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className={styles.filterInput}
          />
        </label>
        <button className={styles.exportBtn} onClick={exportToCSV}>
          Export to CSV
        </button>
      </div>

      {loading ? (
        <p>Loading usage data...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : usage.length === 0 ? (
        <p>No usage records found for this replay.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Caller Name</th>
              <th>Company</th>
              <th>Phone</th>
              <th>Duration</th>
              <th>Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {usage.map((u) => (
              <tr key={u.id}>
                <td>{`${u.firstName ?? '-'} ${u.lastName ?? '-'}`}</td>
                <td>{u.company || '-'}</td>
                <td>{u.phone || '-'}</td>
                <td>{formatDuration(u.durationSeconds)}</td>
                <td>{new Date(u.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function ProtectedUsagePage() {
  return (
    <RequireAuth>
      <UsagePage />
    </RequireAuth>
  );
}
