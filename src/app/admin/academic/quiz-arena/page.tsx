"use client";

import React, { useState, useEffect } from "react";
import {
  Gamepad2,
  Trophy,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Award,
  BookOpen,
  Users,
  Flame,
  ArrowRight
} from "lucide-react";
import {
  createAiChapterQuizAction,
  getStudentQuizListAction,
  QuizItem
} from "@/app/actions/quiz-arena-actions";

export default function InteractiveQuizArenaPage() {
  const [selectedClass, setSelectedClass] = useState("Class 4");
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [activeTab, setActiveTab] = useState<"arena" | "creator" | "leaderboard">("arena");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Active Quiz Playing State
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Creator State
  const [createSubject, setCreateSubject] = useState("Science & Nature");
  const [createChapter, setCreateChapter] = useState("Solar System & Planetary Motion");

  // Leaderboard Roster
  const leaderboard = [
    { rank: 1, name: "Aarav Sharma", score: "980 pts", badge: "🏆 Math Wizard", accuracy: "98%" },
    { rank: 2, name: "Ananya Verma", score: "940 pts", badge: "🌟 Science Prodigy", accuracy: "94%" },
    { rank: 3, name: "Kabir Mehta", score: "890 pts", badge: "🚀 Fast Thinker", accuracy: "89%" },
    { rank: 4, name: "Riya Kapoor", score: "850 pts", badge: "⭐ Rising Star", accuracy: "85%" }
  ];

  useEffect(() => {
    loadQuizzes();
  }, [selectedClass]);

  async function loadQuizzes() {
    setIsLoading(true);
    try {
      const res = await getStudentQuizListAction(selectedClass);
      if (res.success && res.quizzes.length > 0) {
        setQuizzes(res.quizzes);
        if (!activeQuiz) {
          setActiveQuiz(res.quizzes[0]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateQuiz(e: React.FormEvent) {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await createAiChapterQuizAction({
        className: selectedClass,
        subjectName: createSubject,
        chapterName: createChapter
      });
      if (res.success) {
        alert(res.message);
        loadQuizzes();
        setActiveTab("arena");
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  function handleSelectAnswer(idx: number) {
    if (answered) return;
    setSelectedOption(idx);
    setAnswered(true);

    const questions = activeQuiz?.questions_data || [];
    const curr = questions[currentQIndex];
    if (idx === curr.correct) {
      setScore(prev => prev + 100);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  }

  function handleNextQuestion() {
    const questions = activeQuiz?.questions_data || [];
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setAnswered(false);
    } else {
      setQuizFinished(true);
    }
  }

  function handleRestartQuiz() {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setAnswered(false);
    setScore(0);
    setStreak(0);
    setQuizFinished(false);
  }

  const questions = activeQuiz?.questions_data || [];
  const currentQ = questions[currentQIndex] || {
    q: "Loading question...",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correct: 0,
    exp: "Explanation"
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 bg-stone-50/50 min-h-screen text-stone-900">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-950 via-orange-950 to-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            AI Gamified Learning Arena &amp; Subject Mastery Badges
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-amber-400" />
            Interactive Student Quiz &amp; Olympiad Arena
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/80 max-w-2xl">
            Timed chapter quizzes with instant explanation popups, streak bonuses, and live class mastery leaderboards.
          </p>
        </div>

        {/* Live Score Display */}
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/15 text-xs">
          <div className="text-center">
            <div className="text-stone-300 font-bold">Arena Score</div>
            <div className="text-xl font-black font-mono text-amber-300">{score} pts</div>
          </div>
          <div className="border-l border-white/20 pl-4 text-center">
            <div className="text-stone-300 font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" /> Streak
            </div>
            <div className="text-xl font-black font-mono text-orange-400">{streak}x</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 space-x-2 sm:space-x-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("arena")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "arena"
              ? "border-amber-600 text-amber-950"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          🎮 Live Quiz Arena
        </button>

        <button
          onClick={() => setActiveTab("creator")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "creator"
              ? "border-amber-600 text-amber-950"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Zap className="w-4 h-4" />
          ⚡ AI Chapter Quiz Creator
        </button>

        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "leaderboard"
              ? "border-amber-600 text-amber-950"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Trophy className="w-4 h-4" />
          🏆 Class Mastery Leaderboard
        </button>
      </div>

      {/* TAB 1: LIVE ARENA */}
      {activeTab === "arena" && (
        <div className="max-w-3xl mx-auto space-y-6">
          {quizFinished ? (
            /* Quiz Completed Screen */
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-xl text-center space-y-5 animate-in fade-in">
              <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto border-2 border-amber-300">
                <Trophy className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-black text-stone-900">Quiz Completed! Great Job! 🎉</h2>
                <p className="text-xs text-stone-500">
                  You scored <strong>{score} Points</strong> with a peak streak of <strong>{streak}x</strong>!
                </p>
              </div>

              <div className="inline-block bg-amber-50 text-amber-900 px-4 py-2 rounded-2xl border border-amber-200 text-xs font-black">
                🏅 Awarded: Science Concept Master Badge
              </div>

              <div>
                <button
                  onClick={handleRestartQuiz}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Play Again / Practice More
                </button>
              </div>
            </div>
          ) : (
            /* Live Question Card */
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xl space-y-6">
              
              {/* Question Header */}
              <div className="flex justify-between items-center border-b border-stone-200 pb-3 text-xs">
                <span className="font-mono font-bold text-amber-900">
                  Question {currentQIndex + 1} of {questions.length}
                </span>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  {activeQuiz?.chapter_name || "Chapter Quiz"}
                </span>
              </div>

              {/* Question Text */}
              <h3 className="text-base sm:text-lg font-black text-stone-900 leading-snug">
                {currentQ.q}
              </h3>

              {/* Options Grid */}
              <div className="space-y-3 text-xs">
                {currentQ.options?.map((opt: string, idx: number) => {
                  let btnStyle = "bg-stone-50 border-stone-200 text-stone-900 hover:border-amber-400";
                  if (answered) {
                    if (idx === currentQ.correct) {
                      btnStyle = "bg-emerald-100 border-emerald-500 text-emerald-950 font-bold shadow-xs";
                    } else if (selectedOption === idx) {
                      btnStyle = "bg-rose-100 border-rose-500 text-rose-950 font-bold";
                    } else {
                      btnStyle = "bg-stone-50/50 border-stone-100 text-stone-400";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(idx)}
                      disabled={answered}
                      className={`w-full p-4 rounded-2xl border text-left font-medium transition flex items-center justify-between ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-white border border-stone-300 flex items-center justify-center font-bold text-[11px] shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {answered && idx === currentQ.correct && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {answered && selectedOption === idx && idx !== currentQ.correct && (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant Explanation Popup */}
              {answered && (
                <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 text-xs space-y-1 text-amber-950 animate-in fade-in">
                  <div className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Explanation / Key Concept:
                  </div>
                  <p className="leading-relaxed">{currentQ.exp}</p>
                </div>
              )}

              {/* Next Button */}
              {answered && (
                <button
                  onClick={handleNextQuestion}
                  className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
                >
                  <span>{currentQIndex + 1 < questions.length ? "Next Question" : "Finish Quiz & View Score"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

            </div>
          )}
        </div>
      )}

      {/* TAB 2: AI CREATOR */}
      {activeTab === "creator" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-5 max-w-2xl mx-auto">
          <div>
            <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600" />
              AI Chapter Quiz Generator
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Enter any NCERT subject and chapter to auto-generate timed interactive MCQs with pedagogical explanations.
            </p>
          </div>

          <form onSubmit={handleCreateQuiz} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Subject</label>
              <input
                type="text"
                value={createSubject}
                onChange={(e) => setCreateSubject(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                required
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Chapter / Concept Name</label>
              <input
                type="text"
                value={createChapter}
                onChange={(e) => setCreateChapter(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl shadow-sm transition active:scale-98 flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              ⚡ Generate Interactive Chapter Quiz
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: LEADERBOARD */}
      {activeTab === "leaderboard" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Class 4 Science &amp; Math Olympiad Leaderboard
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Top student performers ranked by quiz accuracy and streak points.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {leaderboard.map((user) => (
              <div
                key={user.rank}
                className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                    user.rank === 1 ? "bg-amber-400 text-stone-950" : user.rank === 2 ? "bg-slate-300 text-stone-950" : "bg-stone-200 text-stone-700"
                  }`}>
                    {user.rank}
                  </div>
                  <div>
                    <strong className="text-stone-900 text-sm font-black">{user.name}</strong>
                    <div className="text-[11px] text-stone-500 font-bold">{user.badge}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black font-mono text-amber-900">{user.score}</div>
                  <div className="text-[10px] text-emerald-700 font-bold">{user.accuracy} Accuracy</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
