"use client";

import React from 'react';
import VideoPlayback from './VideoPlayback';

interface MetricData {
  value: number;
  status: string;
}

export interface AnalysisData {
  handMovement: MetricData;
  headMovement: MetricData;
  bodyMovement: MetricData;
  posture: MetricData;
  handSymmetry: MetricData;
  gestureVariety: MetricData;
  eyeContact: MetricData;
  overallScore: number;
  sessionDuration: number;
  transcript: string;
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
  recordedVideo
}) => {
  if (!isOpen || !analysisData) return null;

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Function to get color class based on status
  const getColorClass = (status: string): string => {
    switch (status) {
      case 'Low':
        return 'text-red-500';
      case 'High':
        return 'text-amber-500';
      case 'Normal':
        return 'text-blue-500';
      case 'Good':
        return 'text-green-500';
      case 'Fair':
        return 'text-yellow-500';
      case 'Poor':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // Generate recommendations based on metrics
  const generateRecommendations = (): string[] => {
    const recommendations: string[] = [];

    if (analysisData.handMovement.status === 'Low') {
      recommendations.push('Use more hand gestures to emphasize key points and engage your audience.');
    } else if (analysisData.handMovement.status === 'High') {
      recommendations.push('Try to reduce excessive hand movements as they may distract from your message.');
    }

    if (analysisData.posture.status === 'Poor' || analysisData.posture.status === 'Fair') {
      recommendations.push('Work on maintaining better posture by keeping your back straight and shoulders level.');
    }

    if (analysisData.eyeContact.status === 'Low') {
      recommendations.push('Maintain more consistent eye contact with the camera to better connect with your audience.');
    }

    if (analysisData.handSymmetry.status === 'Low') {
      recommendations.push('Try to use both hands more equally for a balanced presentation style.');
    }

    if (analysisData.gestureVariety.status === 'Low') {
      recommendations.push('Incorporate a wider variety of gestures to keep your presentation engaging.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Your presentation skills are solid! Continue practicing to maintain consistency.');
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  // Truncate or format transcript if it's too long
  const formattedTranscript = analysisData.transcript.length > 500 
    ? analysisData.transcript.substring(0, 500) + "..." 
    : analysisData.transcript || "No transcript available.";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Presentation Analysis Report</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Video Recording */}
          <div className="mb-6 border rounded-lg p-4 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Presentation Recording</h3>
            <VideoPlayback videoBlob={recordedVideo} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Session Overview */}
            <div className="border rounded-lg p-4 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Session Overview</h3>
              <div className="space-y-2">
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Duration:</span> {formatTime(analysisData.sessionDuration)}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Overall Score:</span>{' '}
                  <span className="text-xl font-bold text-blue-600">{analysisData.overallScore}/100</span>
                </p>
              </div>
            </div>

            {/* Recommendations */}
            <div className="border rounded-lg p-4 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Key Recommendations</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                {recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="mt-6 border rounded-lg p-4 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Detailed Metrics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analysisData).map(([key, value]) => {
                // Skip non-metric fields and overall score (already displayed)
                if (key === 'sessionDuration' || key === 'transcript' || key === 'overallScore') return null;
                
                const metric = value as MetricData;
                const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();
                
                return (
                  <div key={key} className="border rounded-lg p-3 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-900 dark:text-white">{formattedKey}</h4>
                      <span className={`font-medium ${getColorClass(metric.status)}`}>
                        {metric.status}
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          getColorClass(metric.status).replace('text-', 'bg-')
                        }`}
                        style={{ width: `${metric.value * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transcript */}
          <div className="mt-6 border rounded-lg p-4 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Transcript</h3>
            <div className="max-h-60 overflow-y-auto p-3 bg-gray-100 dark:bg-gray-900 rounded text-gray-800 dark:text-gray-300">
              {formattedTranscript}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
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