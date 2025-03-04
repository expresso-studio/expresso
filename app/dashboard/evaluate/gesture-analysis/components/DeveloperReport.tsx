"use client";

import React, { useState } from 'react';
import { PoseLandmark, GestureMetrics } from '../types';
import { formatTime } from '../utils';

interface DeveloperReportProps {
  metrics: GestureMetrics;
  poseLandmarks?: PoseLandmark[];
  sessionDuration: number;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

const DeveloperReport: React.FC<DeveloperReportProps> = ({
  metrics,
  poseLandmarks = [], // Default to empty array to avoid undefined errors
  sessionDuration,
  isVisible,
  onToggleVisibility
}) => {
  const [selectedTab, setSelectedTab] = useState<'metrics' | 'landmarks' | 'raw'>('metrics');

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 left-4 bg-gray-900 p-3 rounded-lg border border-gray-700 shadow-lg z-40">
        <button
          onClick={onToggleVisibility}
          className="flex items-center text-gray-300 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span>Show Developer Report</span>
        </button>
      </div>
    );
  }

  // Calculate the number of valid landmarks
  const validLandmarks = poseLandmarks.filter(landmark => 
    landmark?.visibility !== undefined && landmark.visibility > 0.5
  ).length;
  
  // Calculate the average visibility of all landmarks
  const avgVisibility = poseLandmarks.length > 0 
    ? poseLandmarks.reduce((sum, landmark) => 
        sum + (landmark?.visibility ?? 0), 0) / poseLandmarks.length
    : 0;

  // Safely get a landmark with null check
  const getLandmark = (index: number): PoseLandmark | undefined => {
    return poseLandmarks && poseLandmarks.length > index ? poseLandmarks[index] : undefined;
  };

  return (
    <div className="fixed bottom-4 left-4 w-[500px] max-h-[500px] overflow-auto bg-gray-900 rounded-lg border border-gray-700 shadow-lg z-40">
      <div className="flex justify-between items-center border-b border-gray-700 p-3">
        <h3 className="text-white font-medium">Developer Report</h3>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-xs">Session: {formatTime(sessionDuration)}</span>
          <button 
            onClick={onToggleVisibility}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setSelectedTab('metrics')}
          className={`px-4 py-2 text-sm ${
            selectedTab === 'metrics' ? 'bg-blue-900/30 text-blue-300 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'
          }`}
        >
          Metrics
        </button>
        <button
          onClick={() => setSelectedTab('landmarks')}
          className={`px-4 py-2 text-sm ${
            selectedTab === 'landmarks' ? 'bg-blue-900/30 text-blue-300 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'
          }`}
        >
          Landmark Stats
        </button>
        <button
          onClick={() => setSelectedTab('raw')}
          className={`px-4 py-2 text-sm ${
            selectedTab === 'raw' ? 'bg-blue-900/30 text-blue-300 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'
          }`}
        >
          Raw Data
        </button>
      </div>

      <div className="p-4">
        {/* Metrics Tab */}
        {selectedTab === 'metrics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <MetricCard 
                title="Overall Score" 
                value={metrics.overallScore.toFixed(2)} 
                unit="/100" 
                description="Weighted average of all metrics"
              />
              <MetricCard 
                title="Hand Movement" 
                value={(metrics.handMovement * 100).toFixed(2)} 
                unit="%" 
                description="Hand gesture activity level"
              />
              <MetricCard 
                title="Head Movement" 
                value={(metrics.headMovement * 100).toFixed(2)} 
                unit="%" 
                description="Head motion activity level"
              />
              <MetricCard 
                title="Body Movement" 
                value={(metrics.bodyMovement * 100).toFixed(2)} 
                unit="%" 
                description="Torso movement activity"
              />
              <MetricCard 
                title="Posture" 
                value={(metrics.posture * 100).toFixed(2)} 
                unit="%" 
                description="Alignment quality score"
              />
              <MetricCard 
                title="Hand Symmetry" 
                value={(metrics.handSymmetry * 100).toFixed(2)} 
                unit="%" 
                description="Balance between hands"
              />
              <MetricCard 
                title="Gesture Variety" 
                value={(metrics.gestureVariety * 100).toFixed(2)} 
                unit="%" 
                description="Diversity of gestures"
              />
              <MetricCard 
                title="Eye Contact" 
                value={(metrics.eyeContact * 100).toFixed(2)} 
                unit="%" 
                description="Camera gaze consistency"
              />
            </div>
            
            <div className="mt-4 px-4 py-3 bg-gray-800 rounded-lg">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Metric Correlations</h4>
              <table className="w-full text-xs text-gray-400">
                <tbody>
                  <tr>
                    <td className="py-1">Hand-Head Movement:</td>
                    <td className="text-right">
                      {calculateCorrelation(metrics.handMovement, metrics.headMovement).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1">Body-Posture Quality:</td>
                    <td className="text-right">
                      {calculateCorrelation(metrics.bodyMovement, metrics.posture).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1">Eye Contact-Posture:</td>
                    <td className="text-right">
                      {calculateCorrelation(metrics.eyeContact, metrics.posture).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Landmark Stats Tab */}
        {selectedTab === 'landmarks' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <MetricCard 
                title="Valid Landmarks" 
                value={validLandmarks.toString()} 
                unit={`/${poseLandmarks.length}`}
                description="Landmarks with visibility > 0.5"
              />
              <MetricCard 
                title="Average Visibility" 
                value={(avgVisibility * 100).toFixed(2)} 
                unit="%" 
                description="Mean visibility of all landmarks"
              />
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Key Points Visibility</h4>
              <div className="space-y-2">
                <LandmarkVisibility name="Nose" landmark={getLandmark(0)} />
                <LandmarkVisibility name="Left Eye" landmark={getLandmark(2)} />
                <LandmarkVisibility name="Right Eye" landmark={getLandmark(5)} />
                <LandmarkVisibility name="Left Shoulder" landmark={getLandmark(11)} />
                <LandmarkVisibility name="Right Shoulder" landmark={getLandmark(12)} />
                <LandmarkVisibility name="Left Elbow" landmark={getLandmark(13)} />
                <LandmarkVisibility name="Right Elbow" landmark={getLandmark(14)} />
                <LandmarkVisibility name="Left Wrist" landmark={getLandmark(15)} />
                <LandmarkVisibility name="Right Wrist" landmark={getLandmark(16)} />
                <LandmarkVisibility name="Left Hip" landmark={getLandmark(23)} />
                <LandmarkVisibility name="Right Hip" landmark={getLandmark(24)} />
              </div>
            </div>
          </div>
        )}

        {/* Raw Data Tab */}
        {selectedTab === 'raw' && (
          <div className="space-y-4">
            <div className="bg-gray-800 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Raw Metrics</h4>
              <pre className="text-xs text-gray-400 overflow-x-auto">
                {JSON.stringify(metrics, null, 2)}
              </pre>
            </div>
            
            <div className="bg-gray-800 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Pose Landmarks {poseLandmarks.length > 0 ? `(First 5 of ${poseLandmarks.length})` : '(None)'}
              </h4>
              <pre className="text-xs text-gray-400 overflow-x-auto">
                {poseLandmarks.length > 0 
                  ? JSON.stringify(poseLandmarks.slice(0, 5), null, 2)
                  : "No landmark data available"}
              </pre>
            </div>
            
            <div className="text-xs text-gray-500 mt-2">
              Note: Only showing first 5 landmarks to avoid overwhelming the display.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component for displaying a metric card
const MetricCard: React.FC<{
  title: string;
  value: string;
  unit: string;
  description: string;
}> = ({ title, value, unit, description }) => (
  <div className="bg-gray-800 p-3 rounded-lg">
    <div className="flex justify-between items-center mb-1">
      <h4 className="text-sm font-medium text-gray-300">{title}</h4>
      <span className="text-lg font-bold text-blue-400">
        {value}<span className="text-xs ml-1 text-gray-400">{unit}</span>
      </span>
    </div>
    <p className="text-xs text-gray-500">{description}</p>
  </div>
);

// Helper component for landmark visibility
const LandmarkVisibility: React.FC<{
  name: string;
  landmark?: PoseLandmark;
}> = ({ name, landmark }) => {
  const visibility = landmark?.visibility ?? 0;
  
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400">{name}</span>
      <div className="flex items-center">
        <div className="w-32 bg-gray-700 rounded-full h-1.5 mr-2">
          <div 
            className={`h-1.5 rounded-full ${
              visibility > 0.7 ? 'bg-green-500' :
              visibility > 0.5 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${visibility * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-400">{(visibility * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
};

// Helper function to calculate simple correlation between two metrics
function calculateCorrelation(a: number, b: number): number {
  // This is a very simplified version just for display purposes
  // It returns a value between -1 and 1 based on whether the metrics
  // are moving in the same direction or opposite directions
  const normalizedA = a * 2 - 1; // Scale to [-1, 1]
  const normalizedB = b * 2 - 1; // Scale to [-1, 1]
  
  return normalizedA * normalizedB;
}

export default DeveloperReport;