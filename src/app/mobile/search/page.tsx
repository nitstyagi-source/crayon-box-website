"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Search, ArrowLeft, Users, Wallet, Bus, 
  BookOpen, ChevronRight, CheckCircle2, User, Sparkles
} from "lucide-react";
import { useMobileAuth } from "@/components/mobile/MobileAuthProvider";

export default function MobileSearchPage() {
  const { activeRole } = useMobileAuth();
  const [query, setQuery] = useState("");

  const MOCK_ENTITIES = [
    { title: "Aarav Sharma", type: "Student", detail: "Grade 5A &bull; Roll 14 &bull; Adm: CB26-05421", link: "/parent/academics" },
    { title: "Neha Sharma", type: "Faculty", detail: "TGT Mathematics &bull; Class Teacher 5A", link: "/mobile/attendance" },
    { title: "Term 2 Tuition Fee", type: "Fee Head", detail: "₹12,500 &bull; Due 31 Aug 2026", link: "/mobile/fees" },
    { title: "Bus Route 4 (Sector 62)", type: "Transport", detail: "Driver: Ramesh Yadav &bull; 24 Students", link: "/mobile/transport" },
    { title: "Fractions & Decimals", type: "Curriculum", detail: "Grade 5 Math &bull; Chapter 4", link: "/parent/academics" },
  ];

  const results = query.trim() === "" ? [] : MOCK_ENTITIES.filter(e => 
    e.title.toLowerCase().includes(query.toLowerCase()) || 
    e.type.toLowerCase().includes(query.toLowerCase()) ||
    e.detail.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-24">
      
      {/* Search Bar Header */}
      <div className="flex items-center gap-2">
        <Link href="/mobile" className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="flex-1 relative">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, staff, fees, buses..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* Results Feed */}
      <div className="space-y-2.5">
        {query.trim() === "" ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Search Across School ERP</h3>
              <p className="text-xs text-slate-400 mt-0.5">Find students, fees, schedules, staff, or routes instantly.</p>
            </div>

            <div className="flex flex-wrap gap-1.5 justify-center pt-2">
              {["Aarav", "Grade 5A", "Term 2 Fee", "Bus Route 4", "Neha Sharma"].map(tag => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="bg-white border border-slate-200 px-3 py-1 rounded-full text-xs text-slate-600 hover:bg-slate-50"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No ERP records found matching "<strong className="text-slate-600">{query}</strong>".
          </div>
        ) : (
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Search Results ({results.length})
            </span>

            {results.map((res, i) => (
              <Link
                key={i}
                href={res.link}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between hover:bg-slate-50 transition-all group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                      {res.type}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900">{res.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1" dangerouslySetInnerHTML={{ __html: res.detail }} />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
