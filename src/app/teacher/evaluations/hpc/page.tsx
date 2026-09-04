"use client";

import React, { useState, useEffect } from 'react';
import {
  Users,
  Award,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Filter,
  Save,
  Star,
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { VastuModuleBanner } from '@/components/common/VastuModuleBanner';
import {
  getStudentsForEvaluationAction,
  getAssessmentRubricsAction,
  record360EvaluationAction,
  RubricDefinition
} from '@/app/actions/hpc-actions';

export default function TeacherHpcEvaluationPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [rubrics, setRubrics] = useState<RubricDefinition[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string>('COGNITIVE');
  const [selectedCompetency, setSelectedCompetency] = useState<string>('');
  const [score, setScore] = useState<number>(3);
  const [evidence, setEvidence] = useState('');
  const [term, setTerm] = useState('Term 1');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      const [stuRes, rubRes] = await Promise.all([
        getStudentsForEvaluationAction(),
        getAssessmentRubricsAction()
      ]);
      if (stuRes.success && stuRes.students) {
        setStudents(stuRes.students);
        if (stuRes.students.length > 0) setSelectedStudent(stuRes.students[0]);
      }
      if (rubRes.success && rubRes.rubrics) {
        setRubrics(rubRes.rubrics);
        if (rubRes.rubrics.length > 0) setSelectedCompetency(rubRes.rubrics[0].competency_name);
      }
      setIsLoading(false);
    }
    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedCompetency) return;

    setIsSubmitting(true);
    setSubmittedNotice(null);
    const res = await record360EvaluationAction({
      student_id: selectedStudent.id,
      student_name: selectedStudent.name,
      term,
      evaluator_type: 'TEACHER',
      evaluator_name: 'Teacher Evaluation Portal',
      domain: selectedDomain as any,
      competency: selectedCompetency,
      score,
      evidence_notes: evidence
    });

    if (res.success) {
      setSubmittedNotice(`Recorded score for ${selectedStudent.name}`);
      setEvidence('');
    }
    setIsSubmitting(false);
  };

  const currentRubric = rubrics.find(r => r.competency_name === selectedCompetency);

  return (
    <div className="space-y-6 pb-12 font-sans">
      <VastuModuleBanner
        badgeText="TEACHER ASSESSMENT CONSOLE"
        title="NEP 2020 Holistic Evaluation Desk"
        description="Record observational evidence and rubric competency ratings across Cognitive, Affective, Psychomotor, and Socio-Emotional domains."
      />

      {submittedNotice && (
        <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{submittedNotice}</span>
          </div>
          <button onClick={() => setSubmittedNotice(null)} className="text-emerald-700">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Student Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-4 border-stone-200 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-600" /> Student Roster ({students.length})
            </h3>

            <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
              {students.map((stu) => (
                <button
                  key={stu.id}
                  onClick={() => setSelectedStudent(stu)}
                  className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between text-xs cursor-pointer ${
                    selectedStudent?.id === stu.id
                      ? 'bg-amber-50/80 border-amber-300 font-bold text-amber-900'
                      : 'bg-white border-stone-100 hover:border-stone-200 text-stone-700'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-stone-900">{stu.name}</p>
                    <p className="text-[10px] text-stone-400 font-mono">{stu.admission_no} • {stu.class_name}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Evaluation Console Form (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="p-5 border-stone-200 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    Evaluating: <span className="text-amber-700">{selectedStudent?.name || 'Select Student'}</span>
                  </h3>
                  <p className="text-stone-400 text-[11px] font-mono">
                    Admission No: {selectedStudent?.admission_no}
                  </p>
                </div>

                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="p-1.5 bg-stone-50 rounded-lg border border-stone-200 font-semibold"
                >
                  <option value="Term 1">Term 1 (Half Yearly)</option>
                  <option value="Term 2">Term 2 (Final)</option>
                </select>
              </div>

              {/* Domain & Competency Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Target Pedagogical Domain</label>
                  <select
                    value={selectedDomain}
                    onChange={(e) => {
                      setSelectedDomain(e.target.value);
                      const matching = rubrics.filter(r => r.domain === e.target.value);
                      if (matching.length > 0) setSelectedCompetency(matching[0].competency_name);
                    }}
                    className="w-full p-2 bg-stone-50 rounded-xl border border-stone-200 font-semibold text-stone-800"
                  >
                    <option value="COGNITIVE">Cognitive & Inquiry</option>
                    <option value="AFFECTIVE">Affective & Empathy</option>
                    <option value="PSYCHOMOTOR">Psychomotor & Health</option>
                    <option value="SOCIO_EMOTIONAL">Socio-Emotional (SEL)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Competency Rubric</label>
                  <select
                    value={selectedCompetency}
                    onChange={(e) => setSelectedCompetency(e.target.value)}
                    className="w-full p-2 bg-stone-50 rounded-xl border border-stone-200 font-semibold text-stone-800"
                  >
                    {rubrics
                      .filter(r => r.domain === selectedDomain)
                      .map(r => (
                        <option key={r.id} value={r.competency_name}>
                          {r.competency_name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Rubric Descriptor Assistance */}
              {currentRubric && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <span className="font-bold text-stone-600 block text-[11px] uppercase tracking-wider">
                    Rubric Descriptors for {currentRubric.competency_name}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {currentRubric.descriptors?.map((d: any) => (
                      <button
                        key={d.level}
                        type="button"
                        onClick={() => setScore(d.level)}
                        className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                          score === d.level
                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                            : 'bg-white border-stone-200 hover:bg-stone-100 text-stone-700'
                        }`}
                      >
                        <div className="font-bold">Level {d.level}</div>
                        <div className="text-[10px] opacity-90 truncate">{d.title}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Observational Evidence */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Qualitative Observational Evidence / Anecdotal Remarks
                </label>
                <textarea
                  rows={3}
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  placeholder="Record specific instances, project work observations, or collaborative milestones..."
                  className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || !selectedStudent}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Recording...' : 'Commit Evaluation to Record'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

      </div>
    </div>
  );
}
