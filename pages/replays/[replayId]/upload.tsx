import { useRouter } from 'next/router';
import { useState, FormEvent } from 'react';
import RequireAuth from '@/components/RequireAuth';
import styles from '@/styles/Replays.module.css';

function UploadPage() {
  const router = useRouter();
  const { replayId } = router.query;

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !replayId) return;

    const formData = new FormData();
    formData.append('audio', file);

    setUploading(true);
    setStatus(null);

    try {
      const res = await fetch(`/api/replays/${replayId}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      setStatus('Upload successful!');
      setFile(null);
    } catch (err) {
      setStatus('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Upload Replay Audio</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {file && <p>Selected: {file.name}</p>}

        <div className={styles.buttons}>
          <button type="submit" disabled={!file || uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          <button type="button" onClick={() => router.push(`/replays/${replayId}`)}>
            Cancel
          </button>
        </div>
        {status && <p>{status}</p>}
      </form>
    </div>
  );
}

export default function ProtectedUploadPage() {
  return (
    <RequireAuth>
      <UploadPage />
    </RequireAuth>
  );
}
