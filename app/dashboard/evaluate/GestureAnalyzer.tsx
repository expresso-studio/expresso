"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import EvaluateVideo, { PoseResults } from "./EvaluateVideo";
import GestureAnalysis from "./gesture-analysis/GestureAnalysis";
import AnalysisReport from "./AnalysisReport";
import { GestureMetrics, AnalysisData } from "@/lib/types";
import { Eye, EyeOff, BarChart2 } from "lucide-react";
import { OPTIMAL_RANGES } from "./gesture-analysis";

interface GestureAnalyzerProps {
  isRecording: boolean;
  // onStopRecording: () => void;
  transcript: string;
  developerMode?: boolean;
}

const GestureAnalyzer: React.FC<GestureAnalyzerProps> = ({
  isRecording,
  // onStopRecording,
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
  const [currentMetrics, setCurrentMetrics] = useState<GestureMetrics>({
    HandMovement: 0.5,
    HeadMovement: 0.5,
    BodyMovement: 0.5,
    Posture: 0.5,
    HandSymmetry: 0.5,
    GestureVariety: 0.5,
    EyeContact: 0.5,
    OverallScore: 50,
  });
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);

  // Store transcript and previous recording state in refs
  const transcriptRef = useRef(transcript);
  const prevIsRecording = useRef(isRecording);

  // Timer ref for tracking session duration
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to get metric status
  const getMetricStatus = useCallback((key: string, value: number): string => {
    // For Posture, use categorical labels
    if (key === "Posture") {
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
  }, []);

  // Generate the analysis report
  const generateAnalysisReport = useCallback(() => {
    const metricsData: AnalysisData = {
      HandMovement: {
        value: currentMetrics.HandMovement,
        status: getMetricStatus("HandMovement", currentMetrics.HandMovement),
      },
      HeadMovement: {
        value: currentMetrics.HeadMovement,
        status: getMetricStatus("HeadMovement", currentMetrics.HeadMovement),
      },
      BodyMovement: {
        value: currentMetrics.BodyMovement,
        status: getMetricStatus("BodyMovement", currentMetrics.BodyMovement),
      },
      Posture: {
        value: currentMetrics.Posture,
        status: getMetricStatus("Posture", currentMetrics.Posture),
      },
      HandSymmetry: {
        value: currentMetrics.HandSymmetry,
        status: getMetricStatus("HandSymmetry", currentMetrics.HandSymmetry),
      },
      GestureVariety: {
        value: currentMetrics.GestureVariety,
        status: getMetricStatus(
          "GestureVariety",
          currentMetrics.GestureVariety
        ),
      },
      EyeContact: {
        value: currentMetrics.EyeContact,
        status: getMetricStatus("EyeContact", currentMetrics.EyeContact),
      },
      OverallScore: currentMetrics.OverallScore,
      sessionDuration,
      transcript: transcriptRef.current || "No transcript available.",
    };

    setAnalysisData(metricsData);
    setShowReport(true);
  }, [
    setAnalysisData,
    setShowReport,
    getMetricStatus,
    currentMetrics.BodyMovement,
    currentMetrics.EyeContact,
    currentMetrics.GestureVariety,
    currentMetrics.HandMovement,
    currentMetrics.HandSymmetry,
    currentMetrics.HeadMovement,
    currentMetrics.OverallScore,
    currentMetrics.Posture,
    sessionDuration,
  ]);

  // Set isClient to true once component mounts to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update the transcript ref when transcript prop changes
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Handle recording state changes
  useEffect(() => {
    if (isRecording) {
      // Start the timer when recording begins
      setSessionDuration(0);
      timerRef.current = setInterval(() => {
        setSessionDuration((prev) => prev + 1);
      }, 1000);
    } else if (prevIsRecording.current && !isRecording) {
      // Recording just stopped - generate report UNCONDITIONALLY

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Use a small delay to ensure we have the final metrics
      setTimeout(() => {
        generateAnalysisReport();
      }, 300);
    }

    // Update previous recording state
    prevIsRecording.current = isRecording;

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRecording, generateAnalysisReport]);

  // Callback function to receive metrics from GestureAnalysis
  const handleMetricsUpdate = useCallback(
    (metrics: GestureMetrics) => setCurrentMetrics(metrics),
    [setCurrentMetrics]
  );

  // Function to handle the recorded video blob
  const handleVideoRecorded = useCallback(
    (videoBlob: Blob) => setRecordedVideo(videoBlob),
    [setRecordedVideo]
  );

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
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [isClient]);

  // Don't render anything during SSR
  if (!isClient) return null;

  return (
    <div className="w-full h-[85vh] relative mx-auto my-4 overflow-hidden">
      <EvaluateVideo
        loading={loading}
        onPoseResults={setPoseResults}
        onError={setError}
        isRecording={isRecording}
        onVideoRecorded={handleVideoRecorded}
        showSkeleton={showSkeleton}
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

      {/* Control buttons in top left corner - smaller and grouped */}
      <div className="absolute top-5 left-5 z-40 flex space-x-2">
        {/* Toggle Skeleton Button */}
        <button
          onClick={() => setShowSkeleton(!showSkeleton)}
          className="p-2 bg-gray-800/80 text-white rounded-full hover:bg-gray-700 transition-colors"
          title={showSkeleton ? "Hide Skeleton" : "Show Skeleton"}
        >
          {showSkeleton ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>

        {/* Toggle Analysis Panel Button */}
        <button
          onClick={() => setShowAnalysisPanel(!showAnalysisPanel)}
          className="p-2 bg-gray-800/80 text-white rounded-full hover:bg-gray-700 transition-colors"
          title={showAnalysisPanel ? "Hide Analysis" : "Show Analysis"}
        >
          <BarChart2 size={16} />
        </button>
      </div>

      {/* Analysis panel is conditionally displayed based on showAnalysisPanel */}
      {poseResults && showAnalysisPanel && (
        <div className="absolute inset-0">
          <GestureAnalysis
            poseLandmarks={poseResults.poseLandmarks}
            isRecording={isRecording}
            onMetricsUpdate={handleMetricsUpdate}
            developerMode={developerMode}
          />
        </div>
      )}

      {/* Run analysis in background regardless of panel visibility */}
      {poseResults && !showAnalysisPanel && (
        <div className="absolute inset-0" style={{ display: "none" }}>
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

      {/* Transcript Captions */}
      {isRecording && transcript && (
        <div
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-4/5 max-w-3xl p-3 bg-black/70 text-white rounded text-center transition-opacity overflow-hidden"
          style={{
            opacity: transcript ? 1 : 0,
            transition: "opacity 0.5s ease-in-out",
            maxHeight: "80px",
            textOverflow: "ellipsis",
          }}
        >
          {/* Show only the last 150 characters to keep captions manageable */}
          {transcript.length > 150
            ? "..." + transcript.slice(-150)
            : transcript}
        </div>
      )}
    </div>
  );
};

export default GestureAnalyzer;
