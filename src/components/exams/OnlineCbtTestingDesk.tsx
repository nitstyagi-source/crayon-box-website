"use client";

import React, { useState, useEffect } from 'react';
import {
  Monitor,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Lock,
  Maximize2,
  RefreshCw,
  Eye,
  Flag,
  FileCheck,
  ArrowRight,
  ArrowLeft,
  X,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  AlertOctagon
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  getCbtTemplatesAction,
  getCbtProctorStreamAction,
  recordCbtViolationAction,
  submitCbtExamAction,
  CbtExamTemplate,
  CbtProctorSession,
  CbtQuestion
} from '@/app/actions/cbt-exam-actions';

const DEFAULT_QUESTIONS: CbtQuestion[] = [
  {
    id: 'q1',
    question_number: 1,
    section: 'Section A (Multiple Choice)',
    question_text: 'A spherical mirror and a thin spherical lens have each a focal length of -15 cm. The mirror and the lens are likely to be:',
    options: ['Both concave', 'Both convex', 'The mirror is concave and the lens is convex', 'The mirror is convex, but the lens is concave'],
    correct_option: 0,
    marks: 1
  },
  {
    id: 'q2',
    question_number: 2,
    section: 'Section A (Multiple Choice)',
    question_text: 'Which of the following represents the balanced chemical equation for the reaction of iron with steam?',
    options: [
      '2Fe + 3H2O -> Fe2O3 + 3H2',
      '3Fe + 4H2O -> Fe3O4 + 4H2',
      'Fe + H2O -> FeO + H2',
      '3Fe + 2H2O -> Fe3O2 + 2H2'
    ],
    correct_option: 1,
    marks: 1
  },
  {
    id: 'q3',
    question_number: 3,
    section: 'Section A (Multiple Choice)',
    question_text: 'The electrical resistivity of a given metallic wire depends upon:',
    options: ['Its length', 'Its thickness', 'Its shape', 'Nature of the material'],
    correct_option: 3,
    marks: 1
  },
  {
    id: 'q4',
    question_number: 4,
    section: 'Section B (Assertion & Reasoning)',
    question_text: 'Assertion (A): The inner lining of the small intestine has numerous finger-like projections called villi.\nReason (R): The villi increase the surface area for absorption of digested food.',
    options: [
      'Both (A) and (R) are true and (R) is the correct explanation of (A)',
      'Both (A) and (R) are true but (R) is NOT the correct explanation of (A)',
      '(A) is true but (R) is false',
      '(A) is false but (R) is true'
    ],
    correct_option: 0,
    marks: 2
  },
  {
    id: 'q5',
    question_number: 5,
    section: 'Section B (Assertion & Reasoning)',
    question_text: 'A wire of resistance R is cut into five equal pieces. These pieces are then connected in parallel. If the equivalent resistance is R\', the ratio R/R\' is:',
    options: ['1/25', '1/5', '5', '25'],
    correct_option: 3,
    marks: 2
  }
];

const DEFAULT_TEMPLATES: CbtExamTemplate[] = [
  {
    id: 'cbt-cbse-10-sci',
    title: 'CBSE Class 10 Science Term-2 Standard CBT Mock',
    subject: 'Science',
    grade: 'Class 10',
    exam_type: 'CBSE_BOARD_MOCK',
    duration_minutes: 120,
    total_marks: 80,
    is_lockdown_enabled: true,
    questions: DEFAULT_QUESTIONS
  },
  {
    id: 'cbt-jee-main-phy',
    title: 'JEE Main All India CBT Diagnostic Assessment - Mechanics & Optics',
    subject: 'Physics',
    grade: 'Class 12',
    exam_type: 'JEE_MAIN',
    duration_minutes: 180,
    total_marks: 100,
    is_lockdown_enabled: true,
    questions: DEFAULT_QUESTIONS
  },
  {
    id: 'cbt-cbse-10-math',
    title: 'CBSE Class 10 Standard Mathematics Digital Benchmark',
    subject: 'Mathematics',
    grade: 'Class 10',
    exam_type: 'CBSE_BOARD_MOCK',
    duration_minutes: 120,
    total_marks: 80,
    is_lockdown_enabled: true,
    questions: DEFAULT_QUESTIONS
  }
];

