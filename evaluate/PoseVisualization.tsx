"use client"

import React, { useEffect, useState, useRef } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, ZAxis } from 'recharts';

interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface PoseResults {
  poseLandmarks?: PoseLandmark[];
}

interface PoseVisualizationProps {
  results: PoseResults;
}

interface HandPosition {
  x: number;
  y: number;
  timestamp: number;
  hand: 'left' | 'right';
}

const UPDATE_INTERVAL = 50; // ms
const TRAIL_LENGTH = 20; // Number of previous positions to show
const VISIBILITY_THRESHOLD = 0.5;

const PoseVisualization: React.FC<PoseVisualizationProps> = ({ results }) => {
  const [handPositions, setHandPositions] = useState<HandPosition[]>([]);
  const [visibleHands, setVisibleHands] = useState<{ left: boolean; right: boolean }>({
    left: false,
    right: false
  });
  const lastUpdateTime = useRef<number>(0);

  useEffect(() => {
    if (!results.poseLandmarks) return;

    const currentTime = Date.now();
    if (currentTime - lastUpdateTime.current < UPDATE_INTERVAL) return;

    const leftWrist = results.poseLandmarks[15];  // Left wrist index
    const rightWrist = results.poseLandmarks[16]; // Right wrist index

    const leftHandVisible = (leftWrist?.visibility ?? 0) > VISIBILITY_THRESHOLD;
    const rightHandVisible = (rightWrist?.visibility ?? 0) > VISIBILITY_THRESHOLD;

    setVisibleHands({
      left: Boolean(leftHandVisible),
      right: Boolean(rightHandVisible)
    }); 
    const newPositions: HandPosition[] = [];

    if (leftHandVisible) {
      newPositions.push({
        x: leftWrist.x,
        y: 1 - leftWrist.y, // Invert Y coordinate to match camera view
        timestamp: currentTime,
        hand: 'left'
      });
    }

    if (rightHandVisible) {
      newPositions.push({
        x: rightWrist.x,
        y: 1 - rightWrist.y, // Invert Y coordinate to match camera view
        timestamp: currentTime,
        hand: 'right'
      });
    }

    if (newPositions.length > 0) {
      lastUpdateTime.current = currentTime;

      setHandPositions(prev => {
        const filtered = [...prev, ...newPositions].filter(pos => 
          currentTime - pos.timestamp < 1000
        );
        
        const leftPoints = filtered
          .filter(p => p.hand === 'left')
          .slice(-TRAIL_LENGTH);
        const rightPoints = filtered
          .filter(p => p.hand === 'right')
          .slice(-TRAIL_LENGTH);
        
        return [...leftPoints, ...rightPoints];
      });
    }
  }, [results]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const timeDiff = ((Date.now() - data.timestamp) / 1000).toFixed(2);
      
      const getPositionDescription = (x: number, y: number) => {
        let horizontal = x < 0.33 ? "left" : x < 0.66 ? "center" : "right";
        let vertical = y > 0.66 ? "top" : y > 0.33 ? "middle" : "bottom"; // Adjusted for inverted Y
        return `${vertical} ${horizontal}`;
      };

      return (
        <div className="bg-black/90 p-3 rounded border border-gray-600">
          <p className="text-white font-semibold mb-1">
            {data.hand.charAt(0).toUpperCase() + data.hand.slice(1)} Hand
          </p>
          <p className="text-gray-300">
            Position: {getPositionDescription(data.x, data.y)}
          </p>
          <p className="text-gray-300">
            {timeDiff}s ago
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="absolute bottom-0 left-0 w-full bg-black/90 p-4" style={{ height: '300px' }}>
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <h3 className="text-white text-lg font-semibold">Hand Movement Tracker</h3>
          <div className="flex gap-4 mt-2">
            {visibleHands.left && (
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-gray-300 text-sm">Left Hand Trail</span>
              </div>
            )}
            {visibleHands.right && (
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span className="text-gray-300 text-sm">Right Hand Trail</span>
              </div>
            )}
            {!visibleHands.left && !visibleHands.right && (
              <span className="text-yellow-400 text-sm">
                No hands currently detected in view
              </span>
            )}
          </div>
          <div className="text-gray-400 text-sm mt-1">
            Showing the last second of hand movements. Larger dots are more recent positions.
          </div>
        </div>
        <div className="flex-1 bg-black/50 rounded">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis 
                type="number" 
                dataKey="x" 
                domain={[0, 1]} 
                stroke="#fff"
                tickFormatter={(value) => {
                  if (value === 0) return "Left";
                  if (value === 0.5) return "Center";
                  if (value === 1) return "Right";
                  return "";
                }}
                ticks={[0, 0.5, 1]}
              >
                <Label value="Camera View (Left to Right)" position="bottom" offset={0} fill="#fff" />
              </XAxis>
              <YAxis 
                type="number" 
                dataKey="y" 
                domain={[0, 1]} 
                stroke="#fff"
                tickFormatter={(value) => {
                  if (value === 1) return "Top";
                  if (value === 0.5) return "Middle";
                  if (value === 0) return "Bottom";
                  return "";
                }}
                ticks={[0, 0.5, 1]}
              >
              </YAxis>
              <ZAxis 
                type="number" 
                dataKey="timestamp" 
                range={[100, 1000]} 
              />
              <Tooltip content={<CustomTooltip />} />
              {visibleHands.left && (
                <Scatter
                  name="Left Hand"
                  data={handPositions.filter(p => p.hand === 'left')}
                  fill="#3b82f6"
                />
              )}
              {visibleHands.right && (
                <Scatter
                  name="Right Hand"
                  data={handPositions.filter(p => p.hand === 'right')}
                  fill="#ef4444"
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PoseVisualization;