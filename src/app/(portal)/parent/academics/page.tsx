"use client";

import { useSiblingContext } from "@/components/providers/SiblingProvider";
import { BookOpen, FileText, Download, CheckCircle2, Circle, Clock, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export default function AcademicsHub() {
  const { activeSibling } = useSiblingContext();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-900">Academics & Performance</h1>
        <p className="text-sm text-slate-500">Track homework, assignments, and grades for <span className="font-bold text-primary">{activeSibling?.firstName}</span>.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Homework Kanban */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /> Active Assignments</h2>
          </div>

          <div className="space-y-4">
            {/* To Do */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex justify-between items-start mb-3">
                <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Due Tomorrow
                </span>
                <span className="text-xs font-bold text-slate-400">Mathematics</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Fractions Worksheet 4B</h3>
              <p className="text-xs text-slate-500 mb-4">Complete problems 1 through 15 on page 42.</p>
              
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-primary transition-colors cursor-pointer group">
                <UploadIcon className="w-5 h-5 text-slate-400 group-hover:text-primary mb-1 transition-colors" />
                <span className="text-xs font-bold text-slate-600 group-hover:text-primary transition-colors">Drag & drop completed PDF here</span>
              </div>
            </div>

            {/* Submitted */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 opacity-75">
              <div className="flex justify-between items-start mb-3">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                  <Circle className="w-3 h-3" fill="currentColor" /> Submitted
                </span>
                <span className="text-xs font-bold text-slate-400">Science</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Photosynthesis Lab Report</h3>
              <p className="text-xs text-slate-500 mb-0">Waiting for teacher review.</p>
            </div>

            {/* Graded */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex justify-between items-start mb-3">
                <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Graded
                </span>
                <span className="text-xs font-bold text-slate-400">English</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Creative Writing Essay</h3>
              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">Grade:</span>
                <span className="text-lg font-black text-green-600">A-</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Gradebook & Report Cards */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> Term Performance</h2>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-6">Core Subjects Progress (Term 1)</h3>
            
            <div className="space-y-5 mb-8">
              {[
                { subject: "Mathematics", score: 88, color: "bg-blue-500" },
                { subject: "Science", score: 92, color: "bg-emerald-500" },
                { subject: "English", score: 85, color: "bg-indigo-500" },
                { subject: "Social Studies", score: 78, color: "bg-amber-500" }
              ].map((sub, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-xs font-bold text-slate-700">{sub.subject}</span>
                    <span className="text-xs font-black text-slate-900">{sub.score}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${sub.score}%` }} 
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className={`h-2 rounded-full ${sub.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm">
                <Download className="w-4 h-4" /> Download Digitally Signed Report Card
              </button>
              <p className="text-center text-[10px] text-slate-400 mt-3 font-medium uppercase tracking-widest">Digitally Signed by Principal</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function UploadIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
  );
}
