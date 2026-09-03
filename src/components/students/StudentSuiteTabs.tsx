"use client";

import React from 'react';
import Link from 'next/link';
import { Users, Building2, CreditCard, ShieldCheck } from 'lucide-react';

export type StudentSuiteTabType = 'ROSTER' | 'FAMILIES' | 'ID_CARDS' | 'TC';

interface StudentSuiteTabsProps {
  activeTab: StudentSuiteTabType;
  onTabChange?: (tab: StudentSuiteTabType) => void;
  counts?: {
    activeStudents?: number;
    totalFamilies?: number;
    activeIdCards?: number;
    issuedTc?: number;
  };
}

export function StudentSuiteTabs({
  activeTab,
  onTabChange,
  counts = {}
}: StudentSuiteTabsProps) {
  const tabs = [
    {
      id: 'ROSTER' as const,
      label: '1. Student Roster (360°)',
      icon: Users,
      iconColor: 'text-emerald-400',
      href: '/admin/students?tab=roster',
      count: counts.activeStudents,
      badgeColor: 'bg-emerald-700 text-emerald-100',
    },
    {
      id: 'FAMILIES' as const,
      label: '2. Family 360° & Siblings Master',
      icon: Building2,
      iconColor: 'text-blue-400',
      href: '/admin/students?tab=families',
      count: counts.totalFamilies,
      badgeColor: 'bg-blue-700 text-blue-100',
    },
    {
      id: 'ID_CARDS' as const,
      label: '3. ID Card & Escort Pass Studio',
      icon: CreditCard,
      iconColor: 'text-purple-400',
      href: '/admin/students?tab=id-cards',
      count: counts.activeIdCards,
      badgeColor: 'bg-purple-700 text-purple-100',
    },
    {
      id: 'TC' as const,
      label: '4. Transfer Certificate (TC)',
      icon: ShieldCheck,
      iconColor: 'text-amber-400',
      href: '/admin/students?tab=tc',
      count: counts.issuedTc,
      badgeColor: 'bg-amber-700 text-amber-100',
    },
  ];

  return (
    <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        if (onTabChange) {
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-2xs ${
                isActive
                  ? 'bg-[#D97706] text-white shadow-xs ring-1 ring-amber-400/50 font-black'
                  : 'bg-white text-stone-700 hover:text-stone-900 hover:bg-[#FAF7F2] border border-[#E8DFC8]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-100' : 'text-stone-400'}`} />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isActive ? 'bg-amber-800 text-amber-100' : 'bg-[#FAF7F2] text-stone-600 border border-[#E8DFC8]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        }

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shadow-2xs ${
              isActive
                ? 'bg-[#D97706] text-white shadow-xs ring-1 ring-amber-400/50 font-black'
                : 'bg-white text-stone-700 hover:text-stone-900 hover:bg-[#FAF7F2] border border-[#E8DFC8]'
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-100' : 'text-stone-400'}`} />
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && tab.count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isActive ? 'bg-amber-800 text-amber-100' : 'bg-[#FAF7F2] text-stone-600 border border-[#E8DFC8]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
