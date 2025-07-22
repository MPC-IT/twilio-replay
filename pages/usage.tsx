import { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import RequireAuth from '@/components/RequireAuth';
import Layout from '@/components/Layout';
import styles from '@/styles/Replays.module.css';

interface UsageRecord {
  id: number;
  callerId: string;
  durationSeconds: number;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  createdAt: string;
}

function UsagePage() {
  const [usage, setUsage] = useState<UsageRecord[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsage = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/usage?${params.toString()}`);
      const data = await res.json();
      setUsage(data);
    } catch (err) {
      console.error('Failed to fetch usage', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  return (
    <Layout pageTitle="Usage Report">
      <div className={styles.container}>
        <h1>Usage Report</h1>

        <div className={styles.filterRow}>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          <button onClick={fetchUsage} disabled={loading}>Filter</button>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Caller ID</th>
              <th>Duration (sec)</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Company</th>
              <th>Phone</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {usage.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.callerId}</td>
                <td>{entry.durationSeconds}</td>
                <td>{entry.firstName || '-'}</td>
                <td>{entry.lastName || '-'}</td>
                <td>{entry.company || '-'}</td>
                <td>{entry.phone || '-'}</td>
                <td>{new Date(entry.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default function ProtectedUsagePage() {
  return (
    <RequireAuth>
      <UsagePage />
    </RequireAuth>
  );
}
