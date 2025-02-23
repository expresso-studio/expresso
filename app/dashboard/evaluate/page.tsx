/**
 * Main page component that renders the GestureAnalyzer component.
 * This component is wrapped with Suspense to handle the dynamic imports
 * and prevent hydration errors.
 */
import { Suspense } from 'react';
import GestureAnalyzer from './GestureAnalyzer';
import TranscriptionComponent from '@/components/TranscriptionComponent';

export default function Page() {
  return (
    <div className="relative flex flex-col items-center">
      <Suspense fallback={<div>Loading...</div>}>
        <GestureAnalyzer />
      </Suspense>
      <div className="w-full max-w-[1200px] mt-8">
        <TranscriptionComponent />
      </div>
    </div>
  );
}