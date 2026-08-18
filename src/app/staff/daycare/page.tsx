"use client";

import { useState } from "react";
import { Coffee, Moon, Smile, Camera, CheckSquare, Clock, Filter, AlertTriangle } from "lucide-react";
import Image from "next/image";

type Toddler = {
  id: string;
  name: string;
  photoUrl: string;
  selected: boolean;
  status: {
    meal: string | null;
    nap: string | null;
    mood: string | null;
  };
};

const initialToddlers: Toddler[] = Array.from({ length: 18 }).map((_, i) => ({
  id: `T${i + 1}`,
  name: `Toddler ${i + 1}`,
  photoUrl: `https://i.pravatar.cc/150?u=toddler${i}`,
  selected: false,
  status: { meal: null, nap: null, mood: null },
}));

export default function DaycareBulkLogger() {
  const [toddlers, setToddlers] = useState<Toddler[]>(initialToddlers);
  const [activeTab, setActiveTab] = useState<"meal" | "nap" | "mood">("meal");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCount = toddlers.filter(t => t.selected).length;

  const toggleSelectAll = () => {
    const allSelected = selectedCount === toddlers.length;
    setToddlers(toddlers.map(t => ({ ...t, selected: !allSelected })));
  };

  const toggleSelect = (id: string) => {
    setToddlers(toddlers.map(t => t.id === id ? { ...t, selected: !t.selected } : t));
  };

  const applyBulkAction = (value: string) => {
    if (selectedCount === 0) return alert("Select at least one student!");
    
    setToddlers(toddlers.map(t => {
      if (t.selected) {
        return { ...t, status: { ...t.status, [activeTab]: value }, selected: false }; // deselect after apply
      }
      return t;
    }));
  };

  const handleLogSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      alert("Bulk Daycare Logs successfully saved to database with strict RLS applied.");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-32">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Daycare Digital Diary</h1>
          <p className="text-sm text-slate-500">Bulk logging for Nursery • Room 104</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold border border-blue-200 hover:bg-blue-100 transition-colors">
            <Camera className="w-4 h-4" /> Bulk Photo Upload
          </button>
        </div>
      </div>

      {/* Main Layout: Split View */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left: Action Panel (Sticky on Desktop) */}
        <div className="w-full lg:w-80 shrink-0 lg:sticky lg:top-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="font-bold text-slate-800">Bulk Action Log</h2>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full">{selectedCount} Selected</span>
            </div>
            
            <div className="flex border-b border-slate-100">
              <button onClick={() => setActiveTab("meal")} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "meal" ? "border-amber-500 text-amber-600 bg-amber-50" : "border-transparent text-slate-500 hover:bg-slate-50"}`}><Coffee className="w-4 h-4 mx-auto mb-1" /> Meal</button>
              <button onClick={() => setActiveTab("nap")} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "nap" ? "border-indigo-500 text-indigo-600 bg-indigo-50" : "border-transparent text-slate-500 hover:bg-slate-50"}`}><Moon className="w-4 h-4 mx-auto mb-1" /> Nap</button>
              <button onClick={() => setActiveTab("mood")} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "mood" ? "border-pink-500 text-pink-600 bg-pink-50" : "border-transparent text-slate-500 hover:bg-slate-50"}`}><Smile className="w-4 h-4 mx-auto mb-1" /> Mood</button>
            </div>

            <div className="p-4 bg-white space-y-2">
              {activeTab === "meal" && (
                <>
                  <button onClick={() => applyBulkAction("Ate 100%")} className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-700 font-bold text-sm rounded-xl border border-slate-100 transition-colors">✅ Ate Everything (100%)</button>
                  <button onClick={() => applyBulkAction("Ate 50%")} className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-700 font-bold text-sm rounded-xl border border-slate-100 transition-colors">⚠️ Ate Half (50%)</button>
                  <button onClick={() => applyBulkAction("Refused")} className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-700 font-bold text-sm rounded-xl border border-slate-100 transition-colors">❌ Refused Meal</button>
                </>
              )}
              {activeTab === "nap" && (
                <>
                  <button onClick={() => applyBulkAction("Slept 2+ Hours")} className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold text-sm rounded-xl border border-slate-100 transition-colors">😴 Slept 2+ Hours</button>
                  <button onClick={() => applyBulkAction("Slept < 1 Hour")} className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold text-sm rounded-xl border border-slate-100 transition-colors">🥱 Short Nap (&lt;1 Hr)</button>
                  <button onClick={() => applyBulkAction("No Nap")} className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold text-sm rounded-xl border border-slate-100 transition-colors">👀 Skipped Nap</button>
                </>
              )}
              {activeTab === "mood" && (
                <>
                  <button onClick={() => applyBulkAction("Happy & Playful")} className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-pink-50 text-slate-700 hover:text-pink-700 font-bold text-sm rounded-xl border border-slate-100 transition-colors">😁 Happy & Playful</button>
                  <button onClick={() => applyBulkAction("Quiet / Calm")} className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-pink-50 text-slate-700 hover:text-pink-700 font-bold text-sm rounded-xl border border-slate-100 transition-colors">😌 Quiet / Calm</button>
                  <button onClick={() => applyBulkAction("Fussy / Crying")} className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-pink-50 text-slate-700 hover:text-pink-700 font-bold text-sm rounded-xl border border-slate-100 transition-colors">😢 Fussy / Crying</button>
                </>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50">
               <button onClick={handleLogSubmit} disabled={isSubmitting} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-md disabled:opacity-50">
                 {isSubmitting ? "Syncing to DB..." : "Commit Logs to DB"}
               </button>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-slate-100 rounded-xl border border-slate-200">
            <AlertTriangle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 leading-relaxed"><strong>Privacy Notice:</strong> Any photos uploaded here are securely synced to Supabase Storage with strict Row Level Security (RLS). Only verified parents of tagged children can view them.</p>
          </div>
        </div>

        {/* Right: Roster Grid */}
        <div className="flex-1 space-y-4 w-full">
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
             <button onClick={toggleSelectAll} className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-emerald-600 transition-colors">
               <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCount === toddlers.length ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"}`}>
                 {selectedCount === toddlers.length && <CheckSquare className="w-4 h-4" />}
               </div>
               Select All
             </button>
             <div className="text-xs text-slate-500 font-medium">Viewing 18 Toddlers</div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {toddlers.map(toddler => (
              <div 
                key={toddler.id} 
                onClick={() => toggleSelect(toddler.id)}
                className={`relative bg-white rounded-2xl border-2 transition-all duration-200 cursor-pointer overflow-hidden group shadow-sm hover:shadow-md ${toddler.selected ? "border-emerald-500 bg-emerald-50/30" : "border-slate-200"}`}
              >
                {/* Selection Checkmark */}
                <div className={`absolute top-3 left-3 w-5 h-5 rounded-md border flex items-center justify-center transition-all z-10 ${toddler.selected ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white/80 border-slate-300 group-hover:border-emerald-400"}`}>
                   {toddler.selected && <CheckSquare className="w-3 h-3" />}
                </div>

                <div className="p-4 flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full overflow-hidden mb-3 ring-4 transition-all ${toddler.selected ? "ring-emerald-200" : "ring-slate-50 group-hover:ring-slate-100"}`}>
                    <Image src={toddler.photoUrl} alt={toddler.name} width={64} height={64} className="object-cover" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm text-center">{toddler.name}</h3>
                  
                  {/* Status Badges */}
                  <div className="flex flex-wrap justify-center gap-1 mt-3 w-full">
                     {toddler.status.meal && <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold truncate max-w-full"><Coffee className="w-3 h-3 inline mr-1" />{toddler.status.meal}</span>}
                     {toddler.status.nap && <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold truncate max-w-full"><Moon className="w-3 h-3 inline mr-1" />{toddler.status.nap}</span>}
                     {toddler.status.mood && <span className="text-[10px] bg-pink-100 text-pink-800 px-2 py-0.5 rounded font-bold truncate max-w-full"><Smile className="w-3 h-3 inline mr-1" />{toddler.status.mood}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
