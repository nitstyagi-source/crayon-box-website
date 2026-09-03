"use client";

import React, { useState } from "react";
import {
  Bus,
  Sparkles,
  TrendingDown,
  Navigation,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  Fuel
} from "lucide-react";
import { runBusRouteOptimizationAction } from "@/app/actions/bus-optimizer-actions";

export const BusRouteOptimizerDesk: React.FC = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedResult, setOptimizedResult] = useState<any | null>(null);

  async function handleOptimize() {
    setIsOptimizing(true);
    try {
      const res = await runBusRouteOptimizationAction();
      if (res.success) {
        setOptimizedResult(res);
      }
    } finally {
      setIsOptimizing(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xl p-6 sm:p-8 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider bg-cyan-50 text-cyan-950 px-2.5 py-1 rounded-full border border-cyan-200">
              Capacitated Vehicle Routing Problem (CVRP)
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
            Dynamic Bus Route Optimizer (2-Opt CVRP Engine)
          </h2>
          <p className="text-xs text-stone-500">
            Algorithmic sequencing minimizing transit distance, road crossings, and fleet fuel consumption
          </p>
        </div>

        <button
          onClick={handleOptimize}
          disabled={isOptimizing}
          className="px-5 py-2.5 rounded-xl bg-cyan-900 hover:bg-cyan-800 text-white text-xs font-black transition flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-cyan-300" />
          <span>{isOptimizing ? "Computing Optimal 2-Opt Tour..." : "Run Algorithmic Route Optimization"}</span>
        </button>
      </div>

      {optimizedResult && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Optimization Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-stone-400 block">Corridor</span>
              <strong className="text-sm sm:text-base font-black text-stone-900 block truncate">{optimizedResult.busNumber}</strong>
              <p className="text-[10px] text-stone-500">{optimizedResult.routeName}</p>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-stone-400 block">Original Distance</span>
              <strong className="text-sm sm:text-base font-mono font-black text-stone-500">{optimizedResult.originalDistanceKm} km</strong>
              <p className="text-[10px] text-stone-400">Unoptimized sequence</p>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-emerald-700 block">Optimized Tour</span>
              <strong className="text-sm sm:text-base font-mono font-black text-emerald-900">{optimizedResult.optimizedDistanceKm} km</strong>
              <p className="text-[10px] text-emerald-700 font-bold">2-Opt Local Search</p>
            </div>

            <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-cyan-800 block">Fuel Savings</span>
              <div className="flex items-center gap-1.5">
                <Fuel className="w-4 h-4 text-cyan-600" />
                <strong className="text-sm sm:text-base font-black text-cyan-950">
                  {optimizedResult.kilometersSaved} km ({optimizedResult.estimatedFuelSavingsPct}%)
                </strong>
              </div>
              <p className="text-[10px] text-cyan-700">Less diesel per day</p>
            </div>
          </div>

          {/* Re-Sequenced Stops */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-stone-700">
                Optimized Stop Sequence ({optimizedResult.optimizedStops.length} Waypoints)
              </span>
            </div>

            <div className="divide-y divide-stone-100">
              {optimizedResult.optimizedStops.map((stop: any, idx: number) => (
                <div key={idx} className="p-3.5 hover:bg-stone-50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-950 font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <strong className="text-stone-900 font-bold block">{stop.name}</strong>
                      <span className="text-[11px] text-stone-500">
                        GPS: {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {stop.studentCount > 0 && (
                      <span className="text-[11px] font-bold text-cyan-900 bg-cyan-50 px-2 py-0.5 rounded">
                        {stop.studentCount} Students
                      </span>
                    )}
                    {stop.pickupTime && (
                      <span className="text-[11px] font-mono text-stone-600 font-semibold">
                        {stop.pickupTime}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!optimizedResult && (
        <div className="p-12 text-center text-stone-400 text-xs space-y-2 border border-dashed border-stone-200 rounded-2xl">
          <Navigation className="w-8 h-8 mx-auto text-stone-300" />
          <p>Click &quot;Run Algorithmic Route Optimization&quot; to compute the mathematically optimal stop tour.</p>
        </div>
      )}
    </div>
  );
};
