"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Users,
  CreditCard,
  GraduationCap,
  Bus,
  CheckCircle2,
  Calendar,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles,
  Command,
  X,
  FileText,
  Video,
} from 'lucide-react';
import { useInstitution } from '@/components/providers/InstitutionContext';

export function GlobalCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { currentInstitution } = useInstitution();

  // Keyboard shortcut listener: Cmd + K or Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const QUICK_ACTIONS = [
    {
      id: 'students',
      title: 'Students Master Directory & Family 360°',
      category: 'Master Data',
      icon: Users,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      href: '/admin/students',
      shortcut: 'S',
    },
    {
      id: 'id-cards',
      title: 'CR80 Student & Teacher ID Card Generator',
      category: 'Identity Pass',
      icon: CreditCard,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      href: '/admin/id-cards',
      shortcut: 'I',
    },
    {
      id: 'approvals',
      title: 'Executive Approvals Desk & Maker-Checker Queue',
      category: 'Governance',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      href: '/admin/approvals',
      shortcut: 'A',
    },
    {
      id: 'finance',
      title: 'Fee Ledgers, Invoices & Online Payments',
      category: 'Finance',
      icon: CreditCard,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/admin/finance',
      shortcut: 'F',
    },
    {
      id: 'attendance',
      title: 'Live Attendance Register & Gate Scans',
      category: 'Operations',
      icon: Calendar,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      href: '/admin/attendance',
      shortcut: 'T',
    },
    {
      id: 'transport',
      title: 'GPS Bus Telematics & Live Stop Routes',
      category: 'Transport',
      icon: Bus,
      iconColor: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      href: '/admin/transport',
      shortcut: 'B',
    },
    {
      id: 'live-stream',
      title: '16-Channel HD Classroom CCTV Stream Hub',
      category: 'Safety',
      icon: Video,
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-50',
      href: '/admin/live-stream',
      shortcut: 'C',
    },
  ];

  const filteredActions = searchQuery === ''
    ? QUICK_ACTIONS
    : QUICK_ACTIONS.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleSelect = (href: string) => {
    setIsOpen(false);
    setSearchQuery('');
    router.push(href);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 bg-slate-50/60">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search students, staff, invoices, routes, or jump to module..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm font-semibold text-slate-900 placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Quick Nav & Modules ({currentInstitution || 'All Campuses'})
          </div>

          {filteredActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => handleSelect(action.href)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50/70 transition group text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${action.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${action.iconColor}`} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-900">
                      {action.title}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {action.category}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden group-hover:inline-block text-[10px] font-bold text-indigo-600">
                    Jump →
                  </span>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[9px] text-slate-500 font-bold">
                    {action.shortcut}
                  </kbd>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>Navigation: <kbd className="font-mono font-bold">↑</kbd> <kbd className="font-mono font-bold">↓</kbd></span>
            <span>Select: <kbd className="font-mono font-bold">↵</kbd></span>
          </div>
          <div>Press <kbd className="font-mono font-bold">ESC</kbd> to exit</div>
        </div>

      </div>
    </div>
  );
}
