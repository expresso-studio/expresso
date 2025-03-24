/**
 * Component responsible for video capture, pose detection, and video recording.
 */
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

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
    Pose: new (config: {
      locateFile: (file: string) => string;
    }) => MediaPipePose;
  }
}

interface EvaluateVideoProps {
  loading: boolean;
  onPoseResults: (results: PoseResults) => void;
  onError: (error: string) => void;
  isRecording: boolean;
  onVideoRecorded: (videoBlob: Blob) => void;
}

export const EvaluateVideo: React.FC<EvaluateVideoProps> = ({
  loading,
  onPoseResults,
  onError,
  isRecording,
  onVideoRecorded
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const poseRef = useRef<MediaPipePose | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastProcessedTimeRef = useRef<number>(0);
  const [isClient, setIsClient] = useState(false);
  
  // Recording state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);

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
        // Get video stream
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 1280,
            height: 720,
            frameRate: { ideal: 30 },
          },
        });
        
        // Store the video stream reference
        streamRef.current = videoStream;
        
        // Set the video source
        videoRef.current.srcObject = videoStream;
        videoRef.current.muted = true; // Mute the video element to prevent feedback
        
        // Get separate audio stream (will be used only for recording)
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });
          audioStreamRef.current = audioStream;
        } catch (audioErr) {
          console.warn("Could not access microphone:", audioErr);
        }
      } catch (err) {
        onError(
          `Failed to access webcam: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    };

    setupCamera();

    return () => {
      // Clean up all streams
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
        audioStreamRef.current = null;
      }
    };
  }, [isClient, onError]);

// Start recording function - memoized with useCallback
const startRecording = useCallback(() => {
  if (!streamRef.current) return;
  
  try {
    recordedChunksRef.current = [];
    
    // Create a combined stream with video and audio tracks
    const combinedTracks = [];
    
    // Add video track
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      combinedTracks.push(videoTrack);
    } else {
      console.error("No video track available");
      return;
    }
    
    // Add audio track if available
    if (audioStreamRef.current && audioStreamRef.current.getAudioTracks().length > 0) {
      const audioTrack = audioStreamRef.current.getAudioTracks()[0];
      combinedTracks.push(audioTrack);
    }
    
    // Create combined stream
    const combinedStream = new MediaStream(combinedTracks);
    
    // Create media recorder
    const options = { mimeType: 'video/webm' };
    mediaRecorderRef.current = new MediaRecorder(combinedStream, options);
    
    // Handle data available
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };
    
    // Start recording
    mediaRecorderRef.current.start(1000);
    console.log("Recording started with audio");
  } catch (error) {
    console.error("Error starting recording:", error);
  }
}, []);

// Stop recording function - memoized with useCallback
const stopRecording = useCallback(() => {
  if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
    mediaRecorderRef.current.onstop = () => {
      const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/mp4' });
      onVideoRecorded(videoBlob);
      console.log("Recording stopped and saved");
    };
    
    mediaRecorderRef.current.stop();
  }
}, [onVideoRecorded]);

// Handle recording state changes
useEffect(() => {
  if (!streamRef.current) return;
  
  if (isRecording) {
    startRecording();
  } else {
    stopRecording();
  }
}, [isRecording, startRecording, stopRecording]);

  // Initialize pose detection
  useEffect(() => {
    if (!isClient || loading || !videoRef.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Function to draw pose landmarks on canvas
    const drawPoseLandmarks = (
      ctx: CanvasRenderingContext2D,
      landmarks: PoseLandmark[]
    ) => {
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
          ctx.fillStyle = "#00ff00";
          ctx.fill();
        }
      });

      // Define and draw connections between landmarks
      const connections = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 7],
        [0, 4],
        [4, 5],
        [5, 6],
        [6, 8],
        [9, 10],
        [11, 12],
        [11, 13],
        [13, 15],
        [15, 17],
        [15, 19],
        [15, 21],
        [12, 14],
        [14, 16],
        [16, 18],
        [16, 20],
        [16, 22],
        [11, 23],
        [12, 24],
        [23, 24],
        [23, 25],
        [25, 27],
        [27, 29],
        [27, 31],
        [24, 26],
        [26, 28],
        [28, 30],
        [28, 32],
      ] as const;

      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 2;

      connections.forEach(([i, j]) => {
        const start = landmarks[i];
        const end = landmarks[j];

        if (
          start?.visibility &&
          end?.visibility &&
          start.visibility > 0.5 &&
          end.visibility > 0.5
        ) {
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
          },
        });

        // Configure pose detection settings
        poseRef.current.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        // Handle pose detection results
        poseRef.current.onResults((results: PoseResults) => {
          const now = performance.now();
          if (now - lastProcessedTimeRef.current < 33) return; // Limit to ~30fps
          lastProcessedTimeRef.current = now;

          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          if (!videoRef.current) return;

          ctx.drawImage(
            videoRef.current,
            0,
            0,
            ctx.canvas.width,
            ctx.canvas.height
          );

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
        onError(
          `Error initializing pose detection: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
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
        muted
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