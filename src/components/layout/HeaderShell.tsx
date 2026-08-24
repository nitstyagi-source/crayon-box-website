"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2, Calendar, Search, Bell, User,
  ChevronDown, ShieldCheck, Check, Sparkles, Globe
} from 'lucide-react';
import { VANI_TRUST_INSTITUTIONS, VANI_TRUST_ORGANIZATION } from '@/lib/core/institution/trust-hierarchy';
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
    currentRole,
    setRole,
  } = useInstitution();

  const [isInstOpen, setIsInstOpen] = useState(false);
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);

  const sessions = ['2026–2027 (Active)', '2025–2026 (Archived)'];
  const roles = [
    { label: 'Super Admin', value: 'SUPER_ADMIN' },
    { label: 'Principal', value: 'PRINCIPAL' },
    { label: 'Teacher', value: 'TEACHER' },
    { label: 'Accounts Officer', value: 'ACCOUNTS' },
    { label: 'Parent', value: 'PARENT' },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between font-sans z-30 shrink-0 sticky top-0">
      
      {/* Left: VET Brand & Global Institution Switcher */}
      <div className="flex items-center gap-3 sm:gap-6">
        
        {/* Brand Link */}
        <Link href="/admin" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-600 transition">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
            <span className="font-extrabold text-slate-900 text-sm tracking-tight block leading-none">
              VET ERP
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
              Vani Educational Trust
            </span>
          </div>
        </Link>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* Global Institution Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsInstOpen(!isInstOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/80 hover:bg-slate-100 transition text-xs font-bold text-slate-800 shadow-2xs"
          >
            {selectedInstitutionObj ? (
              <span
                className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-2xs"
                style={{ backgroundColor: selectedInstitutionObj.brandColor || '#2563eb' }}
              />
            ) : (
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
            )}
            <span className="truncate max-w-[140px] sm:max-w-[220px]">
              {selectedInstitutionObj ? selectedInstitutionObj.name : 'All Institutions (Trust HQ)'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isInstOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsInstOpen(false)} />
              <div className="absolute top-full left-0 mt-1.5 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Operating Institution
                </div>

                {/* All Institutions Option */}
                <button
                  onClick={() => {
                    setInstitution('ALL');
                    setIsInstOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 text-left flex items-center justify-between text-xs font-semibold hover:bg-slate-50 transition border-b border-slate-100 ${
                    currentInstitution === 'ALL' ? 'text-indigo-600 bg-indigo-50/40 font-bold' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px]">
                      VET
                    </div>
                    <div>
                      <span className="block font-bold">All Institutions (Trust HQ)</span>
                      <span className="text-[10px] text-slate-400 font-medium">Consolidated Multi-School View</span>
                    </div>
                  </div>
                  {currentInstitution === 'ALL' && <Check className="w-4 h-4 text-indigo-600" />}
                </button>

                {/* 4 Member Institutions */}
                {VANI_TRUST_INSTITUTIONS.map((inst) => (
                  <button
                    key={inst.code}
                    onClick={() => {
                      setInstitution(inst.code);
                      setIsInstOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 text-left flex items-center justify-between text-xs font-semibold hover:bg-slate-50 transition ${
                      currentInstitution === inst.code ? 'text-indigo-600 bg-indigo-50/40 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-6 h-6 rounded-lg text-white flex items-center justify-center font-bold text-[10px]"
                        style={{ backgroundColor: inst.brandColor }}
                      >
                        {inst.code}
                      </div>
                      <div>
                        <span className="block font-bold">{inst.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {inst.code} • {inst.institutionType === 'PRE_SCHOOL' ? 'Kindergarten (Montessori)' : 'K-12 (CBSE)'}
                        </span>
                      </div>
                    </div>
                    {currentInstitution === inst.code && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Academic Session Switcher */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setIsSessionOpen(!isSessionOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition text-xs font-semibold text-slate-700 shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentSession}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isSessionOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsSessionOpen(false)} />
              <div className="absolute top-full left-0 mt-1.5 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Academic Session
                </div>
                {sessions.map((sess) => (
                  <button
                    key={sess}
                    onClick={() => {
                      setSession(sess);
                      setIsSessionOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 text-slate-700"
                  >
                    {sess}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: Quick Search + Role Persona Selector + User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Global Quick Action Palette Trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/80 hover:bg-slate-100 transition text-xs font-medium text-slate-500 shadow-2xs"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Search records...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold bg-white border border-slate-200 rounded text-slate-400 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Role Persona Switcher (For live testing) */}
        <div className="relative">
          <button
            onClick={() => setIsRoleOpen(!isRoleOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/60 transition text-xs font-bold text-indigo-900 shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">
              {roles.find((r) => r.value === currentRole)?.label || 'Super Admin'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
          </button>

          {isRoleOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsRoleOpen(false)} />
              <div className="absolute top-full right-0 mt-1.5 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Role
                </div>
                {roles.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => {
                      setRole(r.value);
                      setIsRoleOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 ${
                      currentRole === r.value ? 'text-indigo-600 bg-indigo-50/40 font-bold' : 'text-slate-700'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Live Notification Center */}
        <NotificationCenter role={currentRole} institutionCode={currentInstitution} />

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-xs">
          AD
        </div>
      </div>

    </header>
  );
}
