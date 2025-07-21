import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function AccessWindowPage() {
  const router = useRouter()
  const { replayId } = router.query
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  useEffect(() => {
    if (replayId) {
      fetch(`/api/replays/${replayId}`)
        .then(res => res.json())
        .then(data => {
          if (data.startTime) setStartTime(data.startTime.split('T')[0])
          if (data.endTime) setEndTime(data.endTime.split('T')[0])
        })
    }
  }, [replayId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch(`/api/replays/${replayId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startTime, endTime }),
    })
    alert('Replay window updated.')
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Set Replay Availability</h1>
      <form onSubmit={handleSubmit}>
        <label>Start Time: <input type="date" value={startTime} onChange={e => setStartTime(e.target.value)} /></label><br />
        <label>End Time: <input type="date" value={endTime} onChange={e => setEndTime(e.target.value)} /></label><br />
        <button type="submit">Save</button>
      </form>
    </div>
  )
}
