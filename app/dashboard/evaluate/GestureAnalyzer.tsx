/**
 * Main component that does all pose detection functionality.
 * Handles the UI state, controls, and coordinates between child components.
 * Uses dynamic imports for client-side only components to prevent SSR issues.
 * Edit this file when adding extra child components
 */
"use client"

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import EvaluateVideo, { PoseResults } from './EvaluateVideo';
import { PoseTracking } from './PoseTracking';

// Dynamically import PoseVisualization to prevent SSR issues
const PoseVisualization = dynamic(() => import('./PoseVisualization'), {
  ssr: false
});


const GestureAnalyzer = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [poseResults, setPoseResults] = useState<PoseResults | null>(null);
  const [showVisualization, setShowVisualization] = useState(true);
  const [showNotifications, setShowNotifications] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true once component mounts to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleVisualization = () => setShowVisualization(prev => !prev);
  const toggleNotifications = () => setShowNotifications(prev => !prev);

  // Initialize MediaPipe script
  useEffect(() => {
    if (!isClient) return;

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js';
    script.crossOrigin = 'anonymous';
    document.body.appendChild(script);

    script.onload = () => setLoading(false);
    script.onerror = () => {
      setError('Failed to load pose detection model');
      setLoading(false);
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [isClient]);

  // Don't render anything during SSR
  if (!isClient) return null;

  return (
    <div className="w-[1200px] h-[800px] relative mx-auto my-4 overflow-hidden border">
      <EvaluateVideo
        loading={loading}
        onPoseResults={setPoseResults}
        onError={setError}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-xl">
          Loading pose detection...
        </div>
      )}
      {error && (
        <div className="absolute top-5 left-5 p-4 bg-red-100 border border-red-500 rounded text-red-600">
          {error}
        </div>
      )}
      <div className="absolute top-5 right-5 flex gap-4 z-50">
        <button
          onClick={toggleNotifications}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          {showNotifications ? 'Hide' : 'Show'} Notifications
        </button>
        <button
          onClick={toggleVisualization}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {showVisualization ? 'Hide' : 'Show'} Visualization
        </button>
      </div>
      {poseResults && (
        <div className="absolute inset-0">
          <PoseTracking results={poseResults} showNotifications={showNotifications} />
          {showVisualization && <PoseVisualization results={poseResults} />}
        </div>
      )}
    </div>
  );
};

export default GestureAnalyzer;