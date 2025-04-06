import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MetricIds, MetricNames } from "./constants";
import { GestureMetrics } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function transformMetricsToGestureMetrics(
  metrics: {
    metric_id: MetricIds;
    name: MetricNames;
    score: number;
    evaluated_at: string;
  }[]
): GestureMetrics {
  const gestureMetrics: GestureMetrics = {
    handMovement: 0,
    headMovement: 0,
    bodyMovement: 0,
    posture: 0,
    handSymmetry: 0,
    gestureVariety: 0,
    eyeContact: 0,
    overallScore: 0,
  };

  metrics.forEach((metric) => {
    gestureMetrics[metric.name] = metric.score;
  });

  return gestureMetrics;
}
