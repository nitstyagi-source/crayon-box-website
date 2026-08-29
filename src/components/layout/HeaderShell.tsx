"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search, Bell, User, ChevronDown, Check, Building2, CalendarDays
} from 'lucide-react';
import { VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';
import { useInstitution } from '@/components/providers/InstitutionContext';
import { NotificationCenter } from '@/components/layout/NotificationCenter';

export interface HeaderShellProps {
  onOpenSearch: () => void;
}

export function HeaderShell({ onOpenSearch }: HeaderShellProps) {
  const {
    currentInstitution,
    setInstitution,
    selectedInstitutionObj,
    currentSession,
    setSession,
    currentRole
  } = useInstitution();

  const [isInstOpen, setIsInstOpen] = useState(false);
  const [isSessionOpen, setIsSessionOpen] = useState(false);

  const sessions = ['2025-26', '2026-27'];

  return (
    <div className="flex flex-col bg-slate-50 border-b border-slate-200/50 px-6 pt-5 pb-4 font-sans shrink-0 relative z-30">
      
      {/* Top Row: User Greeting & Profile */}
      <div className="flex items-center justify-between mb-5 w-full max-w-6xl mx-auto">
        
        {/* Left: Logo & Greeting */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white border-2 border-yellow-500 shadow-sm flex items-center justify-center overflow-hidden">
             <img src="/tree-logo.png" alt="Logo" className="w-10 h-10 object-contain" 
                  onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }} />
             <Building2 className="hidden text-[#0A1A44] w-6 h-6" />
          </div>
          <div className="flex flex-col">
             <h2 className="text-[18px] text-slate-800 font-bold leading-tight">Good Morning,</h2>
             <div className="flex items-center gap-1.5">
               <h1 className="text-[20px] text-slate-900 font-extrabold leading-tight">Admin</h1>
               <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center">
                 <Check className="w-3 h-3" strokeWidth={3} />
               </div>
             </div>
             <p className="text-slate-500 text-[13px] font-medium mt-0.5">{selectedInstitutionObj?.name || 'All Institutions'}</p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
           {/* Notification Bell */}
           <div className="relative cursor-pointer">
             <Bell className="w-6 h-6 text-slate-600" />
             <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-slate-50">
               12
             </div>
           </div>

           {/* Profile Picture */}
           <div className="relative">
             <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" className="w-11 h-11 rounded-full border-2 border-slate-200 object-cover" />
             <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
           </div>
        </div>
      </div>

      {/* Bottom Row: Context Selectors */}
      <div className="flex items-center gap-4 w-full max-w-6xl mx-auto">
        {/* School Dropdown */}
        <div className="relative flex-1 max-w-[280px]">
          <button
            onClick={() => setIsInstOpen(!isInstOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition text-sm font-semibold text-slate-700 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span className="truncate">{selectedInstitutionObj ? selectedInstitutionObj.name : 'All Institutions'}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
          
          {isInstOpen && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
              <button
                onClick={() => { setInstitution('ALL'); setIsInstOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50 flex items-center justify-between ${currentInstitution === 'ALL' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-700'}`}
              >
                <span>Trust HQ (All)</span>
                {currentInstitution === 'ALL' && <Check className="w-4 h-4" />}
              </button>
              {Object.values(VANI_TRUST_INSTITUTIONS).map((inst) => (
                <button
                  key={inst.code}
                  onClick={() => { setInstitution(inst.code); setIsInstOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50 flex items-center justify-between ${currentInstitution === inst.code ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-700'}`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: inst.brandColor }} />
                    <span className="truncate">{inst.name}</span>
                  </div>
                  {currentInstitution === inst.code && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Year Dropdown */}
        <div className="relative w-[140px]">
          <button
            onClick={() => setIsSessionOpen(!isSessionOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition text-sm font-semibold text-slate-700 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-slate-400" />
              <span>{currentSession.split(' ')[0]}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {isSessionOpen && (
            <div className="absolute top-full right-0 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
              {sessions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setSession(s); setIsSessionOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50 flex items-center justify-between ${currentSession === s ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-700'}`}
                >
                  <span>{s.split(' ')[0]}</span>
                  {currentSession === s && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
