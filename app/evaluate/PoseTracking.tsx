// PoseTracking.tsx
"use client"

import React, { useEffect, useRef, useState } from 'react';

interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface PoseResults {
  poseLandmarks?: PoseLandmark[];
}

interface Movement {
  part: string;
  magnitude: number;
  timestamp: number;
  coordinates: {
    x: number;
    y: number;
  };
}

interface PoseTrackingProps {
  results: PoseResults;
  showNotifications: boolean;
}

const MOVEMENT_THRESHOLD = 0.025; // Increased threshold for less frequent notifications
const DEBOUNCE_TIME = 500; // Minimum time between notifications in milliseconds

export const PoseTracking: React.FC<PoseTrackingProps> = ({ results, showNotifications }) => {
  const previousLandmarksRef = useRef<PoseLandmark[]>([]);
  const lastNotificationTime = useRef<number>(0);
  const [notifications, setNotifications] = useState<Movement[]>([]);

  useEffect(() => {
    if (!results.poseLandmarks) return;

    const currentLandmarks = results.poseLandmarks;
    if (!previousLandmarksRef.current.length) {
      previousLandmarksRef.current = currentLandmarks;
      return;
    }

    const currentTime = Date.now();
    if (currentTime - lastNotificationTime.current < DEBOUNCE_TIME) {
      return;
    }

    const checkSignificantMovement = (index: number, partName: string) => {
      const current = currentLandmarks[index];
      const previous = previousLandmarksRef.current[index];

      if (current && previous && current.visibility && current.visibility > 0.5) {
        const movementX = current.x - previous.x;
        const movementY = current.y - previous.y;
        const magnitude = Math.sqrt(movementX ** 2 + movementY ** 2);

        if (magnitude > MOVEMENT_THRESHOLD) {
          lastNotificationTime.current = currentTime;
          return {
            part: partName,
            magnitude,
            timestamp: currentTime,
            coordinates: {
              x: current.x,
              y: current.y
            }
          };
        }
      }
      return null;
    };

    const newMovements: Movement[] = [];

    // Check left wrist (index 15)
    const leftMovement = checkSignificantMovement(15, "Left Arm");
    if (leftMovement) newMovements.push(leftMovement);

    // Check right wrist (index 16)
    const rightMovement = checkSignificantMovement(16, "Right Arm");
    if (rightMovement) newMovements.push(rightMovement);

    if (newMovements.length > 0) {
      setNotifications(prev => [...prev, ...newMovements]);
    }

    previousLandmarksRef.current = currentLandmarks;

    // Cleanup old notifications after 1.5 seconds
    setNotifications(prev => prev.filter(n => currentTime - n.timestamp < 1500));
  }, [results]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {showNotifications && notifications.map((notification) => (
        <div
          key={`${notification.part}-${notification.timestamp}`}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-black/90 text-green-400 px-5 py-4 rounded-lg text-lg font-bold z-50 border-2 border-green-400 shadow-lg"
          style={{
            top: `${notification.coordinates.y * 100}%`,
            left: `${notification.coordinates.x * 100}%`,
            animation: 'fadeInOut 1.5s ease-in-out forwards'
          }}
        >
          <style jsx>{`
            @keyframes fadeInOut {
              0% { opacity: 0; transform: translate(-50%, -30px); }
              15% { opacity: 1; transform: translate(-50%, -50%); }
              85% { opacity: 1; transform: translate(-50%, -50%); }
              100% { opacity: 0; transform: translate(-50%, -70px); }
            }
          `}</style>
          {notification.part} Moving!
          <div className="text-sm text-white mt-1 text-center">
            {(notification.magnitude * 100).toFixed(1)}% movement
          </div>
        </div>
      ))}
    </div>
  );
};

export default PoseTracking;