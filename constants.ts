import { SystemParams } from './types';

export const DEFAULT_PARAMS: SystemParams = {
  m1: 50,       // Building Mass
  k1: 2000,     // Building Stiffness
  b1: 10,       // Low damping (like air bearings)
  m2: 5,        // Tuned Mass (~10% of M1)
  k2: 200,      // Tuned to cancel resonance: sqrt(k1/m1) ~= sqrt(k2/m2)
  b2: 15,       // Damping of the TMD
  forceAmplitude: 50,
  forceFrequency: 1.0, // Near resonant frequency sqrt(2000/50)/(2pi) ~= 1.006 Hz
};

export const PHYSICS_DT = 0.01; // Time step for integration
export const CHART_HISTORY_LENGTH = 200;
