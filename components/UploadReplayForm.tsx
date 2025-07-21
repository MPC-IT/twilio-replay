'use client'

import { useState } from 'react'

export default function UploadReplayForm() {
  const [replayId, setReplayId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus(null)

    if (!replayId || !file) {
      setStatus('Replay ID and file are required.')
      return
    }

    const formData = new FormData()
    formData.append('replayId', replayId)
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload-replay', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      if (res.ok) {
        setStatus(`Upload successful! File URL: ${data.url}`)
      } else {
        setStatus(`Error: ${data.error || 'Unknown error'}`)
      }
    } catch (err) {
      console.error(err)
      setStatus('An error occurred while uploading.')
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Upload Replay Recording</h2>

      <div>
        <label htmlFor="replayId">Replay ID (numeric):</label><br />
        <input
          type="number"
          id="replayId"
          value={replayId}
          onChange={(e) => setReplayId(e.target.value)}
          required
        />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label htmlFor="file">Audio File:</label><br />
        <input
          type="file"
          id="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
      </div>

      <button type="submit" style={{ marginTop: '1rem' }}>
        Upload
      </button>

      {status && (
        <p style={{ marginTop: '1rem', color: status.startsWith('Error') ? 'red' : 'green' }}>
          {status}
        </p>
      )}
    </form>
  )
}
