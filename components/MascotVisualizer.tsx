import React, { useState } from 'react';
import { Spring } from './Spring';
import { Damper } from './Damper';
import { Mascot3D } from './Mascot3D';
import { SystemParams, SimulationState } from '../types';

interface VisualizerProps {
  params: SystemParams;
  state: SimulationState;
}

const Mascot2D: React.FC<VisualizerProps> = ({ params, state }) => {
  // Scaling factors to map simulation meters to SVG pixels
  const scale = 500; // pixels per meter
  const groundX = 50;

  // Calculate visual positions
  // x1 and x2 are displacements from equilibrium
  // Let's establish equilibrium positions on screen
  const m1EqPos = 300; 
  const m2EqPos = 550;

  const x1Px = m1EqPos + state.x1 * scale;
  const x2Px = m2EqPos + state.x2 * scale;

  return (
    <div className="visualizer-container">
      <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', fontSize: '0.75rem', color: 'var(--slate-500)', fontFamily: 'monospace' }}>
        2D Schematic
      </div>
      
      <svg viewBox="0 0 800 300" style={{ width: '100%', height: '16rem' }}>
        <defs>
            <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" 
                style={{stroke: "#94a3b8", strokeWidth: 1}} />
            </pattern>
        </defs>

        {/* Wall / Ground */}
        <rect x="0" y="50" width="50" height="200" fill="url(#diagonalHatch)" stroke="#475569" strokeWidth="2" />
        <line x1="50" y1="50" x2="50" y2="250" stroke="#475569" strokeWidth="3" />

        {/* --- Mass 1 (Building / Bearing Shaft) --- */}
        {/* Spring k1 (Wall to M1) */}
        <Spring x1={groundX} y1={100} x2={x1Px} y2={100} coils={8} className="stroke-blue-500" />
        <text x={(groundX + x1Px)/2} y={90} className="fill-blue-500" style={{fontSize: '0.75rem', fontWeight: 'bold'}} textAnchor="middle">k1</text>

        {/* Damper b1 (Wall to M1) */}
        <Damper x1={groundX} y1={200} x2={x1Px} y2={200} className="stroke-blue-400" />
        <text x={(groundX + x1Px)/2} y={230} className="fill-blue-500" style={{fontSize: '0.75rem', fontWeight: 'bold'}} textAnchor="middle">b1 (Air Bearing)</text>

        {/* M1 Block */}
        <g transform={`translate(${x1Px}, 75)`}>
          <rect x="-40" y="0" width="80" height="150" rx="4" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
          <text x="0" y="80" fill="white" textAnchor="middle" style={{fontWeight: 'bold'}}>M1</text>
          <text x="0" y="100" fill="white" textAnchor="middle" style={{fontSize: '0.75rem', opacity: 0.9}}>Building</text>
        </g>

        {/* --- Mass 2 (TMD / Additional Mass) --- */}
        {/* Spring k2 (M1 to M2) */}
        <Spring x1={x1Px + 40} y1={120} x2={x2Px - 30} y2={120} coils={5} className="stroke-red-500" />
        <text x={(x1Px + x2Px)/2} y={110} className="fill-red-500" style={{fontSize: '0.75rem', fontWeight: 'bold'}} textAnchor="middle">k2</text>

        {/* Damper b2 (M1 to M2) - Representing friction/internal damping */}
        <Damper x1={x1Px + 40} y1={180} x2={x2Px - 30} y2={180} className="stroke-red-400" />
        <text x={(x1Px + x2Px)/2} y={210} className="fill-red-500" style={{fontSize: '0.75rem', fontWeight: 'bold'}} textAnchor="middle">b2</text>

        {/* M2 Block */}
        <g transform={`translate(${x2Px}, 100)`}>
          <rect x="-30" y="0" width="60" height="100" rx="4" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
          <text x="0" y="55" fill="white" textAnchor="middle" style={{fontWeight: 'bold'}}>M2</text>
          <text x="0" y="75" fill="white" textAnchor="middle" style={{fontSize: '0.75rem', opacity: 0.9}}>TMD</text>
        </g>

        {/* Force Indicator on M1 */}
        {Math.abs(Math.sin(2 * Math.PI * params.forceFrequency * state.t)) > 0.1 && (
             <g transform={`translate(${x1Px}, 40)`}>
             <path 
                d="M -30 0 L 30 0 M 20 -5 L 30 0 L 20 5" 
                stroke="#10b981" 
                strokeWidth="4"
                fill="none"
                opacity={Math.sin(2 * Math.PI * params.forceFrequency * state.t) > 0 ? 1 : 0}
            />
            <path 
                d="M 30 0 L -30 0 M -20 -5 L -30 0 L -20 5" 
                stroke="#10b981" 
                strokeWidth="4"
                fill="none"
                opacity={Math.sin(2 * Math.PI * params.forceFrequency * state.t) < 0 ? 1 : 0}
            />
            <text x="0" y="-10" textAnchor="middle" fill="#10b981" style={{fontSize: '0.75rem', fontWeight: 'bold'}}>Wind / Voice Coil</text>
           </g>
        )}
      </svg>
    </div>
  );
};

export const MascotVisualizer: React.FC<VisualizerProps> = (props) => {
    const [view, setView] = useState<'3D' | '2D'>('3D');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <div className="flex-between">
                <div style={{ flex: 1 }}></div>
                
                <div className="vis-controls">
                    <button 
                        onClick={() => setView('2D')}
                        className={`btn-vis ${view === '2D' ? 'active' : 'inactive'}`}
                    >
                        2D Schematic
                    </button>
                    <button 
                         onClick={() => setView('3D')}
                        className={`btn-vis ${view === '3D' ? 'active' : 'inactive'}`}
                    >
                        3D Model
                    </button>
                </div>
             </div>
             
             {view === '3D' ? <Mascot3D {...props} /> : <Mascot2D {...props} />}
        </div>
    );
};