"use client";

import React, { useState } from 'react';
import { Building2, ChevronDown, Check, ShieldCheck } from 'lucide-react';
import { VANI_TRUST_ORGANIZATION, VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';

export default function TrustScopeSelector() {
  const [selectedId, setSelectedId] = useState<string>('ins-cbs'); // Default to Crayon Box School
  const [isOpen, setIsOpen] = useState(false);

  const currentSelection = selectedId === 'trust'
    ? { name: VANI_TRUST_ORGANIZATION.name, code: 'TRUST', color: '#0f172a', type: 'Trust HQ (All Institutions)' }
    : VANI_TRUST_INSTITUTIONS.find((i) => i.id === selectedId) || VANI_TRUST_INSTITUTIONS[0];

  return (
    <div className="relative font-sans text-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition font-bold text-slate-800 text-left"
      >
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: 'brandColor' in currentSelection ? currentSelection.brandColor : '#0f172a' }}
        />
        <div className="max-w-[140px] sm:max-w-[180px] truncate">
          <span className="block text-[11px] font-black leading-tight truncate">{currentSelection.name}</span>
          <span className="block text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
            {'code' in currentSelection ? currentSelection.code : 'INS'}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-1.5 border-b border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Institutional Scope Switcher
              </span>
            </div>

            {/* Trust Consolidated Option */}
            <button
              onClick={() => {
                setSelectedId('trust');
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between p-2 rounded-xl transition text-left ${
                selectedId === 'trust' ? 'bg-indigo-50 text-indigo-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <div>
                  <span className="block text-xs font-black">Vani Educational Trust (HQ)</span>
                  <span className="block text-[10px] text-slate-400 font-medium">Consolidated Cross-Institution</span>
                </div>
              </div>
              {selectedId === 'trust' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
            </button>

            <div className="my-1 border-t border-slate-100" />

            {/* 4 Member Institutions */}
            {VANI_TRUST_INSTITUTIONS.map((inst) => {
              const isSelected = selectedId === inst.id;
              return (
                <button
                  key={inst.id}
                  onClick={() => {
                    setSelectedId(inst.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl transition text-left ${
                    isSelected ? 'bg-blue-50 text-blue-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: inst.brandColor }}
                    />
                    <div>
                      <span className="block text-xs font-black">{inst.name}</span>
                      <span className="block text-[10px] text-slate-400 font-medium">
                        {inst.boardAffiliation} • {inst.totalStudents} Students
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
