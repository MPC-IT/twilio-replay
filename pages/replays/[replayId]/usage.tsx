import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface UsageRecord {
  id: number;
  replayId: number;
  callerId: string;
  createdAt: string;
  durationSeconds: number;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
}

export default function UsageReviewPage() {
  const router = useRouter();
  const { replayId } = router.query;
  const [usage, setUsage] = useState<UsageRecord[]>([]);

  useEffect(() => {
    if (!replayId) return;
    fetch(`/api/replays/${replayId}/usage`)
      .then(res => res.json())
      .then(setUsage);
  }, [replayId]);

  const handleChange = (
    id: number,
    field: keyof Pick<UsageRecord, 'firstName' | 'lastName' | 'company' | 'phone'>,
    value: string
  ) => {
    setUsage(prev =>
      prev.map(record => (record.id === id ? { ...record, [field]: value } : record))
    );
  };

  const handleSave = async (id: number) => {
    const record = usage.find(u => u.id === id);
    if (!record) return;
    await fetch(`/api/usage/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: record.firstName,
        lastName: record.lastName,
        company: record.company,
        phone: record.phone,
      }),
    });
  };

  const exportCSV = () => {
    const headers = ['Date/Time', 'Caller ID', 'Duration (sec)', 'First Name', 'Last Name', 'Company', 'Phone'];
    const rows = usage.map(u => [
      new Date(u.createdAt).toLocaleString(),
      u.callerId,
      u.durationSeconds,
      u.firstName || '',
      u.lastName || '',
      u.company || '',
      u.phone || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows]
        .map(e => e.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `replay_${replayId}_usage.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Participant Usage for Replay #{replayId}</h2>

      <button onClick={exportCSV} style={{ marginBottom: '1rem' }}>
        Export CSV
      </button>

      <table border={1} cellPadding={8} cellSpacing={0}>
        <thead>
          <tr>
            <th>Date/Time</th>
            <th>Caller ID</th>
            <th>Duration (sec)</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Company</th>
            <th>Phone</th>
            <th>Save</th>
          </tr>
        </thead>
        <tbody>
          {usage.map(u => (
            <tr key={u.id}>
              <td>{new Date(u.createdAt).toLocaleString()}</td>
              <td>{u.callerId}</td>
              <td>{u.durationSeconds}</td>
              <td>
                <input
                  value={u.firstName || ''}
                  onChange={e => handleChange(u.id, 'firstName', e.target.value)}
                />
              </td>
              <td>
                <input
                  value={u.lastName || ''}
                  onChange={e => handleChange(u.id, 'lastName', e.target.value)}
                />
              </td>
              <td>
                <input
                  value={u.company || ''}
                  onChange={e => handleChange(u.id, 'company', e.target.value)}
                />
              </td>
              <td>
                <input
                  value={u.phone || ''}
                  onChange={e => handleChange(u.id, 'phone', e.target.value)}
                />
              </td>
              <td>
                <button onClick={() => handleSave(u.id)}>Save</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <br />
      <Link href={`/replays/${replayId}`}>
        <button>Back to Replay Edit</button>
      </Link>
    </div>
  );
}
