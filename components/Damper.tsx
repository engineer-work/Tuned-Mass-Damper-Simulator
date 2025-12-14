import React from 'react';

interface DamperProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  className?: string;
}

export const Damper: React.FC<DamperProps> = ({ x1, y1, x2, y2, className = 'stroke-slate-400' }) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  const casingLength = 40;
  const pistonLength = length - casingLength;
  const width = 20;

  return (
    <g transform={`translate(${x1}, ${y1}) rotate(${angle})`}>
      {/* Casing (Left Side) */}
      <line x1="0" y1="0" x2={casingLength} y2="0" className={className} strokeWidth="2" />
      <line x1={casingLength} y1={-width/2} x2={casingLength} y2={width/2} className={className} strokeWidth="2" />
      <line x1={casingLength} y1={-width/2} x2={casingLength + 30} y2={-width/2} className={className} strokeWidth="2" />
      <line x1={casingLength} y1={width/2} x2={casingLength + 30} y2={width/2} className={className} strokeWidth="2" />

      {/* Piston (Right Side) */}
      <line x1={casingLength + 10} y1="-8" x2={casingLength + 10} y2="8" className={className} strokeWidth="4" />
      <line x1={casingLength + 10} y1="0" x2={length} y2="0" className={className} strokeWidth="2" />
    </g>
  );
};
