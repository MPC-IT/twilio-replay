import { signOut, useSession } from 'next-auth/react';
import styles from '@/styles/Layout.module.css';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

export default function Layout({ children, pageTitle }: LayoutProps) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <h1 className={styles.title}>{pageTitle}</h1>
        {user && (
          <button
            onClick={() => signOut()}
            className={styles.logout}
          >
            Logout
          </button>
        )}
      </nav>

      <main className={styles.mainContent}>{children}</main>
      <Footer />
    </div>
  );
}
