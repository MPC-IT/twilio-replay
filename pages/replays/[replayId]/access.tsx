import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function AccessWindowPage() {
  const router = useRouter()
  const { replayId } = router.query
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    if (replayId) {
      fetch(`/api/replays/${replayId}/access`)
        .then(res => res.json())
        .then(data => {
          if (data.startDate) setStartDate(data.startDate.split('T')[0])
          if (data.endDate) setEndDate(data.endDate.split('T')[0])
        })
    }
  }, [replayId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch(`/api/replays/${replayId}/access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate }),
    })
    alert('Access window updated.')
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Set Scheduled Access Window</h1>
      <form onSubmit={handleSubmit}>
        <label>Start Date: <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></label><br />
        <label>End Date: <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></label><br />
        <button type="submit">Save</button>
      </form>
    </div>
  )
}
