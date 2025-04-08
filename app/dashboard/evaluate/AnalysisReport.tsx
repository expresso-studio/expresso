"use client";

import React, { useState, useEffect } from "react"; // Import useState and useEffect
import VideoPlayback from "./VideoPlayback";
import { AnalysisData, MetricData } from "@/lib/types";
import { generateRecommendations } from "@/lib/utils";
import { OPTIMAL_RANGES } from "@/lib/constants";
import MetricIndicator from "@/components/metric-indicator";
import { outfit } from "@/app/fonts";
import DetailedMetrics from "@/components/detailed-metrics";
import KeyRecommendations from "@/components/key-recommendations";

// Define interface for Emotion data if needed, based on API response
interface EmotionScores {
  sadness?: number;
  joy?: number;
  fear?: number;
  disgust?: number;
  anger?: number;
}

interface AnalysisReportProps {
  isOpen: boolean;
  onClose: () => void;
  analysisData: AnalysisData | null;
  recordedVideo: Blob | null;
}

const AnalysisReport: React.FC<AnalysisReportProps> = ({
  isOpen,
  onClose,
  analysisData,
  recordedVideo,
}) => {
  const [emotionData, setEmotionData] = useState<EmotionScores | null>(null);
  const [sentimentScore, setSentimentScore] = useState<number | null>(null); // Add state for sentiment
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false); // Rename for clarity
  const [analysisError, setAnalysisError] = useState<string | null>(null); // Rename for clarity

  useEffect(() => {
    if (isOpen && analysisData?.transcript) {
      const fetchToneAnalysis = async () => {
        // Rename function
        setIsLoadingAnalysis(true);
        setAnalysisError(null);
        setEmotionData(null); // Reset previous data
        setSentimentScore(null); // Reset sentiment score

        try {
          const response = await fetch("/api/tone-analyzer", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: analysisData.transcript }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || `HTTP error! status: ${response.status}`
            );
          }

          const result = await response.json();
          setEmotionData(result.emotion);
          setSentimentScore(result.sentiment); // Store sentiment score
        } catch (error: unknown) {
          console.error("Failed to fetch tone analysis:", error);
          if (error instanceof Error) {
            setAnalysisError(error.message || "Failed to load tone analysis.");
          } else {
            setAnalysisError("An unknown error occurred.");
          }
        } finally {
          setIsLoadingAnalysis(false);
        }
      };

      fetchToneAnalysis(); // Call renamed function
    }
  }, [isOpen, analysisData?.transcript]); // Rerun when modal opens or transcript changes

  if (!isOpen || !analysisData) return null;

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Truncate or format transcript if it's too long
  const formattedTranscript =
    analysisData.transcript.length > 500
      ? analysisData.transcript.substring(0, 500) + "..."
      : analysisData.transcript || "No transcript available.";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-black rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="bg-lightCream dark:bg-darkBurnt p-6">
          <div className="flex justify-between items-center -b pb-4 mb-4">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white">
              Presentation Analysis Report
            </h2>
            <button
              onClick={onClose}
              className="text-stone-500 hover:text-stone-700 dark:text-stone-300 dark:hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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

          {/* Video Recording */}
          <div className="mb-6 rounded-lg p-4 dark:-stone-700">
            <h3
              style={outfit.style}
              className="text-lg font-semibold mb-3 text-stone-900 dark:text-white"
            >
              Presentation Recording
            </h3>
            <VideoPlayback videoBlob={recordedVideo} metrics={analysisData} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Session Overview */}
            <div className="bg-white dark:bg-black rounded-lg p-4 dark:-stone-700">
              <h3
                style={outfit.style}
                className="text-lg font-semibold mb-2 text-stone-900 dark:text-white"
              >
                Session Overview
              </h3>
              <div className="space-y-2">
                <p className="text-stone-700 dark:text-stone-300">
                  <span className="font-medium">Duration:</span>{" "}
                  {formatTime(analysisData.sessionDuration)}
                </p>
                <p className="text-stone-700 dark:text-stone-300">
                  <span className="font-medium">Overall Score:</span>{" "}
                  <span className="text-xl font-bold text-blue-600">
                    {analysisData.OverallScore}/100
                  </span>
                </p>
              </div>
            </div>

            {/* Recommendations */}
            <KeyRecommendations analysisData={analysisData} />
          </div>

          {/* Detailed Metrics */}
          <DetailedMetrics analysisData={analysisData} />

          {/* Transcript */}
          <div className="mt-6  rounded-lg p-4 dark:-stone-700">
            <h3
              style={outfit.style}
              className="text-lg font-semibold mb-2 text-stone-900 dark:text-white"
            >
              Transcript
            </h3>
            <div className="max-h-60 overflow-y-auto p-3 bg-stone-100 dark:bg-stone-900 rounded text-stone-800 dark:text-stone-300">
              {formattedTranscript}
            </div>
          </div>

          {/* Tone Analysis Section (Emotion & Sentiment) */}
          <div className="mt-6  rounded-lg p-4 dark:-stone-700">
            <h3
              style={outfit.style}
              className="text-lg font-semibold mb-4 text-stone-900 dark:text-white"
            >
              Tone Analysis (via IBM Watson)
            </h3>
            {isLoadingAnalysis && (
              <p className="text-stone-600 dark:text-stone-400">
                Loading analysis data...
              </p>
            )}
            {analysisError && (
              <p className="text-red-500">Error: {analysisError}</p>
            )}

            {/* Sentiment Display */}
            {sentimentScore !== null &&
              !isLoadingAnalysis &&
              !analysisError && (
                <div className="mb-4  rounded-lg p-3 dark:-stone-700">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-medium text-stone-900 dark:text-white">
                      Overall Sentiment
                    </h4>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-sm ${
                        sentimentScore > 0.3
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : sentimentScore < -0.3
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      {sentimentScore > 0.3
                        ? "Positive"
                        : sentimentScore < -0.3
                        ? "Negative"
                        : "Neutral"}{" "}
                      ({sentimentScore.toFixed(2)})
                    </span>
                  </div>
                  <div className="w-full bg-stone-300 dark:bg-stone-700 rounded-full h-2.5">
                    {/* Represent score from -1 to 1 on a 0 to 100 scale */}
                    <div
                      className={`h-2.5 rounded-full ${
                        sentimentScore > 0 ? "bg-green-500" : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.abs(sentimentScore) * 50}%`,
                        marginLeft: `${
                          sentimentScore < 0
                            ? 50 - Math.abs(sentimentScore) * 50
                            : 50
                        }%`,
                        marginRight: `${
                          sentimentScore >= 0 ? 50 - sentimentScore * 50 : 50
                        }%`,
                      }}
                    ></div>
                    {/* Add a marker for neutral */}
                    <div className="relative bottom-1.5 h-full flex justify-center items-center">
                      <div className="w-px h-4 bg-stone-500 dark:bg-stone-400"></div>
                    </div>
                  </div>
                </div>
              )}

            {/* Emotion Display */}
            {emotionData && !isLoadingAnalysis && !analysisError && (
              <div>
                <h4 className="text-md font-semibold mb-2 text-stone-800 dark:text-stone-200">
                  Emotion Breakdown
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(emotionData).map(([emotion, score]) => (
                    <div
                      key={emotion}
                      className="bg-white dark:bg-black rounded-lg p-3 dark:-stone-700"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-medium text-stone-900 dark:text-white capitalize">
                          {emotion}
                        </h4>
                        <span className="font-medium text-blue-600">
                          {(score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-stone-300 dark:bg-stone-700 rounded-full h-2.5">
                        <div
                          className="bg-blue-500 h-2.5 rounded-full"
                          style={{ width: `${score * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Combined No Data Message */}
            {!emotionData &&
              sentimentScore === null &&
              !isLoadingAnalysis &&
              !analysisError && (
                <p className="text-stone-600 dark:text-stone-400">
                  No tone analysis data available for this transcript.
                </p>
              )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2  -stone-300 rounded-md text-stone-700 dark:text-stone-300 dark:-stone-600 hover:bg-stone-100 dark:hover:bg-stone-700"
            >
              Close
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisReport;
