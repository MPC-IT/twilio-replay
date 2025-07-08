// pages/replays/lookup.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function ReplayLookup() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/replays/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (res.ok && data.replayId) {
        router.push(`/replays/${data.replayId}`);
      } else {
        setError('Replay code not found. Please check and try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <>
      <Head>
        <title>Replay Access</title>
      </Head>
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <Image
          src="/header.png"
          alt="Multi-Point Communications Header"
          width={600}
          height={120}
          style={{ marginBottom: '40px' }}
        />
        <h1>Access Your Conference Replay</h1>
        <form onSubmit={handleSubmit} style={{ marginTop: '30px' }}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter Replay Code"
            required
            style={{
              padding: '10px',
              fontSize: '16px',
              width: '300px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
          <br />
          <button
            type="submit"
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#242a78',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Access Replay
          </button>
        </form>
        {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>}
      </div>
      <Footer />
    </>
  );
}
