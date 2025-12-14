import React, { useState, useMemo } from 'react';
import { ForceIdentification } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// --- Tab 1 Data: Free Body Diagram ---
const INITIAL_FORCES: ForceIdentification[] = [
  { id: 'k1', name: 'Spring Force k1', target: 'm1', description: 'Restoring force from the main building spring/structure.', isCorrect: true, selected: false },
  { id: 'b1', name: 'Damping Force b1', target: 'm1', description: 'Energy loss due to air bearings/structural friction.', isCorrect: true, selected: false },
  { id: 'k2_on_1', name: 'TMD Spring Force k2 (on M1)', target: 'm1', description: 'The TMD pulling back on the building.', isCorrect: true, selected: false },
  { id: 'b2_on_1', name: 'TMD Damping Force b2 (on M1)', target: 'm1', description: 'Friction between TMD and building acting on the building.', isCorrect: true, selected: false },
  { id: 'wind', name: 'Wind/Voice Coil Force F(t)', target: 'm1', description: 'External driving force.', isCorrect: true, selected: false },
  { id: 'gravity', name: 'Gravity', target: 'm1', description: 'Vertical force.', isCorrect: false, selected: false },
  { id: 'k2_on_2', name: 'TMD Spring Force k2 (on M2)', target: 'm2', description: 'The building pulling on the TMD.', isCorrect: true, selected: false },
  { id: 'b2_on_2', name: 'TMD Damping b2 (on M2)', target: 'm2', description: 'Friction acting on the TMD.', isCorrect: true, selected: false },
  { id: 'wind_on_2', name: 'Wind Force on TMD', target: 'm2', description: 'Wind hitting the internal mass directly.', isCorrect: false, selected: false },
];

// --- Helper to Generate Bode Data for Quiz ---
const generateBodeData = (m: number, kBase: number, b: number) => {
    const data = [];
    for (let f = 0.5; f <= 50; f *= 1.1) {
        const w = 2 * Math.PI * f;
        const calcMag = (k: number) => {
            const denom = Math.sqrt(Math.pow(k - m * w * w, 2) + Math.pow(b * w, 2));
            return 20 * Math.log10(1 / denom); // dB
        };

        data.push({
            f: parseFloat(f.toFixed(2)),
            blue: calcMag(kBase * 0.5),   // Low Stiffness
            green: calcMag(kBase * 1.0),  // Mid Stiffness
            red: calcMag(kBase * 2.0),    // High Stiffness
        });
    }
    return data;
};

