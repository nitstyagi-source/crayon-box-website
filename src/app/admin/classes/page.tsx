"use client";

import React, { useState } from 'react';
import {
  GraduationCap, Users, UserCheck, Plus, Search,
  Filter, Building2, Download, ArrowRight, ExternalLink
} from 'lucide-react';
import { VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';

export default function ClassesMasterPage() {
  const [selectedInst, setSelectedInst] = useState<string>('CBS');
  const [searchQuery, setSearchQuery] = useState('');

  const classData = [
    { id: 'CLS-01', institutionCode: 'CBS', wing: 'Primary Wing', grade: 'Grade 1', section: 'A', room: 'Room 101', classTeacher: 'Ms. Sarah Jenkins', enrolled: 30, capacity: 30, status: 'FULL' },
    { id: 'CLS-02', institutionCode: 'CBS', wing: 'Primary Wing', grade: 'Grade 1', section: 'B', room: 'Room 102', classTeacher: 'Ms. Priya Nair', enrolled: 28, capacity: 30, status: 'OPEN' },
    { id: 'CLS-03', institutionCode: 'CBS', wing: 'Primary Wing', grade: 'Grade 4', section: 'B', room: 'Room 402', classTeacher: 'Dr. Meenakshi Sundaram', enrolled: 32, capacity: 32, status: 'FULL' },
    { id: 'CLS-04', institutionCode: 'CBS', wing: 'Middle Wing', grade: 'Grade 7', section: 'A', room: 'Room 701', classTeacher: 'Prof. Anil Gupta', enrolled: 29, capacity: 32, status: 'OPEN' },
    { id: 'CLS-05', institutionCode: 'CBPS', wing: 'Montessori Wing', grade: 'Pre-Nursery', section: 'Sunflowers', room: 'Sensory Room 1', classTeacher: 'Mrs. Shalini Mehta', enrolled: 18, capacity: 20, status: 'OPEN' },
    { id: 'CLS-06', institutionCode: 'CBPS', wing: 'Montessori Wing', grade: 'Nursery', section: 'Butterflies', room: 'Sensory Room 2', classTeacher: 'Ms. Pooja Batra', enrolled: 20, capacity: 20, status: 'FULL' },
    { id: 'CLS-07', institutionCode: 'AS', wing: 'Secondary Wing', grade: 'Grade 9', section: 'A', room: 'Room 901', classTeacher: 'Dr. R. K. Varma', enrolled: 34, capacity: 35, status: 'OPEN' },
    { id: 'CLS-08', institutionCode: 'AVM', wing: 'Senior Secondary', grade: 'Grade 11', section: 'Science', room: 'Lab 3', classTeacher: 'Prof. Ramesh Chandra', enrolled: 40, capacity: 40, status: 'FULL' },
  ];

  const filtered = classData.filter((c) => {
    const matchInst = selectedInst === 'ALL' || c.institutionCode === selectedInst;
    const matchSearch =
      c.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.classTeacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.room.toLowerCase().includes(searchQuery.toLowerCase());
    return matchInst && matchSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Institutional Structure
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Wings, Classes, Sections & Classrooms</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Classes, Sections & Room Allocations</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Class capacity management, assigned class teachers, and physical classroom allocations across VET schools.
          </p>
        </div>

        {/* Institution Scope Filter */}
        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setSelectedInst('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedInst === 'ALL' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Institutions
          </button>
          {VANI_TRUST_INSTITUTIONS.map((inst) => (
            <button
              key={inst.code}
              onClick={() => setSelectedInst(inst.code)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedInst === inst.code ? 'bg-blue-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {inst.code}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((cls) => (
          <div key={cls.id} className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3 hover:border-blue-300 transition">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-mono">
                  {cls.institutionCode} • {cls.wing}
                </span>
                <h3 className="text-lg font-black text-stone-900 mt-1">{cls.grade} - {cls.section}</h3>
                <p className="text-xs text-stone-500 font-semibold">{cls.room}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                cls.status === 'FULL' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {cls.status}
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-stone-400 font-medium">Class Teacher:</span>
              <p className="font-bold text-stone-800">{cls.classTeacher}</p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-stone-500">Student Capacity</span>
                <span className="text-stone-900">{cls.enrolled} / {cls.capacity}</span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${cls.enrolled >= cls.capacity ? 'bg-amber-500' : 'bg-blue-600'}`}
                  style={{ width: `${(cls.enrolled / cls.capacity) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
