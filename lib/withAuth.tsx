import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import type { ComponentType, ComponentPropsWithoutRef } from 'react';

type Role = 'admin' | 'user' | 'any';

export function withAuth<P extends {}>(
  WrappedComponent: ComponentType<P>,
  allowedRoles: Role[] = ['any']
) {
  const ComponentWithAuth = (props: ComponentPropsWithoutRef<typeof WrappedComponent>) => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === 'loading') return;

      const user = session?.user;
      if (!user) {
        router.replace('/login');
        return;
      }

      if (
        allowedRoles.includes('any') ||
        (user.isAdmin && allowedRoles.includes('admin')) ||
        (!user.isAdmin && allowedRoles.includes('user'))
      ) {
        return;
      }

      router.replace('/not-authorized');
    }, [session, status, router]);

    if (status === 'loading' || !session) return <p>Loading...</p>;

    return <WrappedComponent {...(props as P)} />;
  };

  return ComponentWithAuth;
}
