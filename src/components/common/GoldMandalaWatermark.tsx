"use client";

import React from 'react';

export function GoldMandalaWatermark({
  size = 220,
  opacity = 0.25,
  className = '',
}: {
  size?: number;
  opacity?: number;
  className?: string;
}) {
  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      style={{ opacity, width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E5C378" />
            <stop offset="50%" stopColor="#C5A059" />
            <stop offset="100%" stopColor="#997733" />
          </linearGradient>
        </defs>

        {/* Concentric Decorative Rings */}
        <circle cx="100" cy="100" r="95" stroke="url(#goldGrad)" strokeWidth="0.75" strokeDasharray="2 2" />
        <circle cx="100" cy="100" r="90" stroke="url(#goldGrad)" strokeWidth="1.2" />
        <circle cx="100" cy="100" r="82" stroke="url(#goldGrad)" strokeWidth="0.8" />
        <circle cx="100" cy="100" r="70" stroke="url(#goldGrad)" strokeWidth="1" strokeDasharray="3 1.5" />
        <circle cx="100" cy="100" r="56" stroke="url(#goldGrad)" strokeWidth="0.8" />
        <circle cx="100" cy="100" r="42" stroke="url(#goldGrad)" strokeWidth="1" />
        <circle cx="100" cy="100" r="28" stroke="url(#goldGrad)" strokeWidth="0.8" />
        <circle cx="100" cy="100" r="14" stroke="url(#goldGrad)" strokeWidth="1" />
        <circle cx="100" cy="100" r="5" fill="url(#goldGrad)" />

        {/* 16 Outer Floral Petals with Rich Gold Gradient Fills */}
        {[...Array(16)].map((_, i) => {
          const angle = (i * 360) / 16;
          return (
            <g key={`petal-${i}`} transform={`rotate(${angle} 100 100)`}>
              <path
                d="M100,10 C106,30 118,50 100,72 C82,50 94,30 100,10 Z"
                stroke="url(#goldGrad)"
                strokeWidth="0.8"
                fill="url(#goldGrad)"
                fillOpacity="0.32"
              />
              <path
                d="M100,18 C103,32 110,46 100,60 C90,46 97,32 100,18 Z"
                stroke="url(#goldGrad)"
                strokeWidth="0.5"
                fill="url(#goldGrad)"
                fillOpacity="0.22"
              />
              <circle cx="100" cy="8" r="1.5" fill="url(#goldGrad)" />
            </g>
          );
        })}

        {/* 16 Inner Lotus Petals (Offset 11.25 deg) */}
        {[...Array(16)].map((_, i) => {
          const angle = (i * 360) / 16 + 11.25;
          return (
            <g key={`inner-petal-${i}`} transform={`rotate(${angle} 100 100)`}>
              <path
                d="M100,30 C106,50 114,65 100,82 C86,65 94,50 100,30 Z"
                stroke="url(#goldGrad)"
                strokeWidth="0.75"
                fill="url(#goldGrad)"
                fillOpacity="0.28"
              />
              <circle cx="100" cy="27" r="1.2" fill="url(#goldGrad)" />
            </g>
          );
        })}

        {/* Fine Star Ray Accents */}
        {[...Array(32)].map((_, i) => {
          const angle = (i * 360) / 32;
          return (
            <line
              key={`ray-${i}`}
              x1="100"
              y1="4"
              x2="100"
              y2="10"
              stroke="url(#goldGrad)"
              strokeWidth="0.6"
              transform={`rotate(${angle} 100 100)`}
            />
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Security Microprint Watermark Pattern (Repeating School Name across Card)
 */
export function CardSecurityPattern({ opacity = 0.12 }: { opacity?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" style={{ opacity }}>
      <svg width="100%" height="100%">
        <defs>
          <pattern id="cardMicrotextPattern" width="160" height="11" patternUnits="userSpaceOnUse">
            <text
              x="0"
              y="8"
              fontFamily="'Barlow Condensed', sans-serif"
              fontSize="5.2"
              fontWeight="700"
              fill="#B8934B"
              letterSpacing="0.08em"
            >
              CRAYON BOX SCHOOL &bull; NEW DELHI &bull;
            </text>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cardMicrotextPattern)" />
      </svg>
    </div>
  );
}

export default GoldMandalaWatermark;
