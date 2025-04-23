import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MetricIds, MetricNames, OPTIMAL_RANGES } from "./constants";
import { AnalysisData, GestureMetrics, MetricData, MetricType } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function transformMetricsToGestureMetrics(
  metrics: {
    metric_id: MetricIds;
    name: MetricNames;
    score: number;
    evaluated_at: string;
  }[],
): GestureMetrics {
  const gestureMetrics: GestureMetrics = {
    HandMovement: 0,
    HeadMovement: 0,
    BodyMovement: 0,
    Posture: 0,
    HandSymmetry: 0,
    GestureVariety: 0,
    EyeContact: 0,
    OverallScore: 0,
  };

  metrics.forEach((metric) => {
    gestureMetrics[metric.name] = metric.score;
  });

  return gestureMetrics;
}

// Helper function to get metric status
export const getMetricStatus = (key: string, value: number): string => {
  // For Posture, use categorical labels
  if (key === "Posture") {
    if (value < 0.33) return "Poor";
    if (value < 0.67) return "Fair";
    return "Good";
  }

  // For other metrics
  if (value < OPTIMAL_RANGES[key as keyof typeof OPTIMAL_RANGES].min)
    return "Low";
  if (value > OPTIMAL_RANGES[key as keyof typeof OPTIMAL_RANGES].max)
    return "High";
  return "Normal";
};

export function transformMetricsToAnalysisData(
  metrics: MetricType[],
): AnalysisData {
  const defaultMetricData: MetricData = { value: 0, status: "Low" };

  const analysisData: AnalysisData = {
    HandMovement: defaultMetricData,
    HeadMovement: defaultMetricData,
    BodyMovement: defaultMetricData,
    Posture: defaultMetricData,
    HandSymmetry: defaultMetricData,
    GestureVariety: defaultMetricData,
    EyeContact: defaultMetricData,
    OverallScore: 0,
    sessionDuration: 0,
    transcript: "",
  };

  metrics.forEach((metric) => {
    if (metric.name in analysisData) {
      if (metric.name === "OverallScore") {
        analysisData.OverallScore = metric.score;
      } else {
        console.log("getMetricStatus(metric.name, metric.score)");
        console.log(getMetricStatus(metric.name, metric.score));
        analysisData[
          metric.name as keyof Omit<
            AnalysisData,
            "OverallScore" | "sessionDuration" | "transcript"
          >
        ] = {
          value: metric.score,
          status: getMetricStatus(metric.name, metric.score),
        };
      }
    }
  });

  return analysisData;
}

// Generate recommendations based on metrics
export const generateRecommendations = (
  analysisData: AnalysisData,
): string[] => {
  const recommendations: string[] = [];

  if (analysisData.HandMovement.status === "Low") {
    recommendations.push(
      "Use more hand gestures to emphasize key points and engage your audience.",
    );
  } else if (analysisData.HandMovement.status === "High") {
    recommendations.push(
      "Try to reduce excessive hand movements as they may distract from your message.",
    );
  }

  if (
    analysisData.Posture.status === "Poor" ||
    analysisData.Posture.status === "Fair"
  ) {
    recommendations.push(
      "Work on maintaining better posture by keeping your back straight and shoulders level.",
    );
  }

  if (analysisData.EyeContact.status === "Low") {
    recommendations.push(
      "Maintain more consistent Eye contact with the camera to better connect with your audience.",
    );
  }

  if (analysisData.HandSymmetry.status === "Low") {
    recommendations.push(
      "Try to use both hands more equally for a balanced presentation style.",
    );
  }

  if (analysisData.GestureVariety.status === "Low") {
    recommendations.push(
      "Incorporate a wider variety of gestures to keep your presentation engaging.",
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Your presentation skills are solid! Continue practicing to maintain consistency.",
    );
  }

  return recommendations;
};

// Function to get color class based on status
export const getWordColorClass = (status: string): string => {
  switch (status) {
    case "Low":
      return "text-red-500";
    case "High":
      return "text-amber-500";
    case "Normal":
      return "text-blue-500";
    case "Good":
      return "text-green-500";
    case "Fair":
      return "text-yellow-500";
    case "Poor":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
};

// Function to get color hex based on status
export const getWordColorHex = (status: string): string => {
  switch (status) {
    case "Low":
      return "#EF4444"; // red-500
    case "High":
      return "#F59E0B"; // amber-500
    case "Normal":
      return "#3B82F6"; // blue-500
    case "Good":
      return "#10B981"; // green-500
    case "Fair":
      return "#FBBF24"; // yellow-500
    case "Poor":
      return "#EF4444"; // red-500
    default:
      return "#6B7280"; // gray-500
  }
};
