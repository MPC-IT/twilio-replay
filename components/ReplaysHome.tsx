'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function ReplaysHome() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin === true;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Replay Portal</h1>
      <ul>
        <li><Link href="/replays">Manage Replays</Link></li>
        <li><Link href="/replays/usage">Usage</Link></li>
        {isAdmin && (
          <>
            <li><Link href="/replays/users">Manage Users</Link></li>
            <li><Link href="/replays/branding">Manage Branded Greetings</Link></li>
          </>
        )}
      </ul>
    </div>
  );
}
