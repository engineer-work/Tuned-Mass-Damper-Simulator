import React from 'react';
import { SystemParams } from '../types';

interface ControlProps {
  params: SystemParams;
  setParams: (p: SystemParams) => void;
  reset: () => void;
}

export const SimulationControl: React.FC<ControlProps> = ({ params, setParams, reset }) => {
  const handleChange = (key: keyof SystemParams, value: number) => {
    setParams({ ...params, [key]: value });
  };

  return (
    <div className="control-panel">
      <div className="flex-between" style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontWeight: 'bold', color: 'var(--slate-700)', margin: 0 }}>System Parameters</h3>
        <button onClick={reset} style={{ fontSize: '0.75rem', color: 'var(--blue-600)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Reset Defaults</button>
      </div>

      <div>
        {/* Mass 1 Controls */}
        <div className="control-section">
          <div className="section-label">Building (M1)</div>
          
          <div className="input-group">
            <div className="input-label-row">
              <label>Mass (kg)</label>
              <span className="input-val">{params.m1}</span>
            </div>
            <input 
              type="range" min="10" max="200" step="1" 
              value={params.m1} 
              onChange={(e) => handleChange('m1', parseFloat(e.target.value))}
              className="accent-blue"
            />
          </div>

          <div className="input-group">
            <div className="input-label-row">
              <label>Stiffness k1 (N/m)</label>
              <span className="input-val">{params.k1}</span>
            </div>
            <input 
              type="range" min="500" max="5000" step="50" 
              value={params.k1} 
              onChange={(e) => handleChange('k1', parseFloat(e.target.value))}
              className="accent-blue"
            />
          </div>

          <div className="input-group">
            <div className="input-label-row">
              <label>Damping b1 (Ns/m)</label>
              <span className="input-val">{params.b1}</span>
            </div>
            <input 
              type="range" min="0" max="50" step="0.5" 
              value={params.b1} 
              onChange={(e) => handleChange('b1', parseFloat(e.target.value))}
              className="accent-blue"
            />
          </div>
        </div>

        <hr className="separator" />

        {/* Mass 2 Controls */}
        <div className="control-section">
          <div className="section-label">TMD (M2)</div>
          
          <div className="input-group">
            <div className="input-label-row">
              <label>Mass (kg)</label>
              <span className="input-val">{params.m2}</span>
            </div>
            <input 
              type="range" min="1" max="50" step="0.5" 
              value={params.m2} 
              onChange={(e) => handleChange('m2', parseFloat(e.target.value))}
              className="accent-red"
            />
          </div>

          <div className="input-group">
            <div className="input-label-row">
              <label>Stiffness k2 (N/m)</label>
              <span className="input-val">{params.k2}</span>
            </div>
            <input 
              type="range" min="10" max="1000" step="10" 
              value={params.k2} 
              onChange={(e) => handleChange('k2', parseFloat(e.target.value))}
              className="accent-red"
            />
          </div>

          <div className="input-group">
            <div className="input-label-row">
              <label>Damping b2 (Ns/m)</label>
              <span className="input-val">{params.b2}</span>
            </div>
            <input 
              type="range" min="0" max="50" step="0.5" 
              value={params.b2} 
              onChange={(e) => handleChange('b2', parseFloat(e.target.value))}
              className="accent-red"
            />
          </div>
        </div>

        <hr className="separator" />

        {/* Wind / Force Controls */}
        <div className="control-section">
          <div className="section-label">Wind / Voice Coil</div>
          
          <div className="input-group">
            <div className="input-label-row">
              <label>Amplitude (N)</label>
              <span className="input-val">{params.forceAmplitude}</span>
            </div>
            <input 
              type="range" min="0" max="200" step="5" 
              value={params.forceAmplitude} 
              onChange={(e) => handleChange('forceAmplitude', parseFloat(e.target.value))}
              className="accent-green"
            />
          </div>

          <div className="input-group">
            <div className="input-label-row">
              <label>Frequency (Hz)</label>
              <span className="input-val">{params.forceFrequency.toFixed(2)}</span>
            </div>
            <input 
              type="range" min="0.1" max="5.0" step="0.05" 
              value={params.forceFrequency} 
              onChange={(e) => handleChange('forceFrequency', parseFloat(e.target.value))}
              className="accent-green"
            />
          </div>
        </div>
      </div>
      
      {/* Resonance Tip */}
      <div className="tip-box">
        <strong>Tip:</strong> The Building's natural frequency is approx <span className="text-mono">{(1 / (2 * Math.PI) * Math.sqrt(params.k1 / params.m1)).toFixed(2)} Hz</span>. 
        Try matching the Wind Frequency to this value to see resonance, then adjust the TMD to dampen it!
      </div>
    </div>
  );
};