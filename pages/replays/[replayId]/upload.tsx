import { useRouter } from 'next/router';
import { useState, FormEvent } from 'react';
import RequireAuth from '@/components/RequireAuth';
import styles from '@/styles/Replays.module.css';

function UploadPage() {
  const router = useRouter();
  const { replayId } = router.query;

  const [file, setFile] = useState<File | null>(null);
  const [label, setLabel] = useState('');
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
    formData.append('file', file);
    formData.append('replayId', replayId.toString());
    if (label) formData.append('label', label);

    setUploading(true);
    setStatus(null);

    try {
      const res = await fetch(`/api/replays/${replayId}/upload-replay`, {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      setStatus(`✅ Upload successful: ${json.url}`);
      setFile(null);
      setLabel('');
    } catch (err: any) {
      console.error(err);
      setStatus(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Upload Replay Audio</h1>
      <form onSubmit={handleSubmit} className={styles.form} encType="multipart/form-data">
        <label>
          Audio File (.mp3)
          <input type="file" accept="audio/mpeg" onChange={handleFileChange} disabled={uploading} />
        </label>

        <label>
          Optional Label
          <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} disabled={uploading} />
        </label>

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
