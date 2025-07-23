import { GetServerSideProps } from 'next'
import { prisma } from '@/lib/prisma'

export default function DebugReplays({ replays }: { replays: any[] }) {
  return (
    <div>
      <h1>🔍 Debug: Replays</h1>
      <pre>{JSON.stringify(replays, null, 2)}</pre>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const replays = await prisma.replay.findMany({
    include: {
      prompts: true,
      recordings: true,
      usageRecords: true,
    },
  })
  return { props: { replays } }
}
