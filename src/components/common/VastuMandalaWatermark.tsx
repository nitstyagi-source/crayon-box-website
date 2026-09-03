import React from 'react';

interface VastuWatermarkProps {
  className?: string;
  size?: number;
  opacity?: number; // Default 0.05 (5%)
}

export const VastuMandalaWatermark: React.FC<VastuWatermarkProps> = ({
  className = '',
  size = 480,
  opacity = 0.05
}) => {
  return (
    <div
      className={`pointer-events-none absolute select-none z-0 overflow-hidden flex items-center justify-center ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-stone-900"
      >
        {/* Outer Sacred Circles */}
        <circle cx="250" cy="250" r="240" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" />
        <circle cx="250" cy="250" r="225" stroke="currentColor" strokeWidth="1" />
        <circle cx="250" cy="250" r="200" stroke="currentColor" strokeWidth="0.75" />

        {/* 16-Petal Geometric Solar Rays */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i * 360) / 16;
          return (
            <g key={i} transform={`rotate(${angle} 250 250)`}>
              <path
                d="M250 50 C235 110 230 160 250 190 C270 160 265 110 250 50 Z"
                stroke="currentColor"
                strokeWidth="0.75"
              />
              <circle cx="250" cy="38" r="3" stroke="currentColor" strokeWidth="0.75" />
            </g>
          );
        })}

        {/* 8-Directional Cardinal & Intercardinal Geometry (Ashta-Dikpala) */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 360) / 8;
          return (
            <g key={`card-${i}`} transform={`rotate(${angle} 250 250)`}>
              <line x1="250" y1="55" x2="250" y2="120" stroke="currentColor" strokeWidth="1" />
              <polygon
                points="250,55 246,70 254,70"
                stroke="currentColor"
                strokeWidth="0.75"
                fill="none"
              />
            </g>
          );
        })}

        {/* Middle Lotus Core (Sahasrara & Brahmasthan Equilibrium) */}
        <circle cx="250" cy="250" r="140" stroke="currentColor" strokeWidth="1" />
        <circle cx="250" cy="250" r="110" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" />

        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 360) / 12;
          return (
            <g key={`inner-${i}`} transform={`rotate(${angle} 250 250)`}>
              <path
                d="M250 140 C240 180 240 210 250 230 C260 210 260 180 250 140 Z"
                stroke="currentColor"
                strokeWidth="0.75"
              />
            </g>
          );
        })}

        {/* Central Bindu (Pure Consciousness & Focus) */}
        <circle cx="250" cy="250" r="45" stroke="currentColor" strokeWidth="1" />
        <circle cx="250" cy="250" r="24" stroke="currentColor" strokeWidth="0.75" />
        <circle cx="250" cy="250" r="6" fill="currentColor" />
      </svg>
    </div>
  );
};
