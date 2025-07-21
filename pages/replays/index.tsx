import { GetServerSideProps } from 'next'
import { prisma } from '@/lib/prisma'

interface ReplayWithUsage {
  id: number
  codeInt: number
  replayId: number
  title: string
  createdAt: string
  updatedAt: string
  usageRecords: {
    id: number
    callerId: string
    createdAt: string
    firstName?: string | null
    lastName?: string | null
    company?: string | null
    phone?: string | null
  }[]
}

interface Props {
  replays: ReplayWithUsage[]
}

export default function ReplayListPage({ replays }: Props) {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Conference Replays</h1>
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {replays.map((replay) => (
          <li key={replay.id} style={{ marginBottom: '2rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
            <p><strong>Replay ID:</strong> {replay.replayId}</p>
            <p><strong>Replay Code:</strong> {replay.codeInt}</p>
            <p><strong>Title:</strong> {replay.title}</p>
            <p><strong>Created:</strong> {new Date(replay.createdAt).toLocaleString()}</p>
            <p><strong>Usage Records:</strong> {replay.usageRecords.length}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const replays = await prisma.replay.findMany({
    include: {
      usageRecords: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return {
    props: {
      replays: JSON.parse(JSON.stringify(replays)),
    },
  }
}