export const LearnMode: React.FC = () => {
  const [activeTab, setActiveTab] = useState<1 | 2 | 3 | 4>(1);
  const [forces, setForces] = useState<ForceIdentification[]>(INITIAL_FORCES);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [forceStep, setForceStep] = useState<1 | 2>(1);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const bodeData = useMemo(() => generateBodeData(50, 2000, 30), []);

  const toggleForce = (id: string) => {
    setForces(prev => prev.map(f => f.id === id ? { ...f, selected: !f.selected } : f));
    setFeedback(null);
  };

  const validateForces = () => {
    const incorrectSelection = forces.some(f => f.selected !== f.isCorrect && f.target === (forceStep === 1 ? 'm1' : 'm2'));
    const missedCorrect = forces.some(f => f.isCorrect && !f.selected && f.target === (forceStep === 1 ? 'm1' : 'm2'));

    if (incorrectSelection || missedCorrect) {
      setFeedback("Incorrect. Check the FBD. We only care about horizontal forces acting directly on this mass.");
    } else {
      setFeedback("Correct! All relevant forces identified.");
      if (forceStep === 1) {
        setTimeout(() => {
          setForceStep(2);
          setFeedback(null);
        }, 1500);
      }
    }
  };

  const currentForces = forces.filter(f => f.target === (forceStep === 1 ? 'm1' : 'm2'));

  return (
    <div className="card" style={{ padding: 0, minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
      {/* Tab Header */}
      <div className="tab-nav">
          <button onClick={() => setActiveTab(1)} className={`tab-btn ${activeTab === 1 ? 'active' : ''}`}>
            1. Free Body Diagram
          </button>
          <button onClick={() => setActiveTab(2)} className={`tab-btn ${activeTab === 2 ? 'active' : ''}`}>
            2. Equations & Math
          </button>
          <button onClick={() => setActiveTab(3)} className={`tab-btn ${activeTab === 3 ? 'active' : ''}`}>
            3. Bode Plot Quiz
          </button>
          <button onClick={() => setActiveTab(4)} className={`tab-btn ${activeTab === 4 ? 'active' : ''}`}>
            4. Deep Dive & Debate
          </button>
      </div>

      <div className="tab-content animate-fadeIn">
        
        {/* --- TAB 1: FORCES --- */}
        {activeTab === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ borderBottom: '1px solid var(--slate-200)', paddingBottom: '1rem' }}>
                    <h2 className="section-title">Identify Forces</h2>
                    <p style={{ color: 'var(--slate-600)' }}>
                        {forceStep === 1 ? "Step 1: Identify forces acting on Mass 1 (Building)" : "Step 2: Identify forces acting on Mass 2 (Tuned Mass Damper)"}
                    </p>
                </div>

                <div className="grid-2">
                    <div className="force-diagram-box">
                        <div style={{ position: 'relative', width: '12rem', height: '8rem', backgroundColor: 'white', border: '2px solid var(--slate-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--slate-800)' }}>{forceStep === 1 ? 'm1' : 'm2'}</span>
                            {forces.filter(f => f.target === (forceStep === 1 ? 'm1' : 'm2') && f.selected).map((f, i) => (
                                <div key={f.id} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                                    <div style={{ 
                                        position: 'absolute', top: '50%', left: '50%', width: '100%', height: '0', 
                                        borderTop: '2px solid var(--indigo-500)', 
                                        transform: i % 2 === 0 ? 'translateX(-100%)' : 'translateX(0)',
                                    }}></div>
                                    <span style={{ 
                                        position: 'absolute', backgroundColor: 'var(--indigo-100)', color: 'var(--indigo-800)', 
                                        fontSize: '0.625rem', padding: '0.125rem 0.25rem', borderRadius: '0.25rem', border: '1px solid var(--indigo-200)',
                                        left: i % 2 === 0 ? '-4rem' : 'auto', right: i % 2 === 0 ? 'auto' : '-4rem',
                                        top: '50%', marginTop: '-0.75rem'
                                    }}>
                                        {f.id}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="force-list">
                    {currentForces.map(force => (
                        <div key={force.id} 
                            className={`force-item ${force.selected ? 'selected' : ''}`}
                            onClick={() => toggleForce(force.id)}
                        >
                        <div>
                            <input type="checkbox" checked={force.selected} readOnly className="checkbox" />
                        </div>
                        <div style={{ marginLeft: '0.75rem' }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--slate-800)', margin: 0 }}>{force.name}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', margin: 0 }}>{force.description}</p>
                        </div>
                        </div>
                    ))}
                    </div>
                </div>

                <div className="feedback-bar">
                    <div className={feedback?.startsWith('Correct') ? 'text-success' : 'text-error'}>
                        {feedback}
                    </div>
                    <button onClick={validateForces} className="btn-primary">
                        Check Answer
                    </button>
                </div>
            </div>
        )}

        {/* --- TAB 2: MATH DERIVATION --- */}
        {activeTab === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '56rem', margin: '0 auto' }}>
                <div>
                    <h2 className="section-title">Coupled System Equations</h2>
                    <p className="prose">
                        Based on Newton's Second Law (ΣF = ma), we can derive the equations of motion for the two masses.
                    </p>
                </div>

                {/* Mass 1 Equation */}
                <div className="math-card">
                    <h3 className="math-title-blue">Mass 1: The Building</h3>
                    <div className="grid-2" style={{ alignItems: 'center' }}>
                        <div>
                             <div className="equation-block">
                                m₁ẍ₁ = -k₁x₁ - b₁ẋ₁ + k₂(x₂ - x₁) + b₂(ẋ₂ - ẋ₁) + F(t)
                            </div>
                        </div>
                        <div className="prose" style={{ fontSize: '0.875rem' }}>
                             <p><strong style={{ color: 'var(--slate-800)' }}>-k₁x₁, -b₁ẋ₁</strong>: Restoring and damping forces from the building's structure.</p>
                             <p><strong style={{ color: 'var(--slate-800)' }}>k₂(x₂-x₁)</strong>: The TMD spring pulling on the building.</p>
                             <p><strong style={{ color: 'var(--slate-800)' }}>F(t)</strong>: External wind/actuator force.</p>
                        </div>
                    </div>
                </div>

                {/* Mass 2 Equation */}
                <div className="math-card">
                    <h3 className="math-title-red">Mass 2: The Tuned Mass Damper</h3>
                    <div className="grid-2" style={{ alignItems: 'center' }}>
                         <div>
                            <div className="equation-block">
                                m₂ẍ₂ = -k₂(x₂ - x₁) - b₂(ẋ₂ - ẋ₁)
                            </div>
                         </div>
                         <div className="prose" style={{ fontSize: '0.875rem' }}>
                             <p><strong style={{ color: 'var(--slate-800)' }}>-k₂(x₂-x₁)</strong>: The spring force from the building acting on the TMD.</p>
                             <p>Note: The forces on M2 are equal and opposite to the coupling forces on M1.</p>
                        </div>
                    </div>
                </div>

                {/* Simplified System */}
                <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--slate-200)' }}>
                    <h2 className="section-title">Simplification for Analysis (Single Mass)</h2>
                    <p className="prose">
                        To understand the effect of stiffness on the Bode plot (as seen in the quiz), we simplify the system to a single degree of freedom (removing M2).
                    </p>
                    
                    <div style={{ backgroundColor: 'var(--blue-50)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--blue-200)' }}>
                         <h4 style={{ fontWeight: 'bold', color: 'var(--blue-900)', marginBottom: '0.75rem' }}>Transfer Function Magnitude</h4>
                         <div className="equation-block" style={{ marginBottom: '1rem' }}>
                            |H(jω)| = 1 / √((k - mω²)² + (bω)²)
                        </div>
                        
                        <div className="grid-2" style={{ fontSize: '0.875rem', color: 'var(--blue-900)' }}>
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.5)', padding: '0.75rem', borderRadius: '0.25rem' }}>
                                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>DC Gain (ω → 0)</strong>
                                <p>Amplitude ≈ 1/k</p>
                                <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--slate-500)' }}>Stiffer spring (↑k) = Lower starting amplitude.</p>
                            </div>
                             <div style={{ backgroundColor: 'rgba(255,255,255,0.5)', padding: '0.75rem', borderRadius: '0.25rem' }}>
                                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Resonance (ω_n)</strong>
                                <p>Freq ≈ √(k/m)</p>
                                <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--slate-500)' }}>Stiffer spring (↑k) = Higher resonant frequency.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- TAB 3: BODE QUIZ --- */}
        {activeTab === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div>
                        <h2 className="section-title">Bode Plot Stiffness Quiz</h2>
                        <p className="prose" style={{ maxWidth: '40rem' }}>
                            The plot below shows the frequency response for three different spring stiffnesses (k). 
                            Which color corresponds to the <strong>stiffest</strong> spring (largest k)?
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setQuizAnswer('blue')} className="btn-vis" style={{ backgroundColor: quizAnswer === 'blue' ? 'var(--blue-100)' : 'white', border: '1px solid var(--blue-500)', color: 'var(--blue-600)' }}>Blue</button>
                        <button onClick={() => setQuizAnswer('green')} className="btn-vis" style={{ backgroundColor: quizAnswer === 'green' ? 'var(--green-200)' : 'white', border: '1px solid var(--green-500)', color: 'var(--green-800)' }}>Green</button>
                        <button onClick={() => setQuizAnswer('red')} className="btn-vis" style={{ backgroundColor: quizAnswer === 'red' ? 'var(--red-100)' : 'white', border: '1px solid var(--red-500)', color: 'var(--red-600)' }}>Red</button>
                    </div>
                </div>

                {/* The Chart - FIXED HEIGHT */}
                <div style={{ height: '24rem', width: '100%', backgroundColor: 'white', border: '1px solid var(--slate-200)', borderRadius: '0.5rem', padding: '0.5rem' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={bodeData} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis 
                                dataKey="f" 
                                type="number" 
                                scale="log" 
                                domain={[0.5, 50]} 
                                tickFormatter={(val) => val.toString()}
                                label={{ value: 'Frequency (Hz)', position: 'bottom', offset: 0 }}
                                ticks={[0.5, 1, 2, 5, 10, 20, 50]}
                            />
                            <YAxis 
                                label={{ value: 'Magnitude (dB)', angle: -90, position: 'insideLeft' }} 
                            />
                            <Tooltip 
                                labelFormatter={(v) => `Freq: ${v} Hz`}
                                formatter={(val: number) => [val.toFixed(1) + ' dB']}
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="top" height={36}/>
                            <Line type="monotone" dataKey="blue" stroke="#3b82f6" strokeWidth={3} dot={false} name="Blue Curve" />
                            <Line type="monotone" dataKey="green" stroke="#10b981" strokeWidth={3} dot={false} name="Green Curve" />
                            <Line type="monotone" dataKey="red" stroke="#ef4444" strokeWidth={3} dot={false} name="Red Curve" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Feedback */}
                {quizAnswer && (
                    <div style={{ padding: '1rem', borderRadius: '0.5rem', border: '1px solid', backgroundColor: quizAnswer === 'red' ? 'var(--green-50)' : 'var(--red-50)', borderColor: quizAnswer === 'red' ? 'var(--green-200)' : 'var(--red-200)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <div style={{ fontSize: '1.5rem', color: quizAnswer === 'red' ? 'var(--green-600)' : 'var(--red-600)' }}>
                            {quizAnswer === 'red' ? '✓' : '✗'}
                        </div>
                        <div>
                            <h4 style={{ fontWeight: 'bold', margin: 0, color: quizAnswer === 'red' ? 'var(--green-800)' : 'var(--red-800)' }}>
                                {quizAnswer === 'red' ? 'Correct!' : 'Incorrect.'}
                            </h4>
                            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem', color: 'var(--slate-700)' }}>
                                {quizAnswer === 'red' 
                                    ? "Correct analysis: The Red curve has the lowest starting amplitude (1/k implies large k) and the highest resonant frequency (sqrt(k/m) implies large k)."
                                    : "Hint: Look at the Low Frequency (Start of the graph). Amplitude ≈ 1/k. If k is large (stiff), should the amplitude be high or low?"}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* --- TAB 4: DEEP DIVE & DEBATE --- */}
        {activeTab === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '56rem', margin: '0 auto', paddingBottom: '1.5rem' }}>
                
                {/* Topic 1 */}
                <div className="debate-card">
                    <h2 className="section-title" style={{ color: 'var(--indigo-800)' }}>Debate 1: Stiffness vs. Damping</h2>
                    <p className="prose" style={{ fontStyle: 'italic', marginBottom: '1rem' }}>
                        "If the building is swaying too much, why don't we just build it stronger and stiffer?"
                    </p>
                    
                    <div className="grid-2">
                        <div className="option-card">
                            <h3 style={{ fontWeight: 'bold', color: 'var(--slate-800)', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Option A: Increase Stiffness (k₁)</h3>
                            <ul className="prose" style={{ fontSize: '0.875rem' }}>
                                <li><strong>Method:</strong> Add more steel, thicker concrete, or cross-bracing.</li>
                                <li><strong>Pros:</strong> Simple concept. Reduces sway amplitude (Amplitude ∝ 1/k).</li>
                                <li><strong>Cons:</strong> Extremely expensive. Uses valuable floor space. Increasing stiffness increases the natural frequency.</li>
                            </ul>
                        </div>
                        <div className="option-card highlight">
                             <div className="winner-badge">WINNER</div>
                            <h3 style={{ fontWeight: 'bold', color: 'var(--indigo-700)', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Option B: Add Damping (TMD)</h3>
                            <ul className="prose" style={{ fontSize: '0.875rem' }}>
                                <li><strong>Method:</strong> Add a counter-acting mass at the top.</li>
                                <li><strong>Pros:</strong> Cost-effective. Doesn't require structural redesign. Improves comfort efficiently.</li>
                                <li><strong>Cons:</strong> Takes up penthouse space. Requires maintenance.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Topic 2 */}
                <div className="debate-card">
                    <h2 className="section-title" style={{ color: 'var(--red-800)' }}>Debate 2: The Risk of Detuning</h2>
                    <p className="prose">
                        A TMD works by splitting the resonance peak. But what if the "Tuning" is wrong?
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.25rem', borderLeft: '4px solid var(--green-500)' }}>
                            <h3 style={{ fontWeight: 'bold', color: 'var(--slate-800)' }}>Perfectly Tuned</h3>
                            <p className="prose" style={{ fontSize: '0.875rem', margin: 0 }}>
                                When √(k₂/m₂) ≈ √(k₁/m₁), the TMD absorbs maximum energy. The building stays still, and the TMD oscillates violently.
                            </p>
                        </div>
                        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.25rem', borderLeft: '4px solid var(--red-500)' }}>
                            <h3 style={{ fontWeight: 'bold', color: 'var(--slate-800)' }}>Detuned (The Danger)</h3>
                            <p className="prose" style={{ fontSize: '0.875rem', margin: 0 }}>
                                If the building's mass changes or stiffness degrades, frequencies drift. The TMD becomes "dead weight"—adding mass without cancelling vibration!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Topic 3 */}
                <div className="case-study">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                         <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>Case Study: 200 Clarendon (John Hancock Tower)</h2>
                            <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--slate-400)', marginBottom: '1rem' }}>BOSTON, MA • EST 1976</div>
                            <p className="prose" style={{ color: 'var(--slate-300)', fontSize: '0.875rem' }}>
                                This building is the classic example of TMD necessity. It is very tall and slender, making it flexible. During construction, it swayed enough to cause motion sickness.
                            </p>
                            <p className="prose" style={{ color: 'var(--slate-300)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                <strong>The Solution:</strong> Two 300-ton sliding weights were installed on the 58th floor.
                            </p>
                         </div>
                    </div>
                </div>

            </div>
        )}

      </div>
    </div>
  );
};