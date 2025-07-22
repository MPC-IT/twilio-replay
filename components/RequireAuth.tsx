import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

interface RequireAuthProps {
  adminOnly?: boolean;
  children: React.ReactNode;
}

export default function RequireAuth({ adminOnly, children }: RequireAuthProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    if (session.user.isSuspended) {
      router.replace("/login?suspended=true");
      return;
    }

    if (adminOnly && !session.user.isAdmin) {
      router.replace("/replays");
      return;
    }
  }, [session, status, router, adminOnly]);

  if (status === "loading" || !session?.user) return null;

  return <>{children}</>;
}
