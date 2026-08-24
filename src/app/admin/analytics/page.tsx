"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp, BarChart3, Users, IndianRupee,
  GraduationCap, Bus, Award, RefreshCw, ShieldCheck, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useInstitution } from '@/components/providers/InstitutionContext';
import { getTrustExecutiveGovernanceMetricsAction } from '@/app/actions/governance-analytics-actions';

export default function AdvancedAnalyticsPage() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();

  const [metrics, setMetrics] = useState<any>(null);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    const res = await getTrustExecutiveGovernanceMetricsAction({ institutionCode: currentInstitution });
    if (res.success) {
      setMetrics(res.executive);
      setInstitutions(res.institutions || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [currentInstitution]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-indigo-500/30 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              Executive Business Intelligence & Cross-Campus Analytics
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-indigo-300 text-xs font-semibold">
              {isAllInstitutions ? 'All Institutions' : selectedInstitutionObj?.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-indigo-400" />
            Institutional Analytics & Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Multi-campus operational telemetry, academic score distributions, fee collection velocity, and transport logistics.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchAnalytics}
            isLoading={isLoading}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Analytics
          </Button>
        </div>
      </div>

      {/* 🌟 4 CORE CONSOLIDATED METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Student Retention Rate</span>
          <span className="text-3xl font-black text-emerald-600 block">99.1%</span>
          <p className="text-xs text-slate-500 font-medium">220 Enrolled • Minimal attrition across terms</p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fee Realization Velocity</span>
          <span className="text-3xl font-black text-indigo-600 block">96.8%</span>
          <p className="text-xs text-slate-500 font-medium">₹48.44L Demands • ₹1.04L Sibling Concessions</p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scholastic Pass Index</span>
          <span className="text-3xl font-black text-slate-900 block">100.0%</span>
          <p className="text-xs text-slate-500 font-medium">Term 1 CBSE Exam Class Average: 91.1%</p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Faculty Proxy Coverage</span>
          <span className="text-3xl font-black text-emerald-600 block">100.0%</span>
          <p className="text-xs text-slate-500 font-medium">Zero unattended classroom periods</p>
        </div>
      </div>

      {/* 🌟 2x2 ANALYTICAL DIMENSIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Dimension 1: Academic Scholastic Grade Distribution */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              CBSE 9-Point Grade Distribution (Term 1)
            </h3>
            <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
              Scholastic Assessment
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-slate-700">Grade A1 (91% – 100%)</span>
                <strong className="text-emerald-700">142 Students (64.5%)</strong>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[64.5%]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-slate-700">Grade A2 (81% – 90%)</span>
                <strong className="text-indigo-700">54 Students (24.5%)</strong>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full w-[24.5%]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-slate-700">Grade B1 (71% – 80%)</span>
                <strong className="text-blue-700">18 Students (8.2%)</strong>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full w-[8.2%]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-slate-700">Grade B2 (61% – 70%)</span>
                <strong className="text-amber-700">6 Students (2.8%)</strong>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-[2.8%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Dimension 2: Multi-Campus Demographic Comparison */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Cross-Campus Capacity & Enrollment Share
            </h3>
            <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-md border border-indigo-200">
              4 Trust Campuses
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {institutions.map(inst => (
              <div key={inst.code} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 block font-bold">{inst.name} ({inst.code})</strong>
                  <span className="text-[10px] text-slate-400 font-medium">{inst.affiliation}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-indigo-700 text-sm block">{inst.students} Students</span>
                  <span className="text-[10px] text-slate-500">{inst.faculty} Faculty</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
