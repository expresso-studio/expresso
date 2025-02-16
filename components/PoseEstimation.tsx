"use client"

import React, { useEffect, useRef, useState } from 'react';
import { PoseTracking } from './PoseTracking';
import dynamic from 'next/dynamic';

const PoseVisualization = dynamic(() => import('./PoseVisualization'), {
  ssr: false
});

interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface PoseResults {
  poseLandmarks?: PoseLandmark[];
}

interface MediaPipePose {
  close(): void;
  onResults(callback: (results: PoseResults) => void): void;
  send(config: { image: HTMLVideoElement }): Promise<void>;
  setOptions(options: {
    modelComplexity: number;
    smoothLandmarks: boolean;
    minDetectionConfidence: number;
    minTrackingConfidence: number;
  }): void;
}

declare global {
  interface Window {
    Pose: new (config: { locateFile: (file: string) => string }) => MediaPipePose;
  }
}

const PoseEstimation = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [poseResults, setPoseResults] = useState<PoseResults | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js';
    script.crossOrigin = 'anonymous';
    document.body.appendChild(script);

    script.onload = () => {
      console.log('MediaPipe script loaded');
      setLoading(false);
    };

    script.onerror = () => {
      console.error('Failed to load MediaPipe script');
      setError('Failed to load pose detection model');
      setLoading(false);
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;
    
    const setupCamera = async () => {
      if (!videoRef.current) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1200, height: 800 }
        });
        videoRef.current.srcObject = stream;
        console.log('Camera setup successful');
      } catch (err) {
        console.error('Camera setup failed:', err);
        setError(`Failed to access webcam: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    setupCamera();
  }, [isClient]);

  useEffect(() => {
    if (!isClient || loading || !videoRef.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    let pose: MediaPipePose | null = null;
    let animationFrameId: number | null = null;

    const initializePose = async () => {
      try {
        pose = new window.Pose({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          }
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        pose.onResults((results: PoseResults) => {
          console.log('Pose detection results:', results.poseLandmarks ? 'Landmarks detected' : 'No landmarks');
          
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          if (!videoRef.current) return;
          ctx.drawImage(videoRef.current, 0, 0, ctx.canvas.width, ctx.canvas.height);

          setPoseResults(results);

          if (results.poseLandmarks) {
            results.poseLandmarks.forEach((landmark: PoseLandmark) => {
              ctx.beginPath();
              ctx.arc(
                landmark.x * ctx.canvas.width,
                landmark.y * ctx.canvas.height,
                4,
                0,
                2 * Math.PI
              );
              ctx.fillStyle = '#00ff00';
              ctx.fill();
            });

            // Draw connections
            const connections = [
              [0, 1], [1, 2], [2, 3], [3, 7],
              [0, 4], [4, 5], [5, 6], [6, 8],
              [9, 10], [11, 12], [11, 13], [13, 15],
              [15, 17], [15, 19], [15, 21],
              [12, 14], [14, 16], [16, 18], [16, 20], [16, 22],
              [11, 23], [12, 24], [23, 24],
              [23, 25], [25, 27], [27, 29], [27, 31],
              [24, 26], [26, 28], [28, 30], [28, 32]
            ] as const;

            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;

            connections.forEach(([i, j]) => {
              const start = results.poseLandmarks?.[i];
              const end = results.poseLandmarks?.[j];

              if (start && end) {
                ctx.beginPath();
                ctx.moveTo(start.x * ctx.canvas.width, start.y * ctx.canvas.height);
                ctx.lineTo(end.x * ctx.canvas.width, end.y * ctx.canvas.height);
                ctx.stroke();
              }
            });
          }
        });

        console.log('Pose detection initialized');

        const detectPose = async () => {
          if (videoRef.current?.readyState === 4 && pose) {
            await pose.send({ image: videoRef.current });
          }
          animationFrameId = requestAnimationFrame(detectPose);
        };

        detectPose();
      } catch (err) {
        console.error('Pose initialization failed:', err);
        setError(`Error initializing pose detection: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    initializePose();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (pose) {
        pose.close();
      }
    };
  }, [loading, isClient]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="relative w-[1200px] h-[800px] overflow-hidden">
        <video
          ref={videoRef}
          className="absolute w-full h-full object-cover"
          autoPlay
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="absolute w-full h-full object-cover"
          width={1200}
          height={800}
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
        {poseResults && (
          <div className="absolute inset-0">
            <PoseTracking results={poseResults} />
            <PoseVisualization results={poseResults} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PoseEstimation;