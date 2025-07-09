import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import Layout from '@/components/Layout';
import { Toaster } from 'react-hot-toast';
import { supabase } from '@/utils/supabase'; // ✅ Your Supabase client (safe to import)

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps & { Component: any }) {
  const pageTitle = Component.pageTitle || '';

  return (
    <SessionProvider session={session}>
      <Layout pageTitle={pageTitle}>
        <Component {...pageProps} />
        <Toaster position="top-right" reverseOrder={false} />
      </Layout>
    </SessionProvider>
  );
}
