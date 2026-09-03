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
      className={`bg-white/95 rounded-3xl border border-[#E8DFC8] shadow-xs hover:border-[#D4AF37]/50 hover:shadow-md transition duration-200 font-sans backdrop-blur-xs ${className}`}
      {...props}
    >
      {header && <div className="border-b border-[#E8DFC8] px-6 py-4 bg-[#FAF7F2]/60 rounded-t-3xl">{header}</div>}
      <div className={paddingStyles[padding]}>{children}</div>
      {footer && <div className="border-t border-[#E8DFC8] px-6 py-4 bg-[#FAF7F2]/80 rounded-b-3xl">{footer}</div>}
    </div>
  );
}
