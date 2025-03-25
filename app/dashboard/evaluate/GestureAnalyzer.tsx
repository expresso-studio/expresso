"use client";

import React, { useEffect, useState, useRef } from 'react';
import EvaluateVideo, { PoseResults } from './EvaluateVideo';
import GestureAnalysis from './gesture-analysis/GestureAnalysis';
import AnalysisReport, { AnalysisData } from './AnalysisReport';
import { GestureMetrics } from './gesture-analysis/types';
import { Eye, EyeOff, BarChart2 } from 'lucide-react';

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
  developerMode = true
}) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [poseResults, setPoseResults] = useState<PoseResults | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [currentMetrics, setCurrentMetrics] = useState<GestureMetrics>({
    handMovement: 0.5,
    headMovement: 0.5,
    bodyMovement: 0.5,
    posture: 0.5,
    handSymmetry: 0.5,
    gestureVariety: 0.5,
    eyeContact: 0.5,
    overallScore: 50
  });
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  
  // Store transcript and previous recording state in refs
  const transcriptRef = useRef(transcript);
  const prevIsRecording = useRef(isRecording);
  
  // Timer ref for tracking session duration
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
        setSessionDuration(prev => prev + 1);
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
  }, [isRecording]);

  // Generate the analysis report
  const generateAnalysisReport = () => {
    const metricsData: AnalysisData = {
      handMovement: {
        value: currentMetrics.handMovement,
        status: getMetricStatus('handMovement', currentMetrics.handMovement)
      },
      headMovement: {
        value: currentMetrics.headMovement,
        status: getMetricStatus('headMovement', currentMetrics.headMovement)
      },
      bodyMovement: {
        value: currentMetrics.bodyMovement,
        status: getMetricStatus('bodyMovement', currentMetrics.bodyMovement)
      },
      posture: {
        value: currentMetrics.posture,
        status: getMetricStatus('posture', currentMetrics.posture)
      },
      handSymmetry: {
        value: currentMetrics.handSymmetry,
        status: getMetricStatus('handSymmetry', currentMetrics.handSymmetry)
      },
      gestureVariety: {
        value: currentMetrics.gestureVariety,
        status: getMetricStatus('gestureVariety', currentMetrics.gestureVariety)
      },
      eyeContact: {
        value: currentMetrics.eyeContact,
        status: getMetricStatus('eyeContact', currentMetrics.eyeContact)
      },
      overallScore: currentMetrics.overallScore,
      sessionDuration,
      transcript: transcriptRef.current || "No transcript available."
    };
    
    setAnalysisData(metricsData);
    setShowReport(true);
  };

  // Callback function to receive metrics from GestureAnalysis
  const handleMetricsUpdate = (metrics: GestureMetrics) => {
    setCurrentMetrics(metrics);
  };

  // Function to handle the recorded video blob
  const handleVideoRecorded = (videoBlob: Blob) => {
    setRecordedVideo(videoBlob);
  };
  
  // Helper function to get metric status
  const getMetricStatus = (key: string, value: number): string => {
    // Define optimal ranges
    const OPTIMAL_RANGES = {
      handMovement: { min: 0.08, max: 0.7 },
      headMovement: { min: 0.01, max: 0.5 },
      bodyMovement: { min: 0.02, max: 0.6 },
      posture: { min: 0.4, max: 1.0 },
      handSymmetry: { min: 0.2, max: 0.9 },
      gestureVariety: { min: 0.15, max: 0.9 },
      eyeContact: { min: 0.3, max: 0.9 }
    };
    
    // For posture, use categorical labels
    if (key === 'posture') {
      if (value < 0.33) return 'Poor';
      if (value < 0.67) return 'Fair';
      return 'Good';
    }
    
    // For other metrics
    if (value < OPTIMAL_RANGES[key as keyof typeof OPTIMAL_RANGES].min) return 'Low';
    if (value > OPTIMAL_RANGES[key as keyof typeof OPTIMAL_RANGES].max) return 'High';
    return 'Normal';
  };

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
        <div className="absolute inset-0" style={{ display: 'none' }}>
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
            transition: 'opacity 0.5s ease-in-out',
            maxHeight: '80px',
            textOverflow: 'ellipsis'
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