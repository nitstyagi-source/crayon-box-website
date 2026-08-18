"use client";

import { Search, MapPin, Briefcase, GraduationCap, ArrowRight } from "lucide-react";
import Image from "next/image";
import { getPageContent } from "@/app/actions/cms";
import { useState } from "react";
import { useLivePreview } from "@/hooks/useLivePreview";

const alumniData = [
  {
    id: 1,
    name: "Dr. Elena Rostova",
    graduationYear: 2018,
    university: "Stanford University",
    company: "Mayo Clinic",
    role: "Neurology Resident",
    image: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    mentorshipOpen: true
  },
  {
    id: 2,
    name: "Marcus Chen",
    graduationYear: 2020,
    university: "MIT",
    company: "OpenAI",
    role: "Machine Learning Engineer",
    image: "https://i.pravatar.cc/150?u=a042581f4e29026000d",
    mentorshipOpen: false
  },
  {
    id: 3,
    name: "Sarah Jenkins",
    graduationYear: 2015,
    university: "Harvard Law School",
    company: "United Nations",
    role: "Human Rights Advocate",
    image: "https://i.pravatar.cc/150?u=a04258114e29026702d",
    mentorshipOpen: true
  }
];

export default function AlumniDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const cmsData = useLivePreview("alumni");

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary/30">
      <main className="pt-32 pb-24">
        
        {/* Header */}
        <section className="max-w-7xl mx-auto px-6 mb-16">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-slate-900 tracking-tight leading-tight">
              {cmsData.hero?.headline || "Our"} <span className="text-primary italic pr-2">{cmsData.hero?.subtext || "Alumni"}</span> Network
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {cmsData.hero?.description || "Connect with past graduates of Crayon Box School who are making waves across the globe."}
            </p>
            
            <div className="relative max-w-2xl mx-auto mt-8">
              <Search className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search by name, university, or industry..." 
                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-full text-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all" 
              />
            </div>
          </div>
        </section>

        {/* Directory Grid */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {alumniData.map((alumnus) => (
              <div key={alumnus.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="h-32 bg-slate-900 relative">
                   <div className="absolute inset-0 bg-primary/20"></div>
                   {alumnus.mentorshipOpen && (
                     <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                       Mentorship Open
                     </div>
                   )}
                </div>
                
                <div className="px-8 pb-8 relative">
                  <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden -mt-12 shadow-lg mb-6 bg-slate-100">
                    <Image src={alumnus.image} alt={alumnus.name} width={96} height={96} className="object-cover" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900">{alumnus.name}</h3>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Class of {alumnus.graduationYear}</p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-start gap-3 text-sm text-slate-600">
                      <GraduationCap className="w-5 h-5 text-slate-400 shrink-0" />
                      <span>{alumnus.university}</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-slate-600">
                      <Briefcase className="w-5 h-5 text-slate-400 shrink-0" />
                      <span>{alumnus.role} at <strong>{alumnus.company}</strong></span>
                    </div>
                  </div>

                  <button className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-primary hover:text-white hover:border-primary transition-colors group-hover:bg-primary group-hover:text-white group-hover:border-primary">
                    View Profile <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
