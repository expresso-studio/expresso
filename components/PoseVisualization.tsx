"use client"

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

interface MovementDataPoint {
  timestamp: number;
  leftArmX: number;
  leftArmY: number;
  rightArmX: number;
  rightArmY: number;
}

const PoseVisualization: React.FC<PoseVisualizationProps> = ({ results }) => {
  const [movementData, setMovementData] = useState<MovementDataPoint[]>([]);

  useEffect(() => {
    if (!results.poseLandmarks) return;

    const leftWrist = results.poseLandmarks[15];  // Left wrist index
    const rightWrist = results.poseLandmarks[16]; // Right wrist index

    if (!leftWrist?.visibility || !rightWrist?.visibility) return;
    if (leftWrist.visibility < 0.5 || rightWrist.visibility < 0.5) return;

    const newDataPoint: MovementDataPoint = {
      timestamp: Date.now(),
      leftArmX: leftWrist.x,
      leftArmY: leftWrist.y,
      rightArmX: rightWrist.x,
      rightArmY: rightWrist.y,
    };

    setMovementData(prev => {
      const newData = [...prev, newDataPoint];
      return newData.slice(-50); // Keep last 50 points for better performance
    });
  }, [results]);

  return (
    <div className="absolute bottom-0 left-0 w-full bg-black/80 p-4" style={{ height: '200px' }}>
      <div className="text-white mb-2 text-lg font-semibold">Arm Movement Tracking</div>
      <div className="h-[calc(100%-40px)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={movementData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis 
              dataKey="timestamp"
              domain={['auto', 'auto']}
              tickFormatter={(value: number) => {
                const date = new Date(value);
                return `${date.getMinutes()}:${date.getSeconds().toString().padStart(2, '0')}`;
              }}
              stroke="#fff"
            />
            <YAxis 
              stroke="#fff"
              domain={[0, 1]}
              tickFormatter={(value: number) => value.toFixed(2)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#333',
                border: '1px solid #666',
                color: '#fff',
                borderRadius: '4px',
              }}
              labelFormatter={(value: number) => new Date(value).toLocaleTimeString()}
              formatter={(value: number) => [value.toFixed(3), '']}
            />
            <Legend />
            <Line 
              type="monotone"
              dataKey="leftArmX"
              stroke="#8884d8"
              name="Left Arm X"
              dot={false}
              isAnimationActive={false}
            />
            <Line 
              type="monotone"
              dataKey="leftArmY"
              stroke="#82ca9d"
              name="Left Arm Y"
              dot={false}
              isAnimationActive={false}
            />
            <Line 
              type="monotone"
              dataKey="rightArmX"
              stroke="#ffc658"
              name="Right Arm X"
              dot={false}
              isAnimationActive={false}
            />
            <Line 
              type="monotone"
              dataKey="rightArmY"
              stroke="#ff7300"
              name="Right Arm Y"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PoseVisualization;