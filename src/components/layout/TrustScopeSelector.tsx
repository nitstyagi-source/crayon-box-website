"use client";

import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useInstitution } from '@/components/providers/InstitutionContext';
import { SchoolLogo } from '@/components/ui/SchoolLogo';

export default function TrustScopeSelector() {
  const {
    currentInstitution,
    setInstitution,
    institutionsList,
    selectedInstitutionObj,
    isAllInstitutions
  } = useInstitution();

  const [isOpen, setIsOpen] = useState(false);

  const activeName = isAllInstitutions
    ? 'Vani Educational Trust (HQ)'
    : (selectedInstitutionObj?.name || 'School Portal');
  const activeCode = isAllInstitutions
    ? 'ALL'
    : (selectedInstitutionObj?.code || currentInstitution || 'CBS');
  const activeLogo = isAllInstitutions
    ? '/trust-logo.png'
    : (selectedInstitutionObj?.logoUrl || '/logo.png');

  return (
    <div className="relative font-sans text-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition font-bold text-slate-800 text-left cursor-pointer"
      >
        <SchoolLogo 
          code={activeCode} 
          logoUrl={activeLogo}
          size="xs" 
          shape="square" 
        />
        <div className="max-w-[140px] sm:max-w-[180px] truncate">
          <span className="block text-[11px] font-black leading-tight truncate">{activeName}</span>
          <span className="block text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
            {activeCode}
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
                setInstitution('ALL');
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between p-2 rounded-xl transition text-left cursor-pointer ${
                isAllInstitutions ? 'bg-indigo-50 text-indigo-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <SchoolLogo code="ALL" logoUrl="/trust-logo.png" size="sm" shape="square" />
                <div>
                  <span className="block text-xs font-black">Vani Educational Trust (HQ)</span>
                  <span className="block text-[10px] text-slate-400 font-medium">Consolidated Cross-Institution</span>
                </div>
              </div>
              {isAllInstitutions && <Check className="w-3.5 h-3.5 text-indigo-600" />}
            </button>

            <div className="my-1 border-t border-slate-100" />

            {/* Dynamic Database Institutions */}
            {institutionsList.map((inst) => {
              const isSelected = currentInstitution === inst.code;
              return (
                <button
                  key={inst.code}
                  onClick={() => {
                    setInstitution(inst.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl transition text-left cursor-pointer ${
                    isSelected ? 'bg-blue-50 text-blue-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <SchoolLogo 
                      code={inst.code} 
                      logoUrl={inst.logoUrl} 
                      name={inst.name}
                      size="sm" 
                      shape="square" 
                    />
                    <div className="truncate">
                      <span className="block text-xs font-black truncate">{inst.name}</span>
                      <span className="block text-[10px] text-slate-400 font-medium truncate">
                        {inst.code} • {inst.boardAffiliation || 'Recognized Board'}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
