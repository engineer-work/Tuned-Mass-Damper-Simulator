export interface SystemParams {
  m1: number; // Mass of Building (kg)
  k1: number; // Stiffness of Building (N/m)
  b1: number; // Damping of Building (N*s/m)
  m2: number; // Mass of TMD (kg)
  k2: number; // Stiffness of TMD connection (N/m)
  b2: number; // Damping of TMD connection (N*s/m)
  forceAmplitude: number; // Magnitude of wind/voice coil force (N)
  forceFrequency: number; // Frequency of wind (Hz)
}

export interface SimulationState {
  t: number;
  x1: number; // Position of Mass 1
  v1: number; // Velocity of Mass 1
  x2: number; // Position of Mass 2
  v2: number; // Velocity of Mass 2
}

export interface ForceIdentification {
  id: string;
  name: string;
  target: 'm1' | 'm2';
  description: string;
  isCorrect: boolean; // Is this actually a force in the system?
  selected: boolean;
}

export enum AppMode {
  LEARN = 'LEARN',
  SIMULATE = 'SIMULATE',
}
