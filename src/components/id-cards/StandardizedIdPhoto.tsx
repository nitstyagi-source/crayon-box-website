"use client";

import React from 'react';

export interface StandardizedIdPhotoProps {
  src?: string;
  name?: string;
  className?: string;
  alt?: string;
  badgeLabel?: string;
  badgeBg?: string;
  badgeColor?: string;
  borderGradient?: string;
  fallbackInitial?: string;
  blendMode?: boolean;
}

/**
 * StandardizedIdPhoto Component
 * Ensures every student and staff portrait rendered on ID cards appears against
 * the exact institutional studio backdrop (soft radial gradient: #FFFFFF -> #F1F5F9 -> #E2E8F0)
 * with seamless edge blending (vignette/masking) for visual continuity into the card chassis.
 */
export function StandardizedIdPhoto({
  src,
  name = 'Photo',
  className = 'w-24 h-28 rounded-2xl',
  alt = 'ID Photo',
  badgeLabel,
  badgeBg = '#000080',
  badgeColor = '#ffffff',
  borderGradient = 'from-[#FF671F] via-white to-[#046A38]',
  fallbackInitial,
  blendMode = true,
}: StandardizedIdPhotoProps) {
  const initial = fallbackInitial || (name ? name.trim().split(' ')[0][0] : 'S');

  return (
    <div
      className={`relative p-0.5 rounded-2xl bg-gradient-to-b ${borderGradient} shadow-md overflow-hidden shrink-0 select-none ${className}`}
    >
      {/* Universal Institutional Studio Backdrop Layer */}
      <div
        className="w-full h-full rounded-[14px] overflow-hidden relative flex items-center justify-center"
        style={{
          background: 'radial-gradient(circle at 50% 35%, #FFFFFF 0%, #F1F5F9 55%, #E2E8F0 100%)',
        }}
      >
        {src ? (
          <div className="w-full h-full relative overflow-hidden">
            <img
              src={src}
              alt={alt}
              className={`w-full h-full object-cover object-top relative z-10 transition-all ${
                blendMode ? 'mix-blend-multiply opacity-95' : ''
              }`}
              style={
                blendMode
                  ? {
                      WebkitMaskImage:
                        'radial-gradient(ellipse 94% 96% at 50% 48%, black 72%, transparent 100%)',
                      maskImage:
                        'radial-gradient(ellipse 94% 96% at 50% 48%, black 72%, transparent 100%)',
                    }
                  : undefined
              }
              onError={(e) => {
                // Gracefully hide broken img and show fallback
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* Subtle soft rim ambient lighting overlay for seamless continuity */}
            <div className="absolute inset-0 pointer-events-none rounded-[14px] ring-1 ring-inset ring-black/5" />
          </div>
        ) : null}

        {/* Fallback silhouette / initials if no photo or loading */}
        {!src && (
          <div className="relative z-10 flex flex-col items-center justify-center text-center p-1">
            <div className="w-11 h-11 rounded-full bg-white/95 shadow-2xs flex items-center justify-center text-slate-800 font-black text-xl border border-slate-200">
              {initial}
            </div>
            <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest mt-1">
              STUDIO
            </span>
          </div>
        )}
      </div>

      {/* Optional Status / Role Pill Badge */}
      {badgeLabel && (
        <span
          style={{ backgroundColor: badgeBg, color: badgeColor }}
          className="absolute -bottom-1.5 inset-x-0 mx-auto w-max px-2.5 py-0.5 rounded-full text-[8px] font-black shadow-sm uppercase tracking-wider z-20"
        >
          {badgeLabel}
        </span>
      )}
    </div>
  );
}

export default StandardizedIdPhoto;
