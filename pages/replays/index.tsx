import { GetServerSideProps } from 'next';
import { prisma } from '@/lib/prisma';
import type { Replay, Usage } from '@prisma/client';

type ReplayWithUsages = Replay & {
  usages: Usage[];
};

interface Props {
  replays: ReplayWithUsages[];
}

export default function ReplayListPage({ replays }: Props) {
  return (
    <div>
      <h1>🎧 Conference Replays</h1>
      {replays.map((replay) => {
        const usage = replay.usages[0]; // show first usage, or loop all if needed

        return (
          <div
            key={replay.id}
            style={{
              border: '1px solid #ccc',
              padding: '1rem',
              marginBottom: '1rem',
            }}
          >
            <h2>Replay #{replay.codeInt}: {replay.title}</h2>
            <p><strong>Start:</strong> {new Date(replay.startTime).toLocaleString()}</p>
            <p><strong>End:</strong> {new Date(replay.endTime).toLocaleString()}</p>

            {usage && (
              <p>
                <strong>First Name Recording:</strong>{' '}
                <a href={usage.firstNameRecordingUrl || '#'} target="_blank" rel="noopener noreferrer">
                  {usage.firstNameRecordingUrl || 'Unavailable'}
                </a>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const replays = await prisma.replay.findMany({
    include: {
      usages: true,
    },
    orderBy: {
      startTime: 'desc',
    },
  });

  return {
    props: {
      replays,
    },
  };
};
