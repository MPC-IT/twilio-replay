import { useState } from 'react';

interface Props {
  replayId: Number(number);
}

export default function UploadReplayRecording({ replayId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('replayId', replayId.toString());
    formData.append('file', file);

    const res = await fetch('/api/upload-replay', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      setMessage('Upload successful!');
    } else {
      setMessage(`Error: ${data.error || 'Unknown error'}`);
    }

    setUploading(false);
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <label>
        Upload MP3 Recording:
        <input
          type="file"
          accept="audio/mpeg"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          disabled={uploading}
        />
      </label>
      <button onClick={handleUpload} disabled={!file || uploading} style={{ marginLeft: '0.5rem' }}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}
