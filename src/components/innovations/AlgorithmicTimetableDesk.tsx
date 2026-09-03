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
import { VastuModuleBanner } from "@/components/common/VastuModuleBanner";

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
    <div className="space-y-6 font-sans">
      {/* Option 6 Sattva-Digital Header Banner */}
      <VastuModuleBanner
        badgeText="Genetic Algorithm (GA) Evolutionary Engine"
        badgeIcon={<Zap className="w-3.5 h-3.5" />}
        institutionText="Academic Session 2026–2027"
        title="Algorithmic Master Timetable Studio"
        titleIcon={<Calendar className="w-7 h-7 text-amber-300" />}
        description="Multi-constraint evolutionary optimization eliminating teacher clashes, room bottlenecks, and balancing cognitive morning loads."
        actions={
          <button
            onClick={handleRunGeneticAlgorithm}
            disabled={isGenerating}
            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black transition flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <Zap className="w-4 h-4 text-stone-950 fill-stone-950" />
            <span>{isGenerating ? "Simulating 60 Generations..." : "Run Genetic Scheduler"}</span>
          </button>
        }
      />

      <div className="bg-white/95 rounded-3xl border border-[#E8DFC8] shadow-xs p-6 sm:p-8 space-y-6 backdrop-blur-xs">

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
    </div>
  );
};
