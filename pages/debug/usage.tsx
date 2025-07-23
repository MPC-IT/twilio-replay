import { GetServerSideProps } from 'next'
import { prisma } from '@/lib/prisma'

export default function DebugUsage({ usage }: { usage: any[] }) {
  return (
    <div>
      <h1>📞 Debug: Usage</h1>
      <pre>{JSON.stringify(usage, null, 2)}</pre>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const usage = await prisma.usage.findMany({
    include: {
      replay: true,
    },
  })
  return { props: { usage } }
}
