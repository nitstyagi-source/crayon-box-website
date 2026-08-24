"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap, Users, UserCheck, BookOpen,
  Plus, RefreshCw, Sparkles, Building2, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useInstitution } from '@/components/providers/InstitutionContext';
import { getAcademicClassesDashboardAction } from '@/app/actions/academic-operations-actions';

export default function AcademicClassesPage() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();

  const [classes, setClasses] = useState<any[]>([]);
  const [counts, setCounts] = useState({
    totalClasses: 0,
    totalEnrolled: 0,
    totalCapacity: 0,
    avgUtilization: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchClasses = async () => {
    setIsLoading(true);
    const res = await getAcademicClassesDashboardAction();
    if (res.success) {
      setClasses(res.classes || []);
      setCounts(res.counts || { totalClasses: 0, totalEnrolled: 0, totalCapacity: 0, avgUtilization: 0 });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-indigo-500/30 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              Academic Cohorts & Sections
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-indigo-300 text-xs font-semibold">
              {isAllInstitutions ? 'All Institutions' : selectedInstitutionObj?.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-indigo-400" />
            Classroom & Section Cohorts
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Pre-Nursery through Class 10 section rosters, room allocations, student capacities, and assigned class mentors.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchClasses}
            isLoading={isLoading}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Cohorts
          </Button>
        </div>
      </div>

      {/* 🌟 TELEMATICS COUNTERS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Class Cohorts</span>
          <span className="text-3xl font-black text-slate-900 mt-1 block">{counts.totalClasses}</span>
          <span className="text-[11px] text-slate-500 font-semibold">Active Sections</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Enrolled</span>
          <span className="text-3xl font-black text-indigo-600 mt-1 block">{counts.totalEnrolled}</span>
          <span className="text-[11px] text-indigo-700 font-bold">Allocated Students</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Campus Capacity</span>
          <span className="text-3xl font-black text-emerald-600 mt-1 block">{counts.totalCapacity}</span>
          <span className="text-[11px] text-emerald-700 font-bold">Desk Capacity</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Average Utilization</span>
          <span className="text-3xl font-black text-amber-600 mt-1 block">{counts.avgUtilization}%</span>
          <span className="text-[11px] text-amber-700 font-bold">Classroom Occupancy</span>
        </div>
      </div>

      {/* 🌟 CLASSES CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4 flex flex-col justify-between hover:border-indigo-300 transition"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200">
                  Section {c.section}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {c.room_number || 'Main Wing'}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">{c.grade}</h3>
                <p className="text-xs text-slate-500 font-medium">Class Teacher: <strong className="text-slate-800">{c.classTeacher}</strong></p>
              </div>

              {/* Capacity Bar */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Enrollment:</span>
                  <strong className="text-slate-900 font-bold">{c.enrolled_students} / {c.capacity}</strong>
                </div>

                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, c.utilizationRate)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <Link
                href={`/admin/timetable?grade=${encodeURIComponent(c.grade)}&section=${c.section}`}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                View Timetable <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href={`/admin/students?grade=${encodeURIComponent(c.grade)}`}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                Roster →
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
