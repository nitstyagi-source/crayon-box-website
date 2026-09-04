"use client";

import React from 'react';

export function SilverEmbossedSeal({
  size = 80,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative select-none shrink-0 drop-shadow-md ${className}`}
      style={{ width: size, height: size * 0.95 }}
    >
      <img
        src="/id-cards/silver_seal_3d.png"
        alt="CBS Verified Seal"
        className="w-full h-full object-contain pointer-events-none select-none"
        onError={(e) => {
          // Fallback to SVG if image not yet loaded
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
}

export default SilverEmbossedSeal;
