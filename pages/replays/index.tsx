import { GetServerSideProps } from 'next';
import { prisma } from '@/lib/prisma';
import styles from '@/styles/Replays.module.css';
import Link from 'next/link';
import { useState } from 'react';

interface Replay {
  id: number;
  codeInt: number;
  title: string;
  company: string;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  replays: Replay[];
}

export default function ReplayListPage({ replays }: Props) {
  const [editedReplays, setEditedReplays] = useState<Replay[]>(replays);

  const handleChange = (id: number, field: 'title' | 'company', value: string) => {
    setEditedReplays(prev =>
      prev.map(r => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleDeactivate = (id: number) => {
    // Placeholder — call API to deactivate
    alert(`Deactivate replay ID ${id}`);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>All Conference Replays</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Replay Code</th>
            <th>Title</th>
            <th>Company</th>
            <th>Edit</th>
            <th>Deactivate</th>
          </tr>
        </thead>
        <tbody>
          {editedReplays.map((replay) => (
            <tr key={replay.id}>
              <td>{replay.codeInt}</td>
              <td>
                <input
                  className={styles.input}
                  value={replay.title || ''}
                  onChange={(e) => handleChange(replay.id, 'title', e.target.value)}
                />
              </td>
              <td>
                <input
                  className={styles.input}
                  value={replay.company || ''}
                  onChange={(e) => handleChange(replay.id, 'company', e.target.value)}
                />
              </td>
              <td>
                <Link className={styles.button} href={`/replays/${replay.id}`}>
                  Edit
                </Link>
              </td>
              <td>
                <button className={styles.deactivate} onClick={() => handleDeactivate(replay.id)}>
                  Deactivate
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const replays = await prisma.replay.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return {
    props: {
      replays: JSON.parse(JSON.stringify(replays)),
    },
  };
};
