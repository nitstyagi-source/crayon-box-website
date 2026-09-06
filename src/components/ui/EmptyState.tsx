import React from 'react';
import Link from 'next/link';
import { FolderOpen } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  secondaryActionHref?: string;
  className?: string;
}

export function EmptyState({
  icon = <FolderOpen className="w-8 h-8 text-slate-400" />,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  secondaryActionLabel,
  onSecondaryAction,
  secondaryActionHref,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-2xl border border-dashed border-slate-200 font-sans space-y-4 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shadow-2xs">
        {icon}
      </div>
      <div className="max-w-sm space-y-1">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">{description}</p>
      </div>
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {actionLabel && actionHref && (
            <Link
              href={actionHref}
              className="inline-flex items-center justify-center font-bold text-xs px-3 py-1.5 gap-1.5 h-8 rounded-xl bg-[#D97706] text-white hover:bg-[#B45309] shadow-xs active:scale-95 transition"
            >
              {actionLabel}
            </Link>
          )}
          {actionLabel && !actionHref && onAction && (
            <Button size="sm" variant="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && secondaryActionHref && (
            <Link
              href={secondaryActionHref}
              className="inline-flex items-center justify-center font-bold text-xs px-3 py-1.5 gap-1.5 h-8 rounded-xl border border-[#E8DFC8] bg-white/90 text-stone-700 hover:bg-[#FAF7F2] shadow-xs active:scale-95 transition"
            >
              {secondaryActionLabel}
            </Link>
          )}
          {secondaryActionLabel && !secondaryActionHref && onSecondaryAction && (
            <Button size="sm" variant="outline" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

