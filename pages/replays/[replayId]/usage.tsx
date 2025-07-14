import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

interface UsageRecord {
  id: string
  callerId: string
  createdAt: string
  firstNameRecordingUrl?: string
  lastNameRecordingUrl?: string
  companyRecordingUrl?: string
  phoneRecordingUrl?: string
  transcription?: {
    firstName?: string
    lastName?: string
    company?: string
    phone?: string
  }
}

export default function UsageReviewPage() {
  const router = useRouter()
  const { replayId } = router.query
  const [usage, setUsage] = useState<UsageRecord[]>([])

  useEffect(() => {
    if (!replayId) return
    fetch(`/api/replays/${replayId}/usage`)
      .then(res => res.json())
      .then(setUsage)
  }, [replayId])

  const handleTranscriptionChange = (
    usageId: string,
    field: string,
    value: string
  ) => {
    setUsage((prev) =>
      prev.map((u) =>
        u.id === usageId
          ? {
              ...u,
              transcription: {
                ...u.transcription,
                [field]: value,
              },
            }
          : u
      )
    )
  }

  const handleSave = async (u: UsageRecord) => {
    const res = await fetch(`/api/usage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: u.id,
        transcription: u.transcription,
      }),
    })
    if (res.ok) {
      alert('Transcription saved')
    } else {
      alert('Failed to save transcription')
    }
  }

  const handleDownload = () => {
    if (replayId) {
      window.open(`/api/replays/${replayId}/usage/export`, '_blank')
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Caller Recordings – Replay {replayId}</h2>

      <button onClick={handleDownload} style={{ marginBottom: '1rem' }}>
        📥 Download Usage CSV
      </button>

      {usage.map((u) => (
        <div
          key={u.id}
          style={{
            marginBottom: '2rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #ccc',
          }}
        >
          <p>
            <strong>Caller ID:</strong> {u.callerId}
          </p>
          <p>
            <strong>Date:</strong>{' '}
            {new Date(u.createdAt).toLocaleString()}
          </p>

          {['firstName', 'lastName', 'company', 'phone'].map((field) => {
            const url = u[`${field}RecordingUrl` as keyof UsageRecord] as string
            return url ? (
              <div key={field} style={{ marginBottom: '0.5rem' }}>
                {field.charAt(0).toUpperCase() + field.slice(1)}:{' '}
                <audio controls src={url} />
                <input
                  type="text"
                  placeholder={`Transcribe ${field}`}
                  value={u.transcription?.[field] || ''}
                  onChange={(e) =>
                    handleTranscriptionChange(u.id, field, e.target.value)
                  }
                  style={{ marginLeft: '1rem' }}
                />
              </div>
            ) : null
          })}

          <button onClick={() => handleSave(u)}>Save Transcription</button>
        </div>
      ))}
    </div>
  )
}
