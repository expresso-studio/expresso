"use client";

import React, { useEffect, useRef, useState } from "react";
import _ from "lodash";
import { PoseLandmark, GestureMetrics, GestureFeedback } from "@/lib/types";
import { formatTime, smoothUpdate, calculateMovement } from "./utils";
import {
  analyzePosture,
  calculateBodyMovement,
  calculateEyeContact,
  calculateGestureVariety,
  calculateHandSymmetry,
  generateFeedback,
} from "./analysisAlgorithms";
import MetricsDisplay from "./components/MetricsDisplay";
import FeedbackPanel from "./components/FeedbackPanel";
import DeveloperReport from "./components/DeveloperReport";
import {
  MOVEMENT_BUFFER_SIZE,
  HAND_MOVEMENT_COEFFICIENT,
  HEAD_MOVEMENT_COEFFICIENT,
  BODY_MOVEMENT_COEFFICIENT,
  POSTURE_COEFFICIENT,
  HAND_SYMMETRY_COEFFICIENT,
  GESTURE_VARIETY_COEFFICIENT,
  EYE_CONTACT_COEFFICIENT,
} from "@/lib/constants";
import { useSearchParams } from "next/navigation";

interface Props {
  poseLandmarks?: PoseLandmark[];
  isRecording: boolean;
  onMetricsUpdate?: (metrics: GestureMetrics) => void;
  developerMode?: boolean;
}

