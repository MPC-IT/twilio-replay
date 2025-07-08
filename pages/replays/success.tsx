import Link from 'next/link';
import styles from '@/styles/EditReplay.module.css';
import { withAuth } from '@/lib/withAuth';

function ReplaySuccessPage() {
  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Replay Created Successfully!</h2>
      <p>Your replay was created and saved in the portal.</p>
      <p>
        You can now:
        <ul>
          <li><Link href="/replays">View all Replays</Link></li>
          <li><Link href="/replays/new">Create another Replay</Link></li>
        </ul>
      </p>
    </div>
  );
}

ReplaySuccessPage.pageTitle = 'Replay Created';
export default withAuth(ReplaySuccessPage, ['admin']);
