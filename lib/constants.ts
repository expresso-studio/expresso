import { IconType } from "react-icons";
import { MdOutlineWavingHand } from "react-icons/md";
import { FaPersonFalling, FaHandSparkles } from "react-icons/fa6";
import { LuPersonStanding, LuEye, LuSpeech, LuSmile } from "react-icons/lu";
import { PiHandsPrayingFill } from "react-icons/pi";

export enum MetricNames {
  HandMovement = "handMovement",
  HeadMovement = "headMovement",
  BodyMovement = "bodyMovement",
  Posture = "posture",
  HandSymmetry = "handSymmetry",
  GestureVariety = "gestureVariety",
  EyeContact = "eyeContact",
  OverallScore = "overallScore",
}

export enum MetricIds {
  HandMovement = 1,
  HeadMovement = 2,
  BodyMovement = 3,
  Posture = 4,
  HandSymmetry = 5,
  GestureVariety = 6,
  EyeContact = 7,
  OverallScore = 8,
}

export const MetricNameToIcon: Record<MetricNames, IconType> = {
  [MetricNames.HandMovement]: MdOutlineWavingHand,
  [MetricNames.HeadMovement]: LuSmile,
  [MetricNames.BodyMovement]: FaPersonFalling,
  [MetricNames.Posture]: LuPersonStanding,
  [MetricNames.HandSymmetry]: PiHandsPrayingFill,
  [MetricNames.GestureVariety]: FaHandSparkles,
  [MetricNames.EyeContact]: LuEye,
  [MetricNames.OverallScore]: LuSpeech,
};

export const MetricNameToId: Record<MetricNames, MetricIds> = {
  [MetricNames.HandMovement]: MetricIds.HandMovement,
  [MetricNames.HeadMovement]: MetricIds.HeadMovement,
  [MetricNames.BodyMovement]: MetricIds.BodyMovement,
  [MetricNames.Posture]: MetricIds.Posture,
  [MetricNames.HandSymmetry]: MetricIds.HandSymmetry,
  [MetricNames.GestureVariety]: MetricIds.GestureVariety,
  [MetricNames.EyeContact]: MetricIds.EyeContact,
  [MetricNames.OverallScore]: MetricIds.OverallScore,
};

export const MetricIdToName: Record<MetricIds, MetricNames> = {
  [MetricIds.HandMovement]: MetricNames.HandMovement,
  [MetricIds.HeadMovement]: MetricNames.HeadMovement,
  [MetricIds.BodyMovement]: MetricNames.BodyMovement,
  [MetricIds.Posture]: MetricNames.Posture,
  [MetricIds.HandSymmetry]: MetricNames.HandSymmetry,
  [MetricIds.GestureVariety]: MetricNames.GestureVariety,
  [MetricIds.EyeContact]: MetricNames.EyeContact,
  [MetricIds.OverallScore]: MetricNames.OverallScore,
};

// Buffer sizes and coefficients
export const MOVEMENT_BUFFER_SIZE = 60; // 2 seconds at 30fps
export const POSTURE_COEFFICIENT = 0.25;
export const HAND_MOVEMENT_COEFFICIENT = 0.2;
export const HEAD_MOVEMENT_COEFFICIENT = 0.15;
export const BODY_MOVEMENT_COEFFICIENT = 0.15;
export const HAND_SYMMETRY_COEFFICIENT = 0.1;
export const GESTURE_VARIETY_COEFFICIENT = 0.05;
export const EYE_CONTACT_COEFFICIENT = 0.1;

// Optimal value ranges for public speaking - with wider ranges for easier achievement
export const OPTIMAL_RANGES = {
  handMovement: { min: 0.08, max: 0.7 }, // Even wider range for hand movement
  headMovement: { min: 0.01, max: 0.5 }, // Wider range for head movement
  bodyMovement: { min: 0.02, max: 0.6 }, // New parameter with wide range
  posture: { min: 0.4, max: 1.0 }, // Lower threshold for good posture
  handSymmetry: { min: 0.2, max: 0.9 }, // Even lower minimum threshold
  gestureVariety: { min: 0.15, max: 0.9 }, // Lower minimum threshold
  eyeContact: { min: 0.3, max: 0.9 }, // Lower minimum threshold
};
