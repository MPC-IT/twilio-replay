import { useEffect, useState } from 'react';

export default function ReplayPromptsForm({ replayId }: { replayId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [promptText, setPromptText] = useState({
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
  });
  const [existingAudio, setExistingAudio] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!replayId) return;

    // Check for audio
    fetch(`/recordings/prompts/${replayId}/prompt.mp3`)
      .then(res => res.ok ? setExistingAudio(res.url) : null)
      .catch(() => null);

    // Load current prompt text
    fetch(`/api/replays/${replayId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.prompts) {
          setPromptText({
            firstName: data.prompts.firstName || '',
            lastName: data.prompts.lastName || '',
            company: data.prompts.company || '',
            phone: data.prompts.phone || '',
          });
        }
      });
  }, [replayId]);

  const handlePromptTextUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Saving prompt text...');
    const res = await fetch(`/api/replays/${replayId}/prompts`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promptText),
    });

    setStatus(res.ok ? 'Prompt text updated!' : 'Failed to update prompt text');
  };

  const handleAudioUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('prompt', file);

    const res = await fetch(`/api/replays/${replayId}/prompts`, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      setStatus('Audio uploaded!');
      setExistingAudio(`/recordings/prompts/${replayId}/prompt.mp3`);
    } else {
      setStatus('Failed to upload audio.');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h3>Edit Caller Prompt Text</h3>
      <form onSubmit={handlePromptTextUpdate}>
        {['firstName', 'lastName', 'company', 'phone'].map((field) => (
          <label key={field} style={{ display: 'block', marginBottom: '1rem' }}>
            {field.charAt(0).toUpperCase() + field.slice(1)} Prompt:
            <input
              type="text"
              value={promptText[field as keyof typeof promptText]}
              onChange={(e) => setPromptText(prev => ({
                ...prev,
                [field]: e.target.value,
              }))}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </label>
        ))}
        <button type="submit">Save Prompt Text</button>
      </form>

      <hr style={{ margin: '2rem 0' }} />

      <h3>Upload Prompt Audio (optional)</h3>
      <form onSubmit={handleAudioUpload}>
        <input
          type="file"
          accept="audio/mp3"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button type="submit">Upload Prompt Audio</button>
      </form>

      {existingAudio && (
        <div style={{ marginTop: '1rem' }}>
          <p>Current Audio Prompt:</p>
          <audio controls src={existingAudio} />
        </div>
      )}

      {status && <p style={{ marginTop: '1rem' }}>{status}</p>}
    </div>
  );
}
