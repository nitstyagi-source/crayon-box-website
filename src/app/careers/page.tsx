"use client";

import { useState, useEffect } from "react";
import { 
  Briefcase, GraduationCap, Clock, MapPin, 
  CheckCircle2, Sparkles, Send, Upload, FileText, 
  ArrowRight, ShieldCheck, Phone, Mail, Building2, 
  Award, HeartHandshake, Check, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { getJobVacancies, submitJobApplication } from "@/app/actions/recruitment";

export default function PublicCareersPage() {
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCandidateCode, setSubmittedCandidateCode] = useState<string | null>(null);

  // Application Form State
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    dob: "1994-05-15",
    gender: "Female",
    currentLocation: "Delhi NCR",
    positionApplied: "PRT Mathematics Teacher",
    highestQualification: "B.Sc (Maths), B.Ed",
    experienceYears: 3,
    currentEmployer: "Reputed CBSE School",
    currentSalary: "₹42,000 / month",
    expectedSalary: "₹52,000 / month",
    noticePeriodDays: 15,
    resumeUrl: "https://example.com/candidate_resume.pdf",
    source: "School Website"
  });

  useEffect(() => {
    async function loadJobs() {
      const res = await getJobVacancies({ status: "Open" });
      if (res.success && res.data) {
        setVacancies(res.data);
      }
    }
    loadJobs();
  }, []);

  function handleOpenApply(job: any) {
    setSelectedJob(job);
    setForm(prev => ({
      ...prev,
      positionApplied: job.title
    }));
    setSubmittedCandidateCode(null);
    setIsApplyModalOpen(true);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await submitJobApplication({
        vacancyId: selectedJob?.id,
        ...form
      });

      if (res.success) {
        setSubmittedCandidateCode(res.candidateCode || "CBS-CAN-2026-0921");
      } else {
        alert("Error submitting application: " + res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12 w-full">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="bg-purple-100 text-purple-900 text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Join Our Academic Family
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight leading-tight">
            Shape the Future of Education at <span className="text-purple-600">Crayon Box</span>
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            We are looking for passionate, inspiring educators and administrative professionals who believe in nurturing curiosity, creative excellence, and character.
          </p>
        </div>

        {/* Why Work With Us 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
              🌟
            </div>
            <strong className="text-stone-900 font-bold text-base block">Professional Growth</strong>
            <p className="text-xs text-stone-500 leading-relaxed">
              Regular teacher training workshops, CBSE pedagogy seminars, and leadership development pathways.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              🏫
            </div>
            <strong className="text-stone-900 font-bold text-base block">Smart Classrooms &amp; Labs</strong>
            <p className="text-xs text-stone-500 leading-relaxed">
              Air-conditioned digital smart boards, robotics &amp; AI innovation hubs, and cutting-edge science labs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              ❤️
            </div>
            <strong className="text-stone-900 font-bold text-base block">Empowering Culture</strong>
            <p className="text-xs text-stone-500 leading-relaxed">
              Competitive compensation, medical benefits, child fee concessions, and collaborative teamwork.
            </p>
          </div>
        </div>

        {/* Current Job Openings */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-stone-200 pb-4">
            <div>
              <h2 className="text-2xl font-black text-stone-900 tracking-tight">Current Openings</h2>
              <p className="text-xs text-stone-500">Apply online for immediate review by the school recruitment committee.</p>
            </div>
            <span className="text-xs font-mono font-bold bg-purple-100 text-purple-900 px-3 py-1 rounded-xl">
              {vacancies.length} Active Positions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vacancies.map((job) => (
              <div key={job.id} className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs space-y-4 hover:border-purple-300 transition flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded">
                        {job.job_code} • {job.category}
                      </span>
                      <h3 className="text-lg font-black text-stone-900 mt-1">{job.title}</h3>
                      <span className="text-xs text-stone-500 font-semibold">{job.department} • {job.classes}</span>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-xl">
                      🟢 Open
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-3 rounded-2xl border border-stone-200/70 text-stone-700 font-medium">
                    <div>🎓 <strong>Qual:</strong> {job.min_qualification}</div>
                    <div>⏳ <strong>Exp:</strong> {job.experience_required}</div>
                    <div>💰 <strong>Salary:</strong> {job.salary_range}</div>
                    <div>📍 <strong>Location:</strong> {job.branch}</div>
                  </div>

                  {job.job_description && (
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {job.job_description}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400 font-mono">
                    Deadline: {job.application_deadline}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenApply(job)}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    [ Apply Now ] <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Online Application Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto text-xs">
            
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-purple-600 font-bold block">
                  Online Job Application
                </span>
                <h3 className="text-lg font-black text-stone-900 mt-0.5">
                  Apply for {selectedJob?.title || "Educator Position"}
                </h3>
              </div>
              <button onClick={() => setIsApplyModalOpen(false)} className="text-stone-400 hover:text-stone-800 p-1">✕</button>
            </div>

            {submittedCandidateCode ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto animate-bounce">
                  🎉
                </div>
                <h4 className="text-xl font-black text-stone-900">Application Submitted Successfully!</h4>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  Thank you for applying to Crayon Box School. Your unique Reference Candidate ID is:
                </p>
                <div className="bg-purple-50 border border-purple-200 py-3 px-6 rounded-2xl inline-block font-mono font-black text-purple-900 text-base">
                  {submittedCandidateCode}
                </div>
                <p className="text-[11px] text-stone-500">
                  Our HR committee will review your profile and contact you for the Demo Class / Interview round.
                </p>
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-6 py-2.5 bg-stone-900 text-white font-bold rounded-xl text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                {/* Personal Details */}
                <div className="space-y-3">
                  <span className="font-black text-stone-900 uppercase tracking-wider text-[11px] block border-b border-stone-100 pb-1">
                    1. Personal Details
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sunita Mehra"
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 98711 22334"
                        value={form.mobile}
                        onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. sunita@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Current Location *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rohini, New Delhi"
                        value={form.currentLocation}
                        onChange={(e) => setForm({ ...form, currentLocation: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Details */}
                <div className="space-y-3 pt-2">
                  <span className="font-black text-stone-900 uppercase tracking-wider text-[11px] block border-b border-stone-100 pb-1">
                    2. Professional Qualifications &amp; Experience
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Highest Qualification *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. M.Sc (Maths) + B.Ed + CTET"
                        value={form.highestQualification}
                        onChange={(e) => setForm({ ...form, highestQualification: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Total Experience (Years) *</label>
                      <input
                        type="number"
                        step="0.5"
                        min={0}
                        required
                        value={form.experienceYears}
                        onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Current Employer</label>
                      <input
                        type="text"
                        placeholder="e.g. Cambridge School"
                        value={form.currentEmployer}
                        onChange={(e) => setForm({ ...form, currentEmployer: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Expected Salary</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹50,000 / mo"
                        value={form.expectedSalary}
                        onChange={(e) => setForm({ ...form, expectedSalary: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Notice Period (Days)</label>
                      <input
                        type="number"
                        value={form.noticePeriodDays}
                        onChange={(e) => setForm({ ...form, noticePeriodDays: Number(e.target.value) })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Resume Upload */}
                <div className="bg-purple-50/50 p-3.5 rounded-2xl border border-purple-200 space-y-1">
                  <span className="font-bold text-purple-950 block text-[11px]">Attach Resume / CV (PDF) *</span>
                  <input
                    type="text"
                    required
                    placeholder="Link or paste file URL (e.g. https://...)"
                    value={form.resumeUrl}
                    onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })}
                    className="w-full bg-white border border-purple-300 rounded-xl p-2 text-xs font-mono"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmitting ? "Submitting..." : "[ Submit Application ]"}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
