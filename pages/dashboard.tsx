// pages/dashboard.tsx
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { withAuth } from '@/lib/withAuth';

function Dashboard() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: '3rem',
        padding: '2rem',
        gap: '2rem',
      }}
    >
      <DashboardTile
        href="/replays"
        title="Conference Replays"
        description="Search and manage your replay accounts"
      />
      {isAdmin && (
        <DashboardTile
          href="/admin/users"
          title="Manage Portal Users"
          description="Create, suspend, and reset user accounts"
        />
      )}
    </div>
  );
}

function DashboardTile({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      style={{
        width: '100%',
        maxWidth: '600px',
        padding: '2rem',
        border: '1px solid #ccc',
        borderRadius: '12px',
        background: '#f9f9f9',
        textDecoration: 'none',
        color: '#000',
        boxShadow: '2px 2px 12px rgba(0, 0, 0, 0.05)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <h3 style={{ marginBottom: '0.5rem', color: '#2d97d5', fontSize: '1.3rem' }}>{title}</h3>
      <p style={{ fontSize: '1rem', color: '#444' }}>{description}</p>
    </Link>
  );
}

export default withAuth(Dashboard, ['any']);
