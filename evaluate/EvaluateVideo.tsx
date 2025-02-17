/**
 * Component responsible for video capture and pose detection processing.
 * Handles webcam setup, MediaPipe initialization, and real-time pose detection.
 * Uses refs to manage video and canvas elements, and provides pose detection results
 * to parent component.
 */
"use client"

import React, { useEffect, useRef, useState } from 'react';

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

interface EvaluateVideoProps {
  loading: boolean;
  onPoseResults: (results: PoseResults) => void;
  onError: (error: string) => void;
}

export const EvaluateVideo: React.FC<EvaluateVideoProps> = ({
  loading,
  onPoseResults,
  onError
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<MediaPipePose | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastProcessedTimeRef = useRef<number>(0);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true once component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Setup camera
  useEffect(() => {
    if (!isClient) return;

    const setupCamera = async () => {
      if (!videoRef.current) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: 1200, 
            height: 800,
            frameRate: { ideal: 30 }
          }
        });
        videoRef.current.srcObject = stream;
      } catch (err) {
        onError(`Failed to access webcam: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    setupCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isClient, onError]);

  // Initialize pose detection
  useEffect(() => {
    if (!isClient || loading || !videoRef.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Function to draw pose landmarks on canvas
    const drawPoseLandmarks = (ctx: CanvasRenderingContext2D, landmarks: PoseLandmark[]) => {
      // Draw points for each landmark
      landmarks.forEach((landmark: PoseLandmark) => {
        if (landmark.visibility && landmark.visibility > 0.5) {
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
        }
      });

      // Define and draw connections between landmarks
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
        const start = landmarks[i];
        const end = landmarks[j];

        if (start?.visibility && end?.visibility && 
            start.visibility > 0.5 && end.visibility > 0.5) {
          ctx.beginPath();
          ctx.moveTo(start.x * ctx.canvas.width, start.y * ctx.canvas.height);
          ctx.lineTo(end.x * ctx.canvas.width, end.y * ctx.canvas.height);
          ctx.stroke();
        }
      });
    };

    const initializePose = async () => {
      try {
        // Initialize MediaPipe Pose
        poseRef.current = new window.Pose({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          }
        });

        // Configure pose detection settings
        poseRef.current.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        // Handle pose detection results
        poseRef.current.onResults((results: PoseResults) => {
          const now = performance.now();
          if (now - lastProcessedTimeRef.current < 33) return; // Limit to ~30fps
          lastProcessedTimeRef.current = now;

          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          if (!videoRef.current) return;
          
          ctx.drawImage(videoRef.current, 0, 0, ctx.canvas.width, ctx.canvas.height);

          if (results.poseLandmarks) {
            drawPoseLandmarks(ctx, results.poseLandmarks);
          }

          onPoseResults(results);
        });

        // Start pose detection loop
        const detectPose = async () => {
          if (videoRef.current?.readyState === 4 && poseRef.current) {
            await poseRef.current.send({ image: videoRef.current });
          }
          animationFrameRef.current = requestAnimationFrame(detectPose);
        };

        detectPose();
      } catch (err) {
        onError(`Error initializing pose detection: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    initializePose();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (poseRef.current) {
        poseRef.current.close();
      }
    };
  }, [isClient, loading, onError, onPoseResults]);

  // Don't render anything during SSR
  if (!isClient) return null;

  return (
    <>
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
    </>
  );
};

export type { PoseLandmark, PoseResults, MediaPipePose };
export default EvaluateVideo;