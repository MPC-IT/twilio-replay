import { useRouter } from 'next/router';
import { useState } from 'react';
import styles from '@/styles/Login.module.css'; // reusing styled form box

export default function ReplayAccessPage() {
  const [code, setCode] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    router.push(`/replays/access/${code.trim()}`);
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Replay a Conference Call</h2>
        <p>Enter the numeric Replay Code provided to you.</p>

        <label htmlFor="code">Replay Code:</label>
        <input
          id="code"
          name="code"
          type="number"
          required
          value={code}
          onChange={e => setCode(e.target.value)}
        />

        <button type="submit">Listen Now</button>
      </form>
    </div>
  );
}
