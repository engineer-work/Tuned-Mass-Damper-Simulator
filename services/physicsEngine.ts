import { SystemParams, SimulationState } from '../types';

type Derivative = {
  dx1: number;
  dv1: number;
  dx2: number;
  dv2: number;
};

const evaluate = (
  state: SimulationState,
  t: number,
  dt: number,
  d: Derivative,
  params: SystemParams
): Derivative => {
  const x1 = state.x1 + d.dx1 * dt;
  const v1 = state.v1 + d.dv1 * dt;
  const x2 = state.x2 + d.dx2 * dt;
  const v2 = state.v2 + d.dv2 * dt;

  // External Force F(t) = F_amp * sin(2 * pi * f * t)
  const Force = params.forceAmplitude * Math.sin(2 * Math.PI * params.forceFrequency * t);

  // Coupling Force (Spring k2 and Damper b2)
  // Force from 2 on 1: k2(x2 - x1) + b2(v2 - v1)
  const springForce2 = params.k2 * (x2 - x1);
  const dampingForce2 = params.b2 * (v2 - v1);

  // Forces on Mass 1
  // F_net_1 = -k1*x1 - b1*v1 + springForce2 + dampingForce2 + F(t)
  const F_net_1 = -params.k1 * x1 - params.b1 * v1 + springForce2 + dampingForce2 + Force;

  // Forces on Mass 2
  // F_net_2 = -springForce2 - dampingForce2
  const F_net_2 = -springForce2 - dampingForce2;

  return {
    dx1: v1,
    dv1: F_net_1 / params.m1,
    dx2: v2,
    dv2: F_net_2 / params.m2,
  };
};

export const integrateRK4 = (
  state: SimulationState,
  dt: number,
  params: SystemParams
): SimulationState => {
  const a = evaluate(state, state.t, 0.0, { dx1: 0, dv1: 0, dx2: 0, dv2: 0 }, params);
  const b = evaluate(state, state.t + dt * 0.5, dt * 0.5, a, params);
  const c = evaluate(state, state.t + dt * 0.5, dt * 0.5, b, params);
  const d = evaluate(state, state.t + dt, dt, c, params);

  const dxdt1 = (1.0 / 6.0) * (a.dx1 + 2.0 * (b.dx1 + c.dx1) + d.dx1);
  const dvdt1 = (1.0 / 6.0) * (a.dv1 + 2.0 * (b.dv1 + c.dv1) + d.dv1);
  const dxdt2 = (1.0 / 6.0) * (a.dx2 + 2.0 * (b.dx2 + c.dx2) + d.dx2);
  const dvdt2 = (1.0 / 6.0) * (a.dv2 + 2.0 * (b.dv2 + c.dv2) + d.dv2);

  return {
    t: state.t + dt,
    x1: state.x1 + dxdt1 * dt,
    v1: state.v1 + dvdt1 * dt,
    x2: state.x2 + dxdt2 * dt,
    v2: state.v2 + dvdt2 * dt,
  };
};
