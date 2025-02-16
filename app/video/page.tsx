'use client';

import Head from 'next/head';
import TranscriptionComponent from '@/components/TranscriptionComponent';

export default function TranscriptionPage() {
  return (
    <>
      <Head>
        <title>Transcription Page</title>
        <meta name="description" content="Live transcription from video and audio capture" />
      </Head>
      <main>
        <TranscriptionComponent />
      </main>
    </>
  );
}
