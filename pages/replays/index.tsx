// pages/replays/index.tsx
import { GetServerSideProps } from 'next';
import { prisma } from '@/lib/prisma';
import type { ReplayGetPayload } from '@prisma/client';

type ReplayWithUsages = ReplayGetPayload<{
  include: { usages: true };
}>;

interface Props {
  replays: ReplayWithUsages[];
}

export default function ReplayListPage({ replays }: Props) {
  return (
    <div>
      <h1>Conference Replays</h1>
      {replays.map((replay) => {
        const usage = replay.usages[0]; // show first usage, or loop all if needed

        return (
          <div key={replay.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
            <h2>Replay #{replay.codeInt}: {replay.title}</h2>
            <p><strong>Start:</strong> {new Date(replay.startTime).toLocaleString()}</p>
            <p><strong>End:</strong> {new Date(replay.endTime).toLocaleString()}</p>
            {usage && (
              <div>
                <p><strong>First Name Recording:</strong> <a href={usage.firstNameRecordingUrl || '#'}>{usage.firstNameRecordingUrl || 'N/A'}</a></p>
                <p><strong>Last Name Recording:</strong> <a href={usage.lastNameRecordingUrl || '#'}>{usage.lastNameRecordingUrl || 'N/A'}</a></p>
                <p><strong>Company Recording:</strong> <a href={usage.companyRecordingUrl || '#'}>{usage.companyRecordingUrl || 'N/A'}</a></p>
                <p><strong>Phone Recording:</strong> <a href={usage.phoneRecordingUrl || '#'}>{usage.phoneRecordingUrl || 'N/A'}</a></p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const replays = await prisma.replay.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      usages: true,
    },
  });

  return {
    props: {
      replays: JSON.parse(JSON.stringify(replays)),
    },
  };
};
