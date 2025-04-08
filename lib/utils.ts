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
