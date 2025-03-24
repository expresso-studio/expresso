"use client";

import React, { useEffect, useState } from "react";
import EvaluateVideo, { PoseResults } from "./EvaluateVideo";
import GestureAnalysis from "./gesture-analysis/GestureAnalysis";
import AnalysisReport from "./AnalysisReport";
import { GestureMetrics, AnalysisData } from "@/lib/types";

interface GestureAnalyzerProps {
  isRecording: boolean;
  onStopRecording: () => void;
  transcript: string;
  developerMode?: boolean;
}

const GestureAnalyzer: React.FC<GestureAnalyzerProps> = ({
  isRecording,
  onStopRecording,
  transcript,
  developerMode = true,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [poseResults, setPoseResults] = useState<PoseResults | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [currentMetrics, setCurrentMetrics] = useState<GestureMetrics | null>(
    null
  );
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);

  // Timer ref for tracking session duration
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Set isClient to true once component mounts to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle recording state changes and timer
  useEffect(() => {
    if (isRecording) {
      // Start the timer when recording begins
      timerRef.current = setInterval(() => {
        setSessionDuration((prev) => prev + 1);
      }, 1000);
    } else {
      // Clear timer when recording stops
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRecording]);

  // Callback function to receive metrics from GestureAnalysis
  const handleMetricsUpdate = (metrics: GestureMetrics) => {
    setCurrentMetrics(metrics);
  };

  // Function to handle the recorded video blob
  const handleVideoRecorded = (videoBlob: Blob) => {
    setRecordedVideo(videoBlob);
  };

  // Function to finish recording and show the report
  const handleFinishRecording = () => {
    // Stop the recording
    onStopRecording();

    // Prepare analysis data for the report
    if (currentMetrics) {
      const metricsData: AnalysisData = {
        handMovement: {
          value: currentMetrics.handMovement,
          status: getMetricStatus("handMovement", currentMetrics.handMovement),
        },
        headMovement: {
          value: currentMetrics.headMovement,
          status: getMetricStatus("headMovement", currentMetrics.headMovement),
        },
        bodyMovement: {
          value: currentMetrics.bodyMovement,
          status: getMetricStatus("bodyMovement", currentMetrics.bodyMovement),
        },
        posture: {
          value: currentMetrics.posture,
          status: getMetricStatus("posture", currentMetrics.posture),
        },
        handSymmetry: {
          value: currentMetrics.handSymmetry,
          status: getMetricStatus("handSymmetry", currentMetrics.handSymmetry),
        },
        gestureVariety: {
          value: currentMetrics.gestureVariety,
          status: getMetricStatus(
            "gestureVariety",
            currentMetrics.gestureVariety
          ),
        },
        eyeContact: {
          value: currentMetrics.eyeContact,
          status: getMetricStatus("eyeContact", currentMetrics.eyeContact),
        },
        overallScore: currentMetrics.overallScore,
        sessionDuration,
        transcript,
      };

      setAnalysisData(metricsData);
      setShowReport(true);
    }
  };

  // Helper function to get metric status
  const getMetricStatus = (key: string, value: number): string => {
    // Define optimal ranges - copied from GestureAnalysis.tsx
    const OPTIMAL_RANGES = {
      handMovement: { min: 0.08, max: 0.7 },
      headMovement: { min: 0.01, max: 0.5 },
      bodyMovement: { min: 0.02, max: 0.6 },
      posture: { min: 0.4, max: 1.0 },
      handSymmetry: { min: 0.2, max: 0.9 },
      gestureVariety: { min: 0.15, max: 0.9 },
      eyeContact: { min: 0.3, max: 0.9 },
    };

    // For posture, use categorical labels
    if (key === "posture") {
      if (value < 0.33) return "Poor";
      if (value < 0.67) return "Fair";
      return "Good";
    }

    // For other metrics
    if (value < OPTIMAL_RANGES[key as keyof typeof OPTIMAL_RANGES].min)
      return "Low";
    if (value > OPTIMAL_RANGES[key as keyof typeof OPTIMAL_RANGES].max)
      return "High";
    return "Normal";
  };

  // Initialize MediaPipe script
  useEffect(() => {
    if (!isClient) return;

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js";
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);

    script.onload = () => setLoading(false);
    script.onerror = () => {
      setError("Failed to load pose detection model");
      setLoading(false);
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [isClient]);

  // Don't render anything during SSR
  if (!isClient) return null;

  return (
    <div className="w-[900px] h-[600px] relative mx-auto my-4 overflow-hidden border">
      <EvaluateVideo
        loading={loading}
        onPoseResults={setPoseResults}
        onError={setError}
        isRecording={isRecording}
        onVideoRecorded={handleVideoRecorded}
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

      {/* Finish Recording Button */}
      {isRecording && (
        <div className="absolute top-5 right-5 z-50">
          <button
            onClick={handleFinishRecording}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Finish Recording & Analyze
          </button>
        </div>
      )}

      {poseResults && (
        <div className="absolute inset-0">
          <GestureAnalysis
            poseLandmarks={poseResults.poseLandmarks}
            isRecording={isRecording}
            onMetricsUpdate={handleMetricsUpdate}
            developerMode={developerMode}
          />
        </div>
      )}

      {/* Analysis Report Popup with video data */}
      <AnalysisReport
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        analysisData={analysisData}
        recordedVideo={recordedVideo}
      />
    </div>
  );
};

export default GestureAnalyzer;