const DEFAULT_SESSIONS: CbtProctorSession[] = [
  {
    id: 'sess-1',
    student_name: 'Aarav Sharma',
    admission_no: 'CBS-2024-0012',
    status: 'IN_PROGRESS',
    answered_count: 4,
    total_questions: 5,
    tab_switch_violations: 0,
    fullscreen_violations: 0,
    time_remaining_sec: 4320
  },
  {
    id: 'sess-2',
    student_name: 'Ananya Verma',
    admission_no: 'CBS-2024-0018',
    status: 'FLAGGED',
    answered_count: 2,
    total_questions: 5,
    tab_switch_violations: 2,
    fullscreen_violations: 1,
    time_remaining_sec: 4100
  },
  {
    id: 'sess-3',
    student_name: 'Ishaan Patel',
    admission_no: 'CBS-2024-0024',
    status: 'SUBMITTED',
    answered_count: 5,
    total_questions: 5,
    tab_switch_violations: 0,
    fullscreen_violations: 0,
    time_remaining_sec: 0,
    current_score: 7
  },
  {
    id: 'sess-4',
    student_name: 'Priya Nair',
    admission_no: 'CBS-2024-0031',
    status: 'IN_PROGRESS',
    answered_count: 5,
    total_questions: 5,
    tab_switch_violations: 0,
    fullscreen_violations: 0,
    time_remaining_sec: 3950
  }
];

