"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  UserPlus, Search, Filter, Phone, Mail, Calendar,
  TrendingUp, CheckCircle2, Clock, AlertCircle, Sparkles,
  Download, ArrowRight, ExternalLink, ChevronRight, UserCheck
} from 'lucide-react';
import { VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';

type StageType = 'ENQUIRY' | 'COUNSELLING' | 'CAMPUS_TOUR' | 'APPLICATION' | 'ASSESSMENT' | 'SELECTED' | 'ADMITTED';

interface AdmissionLead {
  id: string;
  applicantName: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  targetInstitutionCode: 'CBS' | 'CBPS' | 'AS' | 'AVM';
  targetGrade: string;
  source: 'GOOGLE_ADS' | 'PARENT_REFERRAL' | 'WALK_IN' | 'SIBLING' | 'SOCIAL_MEDIA';
  assignedCounsellor: string;
  stage: StageType;
  assessmentScore?: number; // Out of 100
  applicationFeePaid: boolean;
  followUpDate: string;
  notes: string;
}

export default function AdmissionsCrmPage() {
  const [selectedInstitution, setSelectedInstitution] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStageFilter, setActiveStageFilter] = useState<string>('ALL');

  const [leads, setLeads] = useState<AdmissionLead[]>([
    {
      id: 'LEAD-2026-081',
      applicantName: 'Kabir Singhania',
      parentName: 'Rohan Singhania',
      parentPhone: '+91 98111 88991',
      parentEmail: 'rohan.s@corp.in',
      targetInstitutionCode: 'CBS',
      targetGrade: 'Grade 1',
      source: 'PARENT_REFERRAL',
      assignedCounsellor: 'Ms. Preeti Verma',
      stage: 'SELECTED',
      assessmentScore: 92,
      applicationFeePaid: true,
      followUpDate: 'Today, 2:00 PM',
      notes: 'Parent impressed with STEM robotics lab. Waiting for admission fee payment.',
    },
    {
      id: 'LEAD-2026-082',
      applicantName: 'Tara Malhotra',
      parentName: 'Deepak Malhotra',
      parentPhone: '+91 98222 77882',
      parentEmail: 'deepak.m@fintech.co',
      targetInstitutionCode: 'CBPS',
      targetGrade: 'Pre-Nursery',
      source: 'GOOGLE_ADS',
      assignedCounsellor: 'Ms. Shalini Mehta',
      stage: 'CAMPUS_TOUR',
      applicationFeePaid: true,
      followUpDate: 'Tomorrow, 10:30 AM',
      notes: 'Montessori sensory room tour scheduled with child.',
    },
    {
      id: 'LEAD-2026-083',
      applicantName: 'Reyansh Gupta',
      parentName: 'Dr. Neha Gupta',
      parentPhone: '+91 98333 66773',
      parentEmail: 'dr.neha@hospital.org',
      targetInstitutionCode: 'AS',
      targetGrade: 'Grade 6',
      source: 'WALK_IN',
      assignedCounsellor: 'Mr. Arvind Saxena',
      stage: 'ASSESSMENT',
      assessmentScore: 88,
      applicationFeePaid: true,
      followUpDate: 'Aug 25, 2026',
      notes: 'Written assessment completed. Readiness review pending.',
    },
    {
      id: 'LEAD-2026-084',
      applicantName: 'Meera Iyer',
      parentName: 'Karthik Iyer',
      parentPhone: '+91 98444 55664',
      parentEmail: 'karthik.i@tech.com',
      targetInstitutionCode: 'CBS',
      targetGrade: 'Nursery',
      source: 'SIBLING',
      assignedCounsellor: 'Ms. Preeti Verma',
      stage: 'ADMITTED',
      assessmentScore: 95,
      applicationFeePaid: true,
      followUpDate: 'Enrolled',
      notes: 'Elder sibling in Grade 4. 15% sibling concession granted.',
    },
  ]);

  const filteredLeads = leads.filter((l) => {
    const matchInst = selectedInstitution === 'ALL' || l.targetInstitutionCode === selectedInstitution;
    const matchStage = activeStageFilter === 'ALL' || l.stage === activeStageFilter;
    const matchSearch =
      l.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.parentPhone.includes(searchQuery);
    return matchInst && matchStage && matchSearch;
  });

  const funnelStats = {
    totalEnquiries: 1420,
    contacted: 1280,
    toursScheduled: 890,
    applicationsSubmitted: 740,
    selected: 680,
    admittedEnrolled: 635,
    conversionPercent: '44.72%',
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header & Export */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Admissions & Growth CRM
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Academic Session 2026–2027</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Admissions CRM Pipeline & Conversion Radar</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Lead capture, parent counselling, campus visits, readiness assessments, and section allocations across VET institutions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition border border-stone-200"
          >
            <Download className="w-3.5 h-3.5" />
            Export Conversion Funnel
          </button>
        </div>
      </div>

      {/* Trust-Wide Lead Conversion Funnel KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 text-center space-y-1 shadow-xs">
          <span className="text-[10px] font-black uppercase text-stone-400">1. Enquiries</span>
          <p className="text-2xl font-black text-stone-900">{funnelStats.totalEnquiries}</p>
          <span className="text-[9px] text-stone-500">100% Ingestion</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 text-center space-y-1 shadow-xs">
          <span className="text-[10px] font-black uppercase text-stone-400">2. Counseled</span>
          <p className="text-2xl font-black text-blue-600">{funnelStats.contacted}</p>
          <span className="text-[9px] text-blue-700 font-bold">90.1% Contact</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 text-center space-y-1 shadow-xs">
          <span className="text-[10px] font-black uppercase text-stone-400">3. Campus Tours</span>
          <p className="text-2xl font-black text-indigo-600">{funnelStats.toursScheduled}</p>
          <span className="text-[9px] text-indigo-700 font-bold">62.6% Visits</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 text-center space-y-1 shadow-xs">
          <span className="text-[10px] font-black uppercase text-stone-400">4. Applications</span>
          <p className="text-2xl font-black text-purple-600">{funnelStats.applicationsSubmitted}</p>
          <span className="text-[9px] text-purple-700 font-bold">52.1% Form Rate</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 text-center space-y-1 shadow-xs">
          <span className="text-[10px] font-black uppercase text-stone-400">5. Selected</span>
          <p className="text-2xl font-black text-emerald-600">{funnelStats.selected}</p>
          <span className="text-[9px] text-emerald-700 font-bold">47.8% Pass</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 text-center space-y-1 shadow-xs">
          <span className="text-[10px] font-black uppercase text-stone-400">6. Admitted</span>
          <p className="text-2xl font-black text-emerald-600">{funnelStats.admittedEnrolled}</p>
          <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
            {funnelStats.conversionPercent} Yield
          </span>
        </div>
      </div>

      {/* Filter & Search Ribbon */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Institution Scope Filter */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <button
            onClick={() => setSelectedInstitution('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedInstitution === 'ALL' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All VET Institutions
          </button>
          {VANI_TRUST_INSTITUTIONS.map((inst) => (
            <button
              key={inst.code}
              onClick={() => setSelectedInstitution(inst.code)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedInstitution === inst.code ? 'bg-blue-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {inst.code} ({inst.shortName})
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lead name, parent phone..."
            className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-none w-full"
          />
        </div>
      </div>

      {/* Active Leads Pipeline Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" /> Active Admissions Candidate Pipeline ({filteredLeads.length})
          </h2>
          <span className="text-xs text-stone-400 font-semibold">Real-Time Counsellor Allocation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-400 uppercase font-black tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3.5">Applicant & Parent</th>
                <th className="p-3.5">Institution & Grade</th>
                <th className="p-3.5">Lead Source</th>
                <th className="p-3.5">Assigned Counsellor</th>
                <th className="p-3.5">Pipeline Stage</th>
                <th className="p-3.5">Assessment Score</th>
                <th className="p-3.5 text-right">Follow-Up Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-3.5">
                    <span className="font-black text-stone-900 block text-sm">{lead.applicantName}</span>
                    <span className="text-stone-500 text-[11px] font-semibold">{lead.parentName} • 📞 {lead.parentPhone}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-black text-blue-600 px-2 py-0.5 rounded-md bg-blue-50 text-[10px] font-mono mr-1.5">
                      {lead.targetInstitutionCode}
                    </span>
                    <span className="font-bold text-stone-800">{lead.targetGrade}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-1 bg-stone-100 text-stone-700 rounded-lg text-[10px] font-bold">
                      {lead.source.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-stone-800">{lead.assignedCounsellor}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                      lead.stage === 'ADMITTED' ? 'bg-emerald-100 text-emerald-800' :
                      lead.stage === 'SELECTED' ? 'bg-blue-100 text-blue-800' :
                      lead.stage === 'CAMPUS_TOUR' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {lead.stage}
                    </span>
                  </td>
                  <td className="p-3.5 font-black text-stone-900">
                    {lead.assessmentScore !== undefined ? `${lead.assessmentScore} / 100` : <span className="text-stone-300">Pending</span>}
                  </td>
                  <td className="p-3.5 text-right">
                    <span className="text-[11px] font-bold text-stone-800 block">{lead.followUpDate}</span>
                    <span className="text-[10px] text-stone-400 font-medium truncate max-w-[150px] inline-block">{lead.notes}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
