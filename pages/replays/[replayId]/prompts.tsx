// /pages/replays/[replayId]/prompts.tsx
import dynamic from 'next/dynamic';

const ReplayPromptsPage = dynamic(() => import('@/components/replays/ReplayPromptsFormPage'), {
  ssr: false, // Prevents server-side rendering during build
});

export default ReplayPromptsPage;
