"use client";

import React from 'react';
import _ from 'lodash';

interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface GestureMetrics {
  handMovement: number;
  headMovement: number;
  posture: number;
  overallScore: number;
}

interface Props {
  poseLandmarks?: PoseLandmark[];
  isRecording: boolean;
}

const MOVEMENT_BUFFER_SIZE = 30;
const POSTURE_COEFFICIENT = 0.72;
const HAND_MOVEMENT_COEFFICIENT = 0.54;

const GestureAnalysis: React.FC<Props> = ({ poseLandmarks, isRecording }) => {
  const [metrics, setMetrics] = React.useState<GestureMetrics>({
    handMovement: 0.5,
    headMovement: 0.5,
    posture: 0.5,
    overallScore: 50
  });

  const prevLandmarksRef = React.useRef<PoseLandmark[]>([]);
  const movementBufferRef = React.useRef<number[]>(Array(MOVEMENT_BUFFER_SIZE).fill(0.5));

  // Smoothly update a metric value
  const smoothUpdate = (currentValue: number, newValue: number): number => {
    const delta = newValue - currentValue;
    const maxChange = 0.05;
    const change = Math.max(-maxChange, Math.min(maxChange, delta));
    return currentValue + change;
  };

  // Analyze posture
  const analyzePosture = (landmarks?: PoseLandmark[]): number => {
    if (!landmarks) return 0.5;

    const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    if (!nose?.visibility || !leftShoulder?.visibility || !rightShoulder?.visibility || 
        !leftHip?.visibility || !rightHip?.visibility ||
        nose.visibility < 0.5 || leftShoulder.visibility < 0.5 || 
        rightShoulder.visibility < 0.5 || leftHip.visibility < 0.5 || 
        rightHip.visibility < 0.5) {
      return 0.5;
    }

    // Shoulder alignment
    const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
    const shoulderScore = Math.max(0, 1 - shoulderDiff * 10);

    // Spine straightness
    const midShoulder = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2
    };
    const midHip = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2
    };

    const spineAngle = Math.abs(midShoulder.x - midHip.x);
    const spineScore = Math.max(0, 1 - spineAngle * 10);

    // Head position
    const headOffset = Math.abs(nose.x - midShoulder.x);
    const headScore = Math.max(0, 1 - headOffset * 10);

    const postureScore = (
      shoulderScore * 0.4 +
      spineScore * 0.4 +
      headScore * 0.2
    );

    return postureScore * POSTURE_COEFFICIENT;
  };

  // Calculate movement
  const calculateMovement = (
    current?: PoseLandmark,
    previous?: PoseLandmark,
    sensitivity: number = 1
  ): number => {
    if (!current?.visibility || !previous?.visibility || 
        current.visibility < 0.5 || previous.visibility < 0.5) {
      return 0;
    }

    return Math.sqrt(
      Math.pow((current.x - previous.x) * sensitivity, 2) +
      Math.pow((current.y - previous.y) * sensitivity, 2)
    ) * HAND_MOVEMENT_COEFFICIENT;
  };

  React.useEffect(() => {
    if (!isRecording || !poseLandmarks?.length) return;

    try {
      if (!prevLandmarksRef.current.length) {
        prevLandmarksRef.current = poseLandmarks;
        return;
      }

      // Calculate new posture score
      const postureScore = analyzePosture(poseLandmarks);

      // Calculate hand movements
      const leftHandMove = calculateMovement(poseLandmarks[15], prevLandmarksRef.current[15], 8);
      const rightHandMove = calculateMovement(poseLandmarks[16], prevLandmarksRef.current[16], 8);
      const handScore = Math.max(leftHandMove, rightHandMove);

      // Update movement buffer
      movementBufferRef.current = [...movementBufferRef.current.slice(1), handScore];
      const averageHandMovement = _.mean(movementBufferRef.current);

      // Update metrics using functional update to avoid dependency loop
      setMetrics(prevMetrics => {
        const newMetrics = {
          handMovement: smoothUpdate(prevMetrics.handMovement, averageHandMovement),
          headMovement: prevMetrics.headMovement,
          posture: smoothUpdate(prevMetrics.posture, postureScore),
          overallScore: 0
        };

        // Calculate overall score
        newMetrics.overallScore = Math.round(
          (newMetrics.handMovement * HAND_MOVEMENT_COEFFICIENT * 100 +
           newMetrics.posture * POSTURE_COEFFICIENT * 100) / 
          (HAND_MOVEMENT_COEFFICIENT + POSTURE_COEFFICIENT)
        );

        return newMetrics;
      });

      prevLandmarksRef.current = poseLandmarks;

    } catch (error) {
      console.error('Error analyzing gestures:', error);
    }
  }, [poseLandmarks, isRecording]); // Removed metrics from dependencies

  return (
    <div className="fixed top-4 right-4 space-y-4 bg-black/80 p-4 rounded-lg w-80">
      <h3 className="text-white font-semibold mb-2">Gesture Analysis</h3>
      
      {Object.entries(metrics).map(([key, value]) => (
        <div key={key} className="flex flex-col mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300 capitalize">
              {key === 'overallScore' ? 'Overall Score' : 
               key.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <span className={key === 'overallScore' ? 'text-white font-bold' : 
              value > 0.65 ? 'text-yellow-500' :
              value > 0.35 ? 'text-green-500' : 
              'text-red-500'}>
              {key === 'overallScore' ? `${value}/100` :
               value > 0.65 ? 'Too Much' :
               value > 0.35 ? 'Optimal' :
               'Too Little'}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                key === 'overallScore' ? 'bg-blue-500' :
                value > 0.65 ? 'bg-yellow-500' :
                value > 0.35 ? 'bg-green-500' :
                'bg-red-500'
              }`}
              style={{ width: `${key === 'overallScore' ? value : value * 100}%` }}
            />
          </div>
        </div>
      ))}

      {isRecording && (
        <div className="mt-4 p-4 rounded-lg bg-gray-700/50 border border-gray-600">
          <p className="text-white text-sm">
            {metrics.posture < 0.35 ? 'Try to maintain upright posture' :
             metrics.handMovement < 0.35 ? 'Try to use more hand gestures' :
             metrics.handMovement > 0.65 ? 'Hand movements are a bit excessive' :
             'Good balance of posture and gestures'}
          </p>
        </div>
      )}
    </div>
  );
};

export default GestureAnalysis;