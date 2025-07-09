// pages/replays/index.tsx
import { useEffect, useState } from 'react';
import type { GetServerSideProps } from 'next';
import type { Replay, Usage } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type ReplayWithUsage = Replay & {
  usages: Usage[];
};

interface Props {
  replays: ReplayWithUsage[];
}

export default function ReplayListPage({ replays }: Props) {
  return (
    <div>
      <h1>Conference Replays</h1>
      {replays.map((replay) => {
        const usage = replay.usages[0]; // You can extend this to loop over all usages if needed

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

// Fetch data on the server and pass to the component as props
export const getServerSideProps: GetServerSideProps = async () => {
  const replays = await prisma.replay.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      usages: true,
    },
  });

  return {
    props: {
      replays: JSON.parse(JSON.stringify(replays)), // serialize Date fields
    },
  };
};
