import { GetServerSideProps } from 'next'
import { prisma } from '@/lib/prisma'

interface ReplayWithUsages {
  id: Number(Number)(number)
  code: number
  title: string | null
  createdAt: Date
  updatedAt: Date
  usages: {
    id: Number(Number)(number)
    callerId: string | null
    createdAt: Date
    firstName: string | null
    lastName: string | null
    company: string | null
    phone: string | null
    replayId: Number(number)
  }[]
}

interface Props {
  replays: ReplayWithUsages[]
}

export default function ReplayListPage({ replays }: Props) {
  return (
    <div>
      <h1>Conference Replays</h1>
      <ul>
        {replays.map((replay) => (
          <li key={replay.id}>
            <strong>Replay Code:</strong> {replay.code}<br />
            <strong>Title:</strong> {replay.title || 'Untitled'}<br />
            <strong>Usages:</strong> {replay.usages.length}
          </li>
        ))}
      </ul>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const replays = await prisma.replay.findMany({
    include: {
      usages: true,
    },
  })

  return {
    props: {
      replays: JSON.parse(JSON.stringify(replays)), // removes Date serialization issues
    },
  }
}
