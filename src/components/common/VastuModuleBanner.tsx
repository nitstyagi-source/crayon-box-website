"use client";

import React from 'react';
import { VastuMandalaWatermark } from './VastuMandalaWatermark';

export interface VastuModuleTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface VastuModuleBannerProps {
  badgeText?: string;
  badgeIcon?: React.ReactNode;
  institutionText?: string;
  title: string;
  titleIcon?: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  tabs?: VastuModuleTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

export function VastuModuleBanner({
  badgeText,
  badgeIcon,
  institutionText,
  title,
  titleIcon,
  description,
  actions,
  tabs,
  activeTab,
  onTabChange,
  className = '',
}: VastuModuleBannerProps) {
  return (
    <div className={`space-y-4 print:hidden ${className}`}>
      {/* Light Pastel Sandalwood & Pearl Cream Sattva Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#FFFDF9] via-[#FAF6EE] to-[#F5EEDB] text-stone-900 p-6 sm:p-8 rounded-3xl border border-[#E8DFC8] border-b-2 border-b-[#D4AF37]/60 shadow-xs relative overflow-hidden">
        {/* Subtle Hairline Vastu Mandala Watermark at 6% Opacity */}
        <VastuMandalaWatermark
          className="top-1/2 right-8 -translate-y-1/2 pointer-events-none text-[#D4AF37]"
          size={340}
          opacity={0.07}
        />

        <div className="z-10 space-y-1 max-w-3xl">
          {(badgeText || institutionText) && (
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {badgeText && (
                <span className="bg-amber-500/10 text-amber-900 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-amber-300/70 flex items-center gap-1.5 shadow-2xs">
                  {badgeIcon}
                  {badgeText}
                </span>
              )}
              {badgeText && institutionText && (
                <span className="text-stone-300 text-xs">•</span>
              )}
              {institutionText && (
                <span className="text-stone-600 text-xs font-semibold">
                  {institutionText}
                </span>
              )}
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
            {titleIcon && <span className="text-[#D97706]">{titleIcon}</span>}
            <span>{title}</span>
          </h1>

          {description && (
            <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 flex-wrap z-10">
            {actions}
          </div>
        )}
      </div>

      {/* Light Pastel Sub-Navigation Tabs Bar */}
      {tabs && tabs.length > 0 && (
        <div className="flex items-center gap-2 border-b border-[#E8DFC8] pb-2 overflow-x-auto scrollbar-none text-xs font-bold">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange && onTabChange(tab.id)}
                className={`px-4 sm:px-5 py-2.5 rounded-2xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-950 font-black shadow-xs border-2 border-[#D97706]/70 ring-1 ring-amber-400/20'
                    : 'bg-white/80 text-stone-600 hover:text-stone-950 hover:bg-white border border-[#E8DFC8]'
                }`}
              >
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive
                        ? 'bg-[#D97706] text-white'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
