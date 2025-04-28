// analysisAlgorithms.ts - Core algorithms for analyzing pose data

import _ from "lodash";
import { PoseLandmark, GestureMetrics, GestureFeedback } from "@/lib/types";
import { calculateMovement } from "./utils";
import { OPTIMAL_RANGES } from "@/lib/constants";

// Analyze Posture from landmarks - simplified to more boolean-like states
export const analyzePosture = (landmarks?: PoseLandmark[]): number => {
  if (!landmarks) return 0.5;

  const nose = landmarks[0];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];

  // Check visibility
  if (
    !nose?.visibility ||
    !leftShoulder?.visibility ||
    !rightShoulder?.visibility ||
    !leftHip?.visibility ||
    !rightHip?.visibility ||
    nose.visibility < 0.5 ||
    leftShoulder.visibility < 0.5 ||
    rightShoulder.visibility < 0.5 ||
    leftHip.visibility < 0.5 ||
    rightHip.visibility < 0.5
  ) {
    return 0.5;
  }

  // Shoulder alignment (horizontal)
  const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
  // More boolean-like: good if under threshold
  const shoulderAligned = shoulderDiff < 0.08;

  // Spine straightness (vertical alignment)
  const midShoulder = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
  };
  const midHip = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2,
  };

  const spineAngle = Math.abs(midShoulder.x - midHip.x);
  // More boolean-like: good if under threshold
  const spineAligned = spineAngle < 0.08;

  // Head position relative to shoulders
  const headOffset = Math.abs(nose.x - midShoulder.x);
  // More boolean-like: good if under threshold
  const headAligned = headOffset < 0.1;

  // Count how many Posture aspects are good
  let goodPostureCount = 0;
  if (shoulderAligned) goodPostureCount++;
  if (spineAligned) goodPostureCount++;
  if (headAligned) goodPostureCount++;

  // Convert to three discrete levels: bad (0-0.33), medium (0.34-0.66), good (0.67-1.0)
  if (goodPostureCount === 0) return 0.2; // Bad Posture
  if (goodPostureCount === 1) return 0.5; // Medium Posture
  if (goodPostureCount === 2) return 0.8; // Good Posture
  return 1.0; // Perfect Posture (all 3 aspects good)
};

// Calculate body movement based on shoulders and hips
export const calculateBodyMovement = (
  landmarks?: PoseLandmark[],
  prevLandmarks?: PoseLandmark[],
): number => {
  if (!landmarks || !prevLandmarks) return 0.5;

  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];

  const prevLeftShoulder = prevLandmarks[11];
  const prevRightShoulder = prevLandmarks[12];
  const prevLeftHip = prevLandmarks[23];
  const prevRightHip = prevLandmarks[24];

  if (
    !leftShoulder?.visibility ||
    !rightShoulder?.visibility ||
    !leftHip?.visibility ||
    !rightHip?.visibility ||
    !prevLeftShoulder?.visibility ||
    !prevRightShoulder?.visibility ||
    !prevLeftHip?.visibility ||
    !prevRightHip?.visibility ||
    leftShoulder.visibility < 0.5 ||
    rightShoulder.visibility < 0.5 ||
    leftHip.visibility < 0.5 ||
    rightHip.visibility < 0.5 ||
    prevLeftShoulder.visibility < 0.5 ||
    prevRightShoulder.visibility < 0.5 ||
    prevLeftHip.visibility < 0.5 ||
    prevRightHip.visibility < 0.5
  ) {
    return 0.5;
  }

  // Calculate torso center points
  const torsoCenter = {
    x: (leftShoulder.x + rightShoulder.x + leftHip.x + rightHip.x) / 4,
    y: (leftShoulder.y + rightShoulder.y + leftHip.y + rightHip.y) / 4,
  };

  const prevTorsoCenter = {
    x:
      (prevLeftShoulder.x +
        prevRightShoulder.x +
        prevLeftHip.x +
        prevRightHip.x) /
      4,
    y:
      (prevLeftShoulder.y +
        prevRightShoulder.y +
        prevLeftHip.y +
        prevRightHip.y) /
      4,
  };

  // Calculate movement between frames
  const movement = Math.sqrt(
    Math.pow((torsoCenter.x - prevTorsoCenter.x) * 15, 2) +
      Math.pow((torsoCenter.y - prevTorsoCenter.y) * 15, 2),
  );

  // Scale the movement to be more sensitive to small changes
  return Math.min(1, Math.pow(movement * 4, 1.2));
};

