import { useEffect, useState } from 'react';
import { withAuth } from '@/lib/withAuth';
import styles from '@/styles/Usage.module.css';

type UsageEntry = {
  id: Number(number);
  replayCode: number;
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  duration: number;
  createdAt: string;
};

function UsagePage() {
  const [replayCode, setReplayCode] = useState('');
  const [usage, setUsage] = useState<UsageEntry[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!replayCode) return;
    setError('');
    fetch(`/api/usage?replayCode=${encodeURIComponent(replayCode)}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => setUsage(data))
      .catch(() => setError('Unable to load usage data.'));
  }, [replayCode]);

  const downloadCSV = () => {
    const headers = [
      'Replay Code',
      'First Name',
      'Last Name',
      'Company',
      'Phone',
      'Duration (min)',
      'Accessed At',
    ];
    const rows = usage.map(u => [
      u.replayCode,
      u.firstName,
      u.lastName,
      u.company,
      u.phone,
      (u.duration / 60).toFixed(1),
      new Date(u.createdAt).toLocaleString(),
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows].map(row => row.map(val => `"${val}"`).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = `usage_report_${replayCode || 'all'}.csv`;
    link.click();
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Usage Report</h2>

      <div className={styles.filterRow}>
        <label className={styles.filterLabel}>
          Replay Code:{' '}
          <input
            type="text"
            value={replayCode}
            onChange={e => setReplayCode(e.target.value)}
            placeholder="Enter replay code"
            className={styles.input}
          />
        </label>

        <button
          onClick={downloadCSV}
          disabled={!usage.length}
          className={styles.exportButton}
        >
          Export to CSV
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {usage.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Replay Code</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Company</th>
              <th>Phone</th>
              <th>Duration (min)</th>
              <th>Accessed At</th>
            </tr>
          </thead>
          <tbody>
            {usage.map(u => (
              <tr key={u.id}>
                <td>{u.replayCode}</td>
                <td>{u.firstName}</td>
                <td>{u.lastName}</td>
                <td>{u.company}</td>
                <td>{u.phone}</td>
                <td>{(u.duration / 60).toFixed(1)}</td>
                <td>{new Date(u.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

UsagePage.pageTitle = 'Usage Report';
export default withAuth(UsagePage, ['user', 'admin']);
