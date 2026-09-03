"use client";

import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Sliders, CheckCircle2, FileText, Download, Printer } from 'lucide-react';
import {
  getBloomsQuestionBankAction,
  generateBloomsExamPaperAction,
  getPublishedQuestionPapersAction
} from '@/app/actions/blooms-test-builder-actions';

export const BloomsTestBuilderStudio: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [publishedPapers, setPublishedPapers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPaper, setGeneratedPaper] = useState<any | null>(null);

  // Configuration sliders
  const [title, setTitle] = useState('Mid-Term Diagnostic Assessment 2026');
  const [gradeLevel, setGradeLevel] = useState('Class 4');
  const [subjectName, setSubjectName] = useState('Science');
  const [totalMarks, setTotalMarks] = useState(25);
  const [durationMinutes, setDurationMinutes] = useState(45);

  const [dist, setDist] = useState({
    remembering: 20,
    understanding: 30,
    applying: 30,
    analyzing: 20
  });

  useEffect(() => {
    loadData();
  }, [gradeLevel, subjectName]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [qRes, pRes] = await Promise.all([
        getBloomsQuestionBankAction(gradeLevel, subjectName),
        getPublishedQuestionPapersAction()
      ]);
      if (qRes.success) setQuestions(qRes.questions);
      if (pRes.success) setPublishedPapers(pRes.papers);
    } finally {
      setIsLoading(false);
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await generateBloomsExamPaperAction({
        title,
        gradeLevel,
        subjectName,
        totalMarks,
        durationMinutes,
        distribution: dist
      });
      if (res.success) {
        setGeneratedPaper(res);
        await loadData();
      } else {
        alert(res.error || 'Failed to generate paper');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* HUD Ribbon */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" />
            <span>CBSE NEP-2020 Cognitive Domain Framework</span>
          </div>
          <h2 className="text-xl font-bold text-stone-900">Bloom's Taxonomy Question Paper &amp; Rubric Studio</h2>
          <p className="text-xs text-stone-500 mt-0.5">Automated test blueprinting across Remembering, Understanding, Applying, and Analyzing levels.</p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-2 bg-purple-50 border border-purple-200 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-purple-700 block">Bank Size</span>
            <strong className="text-purple-950 font-bold text-sm">{questions.length} Questions</strong>
          </div>
          <div className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Papers Built</span>
            <strong className="text-stone-900 font-bold text-sm">{publishedPapers.length} Papers</strong>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Blueprint Controls */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-sm font-bold text-stone-900">Assessment Blueprint Controls</h3>
            <p className="text-[11px] text-stone-400">Configure cognitive distribution weights</p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-stone-500 font-bold mb-1">Assessment Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-500 font-bold mb-1">Subject</label>
                <select
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                >
                  <option value="Science">Science</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>
              <div>
                <label className="block text-stone-500 font-bold mb-1">Grade</label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                >
                  <option value="Class 4">Class 4</option>
                  <option value="Class 5">Class 5</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 space-y-2.5">
              <span className="text-[11px] font-black uppercase text-stone-400 block">Cognitive Proportions</span>
              
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-blue-700 font-bold">1. Remembering (Knowledge)</span>
                  <span className="font-mono">{dist.remembering}%</span>
                </div>
                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full" style={{ width: `${dist.remembering}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-emerald-700 font-bold">2. Understanding (Comprehension)</span>
                  <span className="font-mono">{dist.understanding}%</span>
                </div>
                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${dist.understanding}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-amber-700 font-bold">3. Applying (Problem Solving)</span>
                  <span className="font-mono">{dist.applying}%</span>
                </div>
                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full" style={{ width: `${dist.applying}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-purple-700 font-bold">4. Analyzing (Critical Thinking)</span>
                  <span className="font-mono">{dist.analyzing}%</span>
                </div>
                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full" style={{ width: `${dist.analyzing}%` }} />
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Compiling Blueprint...' : 'Generate CBSE Exam Paper'}</span>
            </button>
          </div>
        </div>

        {/* Right 2 Cols: Question Paper Canvas */}
        <div className="lg:col-span-2 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Generated Examination Paper &amp; Marking Rubric</h3>
              <p className="text-[11px] text-stone-400">Ready for print and digital LMS delivery</p>
            </div>
            {generatedPaper && (
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print PDF
              </button>
            )}
          </div>

          {generatedPaper ? (
            <div className="p-6 border border-stone-200 rounded-xl bg-stone-50/40 space-y-6 animate-in fade-in duration-300">
              {/* Paper Masthead */}
              <div className="text-center border-b border-stone-200 pb-4">
                <h4 className="font-serif font-black text-lg text-stone-900 uppercase">Crayon Box School</h4>
                <p className="text-xs font-bold text-stone-700">{generatedPaper.title}</p>
                <div className="flex justify-center gap-4 text-[11px] text-stone-500 mt-1">
                  <span>Subject: {subjectName}</span>
                  <span>•</span>
                  <span>Grade: {gradeLevel}</span>
                  <span>•</span>
                  <span>Total Marks: {generatedPaper.totalMarks}</span>
                  <span>•</span>
                  <span>Duration: {durationMinutes} Mins</span>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {generatedPaper.questions.map((q: any, idx: number) => (
                  <div key={idx} className="p-3.5 bg-white border border-stone-200/80 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex gap-2 items-start">
                        <span className="font-bold text-stone-900">{idx + 1}.</span>
                        <p className="text-stone-800 leading-relaxed">{q.question_text}</p>
                      </div>
                      <span className="font-mono font-bold text-stone-500 shrink-0">[{q.marks} Mark{q.marks > 1 ? 's' : ''}]</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-stone-100 text-[10px]">
                      <span className="px-2 py-0.5 rounded-full font-bold bg-stone-100 text-stone-600">
                        Level: {q.blooms_level}
                      </span>
                      <span className="text-stone-400">Chapter: {q.chapter_name}</span>
                    </div>

                    <div className="p-2 bg-stone-50 rounded-lg text-[10px] text-stone-600">
                      <strong>Sample Answer / Key:</strong> {q.sample_answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-xs text-stone-400 border border-dashed border-stone-200 rounded-xl">
              Click &quot;Generate CBSE Exam Paper&quot; to compile questions matching Bloom&apos;s Taxonomy distribution.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
