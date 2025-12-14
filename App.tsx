import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_PARAMS, PHYSICS_DT, CHART_HISTORY_LENGTH } from './constants';
import { SystemParams, SimulationState, AppMode } from './types';
import { integrateRK4 } from './services/physicsEngine';
import { MascotVisualizer } from './components/MascotVisualizer';
import { SimulationControl } from './components/SimulationControl';
import { LearnMode } from './components/LearnMode';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.LEARN);
  const [params, setParams] = useState<SystemParams>(DEFAULT_PARAMS);
  
  // Physics State
  const simulationState = useRef<SimulationState>({ t: 0, x1: 0, v1: 0, x2: 0, v2: 0 });
  // React State for visualizer
  const [visualState, setVisualState] = useState<SimulationState>(simulationState.current);
  const [history, setHistory] = useState<any[]>([]);
  const requestRef = useRef<number | null>(null);
  const isRunning = useRef<boolean>(false);

  // Simulation Loop
  const animate = () => {
    if (!isRunning.current) return;

    // Run physics step
    simulationState.current = integrateRK4(simulationState.current, PHYSICS_DT, params);
    
    // Update visual state
    setVisualState({ ...simulationState.current });

    // Update Chart History (Throttle to every 5th frame roughly to save chart render cost)
    if (Math.floor(simulationState.current.t / PHYSICS_DT) % 5 === 0) {
      setHistory(prev => {
        const newData = [...prev, {
          t: simulationState.current.t.toFixed(2),
          x1: simulationState.current.x1,
          x2: simulationState.current.x2
        }];
        if (newData.length > CHART_HISTORY_LENGTH) return newData.slice(newData.length - CHART_HISTORY_LENGTH);
        return newData;
      });
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (mode === AppMode.SIMULATE) {
      isRunning.current = true;
      requestRef.current = requestAnimationFrame(animate);
    } else {
      isRunning.current = false;
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
      isRunning.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, params]); // Re-bind if params change to ensure solver uses latest

  const handleReset = () => {
    setParams(DEFAULT_PARAMS);
    simulationState.current = { t: 0, x1: 0, v1: 0, x2: 0, v2: 0 };
    setVisualState(simulationState.current);
    setHistory([]);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Tuned Mass Damper Simulator</h1>
            <p style={{ color: 'var(--slate-400)', fontSize: '0.875rem', margin: 0 }}>MIT "Mascot" Mechanism & John Hancock Tower Physics</p>
          </div>
          <div className="nav-group">
            <button 
              onClick={() => setMode(AppMode.LEARN)}
              className={`btn-nav ${mode === AppMode.LEARN ? 'active' : 'inactive'}`}
            >
              1. Learn Analysis
            </button>
            <button 
              onClick={() => setMode(AppMode.SIMULATE)}
              className={`btn-nav ${mode === AppMode.SIMULATE ? 'active' : 'inactive'}`}
            >
              2. Simulate
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-layout">
        
        {/* Left Col: Visuals & Logic */}
        <div className="layout-content">
          
          {/* Visualizer Card */}
          <div className="card">
             <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <h2 className="section-title" style={{ margin: 0 }}>System Visualization</h2>
                <div className="badge-legend">
                  <span className="badge-item"><div className="dot dot-blue"></div> Building (M1)</span>
                  <span className="badge-item"><div className="dot dot-red"></div> TMD (M2)</span>
                </div>
             </div>
             <MascotVisualizer params={params} state={visualState} />
          </div>

          {/* Conditional Content */}
          {mode === AppMode.LEARN ? (
             <LearnMode />
          ) : (
            <div className="card" style={{ height: '20rem' }}>
               <h2 className="section-title">Displacement Response</h2>
               <div style={{ width: '100%', height: '16rem' }}>
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="t" hide />
                      <YAxis domain={['auto', 'auto']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        labelStyle={{ color: '#64748b' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="x1" stroke="#3b82f6" strokeWidth={2} dot={false} name="Building Position (x1)" isAnimationActive={false} />
                      <Line type="monotone" dataKey="x2" stroke="#ef4444" strokeWidth={2} dot={false} name="TMD Position (x2)" isAnimationActive={false} />
                    </LineChart>
                 </ResponsiveContainer>
               </div>
            </div>
          )}

          {/* Context Text */}
          <div className="card prose">
            <h3 className="section-title">About the Physics</h3>
            <p>
              Just like the <strong>John Hancock Tower</strong> (200 Clarendon St) in Boston, this system uses a Tuned Mass Damper (M2) to stabilize the main structure (M1) against wind forces. 
              The 300-ton weights in the real tower slide on a lubricated plate (modeled here as low friction <span className="text-mono bg-tag">b2</span>) and are attached via springs (<span className="text-mono bg-tag">k2</span>).
            </p>
            <div style={{ marginTop: '0.5rem' }}>
              In this "Mascot" educational mechanism:
              <ul>
                <li><strong>Voice Coil:</strong> Acts as the wind, applying force <span className="text-mono">F(t)</span>.</li>
                <li><strong>Air Bearings:</strong> Support Mass 1 with virtually zero friction (<span className="text-mono">b1 ≈ 0</span>).</li>
                <li><strong>Aluminum Blade:</strong> Acts as the spring <span className="text-mono">k2</span> connecting the TMD.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Col: Controls */}
        <div className="layout-sidebar">
          <SimulationControl params={params} setParams={setParams} reset={handleReset} />
        </div>

      </main>
    </div>
  );
}

export default App;