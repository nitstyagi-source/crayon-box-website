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
  iconBgColor = 'bg-slate-100 text-slate-700',
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition duration-150 font-sans space-y-3 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
        {icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs ${iconBgColor}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        {(subtext || trend) && (
          <div className="flex items-center gap-1.5 text-xs">
            {trend && (
              <span
                className={`font-bold ${
                  trend.isPositive ? 'text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded' : 'text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            )}
            {subtext && <span className="text-slate-500 font-medium truncate">{subtext}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
