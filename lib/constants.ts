export enum PresentationMetrics {
  HandMovement = 1,
  HeadMovement = 2,
  BodyMovement = 3,
  Posture = 4,
  HandSymmetry = 5,
  GestureVariety = 6,
  EyeContact = 7,
  OverallScore = 8,
}

// Optional: You can also add the optimal ranges as a constant if needed
export const METRIC_OPTIMAL_RANGES = {
  [PresentationMetrics.HandMovement]: { min: 0.08, max: 0.7 },
  [PresentationMetrics.HeadMovement]: { min: 0.01, max: 0.5 },
  [PresentationMetrics.BodyMovement]: { min: 0.02, max: 0.6 },
  [PresentationMetrics.Posture]: { min: 0.4, max: 1.0 },
  [PresentationMetrics.HandSymmetry]: { min: 0.2, max: 0.9 },
  [PresentationMetrics.GestureVariety]: { min: 0.15, max: 0.9 },
  [PresentationMetrics.EyeContact]: { min: 0.3, max: 0.9 },
} as const;
