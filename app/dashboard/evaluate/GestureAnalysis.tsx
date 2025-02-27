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
bodyMovement: number;
posture: number;
handSymmetry: number;
gestureVariety: number;
eyeContact: number;
overallScore: number;
}

interface GestureFeedback {
message: string;
type: 'success' | 'warning' | 'error' | 'info';
}

interface Props {
poseLandmarks?: PoseLandmark[];
isRecording: boolean;
}

// Constants for analysis
const MOVEMENT_BUFFER_SIZE = 60; // 2 seconds at 30fps
const POSTURE_COEFFICIENT = 0.25;
const HAND_MOVEMENT_COEFFICIENT = 0.2;
const HEAD_MOVEMENT_COEFFICIENT = 0.15;
const BODY_MOVEMENT_COEFFICIENT = 0.15;
const HAND_SYMMETRY_COEFFICIENT = 0.1;
const GESTURE_VARIETY_COEFFICIENT = 0.05;
const EYE_CONTACT_COEFFICIENT = 0.1;

// Optimal value ranges for public speaking - with wider ranges for easier achievement
const OPTIMAL_RANGES = {
handMovement: { min: 0.08, max: 0.7 },  // Even wider range for hand movement
headMovement: { min: 0.01, max: 0.5 },  // Wider range for head movement
bodyMovement: { min: 0.02, max: 0.6 },  // New parameter with wide range
posture: { min: 0.4, max: 1.0 },  // Lower threshold for good posture
handSymmetry: { min: 0.2, max: 0.9 },   // Even lower minimum threshold
gestureVariety: { min: 0.15, max: 0.9 },  // Lower minimum threshold
eyeContact: { min: 0.3, max: 0.9 }      // Lower minimum threshold
};

