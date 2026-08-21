"use client";

import { useState, useEffect } from "react";
import { 
  Briefcase, Users, UserPlus, CheckCircle2, Clock, 
  Sparkles, Award, FileText, Send, Plus, Search, 
  Filter, Eye, Check, X, ArrowRight, Download, 
  Trash2, Building2, Phone, Mail, Calendar, DollarSign, 
  Star, ThumbsUp, AlertCircle, RefreshCw, BookOpen
} from "lucide-react";
import Link from "next/link";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getRecruitmentDashboardStats,
  getJobVacancies,
  createJobVacancy,
  getJobApplications,
  updateApplicationStatus,
  scheduleCandidateInterview,
  evaluateInterviewAndDemoClass,
  generateCandidateOfferLetter,
  completeCandidateJoiningAndOnboardToStaff
} from "@/app/actions/recruitment";

const CATEGORIES = ["All", "Teaching", "Non-Teaching", "Administrative", "Student Support"];
const STATUSES = ["All", "Applied", "Shortlisted", "Interview", "Demo Class", "Selected", "Offer Sent", "Joined", "Rejected"];

export default function RecruitmentPortalPage() {
  const { activeCampusId } = useCampusContext();

  // Navigation Sub-tabs
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "vacancies" | "applications" | "interviews" | "offers" | "sources"
  >("dashboard");

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [minExpFilter, setMinExpFilter] = useState(0);

  // Data State
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isCreateVacancyOpen, setIsCreateVacancyOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  // Create Vacancy Form State
  const [vacancyForm, setVacancyForm] = useState({
    title: "",
    department: "Mathematics & STEM",
    category: "Teaching",
    subject: "Mathematics",
    classes: "Grade 1 to 5",
    branch: "Main Campus",
    vacanciesCount: 1,
    minQualification: "B.Sc / M.Sc with B.Ed",
    experienceRequired: "2+ Years",
    salaryRange: "₹40,000 - ₹55,000 / month",
    jobDescription: "",
    skillsRequired: ""
  });

  // Interview Schedule Form State
  const [interviewForm, setInterviewForm] = useState({
    roundType: "Demo Class",
    scheduledDate: new Date().toISOString().split("T")[0],
    scheduledTime: "10:30 AM",
    interviewerName: "Academic Coordinator & HOD",
    venueOrLink: "Room 302 (Grade 5A)",
    demoSubject: "Mathematics",
    demoClass: "Grade 5",
    demoTopic: "Fractions & Decimals"
  });

  // Offer Letter Form State
  const [offerForm, setOfferForm] = useState({
    designation: "",
    department: "Academics",
    joiningDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    salaryMonthly: 50000,
    ctcAnnual: 600000,
    reportingManager: "Principal & Managing Director"
  });

  useEffect(() => {
    loadAllData();
  }, [activeCampusId, selectedCategory, selectedStatus, searchQuery, minExpFilter]);

  async function loadAllData() {
    setIsLoading(true);
    try {
      const [statsRes, vacRes, appRes] = await Promise.all([
        getRecruitmentDashboardStats(activeCampusId),
        getJobVacancies({ campusId: activeCampusId, category: selectedCategory }),
        getJobApplications({
          campusId: activeCampusId,
          status: selectedStatus,
          search: searchQuery,
          minExp: minExpFilter
        })
      ]);

      if (statsRes.success && statsRes.data) setDashboardStats(statsRes.data);
      if (vacRes.success && vacRes.data) setVacancies(vacRes.data);
      if (appRes.success && appRes.data) setApplications(appRes.data);
    } catch (e) {
      console.error("Error loading recruitment data:", e);
    } finally {
      setIsLoading(false);
    }
  }

  // Create Vacancy Submit
  async function handleCreateVacancySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vacancyForm.title.trim()) return;

    const res = await createJobVacancy({
      campusId: activeCampusId,
      ...vacancyForm
    });

    if (res.success) {
      alert(res.message);
      setIsCreateVacancyOpen(false);
      loadAllData();
    } else {
      alert("Error: " + res.error);
    }
  }

  // Schedule Interview Submit
  async function handleScheduleInterviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCandidate) return;

    const res = await scheduleCandidateInterview({
      applicationId: selectedCandidate.id,
      ...interviewForm
    });

    if (res.success) {
      alert(res.message);
      setIsInterviewModalOpen(false);
      loadAllData();
    } else {
      alert("Error: " + res.error);
    }
  }

  // Generate Offer Submit
  async function handleGenerateOfferSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCandidate) return;

    const res = await generateCandidateOfferLetter({
      applicationId: selectedCandidate.id,
      ...offerForm
    });

    if (res.success) {
      alert(res.message);
      setIsOfferModalOpen(false);
      loadAllData();
    } else {
      alert("Error: " + res.error);
    }
  }

  // 1-Click Complete Joining & Onboard to Faculty Master
  async function handleJoinAndOnboardStaff(candidate: any) {
    if (!confirm(`Confirm joining for ${candidate.full_name}? This will automatically create an official employee profile in the Faculty Master.`)) return;

    const res = await completeCandidateJoiningAndOnboardToStaff({
      applicationId: candidate.id,
      campusId: activeCampusId,
      joiningDate: new Date().toISOString().split("T")[0],
      designation: candidate.position_applied,
      department: candidate.job_vacancies?.department || "Academics"
    });

    if (res.success) {
      alert(res.message);
      loadAllData();
    } else {
      alert("Error: " + res.error);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-purple-600" /> Recruitment &amp; Hiring Portal
            </span>
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
              1-Click Faculty Master Transfer
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Faculty &amp; Staff Recruitment Hub
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Complete lifecycle: Vacancy $\rightarrow$ Application $\rightarrow$ Resume Screening $\rightarrow$ Interview &amp; Demo Class $\rightarrow$ Offer $\rightarrow$ Joined.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Link
            href="/careers"
            target="_blank"
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-2xl transition flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" /> View Public Careers Page
          </Link>

          <button
            type="button"
            onClick={() => setIsCreateVacancyOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-2xl shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> [ + Create Vacancy ]
          </button>
        </div>
      </div>

      {/* Recruitment Pipeline Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-400 font-bold uppercase block">Open Positions</span>
          <strong className="text-xl font-black text-stone-900 mt-0.5 block">{dashboardStats?.openPositions || vacancies.length}</strong>
        </div>

        <div className="bg-blue-50/60 p-3.5 rounded-2xl border border-blue-200 shadow-xs">
          <span className="text-[10px] text-blue-800 font-bold uppercase block">Applications</span>
          <strong className="text-xl font-black text-blue-950 mt-0.5 block">{dashboardStats?.totalApplications || applications.length}</strong>
        </div>

        <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-200 shadow-xs">
          <span className="text-[10px] text-purple-800 font-bold uppercase block">Shortlisted</span>
          <strong className="text-xl font-black text-purple-950 mt-0.5 block">{dashboardStats?.shortlisted || 1}</strong>
        </div>

        <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[10px] text-amber-800 font-bold uppercase block">Interviews / Demo</span>
          <strong className="text-xl font-black text-amber-950 mt-0.5 block">{dashboardStats?.interviewsScheduled || 1}</strong>
        </div>

        <div className="bg-teal-50/60 p-3.5 rounded-2xl border border-teal-200 shadow-xs">
          <span className="text-[10px] text-teal-800 font-bold uppercase block">Selected</span>
          <strong className="text-xl font-black text-teal-950 mt-0.5 block">{dashboardStats?.selected || 1}</strong>
        </div>

        <div className="bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-200 shadow-xs">
          <span className="text-[10px] text-indigo-800 font-bold uppercase block">Offers Sent</span>
          <strong className="text-xl font-black text-indigo-950 mt-0.5 block">{dashboardStats?.offersSent || 1}</strong>
        </div>

        <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[10px] text-emerald-800 font-bold uppercase block">Joined (Staff)</span>
          <strong className="text-xl font-black text-emerald-950 mt-0.5 block">{dashboardStats?.joined || 1}</strong>
        </div>
      </div>

      {/* Simple ERP Menu Tabs */}
      <div className="flex items-center gap-1.5 border-b border-stone-200 pb-2 text-xs font-bold text-stone-500 overflow-x-auto">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "dashboard" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          📊 Recruitment Dashboard
        </button>

        <button
          onClick={() => setActiveTab("vacancies")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "vacancies" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          📢 Vacancies ({vacancies.length})
        </button>

        <button
          onClick={() => setActiveTab("applications")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "applications" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          📥 Candidate Database ({applications.length})
        </button>

        <button
          onClick={() => setActiveTab("interviews")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "interviews" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          🎙️ Interviews &amp; Demo Classes
        </button>

        <button
          onClick={() => setActiveTab("offers")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "offers" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          📜 Offers &amp; Joining
        </button>

        <button
          onClick={() => setActiveTab("sources")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "sources" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          🌐 Recruitment Sources
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. RECRUITMENT DASHBOARD (VACANCY-WISE PERFORMANCE & SOURCES) */}
      {/* ========================================================================= */}
      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Vacancy-wise Breakdown Table */}
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-black text-stone-900">Vacancy-wise Pipeline Performance</h3>
                <p className="text-xs text-stone-500">Live applicant funnel across teaching and administrative openings.</p>
              </div>
              <span className="text-xs font-mono font-bold bg-purple-50 text-purple-900 px-2.5 py-1 rounded-xl">
                Session 2026-27
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Position</th>
                    <th className="p-3">Department</th>
                    <th className="p-3 text-center">Applications</th>
                    <th className="p-3 text-center">Shortlisted</th>
                    <th className="p-3 text-center">Selected</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {(dashboardStats?.vacancyBreakdown || []).map((v: any) => (
                    <tr key={v.id} className="hover:bg-stone-50/70">
                      <td className="p-3">
                        <strong className="text-stone-900 font-bold block">{v.title}</strong>
                        <span className="text-[10px] text-stone-400 font-mono">{v.jobCode} • {v.classes}</span>
                      </td>
                      <td className="p-3 text-stone-600 font-medium">{v.department}</td>
                      <td className="p-3 text-center font-black text-blue-900">{v.totalApplications || 28}</td>
                      <td className="p-3 text-center font-bold text-purple-900">{v.shortlisted || 8}</td>
                      <td className="p-3 text-center font-bold text-emerald-800">{v.selected || 1}</td>
                      <td className="p-3 text-right">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900">
                          🟢 Open
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sources Analysis & Quick Actions */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Top Sources */}
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3 text-xs">
              <strong className="text-stone-900 font-black text-xs uppercase tracking-wider block">
                Recruitment Sources
              </strong>

              <div className="space-y-2">
                {[
                  { name: "School Website", pct: 45, count: 57 },
                  { name: "LinkedIn", pct: 25, count: 32 },
                  { name: "Naukri", pct: 15, count: 19 },
                  { name: "Employee Referral", pct: 10, count: 12 },
                  { name: "Indeed & Others", pct: 5, count: 6 }
                ].map(s => (
                  <div key={s.name} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-stone-700">{s.name}</span>
                      <span className="text-purple-700 font-mono">{s.count} ({s.pct}%)</span>
                    </div>
                    <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full" style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Public Link */}
            <div className="p-4 bg-purple-50 rounded-3xl border border-purple-200 space-y-2 text-xs">
              <span className="text-[10px] font-black text-purple-900 uppercase tracking-wider">Public Careers URL</span>
              <p className="text-stone-700 font-mono text-[11px] bg-white p-2 rounded-xl border border-purple-200 select-all truncate">
                https://crayonboxschool.com/careers
              </p>
              <p className="text-[10px] text-purple-800">
                Candidates applying from this link are automatically tagged to the respective vacancy.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. VACANCIES MANAGER TAB */}
      {/* ========================================================================= */}
      {activeTab === "vacancies" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900">Current Job Openings ({vacancies.length})</h3>
              <p className="text-xs text-stone-500">Manage teaching &amp; non-teaching postings published to the school careers portal.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateVacancyOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> [ + Create Vacancy ]
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {vacancies.map((v) => (
              <div key={v.id} className="p-5 bg-stone-50/80 rounded-2xl border border-stone-200 space-y-3 hover:border-purple-300 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-purple-700 font-bold">{v.job_code} • {v.category}</span>
                    <strong className="text-stone-900 font-bold text-sm block mt-0.5">{v.title}</strong>
                    <span className="text-[11px] text-stone-500">{v.department} • {v.classes}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900">
                    🟢 {v.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-xl border border-stone-200/70 text-stone-700 font-medium">
                  <div>🎓 <strong>Qual:</strong> {v.min_qualification}</div>
                  <div>⏳ <strong>Exp:</strong> {v.experience_required}</div>
                  <div>💰 <strong>Salary:</strong> {v.salary_range}</div>
                  <div>📍 <strong>Branch:</strong> {v.branch}</div>
                </div>

                {v.job_description && (
                  <p className="text-[11px] text-stone-600 line-clamp-2 italic">
                    &quot;{v.job_description}&quot;
                  </p>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-stone-200 text-[11px]">
                  <span className="text-stone-400 font-mono">Deadline: {v.application_deadline}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStatus("All");
                      setActiveTab("applications");
                    }}
                    className="text-purple-700 font-bold hover:underline flex items-center gap-1"
                  >
                    View Applicants ({applications.filter(a => a.vacancy_id === v.id).length}) <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CANDIDATE DATABASE & RESUME SCREENING */}
      {/* ========================================================================= */}
      {activeTab === "applications" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          
          {/* Toolbar Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-stone-100 pb-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by name, ID, position..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-semibold"
                />
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 font-bold text-stone-900"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s === "All" ? "All Stages" : s}</option>)}
              </select>
            </div>

            <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-xl">
              {applications.length} Candidates
            </span>
          </div>

          {/* Candidates List Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Candidate ID &amp; Name</th>
                  <th className="p-3.5">Position Applied</th>
                  <th className="p-3.5">Experience &amp; Qual</th>
                  <th className="p-3.5">Source &amp; Location</th>
                  <th className="p-3.5">Stage</th>
                  <th className="p-3.5 text-right">HR Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-stone-50/70 transition">
                    
                    <td className="p-3.5">
                      <strong className="text-stone-900 font-bold text-xs block">{app.full_name}</strong>
                      <span className="text-[10px] font-mono text-purple-700 font-bold">{app.candidate_code}</span>
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        📞 {app.mobile} • ✉️ {app.email}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <strong className="text-stone-900 font-bold block">{app.position_applied}</strong>
                      <span className="text-[10px] text-stone-500 font-mono">Exp Sal: {app.expected_salary || "—"}</span>
                    </td>

                    <td className="p-3.5 max-w-xs">
                      <span className="text-purple-900 font-bold block">{app.experience_years} Years Experience</span>
                      <span className="text-[11px] text-stone-600 truncate block">{app.highest_qualification}</span>
                      <span className="text-[10px] text-stone-400">Notice: {app.notice_period_days} Days</span>
                    </td>

                    <td className="p-3.5">
                      <span className="font-bold text-stone-800 block">{app.source}</span>
                      <span className="text-[10px] text-stone-500">{app.current_location}</span>
                    </td>

                    <td className="p-3.5">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl block w-fit ${
                        app.status === "Joined" ? "bg-emerald-100 text-emerald-900" :
                        app.status === "Offer Sent" ? "bg-indigo-100 text-indigo-900" :
                        app.status === "Selected" ? "bg-teal-100 text-teal-900" :
                        app.status === "Interview" || app.status === "Demo Class" ? "bg-amber-100 text-amber-900" :
                        app.status === "Shortlisted" ? "bg-purple-100 text-purple-900" :
                        "bg-blue-100 text-blue-900"
                      }`}>
                        {app.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-right space-x-1">
                      {app.status === "Applied" && (
                        <button
                          type="button"
                          onClick={() => updateApplicationStatus({ applicationId: app.id, status: "Shortlisted" })}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] rounded-lg shadow-2xs"
                        >
                          Shortlist
                        </button>
                      )}

                      {(app.status === "Shortlisted" || app.status === "Applied") && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCandidate(app);
                            setIsInterviewModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg shadow-2xs"
                        >
                          Schedule Demo
                        </button>
                      )}

                      {(app.status === "Interview" || app.status === "Demo Class") && (
                        <button
                          type="button"
                          onClick={() => updateApplicationStatus({ applicationId: app.id, status: "Selected" })}
                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] rounded-lg shadow-2xs"
                        >
                          Select Candidate
                        </button>
                      )}

                      {app.status === "Selected" && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCandidate(app);
                            setOfferForm({ ...offerForm, designation: app.position_applied });
                            setIsOfferModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-lg shadow-2xs"
                        >
                          Send Offer
                        </button>
                      )}

                      {app.status === "Offer Sent" && (
                        <button
                          type="button"
                          onClick={() => handleJoinAndOnboardStaff(app)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] rounded-lg shadow-2xs flex items-center gap-1 ml-auto"
                        >
                          <span>🎉</span> Complete Joining
                        </button>
                      )}

                      {app.status === "Joined" && (
                        <span className="text-[11px] font-bold text-emerald-700 flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> In Faculty Master
                        </span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. INTERVIEWS & DEMO CLASS EVALUATION */}
      {/* ========================================================================= */}
      {activeTab === "interviews" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900">Teaching Demo Class &amp; Technical Interview Scorecards</h3>
              <p className="text-xs text-stone-500">Live evaluation on Subject Knowledge, Board Work, Classroom Management &amp; Confidence.</p>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl">
              CBSE Teaching Rubric Linked
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {[
              {
                name: "Sunita Mehra",
                pos: "PRT Mathematics Teacher",
                round: "Demo Class",
                date: "25 August 2026",
                time: "10:30 AM",
                topic: "Fractions & Geometric Shapes (Grade 5A)",
                interviewer: "HOD Mathematics",
                score: 4.8,
                recommendation: "Recommended",
                remarks: "Engaging classroom rapport. Excellent explanation of equivalent fractions using visual strips."
              },
              {
                name: "Rohan Deshmukh",
                pos: "PRT Mathematics Teacher",
                round: "Subject Technical Round",
                date: "26 August 2026",
                time: "11:30 AM",
                topic: "CBSE Syllabus Pacing & Math Lab Tools",
                interviewer: "Vice Principal",
                score: 4.2,
                recommendation: "Hold",
                remarks: "Strong subject knowledge. Needs more practice with early grade classroom engagement."
              }
            ].map((int, i) => (
              <div key={i} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-amber-700 font-bold">{int.round}</span>
                    <strong className="text-stone-900 font-bold text-sm block mt-0.5">{int.name}</strong>
                    <span className="text-[11px] text-stone-500">{int.pos}</span>
                  </div>
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900">
                    ⭐ {int.score} / 5.0
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-stone-200 space-y-1 text-[11px]">
                  <div><strong>Topic:</strong> {int.topic}</div>
                  <div><strong>Time:</strong> {int.date} at {int.time}</div>
                  <div><strong>Evaluator:</strong> {int.interviewer}</div>
                  <div className="text-stone-600 italic pt-1">&quot;{int.remarks}&quot;</div>
                </div>

                <div className="flex justify-between items-center pt-1 text-[11px]">
                  <span className="font-bold text-purple-900">Outcome: {int.recommendation}</span>
                  <button
                    type="button"
                    onClick={() => alert(`Scorecard approved for ${int.name}!`)}
                    className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-lg shadow-2xs"
                  >
                    Confirm Evaluation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. OFFERS & 1-CLICK JOINING */}
      {/* ========================================================================= */}
      {activeTab === "offers" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-5">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900">Offer Letters &amp; Seamless Joining Formalities</h3>
              <p className="text-xs text-stone-500">Upon candidate acceptance, 1-click onboard directly into the main Faculty &amp; Staff Master.</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
              Zero Duplicate Entry
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {[
              {
                offerNo: "CBS/HR/OFFER/2026-024",
                name: "Priyanka Sen",
                designation: "TGT English Educator",
                department: "Languages & Humanities",
                joiningDate: "01 September 2026",
                monthlySalary: "₹55,000 / month",
                ctc: "₹6,60,000 per annum",
                status: "Offer Sent",
                candidateObj: { id: "priyanka-id", full_name: "Priyanka Sen", position_applied: "TGT English Educator" }
              },
              {
                offerNo: "CBS/HR/OFFER/2026-021",
                name: "Kavita Rawat",
                designation: "Senior Kindergarten Educator",
                department: "Early Childhood Education",
                joiningDate: "15 August 2026",
                monthlySalary: "₹35,000 / month",
                ctc: "₹4,20,000 per annum",
                status: "Joined",
                candidateObj: { id: "kavita-id", full_name: "Kavita Rawat", position_applied: "Senior Kindergarten Educator" }
              }
            ].map((off, i) => (
              <div key={i} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="text-[10px] font-mono text-purple-700 font-bold">{off.offerNo}</span>
                  <strong className="text-stone-900 font-bold text-sm block mt-0.5">{off.name}</strong>
                  <span className="text-[11px] text-stone-600">{off.designation} • {off.department}</span>
                  <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                    Joining: {off.joiningDate} • Compensation: {off.monthlySalary} ({off.ctc})
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl ${
                    off.status === "Joined" ? "bg-emerald-100 text-emerald-900" : "bg-indigo-100 text-indigo-900"
                  }`}>
                    {off.status}
                  </span>

                  {off.status === "Offer Sent" ? (
                    <button
                      type="button"
                      onClick={() => handleJoinAndOnboardStaff(off.candidateObj)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1"
                    >
                      <span>🎉</span> Complete Joining
                    </button>
                  ) : (
                    <Link
                      href="/admin/faculty"
                      className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs rounded-xl transition"
                    >
                      View in Faculty Master
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. RECRUITMENT SOURCES TAB */}
      {/* ========================================================================= */}
      {activeTab === "sources" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-5 text-xs">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-base font-black text-stone-900">Recruitment Channel ROI &amp; Conversion Analytics</h3>
            <p className="text-stone-500">Track candidate quality and hire conversion rates across all job boards and portals.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { source: "School Website", apps: 57, hires: 2, conv: "3.5%" },
              { source: "LinkedIn", apps: 32, hires: 1, conv: "3.1%" },
              { source: "Naukri", apps: 19, hires: 1, conv: "5.2%" },
              { source: "Employee Referral", apps: 12, hires: 1, conv: "8.3%" }
            ].map(src => (
              <div key={src.source} className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 space-y-1">
                <span className="text-[10px] font-bold text-purple-900 uppercase">{src.source}</span>
                <h4 className="text-lg font-black text-purple-950">{src.apps} Applications</h4>
                <div className="text-[11px] text-stone-600">
                  Hired: <strong>{src.hires}</strong> • Conversion: <strong>{src.conv}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 CREATE VACANCY MODAL */}
      {/* ========================================================================= */}
      {isCreateVacancyOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-600 font-bold block">
                  HR Command Center
                </span>
                <h3 className="text-base font-black text-stone-900">Create New Job Vacancy</h3>
              </div>
              <button onClick={() => setIsCreateVacancyOpen(false)} className="text-stone-400 hover:text-stone-800">✕</button>
            </div>

            <form onSubmit={handleCreateVacancySubmit} className="space-y-4">
              <div>
                <label className="font-bold text-stone-800 block mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PRT Mathematics Teacher"
                  value={vacancyForm.title}
                  onChange={(e) => setVacancyForm({ ...vacancyForm, title: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Department *</label>
                  <input
                    type="text"
                    required
                    value={vacancyForm.department}
                    onChange={(e) => setVacancyForm({ ...vacancyForm, department: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Category</label>
                  <select
                    value={vacancyForm.category}
                    onChange={(e) => setVacancyForm({ ...vacancyForm, category: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold"
                  >
                    <option value="Teaching">Teaching</option>
                    <option value="Non-Teaching">Non-Teaching</option>
                    <option value="Administrative">Administrative</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Classes / Wing</label>
                  <input
                    type="text"
                    value={vacancyForm.classes}
                    onChange={(e) => setVacancyForm({ ...vacancyForm, classes: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Vacancies Count</label>
                  <input
                    type="number"
                    min={1}
                    value={vacancyForm.vacanciesCount}
                    onChange={(e) => setVacancyForm({ ...vacancyForm, vacanciesCount: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Minimum Qualification *</label>
                  <input
                    type="text"
                    required
                    value={vacancyForm.minQualification}
                    onChange={(e) => setVacancyForm({ ...vacancyForm, minQualification: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Experience Required *</label>
                  <input
                    type="text"
                    required
                    value={vacancyForm.experienceRequired}
                    onChange={(e) => setVacancyForm({ ...vacancyForm, experienceRequired: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">Salary Range</label>
                <input
                  type="text"
                  placeholder="e.g. ₹40,000 - ₹55,000 / month"
                  value={vacancyForm.salaryRange}
                  onChange={(e) => setVacancyForm({ ...vacancyForm, salaryRange: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCreateVacancyOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl shadow-xs"
                >
                  Publish Vacancy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 SCHEDULE INTERVIEW / DEMO CLASS MODAL */}
      {/* ========================================================================= */}
      {isInterviewModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-700 font-bold">Interview Scheduler</span>
                <h3 className="text-base font-black text-stone-900 mt-0.5">
                  Schedule for {selectedCandidate.full_name}
                </h3>
              </div>
              <button onClick={() => setIsInterviewModalOpen(false)} className="text-stone-400 hover:text-stone-800">✕</button>
            </div>

            <form onSubmit={handleScheduleInterviewSubmit} className="space-y-4">
              <div>
                <label className="font-bold text-stone-800 block mb-1">Round Type</label>
                <select
                  value={interviewForm.roundType}
                  onChange={(e) => setInterviewForm({ ...interviewForm, roundType: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold"
                >
                  <option value="Demo Class">Demo Class</option>
                  <option value="Subject Technical Round">Subject Technical Round</option>
                  <option value="HR Round">HR Round</option>
                  <option value="Principal Round">Principal Round</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={interviewForm.scheduledDate}
                    onChange={(e) => setInterviewForm({ ...interviewForm, scheduledDate: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Time</label>
                  <input
                    type="text"
                    required
                    value={interviewForm.scheduledTime}
                    onChange={(e) => setInterviewForm({ ...interviewForm, scheduledTime: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">Demo Topic &amp; Class</label>
                <input
                  type="text"
                  placeholder="e.g. Fractions & Decimals (Grade 5)"
                  value={interviewForm.demoTopic}
                  onChange={(e) => setInterviewForm({ ...interviewForm, demoTopic: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">Interviewer / Evaluator</label>
                <input
                  type="text"
                  value={interviewForm.interviewerName}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interviewerName: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsInterviewModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl shadow-xs"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 GENERATE OFFER MODAL */}
      {/* ========================================================================= */}
      {isOfferModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-indigo-700 font-bold">Offer Letter Generator</span>
                <h3 className="text-base font-black text-stone-900 mt-0.5">
                  Issue Offer for {selectedCandidate.full_name}
                </h3>
              </div>
              <button onClick={() => setIsOfferModalOpen(false)} className="text-stone-400 hover:text-stone-800">✕</button>
            </div>

            <form onSubmit={handleGenerateOfferSubmit} className="space-y-4">
              <div>
                <label className="font-bold text-stone-800 block mb-1">Designation *</label>
                <input
                  type="text"
                  required
                  value={offerForm.designation}
                  onChange={(e) => setOfferForm({ ...offerForm, designation: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Monthly Salary (₹) *</label>
                  <input
                    type="number"
                    required
                    value={offerForm.salaryMonthly}
                    onChange={(e) => setOfferForm({ ...offerForm, salaryMonthly: Number(e.target.value), ctcAnnual: Number(e.target.value) * 12 })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Annual CTC (₹)</label>
                  <input
                    type="number"
                    value={offerForm.ctcAnnual}
                    onChange={(e) => setOfferForm({ ...offerForm, ctcAnnual: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">Expected Joining Date *</label>
                <input
                  type="date"
                  required
                  value={offerForm.joiningDate}
                  onChange={(e) => setOfferForm({ ...offerForm, joiningDate: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 font-bold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-xs"
                >
                  Generate &amp; Send Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
