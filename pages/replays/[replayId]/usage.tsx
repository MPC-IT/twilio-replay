import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import RequireAuth from '@/components/RequireAuth'
import styles from '@/styles/Usage.module.css'

type UsageEntry = {
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
  const router = useRouter()
  const { replayId } = router.query

  const [records, setRecords] = useState<UsageEntry[]>([])
  const [savingId, setSavingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!replayId || typeof replayId !== 'string') return

    const fetchUsage = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/usage?replayId=${replayId}`)
        if (!res.ok) throw new Error('Failed to fetch usage records')
        const data: UsageEntry[] = await res.json()
        setRecords(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUsage()
  }, [replayId])

  const handleChange = (id: number, field: keyof UsageEntry, value: string) => {
    setRecords(prev =>
      prev.map(r => (r.id === id ? { ...r, [field]: value } : r))
    )
  }

  const handleSave = async (record: UsageEntry) => {
    setSavingId(record.id)
    try {
      const res = await fetch(`/api/usage/${record.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: record.firstName,
          lastName: record.lastName,
          company: record.company,
          phone: record.phone,
        }),
      })
      if (!res.ok) throw new Error('Failed to save transcription')
      alert('Transcription saved!')
    } catch (err: any) {
      alert(err.message || 'Error saving transcription')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <RequireAuth>
      <div className={styles.container}>
        <h1 className={styles.title}>Caller Responses – Replay {replayId}</h1>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : records.length === 0 ? (
          <p>No usage records found for this replay.</p>
        ) : (
          records.map((record) => (
            <div key={record.id} className={styles.card}>
              <p><strong>Caller ID:</strong> {record.callerId}</p>
              <p><strong>Call Time:</strong> {new Date(record.createdAt).toLocaleString()}</p>
              <p><strong>Duration:</strong> {Math.floor(record.durationSeconds / 60)}m {record.durationSeconds % 60}s</p>

              {['firstName', 'lastName', 'company', 'phone'].map((field) => {
                const label = field.charAt(0).toUpperCase() + field.slice(1)
                const recordingKey = `${field}RecordingUrl` as keyof UsageEntry
                const transcriptionKey = field as keyof UsageEntry

                return (
                  <div key={field} className={styles.promptGroup}>
                    <label>{label} Recording:</label>
                    {record[recordingKey] ? (
                      <audio controls src={record[recordingKey] as string} />
                    ) : (
                      <em>No audio</em>
                    )}
                    <input
                      type="text"
                      placeholder={`Transcribed ${label}`}
                      value={record[transcriptionKey] ?? ''}
                      onChange={(e) =>
                        handleChange(record.id, transcriptionKey, e.target.value)
                      }
                      className={styles.input}
                    />
                  </div>
                )
              })}

              <button
                className={styles.saveButton}
                onClick={() => handleSave(record)}
                disabled={savingId === record.id}
              >
                {savingId === record.id ? 'Saving...' : 'Save Transcription'}
              </button>
            </div>
          ))
        )}
      </div>
    </RequireAuth>
  )
}
