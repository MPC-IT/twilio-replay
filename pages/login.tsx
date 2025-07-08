import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import Image from 'next/image';
import styles from '@/styles/Login.module.css';
import headerImage from '/public/header.png';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl: '/dashboard',
    });

    if (result?.ok) {
      router.push('/dashboard');
    } else {
      setError('Invalid email or password.');
    }
  };

  if (status === 'loading') return null;

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <Image
            src={headerImage}
            alt="Conference Replay Header"
            className={styles.headerImage}
            priority
          />
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <p>Please enter your Email and Password to log in.</p>

          {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            autoComplete="username"
          />

          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            autoComplete="current-password"
          />

          <button type="submit">Login</button>
        </form>
      </div>
    </>
  );
}
