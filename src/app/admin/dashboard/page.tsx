"use client";

import { useCampusContext } from "@/components/providers/CampusProvider";
import { Users, UserPlus, AlertCircle, IndianRupee, TrendingUp, Filter } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { activeCampus } = useCampusContext();

  const campusName = activeCampus?.name || "Main Campus";
  const enrollments = "2,845";
  const admissions = "342";
  const collections = "4.2M";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-slate-900">Global Command Center</h1>
        <div className="text-sm text-slate-500 font-medium">Reporting Context: <span className="text-blue-600 font-bold">{campusName}</span></div>
      </div>

      {/* Top KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Enrollments */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Enrollments</p>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md"><Users className="w-4 h-4" /></div>
          </div>
          <h3 className="text-3xl font-black text-slate-800">{enrollments}</h3>
          <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +12% vs last year</p>
        </div>

        {/* Admissions */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">New Admissions (26-27)</p>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md"><UserPlus className="w-4 h-4" /></div>
          </div>
          <h3 className="text-3xl font-black text-slate-800">{admissions}</h3>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 mb-1">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
          </div>
          <p className="text-xs text-slate-500 font-medium">65% of Target (500)</p>
        </div>

        {/* Helpdesk */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Tickets</p>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-md"><AlertCircle className="w-4 h-4" /></div>
          </div>
          <h3 className="text-3xl font-black text-slate-800">24</h3>
          <p className="text-xs text-amber-600 font-bold mt-2">5 tickets breaching SLA</p>
        </div>

        {/* Collections */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Today's Collections</p>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md"><IndianRupee className="w-4 h-4" /></div>
          </div>
          <h3 className="text-3xl font-black text-slate-800">₹{collections}</h3>
          <p className="text-xs text-slate-500 font-medium mt-2">Q2 Fee Cycle Active</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Visual Analytics: Enrollment Funnel */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold text-slate-800">Admissions Funnel (YTD)</h2>
            <button className="text-slate-400 hover:text-slate-600"><Filter className="w-4 h-4" /></button>
          </div>
          
          <div className="space-y-4">
            {[
              { stage: "Drafts Created", count: 850, pct: "100%", color: "bg-slate-200" },
              { stage: "Submitted & Paid", count: 620, pct: "73%", color: "bg-blue-300" },
              { stage: "Interview Scheduled", count: 480, pct: "56%", color: "bg-blue-400" },
              { stage: "Admitted & Waitlisted", count: 342, pct: "40%", color: "bg-blue-600" }
            ].map((bar, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                  <span>{bar.stage}</span>
                  <span>{bar.count}</span>
                </div>
                <div className="w-full bg-slate-100 rounded h-6 relative overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: bar.pct }} 
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    className={`h-full ${bar.color} rounded-r`}
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Analytics: Demographic Heatmap Mock */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-slate-800 mb-6">Application Origin Heatmap</h2>
          <div className="flex-1 bg-slate-100 rounded-lg border border-slate-200 relative overflow-hidden flex items-center justify-center">
            {/* Mock Map Image */}
            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale mix-blend-multiply" alt="Map" />
            
            {/* Heat Dots */}
            <div className="absolute top-1/3 left-1/4 w-12 h-12 bg-red-500/40 rounded-full blur-md"></div>
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-red-500/50 rounded-full blur-lg"></div>
            <div className="absolute bottom-1/3 right-1/4 w-16 h-16 bg-amber-500/40 rounded-full blur-md"></div>
            
            <div className="relative z-10 bg-white/90 px-3 py-1.5 rounded shadow-sm text-xs font-bold text-slate-700">
              Zone 2 showing highest density (45%)
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
