import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, header, footer, padding = 'md', className = '', ...props }: CardProps) {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition duration-150 font-sans ${className}`}
      {...props}
    >
      {header && <div className="border-b border-slate-100 px-6 py-4">{header}</div>}
      <div className={paddingStyles[padding]}>{children}</div>
      {footer && <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/50 rounded-b-2xl">{footer}</div>}
    </div>
  );
}
