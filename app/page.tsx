/**
 * Main page component that renders the GestureAnalyzer component.
 * This component is wrapped with Suspense to handle the dynamic imports
 * and prevent hydration errors.
 */
import { Suspense } from 'react';
import GestureAnalyzer from '@/evaluate/GestureAnalyzer';

export default function Page() {
  return (
    <div className="relative">
      <Suspense fallback={<div>Loading...</div>}>
        <GestureAnalyzer />
      </Suspense>
    </div>
  );
}