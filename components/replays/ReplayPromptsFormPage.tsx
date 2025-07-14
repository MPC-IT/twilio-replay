import { useRouter } from 'next/router';
import ReplayPromptsForm from './ReplayPromptsForm';

export default function ReplayPromptsFormPage() {
  const router = useRouter();
  const { replayId } = router.query;

  if (!replayId || typeof replayId !== 'string') {
    return <p>Loading replay prompts...</p>;
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Manage Replay Prompts</h1>
      <ReplayPromptsForm replayId={Number(replayId)} />
    </main>
  );
}