export function OnlineCbtTestingDesk() {
  const [viewMode, setViewMode] = useState<'PROCTOR_CENTER' | 'STUDENT_TEST_RUNNER'>('PROCTOR_CENTER');
  const [templates, setTemplates] = useState<CbtExamTemplate[]>(DEFAULT_TEMPLATES);
  const [activeTemplate, setActiveTemplate] = useState<CbtExamTemplate | null>(DEFAULT_TEMPLATES[0]);
  const [proctorSessions, setProctorSessions] = useState<CbtProctorSession[]>(DEFAULT_SESSIONS);
  const [isLoading, setIsLoading] = useState(false);

  // Student Test Runner States
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Record<string, boolean>>({ q1: true });
  const [remainingSeconds, setRemainingSeconds] = useState(7200); // 2 hours
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [activeViolationAlert, setActiveViolationAlert] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any | null>(null);

  useEffect(() => {
    getCbtTemplatesAction().then((res) => {
      if (res.success && res.templates.length > 0) {
        setTemplates(res.templates);
        setActiveTemplate(res.templates[0]);
        getCbtProctorStreamAction(res.templates[0].id).then((pRes) => {
          if (pRes.success) setProctorSessions(pRes.sessions);
          setIsLoading(false);
        });
      }
    });
  }, []);

  // Timer countdown in test runner
  useEffect(() => {
    if (viewMode !== 'STUDENT_TEST_RUNNER' || testResult) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [viewMode, testResult]);

  // Tab switch & focus loss detection
  useEffect(() => {
    if (viewMode !== 'STUDENT_TEST_RUNNER' || testResult) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolationCount((v) => {
          const nextV = v + 1;
          setActiveViolationAlert(`Proctor Alert: Tab switch detected (Strike ${nextV}/3). Background windows are prohibited during CBT.`);
          recordCbtViolationAction('sess-active', 'TAB_SWITCH');
          return nextV;
        });
      }
    };

    const handleWindowBlur = () => {
      // Focus lost
      setViolationCount((v) => {
        const nextV = v + 1;
        setActiveViolationAlert(`Proctor Alert: Window focus lost (Strike ${nextV}/3). Return to examination canvas.`);
        return nextV;
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [viewMode, testResult]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleNext = () => {
    if (!activeTemplate) return;
    if (currentQuestionIdx < activeTemplate.questions.length - 1) {
      const nextIdx = currentQuestionIdx + 1;
      setCurrentQuestionIdx(nextIdx);
      const nextQId = activeTemplate.questions[nextIdx].id;
      setVisitedQuestions((prev) => ({ ...prev, [nextQId]: true }));
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    }
  };

  const handleMarkReview = () => {
    if (!activeTemplate) return;
    const currentQ = activeTemplate.questions[currentQuestionIdx];
    setMarkedForReview((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
    handleNext();
  };

  const handleClear = () => {
    if (!activeTemplate) return;
    const currentQ = activeTemplate.questions[currentQuestionIdx];
    setSelectedAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
  };

  const handleSubmitTest = async () => {
    if (!activeTemplate) return;
    const res = await submitCbtExamAction(activeTemplate.id, selectedAnswers);
    if (res.success) {
      setTestResult(res);
    }
  };

  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* View Switcher Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8DFC8]/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-800">
              <Monitor className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-serif font-bold text-stone-900">
              Computer-Based Testing (CBT) & Browser Lockdown Engine
            </h2>
          </div>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl">
            NTA/CBSE standard digital testing environment with hardware browser lockdown, anti-tab switch detection, live proctoring stream, and automated scoring passback.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'PROCTOR_CENTER' ? (
            <Button
              onClick={() => {
                setViewMode('STUDENT_TEST_RUNNER');
                setRemainingSeconds(7200);
                setTestResult(null);
                setViolationCount(0);
                setSelectedAnswers({});
              }}
              className="bg-amber-700 hover:bg-amber-800 text-white text-xs gap-1.5 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Launch Student CBT Sandbox
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setViewMode('PROCTOR_CENTER')}
              className="border-[#E8DFC8] text-xs text-stone-700 hover:bg-stone-50 gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Proctor Command Center
            </Button>
          )}
        </div>
      </div>

      {/* VIEW 1: PROCTOR COMMAND CENTER */}
      {viewMode === 'PROCTOR_CENTER' && (
        <div className="space-y-6">
          {/* Active Assessments Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map((tpl) => (
              <Card
                key={tpl.id}
                onClick={() => setActiveTemplate(tpl)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                  activeTemplate?.id === tpl.id
                    ? 'border-amber-500 bg-amber-500/[0.04] shadow-md ring-1 ring-amber-400'
                    : 'border-[#E8DFC8] bg-white hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                    {tpl.exam_type}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    <ShieldCheck className="w-3 h-3" /> Lockdown ON
                  </span>
                </div>
                <h3 className="text-sm font-bold text-stone-900 mt-2 line-clamp-1">{tpl.title}</h3>
                <div className="mt-3 flex items-center justify-between text-xs text-stone-500">
                  <span>{tpl.subject} • {tpl.grade}</span>
                  <span>{tpl.duration_minutes} Mins • {tpl.total_marks} Marks</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Live Proctor Grid */}
          <div className="bg-white rounded-2xl border border-[#E8DFC8] p-5 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DFC8]/60">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-stone-900">
                  Live Proctor Supervision Stream ({proctorSessions.length} Candidates Active)
                </h3>
              </div>
              <span className="text-xs text-stone-500">
                Exam: <span className="font-semibold text-stone-800">{activeTemplate?.title}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {proctorSessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-4 rounded-xl border transition-all ${
                    session.status === 'FLAGGED'
                      ? 'border-rose-300 bg-rose-50/50'
                      : session.status === 'SUBMITTED'
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-[#E8DFC8] bg-[#FAF7F2]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">{session.student_name}</span>
                    {session.status === 'FLAGGED' ? (
                      <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Flag className="w-3 h-3" /> FLAGGED
                      </span>
                    ) : session.status === 'SUBMITTED' ? (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> DONE
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Eye className="w-3 h-3" /> TESTING
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-stone-500 mt-1">{session.admission_no}</div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] text-stone-600 mb-1">
                      <span>Answered {session.answered_count}/{session.total_questions}</span>
                      <span>{Math.round((session.answered_count / session.total_questions) * 100)}%</span>
                    </div>
                    <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-600 h-full rounded-full transition-all"
                        style={{ width: `${(session.answered_count / session.total_questions) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Lockdown Violation Indicators */}
                  <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-stone-500">Integrity Strikes:</span>
                    <span
                      className={`font-bold ${
                        session.tab_switch_violations > 0 ? 'text-rose-700' : 'text-stone-700'
                      }`}
                    >
                      {session.tab_switch_violations} Tab Switches
                    </span>
                  </div>

                  {session.status === 'FLAGGED' && (
                    <div className="mt-2 text-[10px] text-rose-800 bg-rose-100/70 p-1.5 rounded-md">
                      ⚠️ 2 window focus losses detected. Proctor notified.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: STUDENT CBT TEST RUNNER & BROWSER LOCKDOWN SIMULATOR */}
      {viewMode === 'STUDENT_TEST_RUNNER' && activeTemplate && (
        <div className="bg-stone-900 text-stone-100 rounded-2xl border border-stone-800 overflow-hidden shadow-2xl">
          {/* Test Header Bar */}
          <div className="bg-stone-950 px-6 py-3 border-b border-stone-800 flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                {activeTemplate.exam_type} • OFFICIAL NTA BENCHMARK
              </span>
              <h2 className="text-base font-bold text-white">{activeTemplate.title}</h2>
            </div>

            <div className="flex items-center gap-4">
              {/* Countdown Timer */}
              <div className="flex items-center gap-2 bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-800">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-sm font-bold text-amber-400">
                  {formatTimer(remainingSeconds)}
                </span>
              </div>

              {/* Fullscreen Lockdown Switch */}
              <Button
                size="sm"
                variant="outline"
                onClick={toggleFullscreen}
                className="border-stone-700 bg-stone-800 text-stone-300 hover:text-white text-xs gap-1.5"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Lockdown'}
              </Button>
            </div>
          </div>

          {/* Violation Banner Alert if triggered */}
          {activeViolationAlert && (
            <div className="bg-rose-950/80 border-b border-rose-800 p-3 px-6 flex items-center justify-between text-xs text-rose-200">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{activeViolationAlert}</span>
              </div>
              <button
                onClick={() => setActiveViolationAlert(null)}
                className="text-rose-400 hover:text-white text-xs underline ml-4"
              >
                Dismiss Warning
              </button>
            </div>
          )}

          {testResult ? (
            /* Result Screen */
            <div className="p-8 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif font-bold text-white">Assessment Submitted Successfully</h3>
              <p className="text-xs text-stone-400">
                Scores have been verified by the Computer-Based Testing proctor engine and synced to the scholastic gradebook.
              </p>

              <div className="bg-stone-800 p-4 rounded-xl border border-stone-700 flex justify-around text-center">
                <div>
                  <div className="text-[11px] text-stone-400">Score Earned</div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {testResult.totalScore} / {testResult.maxScore}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-stone-400">Percentage</div>
                  <div className="text-2xl font-bold text-white">{testResult.percentage}%</div>
                </div>
                <div>
                  <div className="text-[11px] text-stone-400">Integrity Strikes</div>
                  <div className={`text-2xl font-bold ${violationCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {violationCount}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setViewMode('PROCTOR_CENTER')}
                className="bg-amber-600 hover:bg-amber-700 text-white w-full text-xs"
              >
                Return to Proctor Command Center
              </Button>
            </div>
          ) : (
            /* Main Test Canvas Grid */
            <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[520px]">
              {/* Question & Options Pane */}
              <div className="lg:col-span-3 p-6 border-r border-stone-800 flex flex-col justify-between">
                {(() => {
                  const q = activeTemplate.questions[currentQuestionIdx];
                  const isAnswered = selectedAnswers[q.id] !== undefined;

                  return (
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                        <span className="text-xs font-bold text-stone-400">
                          {q.section} • Marks: +{q.marks}, -0
                        </span>
                        <span className="text-xs text-amber-400 font-mono">
                          Question {currentQuestionIdx + 1} of {activeTemplate.questions.length}
                        </span>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm md:text-base font-medium text-stone-100 whitespace-pre-line leading-relaxed">
                          {q.question_text}
                        </h4>

                        <div className="mt-6 space-y-3">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = selectedAnswers[q.id] === oIdx;
                            return (
                              <button
                                key={oIdx}
                                onClick={() => handleSelectOption(q.id, oIdx)}
                                className={`w-full text-left p-3.5 rounded-xl border text-xs md:text-sm flex items-center gap-3 transition-all ${
                                  isSelected
                                    ? 'border-amber-500 bg-amber-500/15 text-white font-medium ring-1 ring-amber-500'
                                    : 'border-stone-800 bg-stone-800/40 text-stone-300 hover:bg-stone-800 hover:text-white'
                                }`}
                              >
                                <span
                                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 border ${
                                    isSelected
                                      ? 'border-amber-400 bg-amber-500 text-stone-950'
                                      : 'border-stone-700 text-stone-400'
                                  }`}
                                >
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Question Navigation Controls */}
                <div className="pt-6 border-t border-stone-800 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrev}
                      disabled={currentQuestionIdx === 0}
                      className="border-stone-700 bg-stone-800 text-stone-300 text-xs"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClear}
                      className="border-stone-700 bg-stone-800 text-stone-400 text-xs hover:text-white"
                    >
                      Clear Response
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMarkReview}
                      className="border-purple-800/60 bg-purple-950/30 text-purple-300 text-xs hover:bg-purple-900/40"
                    >
                      Mark for Review & Next
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleNext}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                    >
                      Save & Next <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmitTest}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs"
                    >
                      Submit Test
                    </Button>
                  </div>
                </div>
              </div>

              {/* Question Palette Sidebar */}
              <div className="p-5 bg-stone-950 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider pb-3 border-b border-stone-800">
                    Question Palette
                  </h4>

                  {/* Status Legend */}
                  <div className="grid grid-cols-2 gap-2 my-4 text-[10px] text-stone-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-500" /> Answered
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-500" /> Not Answered
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-purple-500" /> Marked Review
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-stone-700" /> Not Visited
                    </div>
                  </div>

                  {/* Question Grid */}
                  <div className="grid grid-cols-5 gap-2">
                    {activeTemplate.questions.map((q, idx) => {
                      const isAnswered = selectedAnswers[q.id] !== undefined;
                      const isReview = markedForReview[q.id];
                      const isVisited = visitedQuestions[q.id];
                      const isCurrent = idx === currentQuestionIdx;

                      let badgeClass = 'bg-stone-800 text-stone-400 border-stone-700';
                      if (isReview) badgeClass = 'bg-purple-600 text-white border-purple-500';
                      else if (isAnswered) badgeClass = 'bg-emerald-600 text-white border-emerald-500';
                      else if (isVisited) badgeClass = 'bg-rose-600 text-white border-rose-500';

                      return (
                        <button
                          key={q.id}
                          onClick={() => {
                            setCurrentQuestionIdx(idx);
                            setVisitedQuestions((prev) => ({ ...prev, [q.id]: true }));
                          }}
                          className={`w-9 h-9 rounded-lg text-xs font-bold flex items-center justify-center border transition-all ${badgeClass} ${
                            isCurrent ? 'ring-2 ring-amber-400 scale-105' : ''
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-800 text-[11px] text-stone-500">
                  Candidate: <span className="text-stone-300">Aarav Sharma (CBS-2024-0012)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
