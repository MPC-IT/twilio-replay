import type { GetServerSideProps } from 'next'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

const replayWithUsages = Prisma.validator<Prisma.ReplayDefaultArgs>()({
  include: {
    usages: true,
  },
})

type ReplayWithUsages = Prisma.ReplayGetPayload<typeof replayWithUsages>

interface Props {
  replays: ReplayWithUsages[]
}

export default function ReplayListPage({ replays }: Props) {
  return (
    <div>
      <h1>📞 Conference Replays</h1>
      {replays.map((replay) => {
        const usage = replay.usages[0] // show first usage

        return (
          <div key={replay.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
            <h2>Replay #{replay.codeInt}: {replay.title}</h2>
            <p><strong>Start:</strong> {new Date(replay.startTime).toLocaleString()}</p>
            <p><strong>End:</strong> {new Date(replay.endTime).toLocaleString()}</p>

            {usage && (
              <p>
                <strong>First Name Recording:</strong>{' '}
                <a href={usage.firstNameRecordingUrl || '#'} target="_blank" rel="noreferrer">
                  Play
                </a>
              </p>
            )}
          </div>
        )
      })}
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
      replays,
    },
  }
}
