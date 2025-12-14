import React from 'react';

interface SpringProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width?: number;
  coils?: number;
  className?: string;
}

export const Spring: React.FC<SpringProps> = ({
  x1,
  y1,
  x2,
  y2,
  width = 20,
  coils = 6,
  className = 'stroke-slate-400',
}) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  // Need minimum length to draw coils
  if (length < 10) return null;

  const nx = dx / length;
  const ny = dy / length;

  // Perpendicular vector for width
  const px = -ny * (width / 2);
  const py = nx * (width / 2);

  let path = `M ${x1} ${y1} `;
  
  const step = length / coils;
  
  for (let i = 1; i <= coils; i++) {
    const progress = (i - 0.5) * step;
    // Zigzag
    const side = i % 2 === 0 ? 1 : -1;
    const cx = x1 + nx * progress + px * side;
    const cy = y1 + ny * progress + py * side;
    path += `L ${cx} ${cy} `;
  }

  path += `L ${x2} ${y2}`;

  return (
    <path
      d={path}
      fill="none"
      strokeWidth="3"
      className={className}
    />
  );
};