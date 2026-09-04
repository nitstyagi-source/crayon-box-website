"use client";

import React, { useState, useEffect } from 'react';
import {
  Award,
  Sparkles,
  BookOpen,
  HeartHandshake,
  Activity,
  Smile,
  CheckCircle2,
  Download,
  Printer,
  Search,
  Users,
  ChevronRight,
  ShieldCheck,
  Star,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  getAssessmentRubricsAction,
  getStudentHolisticCardDataAction,
  record360EvaluationAction,
  RubricDefinition,
  Student360Evaluation
} from '@/app/actions/hpc-actions';

interface NEP2020DeskProps {
  studentsList: Array<{ id: string; name: string; admission_no: string; class_name?: string }>;
}

export function NEP2020HolisticProgressDesk({ studentsList }: NEP2020DeskProps) {
  const [rubrics, setRubrics] = useState<RubricDefinition[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(studentsList[0] || null);
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [evaluations, setEvaluations] = useState<Student360Evaluation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeEvaluatorTab, setActiveEvaluatorTab] = useState<'TEACHER' | 'SELF' | 'PEER' | 'PARENT'>('TEACHER');

  // Form State for Adding an Evaluation
  const [selectedCompetency, setSelectedCompetency] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<'COGNITIVE' | 'AFFECTIVE' | 'PSYCHOMOTOR' | 'SOCIO_EMOTIONAL'>('COGNITIVE');
  const [score, setScore] = useState<number>(3);
  const [evidence, setEvidence] = useState('');
  const [evaluatorName, setEvaluatorName] = useState('Smt. Sunita Rao (Class Teacher)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getAssessmentRubricsAction().then((res) => {
      if (res.success && res.rubrics) {
        setRubrics(res.rubrics);
        if (res.rubrics.length > 0) {
          setSelectedCompetency(res.rubrics[0].competency_name);
        }
      }
    });
  }, []);

  const loadStudentEvals = async () => {
    if (!selectedStudent) return;
    setIsLoading(true);
    const res = await getStudentHolisticCardDataAction(selectedStudent.id, selectedTerm);
    if (res.success) {
      setEvaluations(res.evaluations || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadStudentEvals();
  }, [selectedStudent, selectedTerm]);

  const handleAddEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedCompetency) return;

    setIsSubmitting(true);
    const res = await record360EvaluationAction({
      student_id: selectedStudent.id,
      student_name: selectedStudent.name,
      term: selectedTerm,
      evaluator_type: activeEvaluatorTab,
      evaluator_name: evaluatorName,
      domain: selectedDomain,
      competency: selectedCompetency,
      score,
      evidence_notes: evidence
    });

    if (res.success) {
      setEvidence('');
      await loadStudentEvals();
    }
    setIsSubmitting(false);
  };

  // Compute Domain Averages for Radar Chart or Progress Pills
  const domainScores = {
    COGNITIVE: evaluations.filter(e => e.domain === 'COGNITIVE'),
    AFFECTIVE: evaluations.filter(e => e.domain === 'AFFECTIVE'),
    PSYCHOMOTOR: evaluations.filter(e => e.domain === 'PSYCHOMOTOR'),
    SOCIO_EMOTIONAL: evaluations.filter(e => e.domain === 'SOCIO_EMOTIONAL')
  };

  const calculateAvg = (list: Student360Evaluation[]) => {
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, curr) => acc + curr.score, 0);
    return (sum / list.length).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-linear-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 p-5 rounded-2xl border border-amber-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> CBSE NEP 2020 Pedagogical Framework
          </span>
          <h2 className="text-lg font-black text-stone-900 mt-1.5">
            360-Degree Multidimensional Holistic Progress Card (HPC)
          </h2>
          <p className="text-xs text-stone-600 max-w-2xl mt-0.5">
            Transitions from rote marks to multidimensional competency tracking across Cognitive, Affective, Psychomotor & Socio-Emotional domains with Self, Peer, Teacher, and Parent voice.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="text-xs font-bold gap-1.5 bg-white shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-stone-600" /> Print Official HPC
          </Button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Student Selector & Radar Highlights (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-4 border-stone-200 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-600" /> Select Student Dossier
            </h3>
            
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {studentsList.map((stu) => (
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
                    <p className="text-[10px] text-stone-400 font-mono">{stu.admission_no}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                </button>
              ))}
            </div>
          </Card>

          {/* 4-Domain Summary */}
          <Card className="p-4 border-stone-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" /> 360° Domain Mastery
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-sky-50 border border-sky-100">
                <span className="font-semibold text-sky-900 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-sky-600" /> Cognitive Mastery
                </span>
                <span className="font-bold font-mono text-sky-950">{calculateAvg(domainScores.COGNITIVE)} / 4.0</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50 border border-rose-100">
                <span className="font-semibold text-rose-900 flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-rose-600" /> Affective & Empathy
                </span>
                <span className="font-bold font-mono text-rose-950">{calculateAvg(domainScores.AFFECTIVE)} / 4.0</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" /> Psychomotor Agility
                </span>
                <span className="font-bold font-mono text-emerald-950">{calculateAvg(domainScores.PSYCHOMOTOR)} / 4.0</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50 border border-purple-100">
                <span className="font-semibold text-purple-900 flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-purple-600" /> Socio-Emotional (SEL)
                </span>
                <span className="font-bold font-mono text-purple-950">{calculateAvg(domainScores.SOCIO_EMOTIONAL)} / 4.0</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Multi-Perspective Evaluation Entry & Stream (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Evaluator Type Switcher */}
          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl border border-stone-200">
            {(['TEACHER', 'SELF', 'PEER', 'PARENT'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveEvaluatorTab(tab);
                  if (tab === 'TEACHER') setEvaluatorName('Smt. Sunita Rao (Class Teacher)');
                  if (tab === 'SELF') setEvaluatorName(selectedStudent?.name || 'Self Evaluation');
                  if (tab === 'PEER') setEvaluatorName('Arjun Sharma (Peer Buddy)');
                  if (tab === 'PARENT') setEvaluatorName('Parent Guardian Voice');
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  activeEvaluatorTab === tab
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {tab === 'TEACHER' && '👨‍🏫 Teacher Evaluation'}
                {tab === 'SELF' && '🧒 Self Assessment'}
                {tab === 'PEER' && '🤝 Peer Review'}
                {tab === 'PARENT' && '🏡 Parent Reflection'}
              </button>
            ))}
          </div>

          {/* Evaluation Entry Box */}
          <Card className="p-4 border-stone-200 shadow-xs">
            <form onSubmit={handleAddEvaluation} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Target Domain</label>
                  <select
                    value={selectedDomain}
                    onChange={(e: any) => setSelectedDomain(e.target.value)}
                    className="w-full p-2 bg-stone-50 rounded-lg border border-stone-200 font-medium"
                  >
                    <option value="COGNITIVE">Cognitive & Inquiry</option>
                    <option value="AFFECTIVE">Affective & Inclusivity</option>
                    <option value="PSYCHOMOTOR">Psychomotor & Health</option>
                    <option value="SOCIO_EMOTIONAL">Socio-Emotional (SEL)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Competency Rubric</label>
                  <select
                    value={selectedCompetency}
                    onChange={(e) => setSelectedCompetency(e.target.value)}
                    className="w-full p-2 bg-stone-50 rounded-lg border border-stone-200 font-medium"
                  >
                    {rubrics
                      .filter(r => r.domain === selectedDomain)
                      .map(r => (
                        <option key={r.id} value={r.competency_name}>
                          {r.competency_name}
                        </option>
                      ))}
                    {rubrics.filter(r => r.domain === selectedDomain).length === 0 && (
                      <option value="General Mastery">General Mastery Descriptor</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Rubric Score Scale */}
              <div>
                <label className="font-semibold text-stone-700 block mb-1.5 text-xs">
                  Proficiency Scale (Level 1: Emerging → Level 4: Exemplary)
                </label>
                <div className="grid grid-cols-4 gap-2 text-xs text-center">
                  {[
                    { lvl: 1, title: 'Level 1: Emerging' },
                    { lvl: 2, title: 'Level 2: Developing' },
                    { lvl: 3, title: 'Level 3: Proficient' },
                    { lvl: 4, title: 'Level 4: Exemplary' }
                  ].map((s) => (
                    <button
                      key={s.lvl}
                      type="button"
                      onClick={() => setScore(s.lvl)}
                      className={`p-2 rounded-lg border font-bold transition cursor-pointer ${
                        score === s.lvl
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1 text-xs">
                  Qualitative Observational Evidence / Anecdotal Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Demonstrated critical inquiry during science group experiment on solubility."
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  className="w-full p-2 text-xs bg-stone-50 rounded-lg border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-stone-400 font-mono">
                  Evaluator: {evaluatorName}
                </span>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Recording...' : 'Commit to Student HPC'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Recorded Evaluations Stream */}
          <Card className="p-4 border-stone-200 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500" /> Recorded Competency Evidence Log ({evaluations.length})
            </h4>

            {isLoading ? (
              <p className="text-xs text-stone-400 py-6 text-center">Loading holistic portfolio data...</p>
            ) : evaluations.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">No evaluations entered for this term yet.</p>
            ) : (
              <div className="space-y-2.5">
                {evaluations.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 bg-stone-50/70 rounded-xl border border-stone-200/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          {ev.evaluator_type}
                        </span>
                        <span className="font-bold text-stone-800">{ev.competency}</span>
                        <span className="text-[11px] text-stone-400">({ev.domain})</span>
                      </div>
                      {ev.evidence_notes && (
                        <p className="text-stone-600 text-xs italic">
                          "{ev.evidence_notes}"
                        </p>
                      )}
                      <p className="text-[10px] text-stone-400 font-mono">
                        By {ev.evaluator_name} on {new Date(ev.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-1 bg-amber-500 text-white font-mono font-bold px-2 py-1 rounded-lg text-xs shadow-2xs">
                      <Star className="w-3 h-3 fill-current" /> Level {ev.score}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}
