"use client";

import Link from "next/link";
import { useSiblingContext } from "@/components/providers/SiblingProvider";
import { HeartPulse, BookOpen, Clock, Wallet, LayoutGrid, Bus, Calendar, Library } from "lucide-react";

export default function ParentAppHub() {
  const { activeSibling } = useSiblingContext();

  const APPS = [
    { name: "Daycare Diary", icon: Clock, color: "bg-indigo-50 text-indigo-600", border: "border-indigo-100", href: "/parent/daycare" },
    { name: "Health Clinic", icon: HeartPulse, color: "bg-red-50 text-red-600", border: "border-red-100", href: "/parent/health" },
    { name: "Smart Wallet", icon: Wallet, color: "bg-emerald-50 text-emerald-600", border: "border-emerald-100", href: "/parent/wallet" },
    { name: "Transport", icon: Bus, color: "bg-amber-50 text-amber-600", border: "border-amber-100", href: "/parent/transport" },
    { name: "Library (OPAC)", icon: Library, color: "bg-purple-50 text-purple-600", border: "border-purple-100", href: "/parent/library" },
    { name: "Calendar", icon: Calendar, color: "bg-blue-50 text-blue-600", border: "border-blue-100", href: "/parent/calendar" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32">
      
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-200">
          <LayoutGrid className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800">App Hub</h1>
          <p className="text-slate-500 mt-2">All additional services for {activeSibling?.firstName || "your child"}.</p>
        </div>
      </div>

      {/* iOS-Style App Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8 justify-items-center">
        {APPS.map((app) => (
          <Link href={app.href} key={app.name} className="flex flex-col items-center group w-full max-w-[120px]">
            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl ${app.color} ${app.border} border shadow-sm flex items-center justify-center group-hover:scale-105 group-hover:shadow-md transition-all duration-300 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <app.icon className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
            </div>
            <span className="mt-3 text-xs md:text-sm font-bold text-slate-700 text-center line-clamp-1 group-hover:text-blue-600 transition-colors">
              {app.name}
            </span>
          </Link>
        ))}
      </div>

    </div>
  );
}