const GestureAnalysis: React.FC<Props> = ({ poseLandmarks, isRecording }) => {
const [metrics, setMetrics] = React.useState<GestureMetrics>({
  handMovement: 0.5,
  headMovement: 0.5,
  bodyMovement: 0.5,
  posture: 0.5,
  handSymmetry: 0.5,
  gestureVariety: 0.5,
  eyeContact: 0.5,
  overallScore: 50
});

const [feedback, setFeedback] = React.useState<GestureFeedback[]>([]);
const [sessionDuration, setSessionDuration] = React.useState(0);

// References for tracking movement over time
const prevLandmarksRef = React.useRef<PoseLandmark[]>([]);
const handMovementBufferRef = React.useRef<number[]>(Array(MOVEMENT_BUFFER_SIZE).fill(0.5));
const headMovementBufferRef = React.useRef<number[]>(Array(MOVEMENT_BUFFER_SIZE).fill(0.5));
const bodyMovementBufferRef = React.useRef<number[]>(Array(MOVEMENT_BUFFER_SIZE).fill(0.5));
const handPositionsBufferRef = React.useRef<{left: PoseLandmark, right: PoseLandmark}[]>([]);
const timerRef = React.useRef<NodeJS.Timeout | null>(null);

// Start/stop session timer
React.useEffect(() => {
  if (isRecording) {
    timerRef.current = setInterval(() => {
      setSessionDuration(prev => prev + 1);
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

// Format time for display
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Smoothly update a metric value to prevent jarring UI changes
const smoothUpdate = (currentValue: number, newValue: number, sensitivity: number = 0.05): number => {
  const delta = newValue - currentValue;
  const maxChange = sensitivity;
  const change = Math.max(-maxChange, Math.min(maxChange, delta));
  return currentValue + change;
};

// Analyze posture from landmarks - simplified to more boolean-like states
const analyzePosture = (landmarks?: PoseLandmark[]): number => {
  if (!landmarks) return 0.5;

  const nose = landmarks[0];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];

  // Check visibility
  if (!nose?.visibility || !leftShoulder?.visibility || !rightShoulder?.visibility || 
      !leftHip?.visibility || !rightHip?.visibility ||
      nose.visibility < 0.5 || leftShoulder.visibility < 0.5 || 
      rightShoulder.visibility < 0.5 || leftHip.visibility < 0.5 || 
      rightHip.visibility < 0.5) {
    return 0.5;
  }

  // Shoulder alignment (horizontal)
  const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
  // More boolean-like: good if under threshold
  const shoulderAligned = shoulderDiff < 0.08;

  // Spine straightness (vertical alignment)
  const midShoulder = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2
  };
  const midHip = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2
  };

  const spineAngle = Math.abs(midShoulder.x - midHip.x);
  // More boolean-like: good if under threshold
  const spineAligned = spineAngle < 0.08;

  // Head position relative to shoulders
  const headOffset = Math.abs(nose.x - midShoulder.x);
  // More boolean-like: good if under threshold
  const headAligned = headOffset < 0.1;
  
  // Count how many posture aspects are good
  let goodPostureCount = 0;
  if (shoulderAligned) goodPostureCount++;
  if (spineAligned) goodPostureCount++;
  if (headAligned) goodPostureCount++;
  
  // Convert to three discrete levels: bad (0-0.33), medium (0.34-0.66), good (0.67-1.0)
  if (goodPostureCount === 0) return 0.2; // Bad posture
  if (goodPostureCount === 1) return 0.5; // Medium posture
  if (goodPostureCount === 2) return 0.8; // Good posture
  return 1.0; // Perfect posture (all 3 aspects good)
};

// Calculate movement between two landmarks
const calculateMovement = (
  current?: PoseLandmark,
  previous?: PoseLandmark,
  sensitivity: number = 1
): number => {
  if (!current?.visibility || !previous?.visibility || 
      current.visibility < 0.5 || previous.visibility < 0.5) {
    return 0;
  }

  // Calculate distance moved (scaled by sensitivity)
  const movement = Math.sqrt(
    Math.pow((current.x - previous.x) * sensitivity, 2) +
    Math.pow((current.y - previous.y) * sensitivity, 2)
  );
  
  // Apply a more balanced scaling to keep movements in the middle range more often
  // This makes it easier to stay in the "optimal" zone with normal movement
  return Math.min(1, Math.pow(movement * 3, 1.2));
};

// Calculate body movement based on shoulders and hips
const calculateBodyMovement = (landmarks?: PoseLandmark[], prevLandmarks?: PoseLandmark[]): number => {
  if (!landmarks || !prevLandmarks) return 0.5;
  
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  
  const prevLeftShoulder = prevLandmarks[11];
  const prevRightShoulder = prevLandmarks[12];
  const prevLeftHip = prevLandmarks[23];
  const prevRightHip = prevLandmarks[24];
  
  if (!leftShoulder?.visibility || !rightShoulder?.visibility || 
      !leftHip?.visibility || !rightHip?.visibility ||
      !prevLeftShoulder?.visibility || !prevRightShoulder?.visibility || 
      !prevLeftHip?.visibility || !prevRightHip?.visibility ||
      leftShoulder.visibility < 0.5 || rightShoulder.visibility < 0.5 || 
      leftHip.visibility < 0.5 || rightHip.visibility < 0.5 ||
      prevLeftShoulder.visibility < 0.5 || prevRightShoulder.visibility < 0.5 || 
      prevLeftHip.visibility < 0.5 || prevRightHip.visibility < 0.5) {
    return 0.5;
  }
  
  // Calculate torso center points
  const torsoCenter = {
    x: (leftShoulder.x + rightShoulder.x + leftHip.x + rightHip.x) / 4,
    y: (leftShoulder.y + rightShoulder.y + leftHip.y + rightHip.y) / 4
  };
  
  const prevTorsoCenter = {
    x: (prevLeftShoulder.x + prevRightShoulder.x + prevLeftHip.x + prevRightHip.x) / 4,
    y: (prevLeftShoulder.y + prevRightShoulder.y + prevLeftHip.y + prevRightHip.y) / 4
  };
  
  // Calculate movement between frames
  const movement = Math.sqrt(
    Math.pow((torsoCenter.x - prevTorsoCenter.x) * 15, 2) +
    Math.pow((torsoCenter.y - prevTorsoCenter.y) * 15, 2)
  );
  
  // Scale the movement to be more sensitive to small changes
  return Math.min(1, Math.pow(movement * 4, 1.2));
};

// Calculate hand symmetry (how similarly both hands are being used)
const calculateHandSymmetry = (landmarks?: PoseLandmark[]): number => {
  if (!landmarks) return 0.5;
  
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[14];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  
  if (!leftWrist?.visibility || !rightWrist?.visibility || 
      !leftElbow?.visibility || !rightElbow?.visibility ||
      !leftShoulder?.visibility || !rightShoulder?.visibility ||
      leftWrist.visibility < 0.5 || rightWrist.visibility < 0.5 ||
      leftElbow.visibility < 0.5 || rightElbow.visibility < 0.5 ||
      leftShoulder.visibility < 0.5 || rightShoulder.visibility < 0.5) {
    return 0.5;
  }
  
  // Track positions over time
  if (handPositionsBufferRef.current.length >= 30) {
    handPositionsBufferRef.current.shift();
  }
  
  handPositionsBufferRef.current.push({
    left: { ...leftWrist },
    right: { ...rightWrist }
  });
  
  // Not enough data yet
  if (handPositionsBufferRef.current.length < 5) {
    return 0.5;
  }
  
  // Calculate movement for each hand over the buffer (last 10 frames)
  const leftMovements: number[] = [];
  const rightMovements: number[] = [];
  
  const recentFrames = handPositionsBufferRef.current.slice(-10);
  
  for (let i = 1; i < recentFrames.length; i++) {
    const prevFrame = recentFrames[i-1];
    const currFrame = recentFrames[i];
    
    leftMovements.push(calculateMovement(currFrame.left, prevFrame.left, 1));
    rightMovements.push(calculateMovement(currFrame.right, prevFrame.right, 1));
  }
  
  const leftTotal = _.sum(leftMovements);
  const rightTotal = _.sum(rightMovements);
  
  // Check current arm positions
  const leftArmExtension = Math.sqrt(
    Math.pow(leftWrist.x - leftShoulder.x, 2) + 
    Math.pow(leftWrist.y - leftShoulder.y, 2)
  );
  
  const rightArmExtension = Math.sqrt(
    Math.pow(rightWrist.x - rightShoulder.x, 2) + 
    Math.pow(rightWrist.y - rightShoulder.y, 2)
  );
  
  // If both arms are close to body, symmetry is less relevant
  const armsExtended = Math.max(leftArmExtension, rightArmExtension) > 0.2;
  
  // If both hands are very still, check position symmetry instead of movement
  if (leftTotal < 0.01 && rightTotal < 0.01) {
    if (!armsExtended) {
      return 0.5; // Both arms at rest, considered neutral symmetry
    }
    
    // Check if hands are at similar heights (y-coordinate)
    const heightDifference = Math.abs(leftWrist.y - rightWrist.y);
    return Math.max(0, 1 - heightDifference * 5);
  }
  
  // If one hand is moving significantly more than the other
  if (leftTotal > 0.1 || rightTotal > 0.1) {
    // Calculate the ratio between the more active and less active hand
    const max = Math.max(leftTotal, rightTotal);
    const min = Math.min(leftTotal, rightTotal);
    
    return min / max;
  }
  
  // Default case - moderate symmetry
  return 0.5;
};

// Calculate gesture variety (are they using the same gestures repeatedly)
const calculateGestureVariety = (landmarks?: PoseLandmark[]): number => {
  if (!landmarks || handPositionsBufferRef.current.length < 10) return 0.5;
  
  // Use the positions from the hand symmetry calculation
  // Calculate the different regions where the hands have been
  const regions = new Set<string>();
  const gridSize = 5; // 5x5 grid for hand positions
  
  handPositionsBufferRef.current.forEach(frame => {
    // Quantize positions to grid cells
    const leftRegion = `${Math.floor(frame.left.x * gridSize)}_${Math.floor(frame.left.y * gridSize)}`;
    const rightRegion = `${Math.floor(frame.right.x * gridSize)}_${Math.floor(frame.right.y * gridSize)}`;
    
    regions.add(leftRegion);
    regions.add(rightRegion);
  });
  
  // More unique regions = more variety
  // Scale to 0-1 range (max would be 2 * gridSize^2 if using every region)
  const maxPossibleRegions = Math.min(2 * Math.pow(gridSize, 2), 30);
  return Math.min(1, regions.size / maxPossibleRegions);
};

// Calculate eye contact (based on head position and orientation)
const calculateEyeContact = (landmarks?: PoseLandmark[]): number => {
  if (!landmarks) return 0.5;
  
  const nose = landmarks[0];
  const leftEye = landmarks[2];
  const rightEye = landmarks[5];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  
  if (!nose?.visibility || !leftEye?.visibility || !rightEye?.visibility || 
      !leftShoulder?.visibility || !rightShoulder?.visibility ||
      nose.visibility < 0.5 || leftEye.visibility < 0.5 || rightEye.visibility < 0.5 ||
      leftShoulder.visibility < 0.5 || rightShoulder.visibility < 0.5) {
    return 0.5;
  }
  
  // Calculate if face is directed forward
  // const eyeMidpoint = {
  //   x: (leftEye.x + rightEye.x) / 2,
  //   y: (leftEye.y + rightEye.y) / 2,
  //   z: (leftEye.z + rightEye.z) / 2
  // };
  
  // Calculate midpoint of shoulders
  const shoulderMidpoint = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2
  };
  
  // Check if nose is aligned with shoulder midpoint (horizontal alignment)
  const horizontalAlignment = 1 - Math.min(1, Math.abs(nose.x - shoulderMidpoint.x) * 10);
  
  // Check eye horizontal alignment (how level the eyes are)
  const eyeHorizontalAlignment = 1 - Math.min(1, Math.abs(leftEye.y - rightEye.y) * 10);
  
  // Calculate distance between eyes (for perspective/facing detection)
  const eyeDistance = Math.sqrt(
    Math.pow(rightEye.x - leftEye.x, 2) + 
    Math.pow(rightEye.y - leftEye.y, 2)
  );
  
  // When looking directly at camera, eyes should be more separated
  // Scale to normalize the value
  const facingScore = Math.min(1, eyeDistance * 10);
  
  // Combine metrics with appropriate weights
  return Math.max(0, Math.min(1, 
    horizontalAlignment * 0.4 + 
    eyeHorizontalAlignment * 0.3 + 
    facingScore * 0.3
  ));
};

// Generate feedback messages based on current metrics
const generateFeedback = (metrics: GestureMetrics): GestureFeedback[] => {
  const feedback: GestureFeedback[] = [];
  
  // Use a random number to occasionally skip feedback to reduce distraction
  if (Math.random() > 0.7) {
    return feedback;
  }
  
  // Check each metric against optimal ranges
  Object.entries(OPTIMAL_RANGES).forEach(([key, range]) => {
    const metricKey = key as keyof typeof OPTIMAL_RANGES;
    const value = metrics[metricKey];
    
    if (value < range.min) {
      // Low value
      switch(metricKey) {
        case 'handMovement':
          feedback.push({ 
            message: 'Consider using more hand gestures', 
            type: 'warning' 
          });
          break;
        case 'headMovement':
          feedback.push({ 
            message: 'Slight head movement recommended', 
            type: 'info' 
          });
          break;
        case 'posture':
          feedback.push({ 
            message: 'Check posture alignment', 
            type: 'warning' 
          });
          break;
        case 'handSymmetry':
          feedback.push({ 
            message: 'Balance hand usage', 
            type: 'info' 
          });
          break;
        case 'gestureVariety':
          feedback.push({ 
            message: 'Vary gestures for engagement', 
            type: 'info' 
          });
          break;
        case 'eyeContact':
          feedback.push({ 
            message: 'Maintain eye contact', 
            type: 'info' 
          });
          break;
      }
    } else if (value > range.max) {
      // High value
      switch(metricKey) {
        case 'handMovement':
          feedback.push({ 
            message: 'Hand movements above normal range', 
            type: 'info' 
          });
          break;
        case 'headMovement':
          feedback.push({ 
            message: 'Head movement above normal range', 
            type: 'info' 
          });
          break;
        case 'posture': 
          // Usually not an issue to have extremely good posture
          break;
        case 'handSymmetry':
          // Usually not an issue to have perfect symmetry
          break;
        case 'gestureVariety':
          feedback.push({ 
            message: 'Consider more consistent gestures', 
            type: 'info' 
          });
          break;
        case 'eyeContact':
          // Usually not an issue to have perfect eye contact
          break;
      }
    }
  });
  
  // Limit to 1 feedback item at a time to reduce distraction
  return feedback.slice(0, 1);
};

// Counter ref for frame skipping (moved outside useEffect)
const frameCountRef = React.useRef(0);

// Main analysis effect - removed metrics from dependency array
React.useEffect(() => {
  if (!isRecording || !poseLandmarks?.length) return;

  try {
    if (!prevLandmarksRef.current.length) {
      prevLandmarksRef.current = poseLandmarks;
      return;
    }

    // Only update every nth frame to reduce distraction (effectively every ~200ms at 30fps)
    frameCountRef.current += 1;
    if (frameCountRef.current % 6 !== 0) {
      prevLandmarksRef.current = poseLandmarks;
      return;
    }

    // Calculate all metrics
    const postureScore = analyzePosture(poseLandmarks);
    
    // Hand movements - more balanced sensitivity for middle zone
    const leftHandMove = calculateMovement(poseLandmarks[15], prevLandmarksRef.current[15], 8);
    const rightHandMove = calculateMovement(poseLandmarks[16], prevLandmarksRef.current[16], 8);
    const handScore = Math.max(leftHandMove, rightHandMove);
    
    // Head movement - more balanced sensitivity for middle zone
    const headMove = calculateMovement(poseLandmarks[0], prevLandmarksRef.current[0], 15);
    
    // Body movement - track torso movement
    const bodyMove = calculateBodyMovement(poseLandmarks, prevLandmarksRef.current);
    
    // Update movement buffers
    handMovementBufferRef.current = [...handMovementBufferRef.current.slice(1), handScore];
    headMovementBufferRef.current = [...headMovementBufferRef.current.slice(1), headMove];
    bodyMovementBufferRef.current = [...bodyMovementBufferRef.current.slice(1), bodyMove];
    
    // Calculate averages from buffers - use more frames for stability
    const recentHandBuffer = handMovementBufferRef.current.slice(-30);
    const recentHeadBuffer = headMovementBufferRef.current.slice(-30);
    const recentBodyBuffer = bodyMovementBufferRef.current.slice(-30);
    
    const averageHandMovement = _.mean(recentHandBuffer);
    const averageHeadMovement = _.mean(recentHeadBuffer);
    const averageBodyMovement = _.mean(recentBodyBuffer);
    
    // Calculate advanced metrics
    const handSymmetry = calculateHandSymmetry(poseLandmarks);
    const gestureVariety = calculateGestureVariety(poseLandmarks);
    const eyeContact = calculateEyeContact(poseLandmarks);

    // Update metrics using functional update with slower update rate
    setMetrics(prevMetrics => {
      const newMetrics = {
        handMovement: smoothUpdate(prevMetrics.handMovement, averageHandMovement, 0.05),  // Slower update
        headMovement: smoothUpdate(prevMetrics.headMovement, averageHeadMovement, 0.05),  // Slower update
        bodyMovement: smoothUpdate(prevMetrics.bodyMovement, averageBodyMovement, 0.05),  // New body movement
        posture: postureScore, // Directly use posture score (already discrete)
        handSymmetry: smoothUpdate(prevMetrics.handSymmetry, handSymmetry, 0.05),
        gestureVariety: smoothUpdate(prevMetrics.gestureVariety, gestureVariety, 0.05),
        eyeContact: smoothUpdate(prevMetrics.eyeContact, eyeContact, 0.05),
        overallScore: 0
      };

      // Calculate overall score (weighted average) - Add a bonus to make it easier to get a higher score
      const rawScore = (
        (newMetrics.handMovement * HAND_MOVEMENT_COEFFICIENT +
         newMetrics.headMovement * HEAD_MOVEMENT_COEFFICIENT +
         newMetrics.bodyMovement * BODY_MOVEMENT_COEFFICIENT +
         newMetrics.posture * POSTURE_COEFFICIENT +
         newMetrics.handSymmetry * HAND_SYMMETRY_COEFFICIENT +
         newMetrics.gestureVariety * GESTURE_VARIETY_COEFFICIENT +
         newMetrics.eyeContact * EYE_CONTACT_COEFFICIENT) * 100 /
        (HAND_MOVEMENT_COEFFICIENT + HEAD_MOVEMENT_COEFFICIENT + BODY_MOVEMENT_COEFFICIENT + 
         POSTURE_COEFFICIENT + HAND_SYMMETRY_COEFFICIENT + GESTURE_VARIETY_COEFFICIENT + 
         EYE_CONTACT_COEFFICIENT)
      );
      
      // Apply curve to make scores higher - this gives a 10-15 point boost to mid-range scores
      const curvedScore = Math.round(Math.min(100, rawScore * 1.15));
      newMetrics.overallScore = curvedScore;

      return newMetrics;
    });

    // Generate new feedback occasionally based on current metrics state
    // Don't update feedback directly from this effect to avoid triggering rerenders
    const shouldUpdateFeedback = sessionDuration % 5 === 0;
    if (shouldUpdateFeedback) {
      // Get metrics first to ensure we have the latest values
      setMetrics(currentMetrics => {
        // Generate feedback based on current metrics
        const newFeedback = generateFeedback(currentMetrics);
        // Update feedback in a separate state update
        setTimeout(() => setFeedback(newFeedback), 0);
        // Return unchanged metrics to avoid unnecessary update
        return currentMetrics;
      });
    }

    // Update reference for next frame
    prevLandmarksRef.current = poseLandmarks;

  } catch (error) {
    console.error('Error analyzing gestures:', error);
  }
// Removed metrics from dependency array to prevent update loop
}, [poseLandmarks, isRecording, sessionDuration]);

// Get color class based on value and optimal range - Star Trek LCARS style
const getColorClass = (key: string, value: number): string => {
  const metricKey = key as keyof typeof OPTIMAL_RANGES;
  if (!OPTIMAL_RANGES[metricKey]) return 'bg-blue-500';
  
  // For posture, use categorical colors
  if (key === 'posture') {
    if (value < 0.33) return 'bg-red-500';
    if (value < 0.67) return 'bg-yellow-500';
    return 'bg-green-500';
  }
  
  // For other metrics - use Trek-like colors
  if (value < OPTIMAL_RANGES[metricKey].min) return 'bg-red-500';
  if (value > OPTIMAL_RANGES[metricKey].max) return 'bg-amber-500';
  return 'bg-blue-500'; // Normal/optimal in Trek style is often blue
};

// Get text for metric status - more Star Trek medical dashboard style
const getMetricStatus = (key: string, value: number): string => {
  const metricKey = key as keyof typeof OPTIMAL_RANGES;
  if (!OPTIMAL_RANGES[metricKey]) return 'N/A';
  
  // For posture, use categorical labels
  if (key === 'posture') {
    if (value < 0.33) return 'Poor';
    if (value < 0.67) return 'Fair';
    return 'Good';
  }
  
  // For other metrics
  if (value < OPTIMAL_RANGES[metricKey].min) return 'Low';
  if (value > OPTIMAL_RANGES[metricKey].max) return 'High';
  return 'Normal';
};

// Function to format metric name for display
const formatMetricName = (key: string): string => {
  return key === 'overallScore' ? 'Overall Score' : 
    key.replace(/([A-Z])/g, ' $1').trim();
};

return (
  <div className="fixed top-4 right-4 space-y-4 bg-black/80 p-4 rounded-lg w-96">
    <div className="flex justify-between items-center">
      <h3 className="text-white font-semibold">Gesture Analysis</h3>
      {isRecording && (
        <div className="flex items-center">
          <span className="animate-pulse mr-2 h-3 w-3 rounded-full bg-red-500"></span>
          <span className="text-white text-sm">{formatTime(sessionDuration)}</span>
        </div>
      )}
    </div>
    
    {/* Metrics Display */}
    <div className="space-y-3">
      {Object.entries(metrics).map(([key, value]) => (
        <div key={key} className="flex flex-col mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300 capitalize">
              {formatMetricName(key)}
            </span>
            <span className={
              key === 'overallScore' ? 'text-white font-bold' : 
              getColorClass(key, value) === 'bg-blue-500' ? 'text-blue-400' :
              getColorClass(key, value) === 'bg-green-500' ? 'text-green-400' :
              getColorClass(key, value) === 'bg-amber-500' ? 'text-amber-400' : 
              'text-red-400'
            }>
              {key === 'overallScore' ? `${value}/100` : getMetricStatus(key, value)}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                key === 'overallScore' ? 'bg-blue-500' : getColorClass(key, value)
              }`}
              style={{ width: `${key === 'overallScore' ? value : value * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>

    {/* Feedback Panel */}
    {isRecording && feedback.length > 0 && (
      <div className="mt-4 p-4 rounded-lg bg-gray-700/50 border border-gray-600 space-y-2">
        {feedback.map((item, index) => (
          <div 
            key={index}
            className={`text-sm p-2 rounded ${
              item.type === 'success' ? 'bg-green-800/30 text-green-300' :
              item.type === 'warning' ? 'bg-yellow-800/30 text-yellow-300' :
              item.type === 'error' ? 'bg-red-800/30 text-red-300' :
              'bg-blue-800/30 text-blue-300'
            }`}
          >
            {item.message}
          </div>
        ))}
      </div>
    )}

    {/* Show feedback only */}
    {isRecording && feedback.length > 0 && (
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <h4 className="text-white text-sm">System Analysis</h4>
          <span className="text-xs text-blue-400">
            {feedback.length > 0 ? 'Analyzing...' : ''}
          </span>
        </div>
      </div>
    )}
  </div>
);
};

export default GestureAnalysis;