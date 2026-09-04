"use client";

import React from 'react';

export function SilverEmbossedSeal({
  size = 64,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative select-none shrink-0 drop-shadow-md ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <radialGradient id="silverBase" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#E2E8F0" />
            <stop offset="65%" stopColor="#94A3B8" />
            <stop offset="85%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#64748B" />
          </radialGradient>
          <linearGradient id="silverRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#94A3B8" />
            <stop offset="50%" stopColor="#F8FAFC" />
            <stop offset="75%" stopColor="#64748B" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>
          <filter id="sealShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0.5" dy="1" stdDeviation="1" floodColor="#0F172A" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* 16-Point Scalloped Medallion Outer Contour */}
        <path
          d="M50,2 
             C53,5 57,5 60,3 C64,6 68,7 70,5 C74,9 78,11 80,10 C83,14 87,17 88,17 C90,21 93,25 93,26 C95,31 97,35 96,37 C97,42 98,46 97,48 C97,52 97,58 96,63 C97,65 95,69 93,74 C93,75 90,79 88,83 C87,83 83,86 80,90 C78,89 74,91 70,95 C68,93 64,94 60,97 C57,95 53,95 50,98 C47,95 43,95 40,97 C36,94 32,93 30,95 C26,91 22,89 20,90 C17,86 13,83 12,83 C10,79 7,75 7,74 C5,69 3,65 4,63 C3,58 3,52 3,48 C3,46 4,42 4,37 C3,35 5,31 7,26 C7,25 10,21 12,17 C13,17 17,14 20,10 C22,11 26,9 30,5 C32,7 36,6 40,3 C43,5 47,5 50,2 Z"
          fill="url(#silverBase)"
          stroke="url(#silverRim)"
          strokeWidth="1.2"
          filter="url(#sealShadow)"
        />

        {/* Inner Engraved Circles */}
        <circle cx="50" cy="50" r="37" stroke="#475569" strokeWidth="0.7" strokeDasharray="1.5 1" opacity="0.7" />
        <circle cx="50" cy="50" r="34" stroke="url(#silverRim)" strokeWidth="1.2" />
        <circle cx="50" cy="50" r="24" fill="url(#silverBase)" stroke="#64748B" strokeWidth="0.8" />

        {/* Circular Engraved Text */}
        <path id="textCircleTop" d="M 18,50 A 32,32 0 1,1 82,50" fill="none" />
        <text fontSize="5.2" fontWeight="900" fill="#1E293B" letterSpacing="0.12em">
          <textPath href="#textCircleTop" startOffset="50%" textAnchor="middle">
            CRAYON BOX SCHOOL
          </textPath>
        </text>

        {/* Bottom Curved Text: VERIFIED */}
        <path id="textCircleBottom" d="M 80,50 A 30,30 0 0,1 20,50" fill="none" />
        <text fontSize="5.5" fontWeight="900" fill="#0F172A" letterSpacing="0.16em">
          <textPath href="#textCircleBottom" startOffset="50%" textAnchor="middle">
            ★ VERIFIED ★
          </textPath>
        </text>

        {/* Center Shield / Crest with Checkmark */}
        <path
          d="M50,33 L59,37 C59,45 55,53 50,56 C45,53 41,45 41,37 Z"
          fill="#FFFFFF"
          stroke="#475569"
          strokeWidth="0.9"
        />
        {/* Checkmark in relief */}
        <path
          d="M45,44 L48,48 L55,40"
          fill="none"
          stroke="#0F172A"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default SilverEmbossedSeal;
