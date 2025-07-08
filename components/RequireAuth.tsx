import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

type RequireAuthProps = {
  children: React.ReactNode;
  adminOnly?: boolean;
};

export default function RequireAuth({ children, adminOnly = false }: RequireAuthProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading

    if (!session) {
      router.replace('/login');
      return;
    }

    if (adminOnly && session.user?.role !== 'admin') {
      // Redirect non-admin user trying to access admin page
      router.replace('/replays');
      return;
    }
  }, [session, status, router, adminOnly]);

  if (status === 'loading' || !session) {
    return <p>Loading...</p>;
  }

  if (adminOnly && session.user?.role !== 'admin') {
    return <p>Access denied</p>;
  }

  return <>{children}</>;
}
