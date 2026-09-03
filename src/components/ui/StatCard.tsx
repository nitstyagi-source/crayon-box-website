import React from 'react';

export interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  iconBgColor?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  subtext,
  trend,
  icon,
  iconBgColor = 'bg-amber-50 text-amber-700 border border-amber-200/60',
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`bg-white/95 p-5 sm:p-6 rounded-3xl border border-[#E8DFC8] shadow-xs hover:border-[#D4AF37]/50 hover:shadow-md transition-all duration-200 font-sans space-y-3 relative overflow-hidden backdrop-blur-xs group ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-wider text-stone-500 group-hover:text-stone-700 transition">
          {label}
        </span>
        {icon && (
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs shadow-2xs ${iconBgColor}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">{value}</h3>
        {(subtext || trend) && (
          <div className="flex items-center gap-1.5 text-xs">
            {trend && (
              <span
                className={`font-black px-2 py-0.5 rounded-full text-[10px] ${
                  trend.isPositive
                    ? 'text-emerald-800 bg-emerald-100 border border-emerald-200'
                    : 'text-rose-800 bg-rose-100 border border-rose-200'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            )}
            {subtext && <span className="text-stone-500 font-semibold truncate">{subtext}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
