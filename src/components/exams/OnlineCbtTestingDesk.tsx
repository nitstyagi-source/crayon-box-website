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
  AlertOctagon,
  Users
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

const DEFAULT_QUESTIONS: CbtQuestion[] = [];


interface OnlineCbtTestingDeskProps {
  candidateName?: string;
  candidateId?: string;
}

export function OnlineCbtTestingDesk({
  candidateName,
  candidateId
}: OnlineCbtTestingDeskProps = {}) {
  const [viewMode, setViewMode] = useState<'PROCTOR_CENTER' | 'STUDENT_TEST_RUNNER'>('PROCTOR_CENTER');
  const [templates, setTemplates] = useState<CbtExamTemplate[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<CbtExamTemplate | null>(null);
  const [proctorSessions, setProctorSessions] = useState<CbtProctorSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Student Test Runner States
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Record<string, boolean>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(7200); // 2 hours
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [activeViolationAlert, setActiveViolationAlert] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any | null>(null);

  useEffect(() => {
    setIsLoading(true);
    getCbtTemplatesAction().then((res) => {
      if (res.success && res.templates && res.templates.length > 0) {
        setTemplates(res.templates);
        setActiveTemplate(res.templates[0]);
        getCbtProctorStreamAction(res.templates[0].id).then((pRes) => {
          if (pRes.success && pRes.sessions) setProctorSessions(pRes.sessions);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    }).catch(() => setIsLoading(false));
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
            Standard digital testing environment with hardware browser lockdown, anti-tab switch detection, live proctoring stream, and automated scoring passback.
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
          {isLoading ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E8DFC8] text-stone-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600" />
              <div className="text-xs font-bold text-stone-600">Loading CBT Assessments &amp; Proctor Feeds...</div>
            </div>
          ) : templates.length > 0 ? (
            /* Active Assessments Cards */
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
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E8DFC8] text-stone-400">
              <Monitor className="w-8 h-8 mx-auto mb-2 text-stone-300" />
              <div className="text-xs font-bold text-stone-600">No CBT Assessments Scheduled</div>
              <div className="text-[10px] text-stone-400 mt-0.5">Create exam templates in the Examination Hub to launch online CBT tests.</div>
            </div>
          )}

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
                Exam: <span className="font-semibold text-stone-800">{activeTemplate?.title || 'No Exam Selected'}</span>
              </span>
            </div>

            {proctorSessions && proctorSessions.length > 0 ? (
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
            ) : (
              <div className="p-8 text-center text-stone-400 border border-dashed border-[#E8DFC8] rounded-xl mt-4">
                <Users className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                <div className="text-xs font-bold text-stone-600">No active student sessions for this assessment</div>
                <div className="text-[10px] text-stone-400 mt-0.5">Students appearing for this CBT will appear in real time here.</div>
              </div>
            )}
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
                  Candidate: <span className="text-stone-300">{candidateName ? `${candidateName} (${candidateId || 'STU-ACTIVE'})` : 'Active Examinee (Session Active)'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
