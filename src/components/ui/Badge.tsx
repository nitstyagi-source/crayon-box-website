import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'indigo' | 'stage';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'neutral', size = 'sm', className = '', ...props }: BadgeProps) {
  const sizeStyles = {
    sm: 'text-[10px] font-bold px-2 py-0.5 rounded-md',
    md: 'text-xs font-bold px-2.5 py-1 rounded-lg',
  };

  const variantStyles = {
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200/80',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    error: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    stage: 'bg-slate-900 text-white font-mono uppercase tracking-wider',
  };

  return (
    <span className={`inline-flex items-center gap-1 font-sans ${sizeStyles[size]} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
