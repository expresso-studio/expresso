// constants.ts - Configuration values for analysis algorithms

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
  handMovement: { min: 0.08, max: 0.7 },  // Even wider range for hand movement
  headMovement: { min: 0.01, max: 0.5 },  // Wider range for head movement
  bodyMovement: { min: 0.02, max: 0.6 },  // New parameter with wide range
  posture: { min: 0.4, max: 1.0 },  // Lower threshold for good posture
  handSymmetry: { min: 0.2, max: 0.9 },   // Even lower minimum threshold
  gestureVariety: { min: 0.15, max: 0.9 },  // Lower minimum threshold
  eyeContact: { min: 0.3, max: 0.9 }      // Lower minimum threshold
};