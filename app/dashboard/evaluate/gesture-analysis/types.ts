// types.ts - Shared types for the gesture analysis system

export interface PoseLandmark {
    x: number;
    y: number;
    z: number;
    visibility?: number;
  }
  
  export interface GestureMetrics {
    handMovement: number;
    headMovement: number;
    bodyMovement: number;
    posture: number;
    handSymmetry: number;
    gestureVariety: number;
    eyeContact: number;
    overallScore: number;
  }
  
  export interface GestureFeedback {
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
  }
  
  export interface MetricData {
    value: number;
    status: string;
  }
  
  export interface AnalysisData {
    handMovement: MetricData;
    headMovement: MetricData;
    bodyMovement: MetricData;
    posture: MetricData;
    handSymmetry: MetricData;
    gestureVariety: MetricData;
    eyeContact: MetricData;
    overallScore: number;
    sessionDuration: number;
    transcript: string;
  }