// Calculate hand symmetry (how similarly both hands are being used)
export const calculateHandSymmetry = (
  landmarks?: PoseLandmark[],
  handPositionsBuffer?: { left: PoseLandmark; right: PoseLandmark }[],
): number => {
  if (!landmarks || !handPositionsBuffer || handPositionsBuffer.length < 5)
    return 0.5;

  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[14];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];

  if (
    !leftWrist?.visibility ||
    !rightWrist?.visibility ||
    !leftElbow?.visibility ||
    !rightElbow?.visibility ||
    !leftShoulder?.visibility ||
    !rightShoulder?.visibility ||
    leftWrist.visibility < 0.5 ||
    rightWrist.visibility < 0.5 ||
    leftElbow.visibility < 0.5 ||
    rightElbow.visibility < 0.5 ||
    leftShoulder.visibility < 0.5 ||
    rightShoulder.visibility < 0.5
  ) {
    return 0.5;
  }

  // Calculate movement for each hand over the buffer (last 10 frames)
  const leftMovements: number[] = [];
  const rightMovements: number[] = [];

  const recentFrames = handPositionsBuffer.slice(-10);

  for (let i = 1; i < recentFrames.length; i++) {
    const prevFrame = recentFrames[i - 1];
    const currFrame = recentFrames[i];

    leftMovements.push(calculateMovement(currFrame.left, prevFrame.left, 1));
    rightMovements.push(calculateMovement(currFrame.right, prevFrame.right, 1));
  }

  const leftTotal = _.sum(leftMovements);
  const rightTotal = _.sum(rightMovements);

  // Check current arm positions
  const leftArmExtension = Math.sqrt(
    Math.pow(leftWrist.x - leftShoulder.x, 2) +
      Math.pow(leftWrist.y - leftShoulder.y, 2),
  );

  const rightArmExtension = Math.sqrt(
    Math.pow(rightWrist.x - rightShoulder.x, 2) +
      Math.pow(rightWrist.y - rightShoulder.y, 2),
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
export const calculateGestureVariety = (
  landmarks?: PoseLandmark[],
  handPositionsBuffer?: { left: PoseLandmark; right: PoseLandmark }[],
): number => {
  if (!landmarks || !handPositionsBuffer || handPositionsBuffer.length < 10)
    return 0.5;

  // Use the positions from the hand symmetry calculation
  // Calculate the different regions where the hands have been
  const regions = new Set<string>();
  const gridSize = 5; // 5x5 grid for hand positions

  handPositionsBuffer.forEach((frame) => {
    // Quantize positions to grid cells
    const leftRegion = `${Math.floor(frame.left.x * gridSize)}_${Math.floor(
      frame.left.y * gridSize,
    )}`;
    const rightRegion = `${Math.floor(frame.right.x * gridSize)}_${Math.floor(
      frame.right.y * gridSize,
    )}`;

    regions.add(leftRegion);
    regions.add(rightRegion);
  });

  // More unique regions = more variety
  // Scale to 0-1 range (max would be 2 * gridSize^2 if using every region)
  const maxPossibleRegions = Math.min(2 * Math.pow(gridSize, 2), 30);
  return Math.min(1, regions.size / maxPossibleRegions);
};

// Calculate eye contact (based on head position and orientation)
export const calculateEyeContact = (landmarks?: PoseLandmark[]): number => {
  if (!landmarks) return 0.5;

  const nose = landmarks[0];
  const leftEye = landmarks[2];
  const rightEye = landmarks[5];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];

  if (
    !nose?.visibility ||
    !leftEye?.visibility ||
    !rightEye?.visibility ||
    !leftShoulder?.visibility ||
    !rightShoulder?.visibility ||
    nose.visibility < 0.5 ||
    leftEye.visibility < 0.5 ||
    rightEye.visibility < 0.5 ||
    leftShoulder.visibility < 0.5 ||
    rightShoulder.visibility < 0.5
  ) {
    return 0.5;
  }

  // Calculate midpoint of shoulders
  const shoulderMidpoint = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
  };

  // Check if nose is aligned with shoulder midpoint (horizontal alignment)
  const horizontalAlignment =
    1 - Math.min(1, Math.abs(nose.x - shoulderMidpoint.x) * 10);

  // Check eye horizontal alignment (how level the eyes are)
  const eyeHorizontalAlignment =
    1 - Math.min(1, Math.abs(leftEye.y - rightEye.y) * 10);

  // Calculate distance between eyes (for perspective/facing detection)
  const eyeDistance = Math.sqrt(
    Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2),
  );

  // When looking directly at camera, eyes should be more separated
  // Scale to normalize the value
  const facingScore = Math.min(1, eyeDistance * 10);

  // Combine metrics with appropriate weights
  return Math.max(
    0,
    Math.min(
      1,
      horizontalAlignment * 0.4 +
        eyeHorizontalAlignment * 0.3 +
        facingScore * 0.3,
    ),
  );
};

// Generate feedback messages based on current metrics
export const generateFeedback = (
  metrics: GestureMetrics,
): GestureFeedback[] => {
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
      switch (metricKey) {
        case "HandMovement":
          feedback.push({
            message: "Consider using more hand gestures",
            type: "warning",
          });
          break;
        case "HeadMovement":
          feedback.push({
            message: "Slight head movement recommended",
            type: "info",
          });
          break;
        case "Posture":
          feedback.push({
            message: "Check Posture alignment",
            type: "warning",
          });
          break;
        case "HandSymmetry":
          feedback.push({
            message: "Balance hand usage",
            type: "info",
          });
          break;
        case "GestureVariety":
          feedback.push({
            message: "Vary gestures for engagement",
            type: "info",
          });
          break;
        case "EyeContact":
          feedback.push({
            message: "Maintain eye contact",
            type: "info",
          });
          break;
      }
    } else if (value > range.max) {
      // High value
      switch (metricKey) {
        case "HandMovement":
          feedback.push({
            message: "Hand movements above normal range",
            type: "info",
          });
          break;
        case "HeadMovement":
          feedback.push({
            message: "Head movement above normal range",
            type: "info",
          });
          break;
        case "Posture":
          // Usually not an issue to have extremely good Posture
          break;
        case "HandSymmetry":
          // Usually not an issue to have perfect symmetry
          break;
        case "GestureVariety":
          feedback.push({
            message: "Consider more consistent gestures",
            type: "info",
          });
          break;
        case "EyeContact":
          // Usually not an issue to have perfect eye contact
          break;
      }
    }
  });

  // Limit to 1 feedback item at a time to reduce distraction
  return feedback.slice(0, 1);
};
