"use client";

import React, { useState, useEffect } from 'react';
import {
  Award,
  Download,
  Printer,
  Search,
  BookOpen,
  HeartHandshake,
  Activity,
  Smile,
  Users,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { VastuModuleBanner } from '@/components/common/VastuModuleBanner';
import { useInstitution } from '@/components/providers/InstitutionContext';
import {
  getStudentsForEvaluationAction,
  getStudentHolisticCardDataAction,
  Student360Evaluation
} from '@/app/actions/hpc-actions';

export default function HolisticReportCardPrintPage() {
  const { selectedInstitutionObj } = useInstitution();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [term, setTerm] = useState('Term 1');
  const [reportData, setReportData] = useState<{
    student: any;
    evaluations: Student360Evaluation[];
    portfolios: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getStudentsForEvaluationAction().then((res) => {
      if (res.success && res.students && res.students.length > 0) {
        setStudents(res.students);
        setSelectedStudentId(res.students[0].id);
      }
      setIsLoading(false);
    });
  }, []);

  const loadStudentReport = async () => {
    if (!selectedStudentId) return;
    setIsLoading(true);
    const res = await getStudentHolisticCardDataAction(selectedStudentId, term);
    if (res.success) {
      setReportData({
        student: res.student,
        evaluations: res.evaluations,
        portfolios: res.portfolios
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadStudentReport();
  }, [selectedStudentId, term]);

  const domainScores = {
    COGNITIVE: reportData?.evaluations.filter(e => e.domain === 'COGNITIVE') || [],
    AFFECTIVE: reportData?.evaluations.filter(e => e.domain === 'AFFECTIVE') || [],
    PSYCHOMOTOR: reportData?.evaluations.filter(e => e.domain === 'PSYCHOMOTOR') || [],
    SOCIO_EMOTIONAL: reportData?.evaluations.filter(e => e.domain === 'SOCIO_EMOTIONAL') || []
  };

  const getDomainAvg = (list: Student360Evaluation[]) => {
    if (list.length === 0) return '3.0';
    const sum = list.reduce((a, b) => a + b.score, 0);
    return (sum / list.length).toFixed(1);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="print:hidden">
        <VastuModuleBanner
          badgeText="NEP 2020 OFFICIAL REPORT"
          title="360° Holistic Progress Card (HPC) Generator"
          description="Print-ready 360-degree Multidimensional Report Card capturing Self, Peer, Teacher, and Parent evaluations."
        />

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs mt-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-stone-600">Select Student:</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="p-2 text-xs bg-stone-50 rounded-xl border border-stone-200 font-semibold"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.admission_no}) - {s.class_name}
                </option>
              ))}
            </select>

            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="p-2 text-xs bg-stone-50 rounded-xl border border-stone-200 font-semibold"
            >
              <option value="Term 1">Term 1 (Half Yearly)</option>
              <option value="Term 2">Term 2 (Annual Final)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => window.print()}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Official Document
            </Button>
          </div>
        </div>
      </div>

      {/* Printable Report Card Sheet */}
      {reportData && (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-sm max-w-4xl mx-auto space-y-8 print:border-none print:shadow-none print:p-0">
          
          {/* Header */}
          <div className="text-center border-b-2 border-stone-900 pb-6 space-y-2">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 rounded-2xl bg-white border border-stone-200 p-1 flex items-center justify-center shadow-xs overflow-hidden">
                <img src={selectedInstitutionObj?.logoUrl || '/logo.png'} alt="" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = '/logo.png'; }} />
              </div>
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight uppercase">
              {selectedInstitutionObj?.name || 'School Academic Report'}
            </h1>
            <p className="text-xs font-semibold text-stone-500">
              Affiliated to {selectedInstitutionObj?.boardAffiliation || 'Recognized Board'} • Affiliation No. {selectedInstitutionObj?.affiliationNumber || '2130894'}
            </p>
            <div className="inline-block mt-2 px-4 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-xs uppercase tracking-wider border border-amber-300">
              NEP 2020 — 360° Holistic Progress Card (HPC)
            </div>
          </div>

          {/* Student Demographics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
            <div>
              <span className="text-[10px] text-stone-400 font-bold uppercase block">Student Name</span>
              <strong className="text-stone-900 text-sm">{reportData.student?.full_name || 'Arjun Das'}</strong>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 font-bold uppercase block">Admission Number</span>
              <strong className="text-stone-900 text-sm font-mono">{reportData.student?.admission_no || 'TEST-ADM-2026-0001'}</strong>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 font-bold uppercase block">Grade & Section</span>
              <strong className="text-stone-900 text-sm">{reportData.student?.class_name || 'Class 1'} - Section A</strong>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 font-bold uppercase block">Assessment Term</span>
              <strong className="text-stone-900 text-sm">{term} (2026–27)</strong>
            </div>
          </div>

          {/* 4-Domain Competency Overview Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-800 border-b border-stone-200 pb-1">
              Part I: Multidimensional Domain Competencies (4-Point Mastery Scale)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200/60 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-sky-900 block font-bold">1. Cognitive & Scientific Inquiry</strong>
                  <span className="text-[11px] text-sky-700">Problem solving & conceptual mastery</span>
                </div>
                <span className="font-mono font-black text-sky-950 text-sm">{getDomainAvg(domainScores.COGNITIVE)} / 4.0</span>
              </div>

              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/60 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-rose-900 block font-bold">2. Affective & Empathy Domain</strong>
                  <span className="text-[11px] text-rose-700">Inclusivity, values & diversity respect</span>
                </div>
                <span className="font-mono font-black text-rose-950 text-sm">{getDomainAvg(domainScores.AFFECTIVE)} / 4.0</span>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-emerald-900 block font-bold">3. Psychomotor & Physical Fitness</strong>
                  <span className="text-[11px] text-emerald-700">Kinesthetic agility, sports & fine motor</span>
                </div>
                <span className="font-mono font-black text-emerald-950 text-sm">{getDomainAvg(domainScores.PSYCHOMOTOR)} / 4.0</span>
              </div>

              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/60 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-purple-900 block font-bold">4. Socio-Emotional Learning (SEL)</strong>
                  <span className="text-[11px] text-purple-700">Self-regulation & peer collaboration</span>
                </div>
                <span className="font-mono font-black text-purple-950 text-sm">{getDomainAvg(domainScores.SOCIO_EMOTIONAL)} / 4.0</span>
              </div>
            </div>
          </div>

          {/* 360-Degree Qualitative Evidence Log */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-800 border-b border-stone-200 pb-1">
              Part II: 360-Degree Evaluation & Observational Evidence Log
            </h3>

            {reportData.evaluations.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-4">No qualitative assessments recorded yet.</p>
            ) : (
              <div className="border border-stone-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-100 text-stone-600 uppercase text-[10px] font-bold border-b border-stone-200">
                      <th className="py-2.5 px-4">Perspective</th>
                      <th className="py-2.5 px-4">Domain & Competency</th>
                      <th className="py-2.5 px-4">Anecdotal Observational Evidence</th>
                      <th className="py-2.5 px-4 text-center">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {reportData.evaluations.map((ev) => (
                      <tr key={ev.id}>
                        <td className="py-2.5 px-4 font-bold text-stone-800 whitespace-nowrap">
                          {ev.evaluator_type}
                        </td>
                        <td className="py-2.5 px-4">
                          <strong className="text-stone-900 block">{ev.competency}</strong>
                          <span className="text-[10px] text-stone-400 font-mono">{ev.domain}</span>
                        </td>
                        <td className="py-2.5 px-4 text-stone-600 italic">
                          "{ev.evidence_notes || 'Demonstrated consistent engagement and milestone attainment.'}"
                        </td>
                        <td className="py-2.5 px-4 text-center font-mono font-bold text-amber-900">
                          Level {ev.score}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sign-off Seal */}
          <div className="grid grid-cols-3 gap-8 pt-12 border-t border-stone-200 text-center text-xs">
            <div>
              <div className="h-10 border-b border-stone-400 mb-2"></div>
              <span className="font-bold text-stone-700 block">Class Teacher</span>
              <span className="text-[10px] text-stone-400">Signature & Remarks</span>
            </div>
            <div>
              <div className="h-10 border-b border-stone-400 mb-2"></div>
              <span className="font-bold text-stone-700 block">Parent / Guardian</span>
              <span className="text-[10px] text-stone-400">Reflection & Sign-off</span>
            </div>
            <div>
              <div className="h-10 border-b border-stone-400 mb-2 flex items-end justify-center font-serif italic text-xs font-bold text-stone-900 pb-1">
                {selectedInstitutionObj?.principalName || 'Principal'}
              </div>
              <span className="font-bold text-stone-700 block">Principal</span>
              <span className="text-[10px] text-stone-400">Institutional Seal</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
