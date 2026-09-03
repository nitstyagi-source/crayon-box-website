"use client";

import React, { useState } from "react";
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  User,
  Building2,
  Zap,
  RefreshCw,
  Award
} from "lucide-react";
import { runGeneticTimetableGeneratorAction } from "@/app/actions/timetable-generator-actions";

export const AlgorithmicTimetableDesk: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<any | null>(null);

  async function handleRunGeneticAlgorithm() {
    setIsGenerating(true);
    try {
      const res = await runGeneticTimetableGeneratorAction();
      if (res.success) {
        setGenerationResult(res);
      } else {
        alert(res.error || "Failed to generate timetable");
      }
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xl p-6 sm:p-8 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider bg-purple-50 text-purple-950 px-2.5 py-1 rounded-full border border-purple-200">
              Genetic Algorithm (GA) Evolutionary Engine
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
            Algorithmic Master Timetable Generator
          </h2>
          <p className="text-xs text-stone-500">
            Multi-constraint evolutionary optimization eliminating teacher clashes and balancing cognitive morning loads
          </p>
        </div>

        <button
          onClick={handleRunGeneticAlgorithm}
          disabled={isGenerating}
          className="px-5 py-2.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-white text-xs font-black transition flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>{isGenerating ? "Simulating 60 Generations..." : "Run Genetic Scheduler"}</span>
        </button>
      </div>

      {generationResult && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-emerald-700 block">Teacher Clashes</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <strong className="text-lg font-black text-emerald-950">{generationResult.clashCount} Clashes</strong>
              </div>
              <p className="text-[10px] text-emerald-700 font-semibold">100% Conflict-Free</p>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-purple-700 block">Fitness Optimization</span>
              <strong className="text-lg font-black text-purple-950">{generationResult.fitnessScore} / 1000</strong>
              <p className="text-[10px] text-purple-700">Evolutionary peak score</p>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-stone-400 block">Execution Speed</span>
              <strong className="text-lg font-black text-stone-900">{generationResult.durationMs} ms</strong>
              <p className="text-[10px] text-stone-500">Converged in {generationResult.generationsRun} generations</p>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-stone-400 block">Slots Scheduled</span>
              <strong className="text-lg font-black text-stone-900">{generationResult.totalSlotsGenerated} Periods</strong>
              <p className="text-[10px] text-stone-500">Published to school master</p>
            </div>
          </div>

          {/* Sample Generated Period Slots */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-stone-700">
                Sample Conflict-Free Schedule Preview
              </span>
            </div>

            <div className="divide-y divide-stone-100">
              {generationResult.sampleSlots.map((sl: any, idx: number) => (
                <div key={idx} className="p-3.5 hover:bg-stone-50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-stone-100 text-stone-700 font-mono font-bold rounded text-[11px]">
                      {sl.day} • Period {sl.periodNumber}
                    </span>
                    <div>
                      <strong className="text-stone-900 font-bold block">{sl.className} ({sl.section}) — {sl.subjectName}</strong>
                      <span className="text-[11px] text-stone-500">Faculty: {sl.teacherName}</span>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-purple-900 bg-purple-50 px-2.5 py-1 rounded font-bold">
                    {sl.roomNumber}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!generationResult && (
        <div className="p-12 text-center text-stone-400 text-xs space-y-2 border border-dashed border-stone-200 rounded-2xl">
          <Calendar className="w-8 h-8 mx-auto text-stone-300" />
          <p>Click &quot;Run Genetic Scheduler&quot; to execute the evolutionary optimization cycle.</p>
        </div>
      )}
    </div>
  );
};
