import { IconType } from "react-icons";
import {
  MetricNames,
  MetricIds,
  CourseNames,
  MetricDisplayNames,
  LessonNames,
} from "./constants";

export type StatisticType = {
  icon: React.ReactNode;
  text: string;
  status: number;
};

export type CourseType = {
  id: number;
  icon: IconType;
  color: string;
  name: CourseNames;
  topics: (string | MetricDisplayNames)[];
  lessons: LessonType[];
};

export type CourseStatus = {
  name: CourseNames;
  status: number;
};

export type LessonType = {
  id: number;
  icon: IconType;
  name: LessonNames;
  topics: (string | MetricDisplayNames)[];
};

export type LessonStatus = {
  name: LessonNames;
  status: boolean;
};

export type LessonLeft = {
  lesson_id: number;
  lesson_name: string;
};

export type MetricType = {
  metric_id: MetricIds;
  name: MetricNames;
  score: number;
  evaluated_at: string;
};

export type PresentationType = {
  id: string;
  title: string;
  video_url: string;
  created_at: string;
  metrics: MetricType[];
};

// literally the only difference between this and the PresentationType
// is presentation_id vs id
export type ReportItemType = {
  presentation_id: string;
  title: string;
  video_url: string;
  created_at: string;
  metrics: MetricType[];
};

export type UserType = {
  id: string;
  email: string;
  name: string;
  created_at: string;
};

export type NavItemType = {
  title: string;
  url: string;
  icon?: React.ReactNode;
  activeIcon?: React.ReactNode;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
};

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface GestureMetrics {
  HandMovement: number;
  HeadMovement: number;
  BodyMovement: number;
  Posture: number;
  HandSymmetry: number;
  GestureVariety: number;
  EyeContact: number;
  OverallScore: number;
}

export interface GestureFeedback {
  message: string;
  type: "success" | "warning" | "error" | "info";
}

export interface MetricInput {
  name: MetricNames;
  value: number;
}

export interface MetricData {
  value: number;
  status: string;
}

export interface AnalysisData {
  HandMovement: MetricData;
  HeadMovement: MetricData;
  BodyMovement: MetricData;
  Posture: MetricData;
  HandSymmetry: MetricData;
  GestureVariety: MetricData;
  EyeContact: MetricData;
  OverallScore: number;
  sessionDuration: number;
  transcript: string;
}

export interface FillerStats {
  fillerWordCount: number;
  fillerWordsStats: { [word: string]: number };
  maxWPM: number | null;
  minWPM: number | null;
  sessionWPM: number;
}