const GestureAnalysis: React.FC<Props> = ({
  poseLandmarks,
  isRecording,
  onMetricsUpdate,
  developerMode = true,
}) => {
  // State
  const [metrics, setMetrics] = useState<GestureMetrics>({
    HandMovement: 0.5,
    HeadMovement: 0.5,
    BodyMovement: 0.5,
    Posture: 0.5,
    HandSymmetry: 0.5,
    GestureVariety: 0.5,
    EyeContact: 0.5,
    OverallScore: 50,
  });
  const [feedback, setFeedback] = useState<GestureFeedback[]>([]);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isPanelVisible, setIsPanelVisible] = useState(false); // Changed to false by default
  const [isDevReportVisible, setIsDevReportVisible] = useState(false);

  const searchParams = useSearchParams();
  const initialEnabled = {
    HandMovement: true,
    HeadMovement: true,
    BodyMovement: true,
    Posture: true,
    HandSymmetry: true,
    GestureVariety: true,
    EyeContact: true,
    OverallScore: true,
  };
  Object.keys(initialEnabled).forEach((key) => {
    const param = searchParams?.get(key);
    if (param === "false" || param === "true") {
      initialEnabled[key as keyof GestureMetrics] = param === "true";
    }
  });

  const [enabledMetrics, setEnabledMetrics] =
    useState<Record<keyof GestureMetrics, boolean>>(initialEnabled);

  // Refs for tracking movement and analysis data
  const prevLandmarksRef = useRef<PoseLandmark[]>([]);
  const HandMovementBufferRef = useRef<number[]>(
    Array(MOVEMENT_BUFFER_SIZE).fill(0.5),
  );
  const HeadMovementBufferRef = useRef<number[]>(
    Array(MOVEMENT_BUFFER_SIZE).fill(0.5),
  );
  const BodyMovementBufferRef = useRef<number[]>(
    Array(MOVEMENT_BUFFER_SIZE).fill(0.5),
  );
  const handPositionsBufferRef = useRef<
    { left: PoseLandmark; right: PoseLandmark }[]
  >([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const frameCountRef = useRef(0);

  // Call onMetricsUpdate whenever metrics change
  useEffect(() => {
    if (onMetricsUpdate) {
      onMetricsUpdate(metrics);
    }
  }, [metrics, onMetricsUpdate]);

  // Start/stop session timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setSessionDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setSessionDuration(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  // Main analysis effect
  useEffect(() => {
    if (!isRecording || !poseLandmarks?.length) return;

    try {
      if (!prevLandmarksRef.current.length) {
        prevLandmarksRef.current = poseLandmarks;
        return;
      }

      // Only update every nth frame to reduce computation load (effectively every ~200ms at 30fps)
      frameCountRef.current += 1;
      if (frameCountRef.current % 6 !== 0) {
        prevLandmarksRef.current = poseLandmarks;
        return;
      }

      // Calculate all metrics
      const PostureScore = analyzePosture(poseLandmarks);

      // Hand movements - more balanced sensitivity for middle zone
      const leftHandMove = calculateMovement(
        poseLandmarks[15],
        prevLandmarksRef.current[15],
        8,
      );
      const rightHandMove = calculateMovement(
        poseLandmarks[16],
        prevLandmarksRef.current[16],
        8,
      );
      const handScore = Math.max(leftHandMove, rightHandMove);

      // Head movement - more balanced sensitivity for middle zone
      const headMove = calculateMovement(
        poseLandmarks[0],
        prevLandmarksRef.current[0],
        15,
      );

      // Body movement - track torso movement
      const bodyMove = calculateBodyMovement(
        poseLandmarks,
        prevLandmarksRef.current,
      );

      // Update movement buffers
      HandMovementBufferRef.current = [
        ...HandMovementBufferRef.current.slice(1),
        handScore,
      ];
      HeadMovementBufferRef.current = [
        ...HeadMovementBufferRef.current.slice(1),
        headMove,
      ];
      BodyMovementBufferRef.current = [
        ...BodyMovementBufferRef.current.slice(1),
        bodyMove,
      ];

      // Update hand positions buffer for symmetry and variety calculations
      if (handPositionsBufferRef.current.length >= 30) {
        handPositionsBufferRef.current.shift();
      }

      if (poseLandmarks[15] && poseLandmarks[16]) {
        handPositionsBufferRef.current.push({
          left: { ...poseLandmarks[15] },
          right: { ...poseLandmarks[16] },
        });
      }

      // Calculate averages from buffers for stability
      const recentHandBuffer = HandMovementBufferRef.current.slice(-30);
      const recentHeadBuffer = HeadMovementBufferRef.current.slice(-30);
      const recentBodyBuffer = BodyMovementBufferRef.current.slice(-30);

      const averageHandMovement = _.mean(recentHandBuffer);
      const averageHeadMovement = _.mean(recentHeadBuffer);
      const averageBodyMovement = _.mean(recentBodyBuffer);

      // Calculate advanced metrics
      const HandSymmetry = calculateHandSymmetry(
        poseLandmarks,
        handPositionsBufferRef.current,
      );
      const GestureVariety = calculateGestureVariety(
        poseLandmarks,
        handPositionsBufferRef.current,
      );
      const EyeContact = calculateEyeContact(poseLandmarks);

      // Update metrics using functional update with slower update rate
      setMetrics((prevMetrics) => {
        const newMetrics = {
          HandMovement: smoothUpdate(
            prevMetrics.HandMovement,
            averageHandMovement,
            0.05,
          ),
          HeadMovement: smoothUpdate(
            prevMetrics.HeadMovement,
            averageHeadMovement,
            0.05,
          ),
          BodyMovement: smoothUpdate(
            prevMetrics.BodyMovement,
            averageBodyMovement,
            0.05,
          ),
          Posture: PostureScore, // Directly use Posture score (already discrete)
          HandSymmetry: smoothUpdate(
            prevMetrics.HandSymmetry,
            HandSymmetry,
            0.05,
          ),
          GestureVariety: smoothUpdate(
            prevMetrics.GestureVariety,
            GestureVariety,
            0.05,
          ),
          EyeContact: smoothUpdate(prevMetrics.EyeContact, EyeContact, 0.05),
          OverallScore: 0,
        };

        // Calculate overall score (weighted average) with a boost to improve user experience
        const rawScore =
          ((newMetrics.HandMovement * HAND_MOVEMENT_COEFFICIENT +
            newMetrics.HeadMovement * HEAD_MOVEMENT_COEFFICIENT +
            newMetrics.BodyMovement * BODY_MOVEMENT_COEFFICIENT +
            newMetrics.Posture * POSTURE_COEFFICIENT +
            newMetrics.HandSymmetry * HAND_SYMMETRY_COEFFICIENT +
            newMetrics.GestureVariety * GESTURE_VARIETY_COEFFICIENT +
            newMetrics.EyeContact * EYE_CONTACT_COEFFICIENT) *
            100) /
          (HAND_MOVEMENT_COEFFICIENT +
            HEAD_MOVEMENT_COEFFICIENT +
            BODY_MOVEMENT_COEFFICIENT +
            POSTURE_COEFFICIENT +
            HAND_SYMMETRY_COEFFICIENT +
            GESTURE_VARIETY_COEFFICIENT +
            EYE_CONTACT_COEFFICIENT);

        // Apply curve to make scores higher - this gives a 10-15 point boost to mid-range scores
        const curvedScore = Math.round(Math.min(100, rawScore * 1.15));
        newMetrics.OverallScore = curvedScore;

        return newMetrics;
      });

      // Generate new feedback occasionally based on current metrics state
      const shouldUpdateFeedback = sessionDuration % 5 === 0;
      if (shouldUpdateFeedback) {
        // Get metrics first to ensure we have the latest values
        setMetrics((currentMetrics) => {
          // Generate feedback based on current metrics
          const newFeedback = generateFeedback(currentMetrics);
          // Update feedback in a separate state update to avoid triggering rerenders
          setTimeout(() => setFeedback(newFeedback), 0);
          // Return unchanged metrics to avoid unnecessary update
          return currentMetrics;
        });
      }

      // Update reference for next frame
      prevLandmarksRef.current = poseLandmarks;
    } catch (error) {
      console.error("Error analyzing gestures:", error);
    }
  }, [poseLandmarks, isRecording, sessionDuration]);

  // Toggle panel visibility
  const togglePanelVisibility = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  // Toggle developer report visibility
  const toggleDevReportVisibility = () => {
    setIsDevReportVisible(!isDevReportVisible);
  };

  // Activate developer mode on double-click of the header (Easter egg)
  const handleHeaderDoubleClick = () => {
    if (!developerMode) {
      setIsDevReportVisible(true);
    }
  };

  const toggleMetric = (metric: keyof GestureMetrics) => {
    setEnabledMetrics((prev) => ({ ...prev, [metric]: !prev[metric] }));
  };

  // Minimized view when panel is hidden
  if (!isPanelVisible) {
    return (
      <>
        <div className="fixed top-4 right-4 bg-black/80 p-3 rounded-lg shadow-lg">
          <button
            onClick={togglePanelVisibility}
            className="flex items-center text-white text-sm hover:text-blue-300 transition-colors"
          >
            <span className="mr-2">Show Analysis</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </button>
        </div>

        {/* Developer Report - always show if visible, even when main panel is hidden */}
        {developerMode && (
          <DeveloperReport
            metrics={metrics}
            poseLandmarks={poseLandmarks}
            sessionDuration={sessionDuration}
            isVisible={isDevReportVisible}
            onToggleVisibility={toggleDevReportVisibility}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="fixed top-4 right-4 space-y-4 bg-black/80 p-4 rounded-lg w-96 shadow-lg">
        <div
          className="flex justify-between items-center"
          onDoubleClick={handleHeaderDoubleClick}
        >
          <h3 className="text-white font-semibold">Gesture Analysis</h3>
          <div className="flex items-center space-x-3">
            {isRecording && (
              <div className="flex items-center">
                <span className="animate-pulse mr-2 h-3 w-3 rounded-full bg-red-500"></span>
                <span className="text-white text-sm">
                  {formatTime(sessionDuration)}
                </span>
              </div>
            )}
            <button
              onClick={togglePanelVisibility}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Overall Score */}
        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Overall Score</span>
            <span className="text-xl font-bold text-blue-400">
              {metrics.OverallScore}/100
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${metrics.OverallScore}%` }}
            />
          </div>
        </div>

        {/* Metrics Display Component */}
        <MetricsDisplay
          metrics={metrics}
          enabledMetrics={enabledMetrics}
          toggleMetric={toggleMetric}
        />

        {/* Feedback Panel Component */}
        <FeedbackPanel feedback={feedback} isRecording={isRecording} />

        {/* Developer Mode Toggle (if enabled) */}
        {developerMode && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <button
              onClick={toggleDevReportVisibility}
              className="w-full text-xs text-gray-400 hover:text-white py-1 transition-colors flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              {isDevReportVisible ? "Hide" : "Show"} Developer Report
            </button>
          </div>
        )}
      </div>

      {/* Developer Report */}
      {developerMode && (
        <DeveloperReport
          metrics={metrics}
          poseLandmarks={poseLandmarks}
          sessionDuration={sessionDuration}
          isVisible={isDevReportVisible}
          onToggleVisibility={toggleDevReportVisibility}
        />
      )}
    </>
  );
};

export default GestureAnalysis;
