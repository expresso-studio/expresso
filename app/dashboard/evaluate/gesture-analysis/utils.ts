// utils.ts - Utility functions for gesture analysis

import { PoseLandmark } from "@/lib/types";
import { OPTIMAL_RANGES } from "@/lib/constants";

/**
 * Format time for display.
 * @param {number} seconds - The time in seconds.
 * @returns {string} The formatted time string.
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Smoothly update a metric value to prevent jarring UI changes.
 * @param {number} currentValue - The current value of the metric.
 * @param {number} newValue - The new value of the metric.
 * @param {number} [sensitivity=0.05] - The sensitivity of the update.
 * @returns {number} The updated value of the metric.
 */
export const smoothUpdate = (
  currentValue: number,
  newValue: number,
  sensitivity: number = 0.05,
): number => {
  const delta = newValue - currentValue;
  const maxChange = sensitivity;
  const change = Math.max(-maxChange, Math.min(maxChange, delta));
  return currentValue + change;
};

/**
 * Calculate movement between two landmarks.
 * @param {PoseLandmark} [current] - The current landmark.
 * @param {PoseLandmark} [previous] - The previous landmark.
 * @param {number} [sensitivity=1] - The sensitivity of the movement calculation.
 * @returns {number} The calculated movement.
 */
export const calculateMovement = (
  current?: PoseLandmark,
  previous?: PoseLandmark,
  sensitivity: number = 1,
): number => {
  if (
    !current?.visibility ||
    !previous?.visibility ||
    current.visibility < 0.5 ||
    previous.visibility < 0.5
  ) {
    return 0;
  }

  // Calculate distance moved (scaled by sensitivity)
  const movement = Math.sqrt(
    Math.pow((current.x - previous.x) * sensitivity, 2) +
      Math.pow((current.y - previous.y) * sensitivity, 2),
  );

  // Apply a more balanced scaling to keep movements in the middle range more often
  // This makes it easier to stay in the "optimal" zone with normal movement
  return Math.min(1, Math.pow(movement * 3, 1.2));
};

/**
 * Get color class based on value and optimal range.
 * @param {string} key - The metric key.
 * @param {number} value - The metric value.
 * @returns {string} The color class.
 */
export const getColorClass = (key: string, value: number): string => {
  const metricKey = key as keyof typeof OPTIMAL_RANGES;
  if (!OPTIMAL_RANGES[metricKey]) return "bg-blue-500";

  // For Posture, use categorical colors
  if (key === "Posture") {
    if (value < 0.33) return "bg-red-500";
    if (value < 0.67) return "bg-yellow-500";
    return "bg-green-500";
  }

  // For other metrics - use Trek-like colors
  if (value < OPTIMAL_RANGES[metricKey].min) return "bg-red-500";
  if (value > OPTIMAL_RANGES[metricKey].max) return "bg-amber-500";
  return "bg-blue-500"; // Normal/optimal in Trek style is often blue
};

/**
 * Get text for metric status.
 * @param {string} key - The metric key.
 * @param {number} value - The metric value.
 * @returns {string} The metric status text.
 */
export const getMetricStatus = (key: string, value: number): string => {
  const metricKey = key as keyof typeof OPTIMAL_RANGES;
  if (!OPTIMAL_RANGES[metricKey]) return "N/A";

  // For Posture, use categorical labels
  if (key === "Posture") {
    if (value < 0.33) return "Poor";
    if (value < 0.67) return "Fair";
    return "Good";
  }

  // For other metrics
  if (value < OPTIMAL_RANGES[metricKey].min) return "Low";
  if (value > OPTIMAL_RANGES[metricKey].max) return "High";
  return "Normal";
};

/**
 * Function to format metric name for display.
 * @param {string} key - The metric key.
 * @returns {string} The formatted metric name.
 */
export const formatMetricName = (key: string): string => {
  return key === "OverallScore"
    ? "Overall Score"
    : key.replace(/([A-Z])/g, " $1").trim();
};
