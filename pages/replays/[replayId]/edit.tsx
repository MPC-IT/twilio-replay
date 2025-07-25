import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '@/styles/EditReplay.module.css';

interface Replay {
  id: number;
  codeInt: number;
  title: string;
  startTime?: string;
  endTime?: string;
  firstNamePromptEnabled: boolean;
  lastNamePromptEnabled: boolean;
  companyPromptEnabled: boolean;
  phonePromptEnabled: boolean;
  firstNamePromptUrl?: string;
  lastNamePromptUrl?: string;
  companyPromptUrl?: string;
  phonePromptUrl?: string;
  recordingUrl?: string;
}

export default function EditReplayPage() {
  const router = useRouter();
  const { replayId } = router.query;
  const [replay, setReplay] = useState<Replay | null>(null);

  useEffect(() => {
    if (!replayId) return;
    fetch(`/api/replays/${replayId}`)
      .then(res => res.json())
      .then(data => setReplay(data));
  }, [replayId]);

  const handleChange = (field: keyof Replay, value: any) => {
    if (!replay) return;
    setReplay({ ...replay, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replay) return;
    await fetch(`/api/replays/${replayId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(replay),
    });
    router.push('/replays');
  };

  if (!replay) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <h1>{replay.title}</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Start Time:
          <input
            type="datetime-local"
            value={replay.startTime || ''}
            onChange={(e) => handleChange('startTime', e.target.value)}
          />
        </label>

        <label>
          End Time:
          <input
            type="datetime-local"
            value={replay.endTime || ''}
            onChange={(e) => handleChange('endTime', e.target.value)}
          />
        </label>

        <fieldset>
          <legend>Caller Prompts</legend>

          <label>
            <input
              type="checkbox"
              checked={replay.firstNamePromptEnabled}
              onChange={(e) => handleChange('firstNamePromptEnabled', e.target.checked)}
            />
            Enable First Name Prompt
          </label>

          <label>
            <input
              type="checkbox"
              checked={replay.lastNamePromptEnabled}
              onChange={(e) => handleChange('lastNamePromptEnabled', e.target.checked)}
            />
            Enable Last Name Prompt
          </label>

          <label>
            <input
              type="checkbox"
              checked={replay.companyPromptEnabled}
              onChange={(e) => handleChange('companyPromptEnabled', e.target.checked)}
            />
            Enable Company Prompt
          </label>

          <label>
            <input
              type="checkbox"
              checked={replay.phonePromptEnabled}
              onChange={(e) => handleChange('phonePromptEnabled', e.target.checked)}
            />
            Enable Phone Prompt
          </label>
        </fieldset>

        <label>
          Conference Recording:
          <input type="file" disabled />
          <p style={{ fontSize: '0.8rem', color: '#666' }}>
            Upload functionality handled separately
          </p>
        </label>

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}
