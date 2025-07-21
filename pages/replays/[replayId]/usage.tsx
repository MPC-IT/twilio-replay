import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface UsageRecord {
  id: number;
  replayId: number;
  callerId: string;
  createdAt: string;
  firstNameRecordingUrl?: string;
  lastNameRecordingUrl?: string;
  companyRecordingUrl?: string;
  phoneRecordingUrl?: string;
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

  const handleFieldChange = (
    id: number,
    field: keyof Pick<UsageRecord, 'firstName' | 'lastName' | 'company' | 'phone'>,
    value: string
  ) => {
    setUsage((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, [field]: value } : u
      )
    );
  };

  const handleSave = async (u: UsageRecord) => {
    const res = await fetch(`/api/usage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        company: u.company,
        phone: u.phone,
      }),
    });
    alert(res.ok ? 'Saved transcription' : 'Failed to save transcription');
  };

  const handleDownload = () => {
    if (replayId) {
      window.open(`/api/replays/${replayId}/usage/export`, '_blank');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Usage Records for Replay {replayId}</h2>

      <button onClick={handleDownload} style={{ marginBottom: '1rem' }}>
        📥 Download CSV
      </button>

      {usage.map((u) => (
        <div key={u.id} style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #ccc' }}>
          <p><strong>Caller ID:</strong> {u.callerId}</p>
          <p><strong>Date:</strong> {new Date(u.createdAt).toLocaleString()}</p>

          {['firstName', 'lastName', 'company', 'phone'].map((field) => {
            const fieldKey = `${field}RecordingUrl` as keyof UsageRecord;
            const audioUrl = u[fieldKey] as string;
            return audioUrl ? (
              <div key={field} style={{ marginBottom: '0.5rem' }}>
                {field.charAt(0).toUpperCase() + field.slice(1)}:{' '}
                <audio controls src={audioUrl} />
                <input
                  type="text"
                  placeholder={`Transcribe ${field}`}
                  value={u[field as keyof UsageRecord] || ''}
                  onChange={(e) => handleFieldChange(u.id, field as any, e.target.value)}
                  style={{ marginLeft: '1rem' }}
                />
              </div>
            ) : null;
          })}

          <button onClick={() => handleSave(u)}>Save Transcription</button>
        </div>
      ))}
    </div>
  );
}
