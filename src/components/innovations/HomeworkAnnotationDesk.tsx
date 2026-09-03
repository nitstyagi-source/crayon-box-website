"use client";

import React, { useState, useEffect } from 'react';
import { PenTool, CheckCircle2, MessageSquare, Award, Sparkles, Image as ImageIcon } from 'lucide-react';
import {
  getHomeworkSubmissionsAction,
  gradeHomeworkSubmissionAction,
  submitHomeworkPhotoAction
} from '@/app/actions/homework-submission-actions';

export const HomeworkAnnotationDesk: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGrading, setIsGrading] = useState(false);

  // Grading form state
  const [marks, setMarks] = useState(5);
  const [feedback, setFeedback] = useState('Excellent handwritten clarity and neat problem presentation!');
  const [teacherName, setTeacherName] = useState('Mrs. Priya Sharma');
  const [gradeNotice, setGradeNotice] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const res = await getHomeworkSubmissionsAction();
      if (res.success && res.submissions.length > 0) {
        setSubmissions(res.submissions);
        setSelectedSub(res.submissions[0]);
      } else {
        // Provide demo submission if table empty
        const demo = [{
          id: 'sub-demo-1',
          studentName: 'Viraj Tyagi',
          admissionNo: 'ADM-2026-7983',
          photoUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=60',
          notes: 'Completed Chapter 4 Science exercise questions in class notebook.',
          status: 'SUBMITTED',
          submissionDate: new Date().toISOString()
        }];
        setSubmissions(demo);
        setSelectedSub(demo[0]);
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleSaveGrade = async () => {
    if (!selectedSub) return;
    setIsGrading(true);
    setGradeNotice(null);
    try {
      const res = await gradeHomeworkSubmissionAction({
        submissionId: selectedSub.id,
        marksObtained: marks,
        teacherFeedback: feedback,
        teacherName,
        annotations: [{ x: 45, y: 30, text: '✓ Correct Diagram', type: 'STAR' }]
      });

      if (res.success) {
        setGradeNotice(`✓ Evaluated work for ${selectedSub.studentName}. Recorded score: ${marks}/5.`);
        await loadData();
      } else {
        alert(res.error || 'Failed to grade submission');
      }
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* HUD Ribbon */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
            <PenTool className="w-4 h-4" />
            <span>Digital Notebook Assessment &amp; Feedback</span>
          </div>
          <h2 className="text-xl font-bold text-stone-900">Parent Homework Submission &amp; Annotation Desk</h2>
          <p className="text-xs text-stone-500 mt-0.5">Evaluate parent notebook photo uploads with digital ink annotations, rubrics, and feedback.</p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">Submissions Pending</span>
            <strong className="text-emerald-950 font-bold text-sm">{submissions.filter(s => s.status === 'SUBMITTED').length} Notebooks</strong>
          </div>
        </div>
      </div>

      {gradeNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{gradeNotice}</span>
        </div>
      )}

      {/* Grid: Submissions Queue & Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Queue */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-sm font-bold text-stone-900">Student Submissions</h3>
            <span className="text-[11px] text-stone-400">Class 4 • Science</span>
          </div>

          <div className="space-y-2.5">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                onClick={() => setSelectedSub(sub)}
                className={`p-3.5 rounded-xl border transition cursor-pointer space-y-1 ${
                  selectedSub?.id === sub.id
                    ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500'
                    : 'bg-stone-50 border-stone-200 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <strong className="text-stone-900 font-bold text-xs">{sub.studentName}</strong>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    sub.status === 'GRADED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {sub.status}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 truncate">{sub.notes}</p>
                <span className="text-[10px] text-stone-400 font-mono block">Roll: {sub.admissionNo}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Cols: Interactive Canvas & Teacher Feedback */}
        {selectedSub && (
          <div className="lg:col-span-2 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Notebook Work of {selectedSub.studentName}</h3>
                <p className="text-[11px] text-stone-400">{selectedSub.notes}</p>
              </div>
              <span className="font-mono text-xs font-bold text-stone-500">{selectedSub.admissionNo}</span>
            </div>

            {/* Photo Preview Canvas with simulated annotation pins */}
            <div className="relative border border-stone-200 rounded-xl overflow-hidden bg-stone-950 max-h-[340px] flex items-center justify-center">
              <img
                src={selectedSub.photoUrl}
                alt="Student Handwritten Homework"
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute top-4 left-4 bg-emerald-600/90 backdrop-blur-xs text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Teacher Verified Submission
              </div>
              <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-xs text-white px-3 py-1 rounded-full text-[10px] font-mono">
                Pencil Work Resolution: 1080p
              </div>
            </div>

            {/* Teacher Feedback & Scoring */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-500 font-bold mb-1">Marks Awarded (Out of 5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={marks}
                    onChange={(e) => setMarks(parseInt(e.target.value, 10))}
                    className="w-full p-2 bg-white border border-stone-200 rounded-lg font-bold text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 font-bold mb-1">Evaluating Faculty</label>
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    className="w-full p-2 bg-white border border-stone-200 rounded-lg font-bold text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-500 font-bold mb-1">Pedagogical Feedback for Student &amp; Parent</label>
                <textarea
                  rows={2}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-800 font-medium"
                />
              </div>

              <button
                onClick={handleSaveGrade}
                disabled={isGrading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isGrading ? 'Publishing Digital Feedback...' : 'Publish Grade & Annotation to Parent Portal'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
