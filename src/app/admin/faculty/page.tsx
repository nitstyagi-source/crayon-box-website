"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, Plus, Search, Filter, Mail, Phone, GraduationCap, 
  Award, ShieldCheck, Edit3, Trash2, X, Check, LayoutGrid, 
  Table as TableIcon, Sparkles, BookOpen, Star, UserCheck, 
  ExternalLink, Building2, Briefcase, FileText, ChevronRight,
  Clock, AlertCircle, ArrowRight, ShieldAlert, Heart, Activity
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getFacultyList, 
  createFacultyMember, 
  updateFacultyMember, 
  deleteFacultyMember 
} from "@/app/actions/faculty";
import { getManagementExecutiveDashboard } from "@/app/actions/faculty-enterprise";
import { getClasses } from "@/app/actions/classes";
import FileUpload from "@/components/admin/FileUpload";

const CATEGORIES = [
  "All",
  "Teaching",
  "Non-Teaching",
  "Administration",
  "Support Staff",
  "Leadership"
];

const DEPARTMENTS = [
  "All",
  "Sciences & Robotics",
  "Mathematics",
  "Early Childhood Education",
  "Languages",
  "Arts & Humanities",
  "Sports & Physical Education",
  "Student Welfare",
  "Administration"
];

const WINGS = [
  "All Wings",
  "Early Years",
  "Primary (1-5)",
  "Middle School (6-8)",
  "Senior Secondary",
  "Administration"
];

export default function FacultyAdminDashboard() {
  const { activeCampusId } = useCampusContext();
  const [faculty, setFaculty] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [execKpis, setExecKpis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedWing, setSelectedWing] = useState("All Wings");
  const [statusFilter, setStatusFilter] = useState<"Active" | "On Leave" | "Former" | "All">("Active");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "address" | "academic" | "qualifications" | "documents">("basic");
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    employee_id: "",
    employee_code: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "Female",
    dob: "",
    blood_group: "O+",
    nationality: "Indian",
    marital_status: "Married",
    personal_mobile: "",
    whatsapp_no: "",
    personal_email: "",
    official_email: "",
    email: "",
    phone_number: "",
    emergency_contact: "",
    photo_url: "",
    designation: "PRT Teacher",
    role: "Teacher",
    employee_category: "Teaching",
    department: "Sciences & Robotics",
    wing: "Primary (1-5)",
    qualification: "M.Sc, B.Ed",
    experience_years: "6 Years",
    total_experience: "8 Years",
    experience_in_school: "3 Years",
    previous_school: "Delhi Public School",
    previous_designation: "TGT Teacher",
    joining_date: "",
    confirmation_date: "",
    probation_period: "6 Months",
    notice_period: "30 Days",
    employment_type: "Permanent",
    status: "Active",
    subjects_taught: "",
    is_class_teacher: false,
    class_teacher_for: "",
    bio: "",
    is_leadership: false,
    order_index: 10,
    aadhaar_no: "",
    pan_no: "",
    resume_url: "",
    police_verification_status: "Verified",
    basic_salary: 35000,
    hra: 14000,
    conveyance: 3000,
    special_allowance: 8000,
    gross_salary: 60000,
    net_salary: 56700,
    bank_name: "HDFC Bank",
    bank_account_no: "",
    bank_ifsc: ""
  });

  useEffect(() => {
    loadFacultyData();
  }, [activeCampusId, selectedCategory, selectedDept, selectedWing, statusFilter]);

  async function loadFacultyData() {
    setIsLoading(true);
    try {
      const [facRes, kpiRes, classRes] = await Promise.all([
        getFacultyList(activeCampusId, {
          search: searchTerm,
          category: selectedCategory,
          department: selectedDept,
          wing: selectedWing === "All Wings" ? "All" : selectedWing,
          status: statusFilter === "Former" ? "Resigned" : statusFilter
        }),
        getManagementExecutiveDashboard(activeCampusId),
        getClasses(activeCampusId)
      ]);

      if (facRes.success) setFaculty(facRes.data);
      if (kpiRes.success) setExecKpis(kpiRes.data);
      if (classRes.success) setClasses(classRes.data);
    } catch (e) {
      console.error("Failed to load faculty:", e);
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenAdd() {
    setIsEditing(false);
    setActiveTab("basic");
    const randomNum = Math.floor(100 + Math.random() * 900);
    setFormData({
      id: "",
      employee_id: `CB-FAC-${randomNum}`,
      employee_code: `FAC2026${randomNum}`,
      first_name: "",
      middle_name: "",
      last_name: "",
      gender: "Female",
      dob: "",
      blood_group: "O+",
      nationality: "Indian",
      marital_status: "Married",
      personal_mobile: "",
      whatsapp_no: "",
      personal_email: "",
      official_email: "",
      email: "",
      phone_number: "",
      emergency_contact: "",
      photo_url: "",
      designation: "Teacher",
      role: "Teacher",
      employee_category: "Teaching",
      department: "Sciences & Robotics",
      wing: "Primary (1-5)",
      qualification: "M.Sc, B.Ed",
      experience_years: "5 Years",
      total_experience: "7 Years",
      experience_in_school: "2 Years",
      previous_school: "Delhi Public School",
      previous_designation: "TGT Teacher",
      joining_date: new Date().toISOString().split("T")[0],
      confirmation_date: "",
      probation_period: "6 Months",
      notice_period: "30 Days",
      employment_type: "Permanent",
      status: "Active",
      subjects_taught: "",
      is_class_teacher: false,
      class_teacher_for: classes[0]?.grade ? `${classes[0].grade}-${classes[0].section}` : "Grade 1-A",
      bio: "",
      is_leadership: false,
      order_index: (faculty.length || 0) + 1,
      aadhaar_no: "",
      pan_no: "",
      resume_url: "",
      police_verification_status: "Verified",
      basic_salary: 35000,
      hra: 14000,
      conveyance: 3000,
      special_allowance: 8000,
      gross_salary: 60000,
      net_salary: 56700,
      bank_name: "HDFC Bank",
      bank_account_no: "",
      bank_ifsc: ""
    });
    setModalOpen(true);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    try {
      let res;
      if (isEditing) {
        res = await updateFacultyMember(formData.id, formData);
      } else {
        res = await createFacultyMember({ ...formData, campus_id: activeCampusId });
      }

      if (res.success) {
        setModalOpen(false);
        loadFacultyData();
      } else {
        alert("Failed to save faculty member: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string, name: string, empId?: string) {
    if (!confirm(`Are you sure you want to permanently remove ${name} (${empId || 'Staff Member'}) from the staff records?\n\nThis will also remove all associated 360° dossiers (attendance, qualifications, timetable, documents).`)) return;
    setIsLoading(true);
    const res = await deleteFacultyMember(id);
    if (res.success) {
      alert(`Staff member ${name} removed successfully.`);
      await loadFacultyData();
    } else {
      alert("Failed to delete member: " + res.error);
      setIsLoading(false);
    }
  }

  const filteredFaculty = faculty.filter(f => {
    if (selectedCategory !== "All") {
      if (selectedCategory === "Leadership" && !f.is_leadership) return false;
      if (selectedCategory !== "Leadership" && f.employee_category !== selectedCategory && f.employee_category) return false;
    }
    if (selectedDept !== "All" && f.department !== selectedDept) return false;
    if (selectedWing !== "All" && selectedWing !== "All Wings" && f.wing !== selectedWing) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const fullName = `${f.first_name || ''} ${f.middle_name || ''} ${f.last_name || ''}`.toLowerCase();
    return (
      fullName.includes(term) ||
      (f.employee_id && f.employee_id.toLowerCase().includes(term)) ||
      (f.designation && f.designation.toLowerCase().includes(term)) ||
      (f.subjects_taught && f.subjects_taught.toLowerCase().includes(term)) ||
      (f.department && f.department.toLowerCase().includes(term))
    );
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-800 text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Faculty & Employee LifeCycle
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Academic Session 2026-2027</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Faculty & Staff Command Hub</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">Central profile and workflow system for teachers, coordinators, admin, and support employees.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Link
            href="/admin/faculty/substitutions"
            className="bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold px-4 py-2.5 rounded-2xl text-xs border border-purple-200 flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-4 h-4 text-purple-600" /> Smart Substitution Hub
          </Link>
          <button 
            onClick={handleOpenAdd}
            className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-5 py-2.5 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-amber-400" /> Onboard Employee
          </button>
        </div>
      </div>

      {/* 21. PRINCIPAL / MANAGEMENT EXECUTIVE DASHBOARD TABLE */}
      {execKpis && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" /> Principal & Executive Operations Dashboard
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Live Biometric & Academic Sync
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-[10px] font-bold text-stone-400 uppercase">Total Headcount</span>
              <p className="text-xl font-black text-stone-900 mt-0.5">{execKpis.totalEmployees}</p>
              <span className="text-[10px] text-blue-600 font-bold">{execKpis.teachingStaff} Teaching Staff</span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Present Today</span>
              <p className="text-xl font-black text-emerald-700 mt-0.5">{execKpis.presentToday}</p>
              <span className="text-[10px] text-emerald-600 font-bold">Biometric In-Sync</span>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
              <span className="text-[10px] font-bold text-amber-800 uppercase">On Leave</span>
              <p className="text-xl font-black text-amber-700 mt-0.5">{execKpis.onLeaveToday}</p>
              <span className="text-[10px] text-amber-600 font-bold">Approved Leaves</span>
            </div>

            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200">
              <span className="text-[10px] font-bold text-purple-800 uppercase">Lesson Plans</span>
              <p className="text-xl font-black text-purple-700 mt-0.5">{execKpis.pendingLessonPlans}</p>
              <span className="text-[10px] text-purple-600 font-bold">Active Syllabus</span>
            </div>

            <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-200">
              <span className="text-[10px] font-bold text-indigo-800 uppercase">Substitutions</span>
              <p className="text-xl font-black text-indigo-700 mt-0.5">{execKpis.openSubstitutions}</p>
              <span className="text-[10px] text-indigo-600 font-bold">Auto-Optimized</span>
            </div>

            <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200">
              <span className="text-[10px] font-bold text-rose-800 uppercase">Appraisals</span>
              <p className="text-xl font-black text-rose-700 mt-0.5">4.8 / 5.0</p>
              <span className="text-[10px] text-rose-600 font-bold">Annual Avg Rating</span>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar: Search, Category Tabs, Filters, View Modes */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
        
        {/* Category Pill Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-stone-100">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? "bg-stone-900 text-white shadow-sm"
                  : "bg-stone-50 text-stone-600 hover:bg-stone-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Instant Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search name, emp ID, subject..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-900 transition-all font-medium"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Department, Wing & Status Selectors */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select 
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="bg-stone-50 border border-stone-200 px-3 py-2 rounded-xl text-xs font-bold text-stone-700"
            >
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select 
              value={selectedWing}
              onChange={e => setSelectedWing(e.target.value)}
              className="bg-stone-50 border border-stone-200 px-3 py-2 rounded-xl text-xs font-bold text-stone-700"
            >
              {WINGS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>

            {/* View Switcher */}
            <div className="flex bg-stone-100 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-lg transition-all ${viewMode === "cards" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"}`}
                title="Grid Cards"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-all ${viewMode === "table" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"}`}
                title="Data Table"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Rendering */}
      {isLoading ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200">
          <p className="text-stone-400 font-bold text-xs animate-pulse">Loading employee records...</p>
        </div>
      ) : filteredFaculty.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 space-y-3">
          <Users className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-sm font-bold text-stone-800">No staff members found</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">Try adjusting filters or enroll a new employee.</p>
        </div>
      ) : viewMode === "cards" ? (
        
        /* 1. Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculty.map(member => (
            <div 
              key={member.id} 
              className={`bg-white rounded-3xl border p-6 flex flex-col justify-between hover:shadow-lg transition-all group ${
                member.is_leadership ? "border-amber-200 bg-gradient-to-b from-amber-50/20 to-white" : "border-stone-200"
              }`}
            >
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative shrink-0">
                    {member.photo_url ? (
                      <img 
                        src={member.photo_url} 
                        alt={member.first_name} 
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-stone-200 shadow-sm group-hover:scale-105 transition-transform" 
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-stone-100 border-2 border-stone-200 flex items-center justify-center font-black text-xl text-stone-600">
                        {member.first_name[0]}{member.last_name[0]}
                      </div>
                    )}
                    {member.is_leadership && (
                      <span className="absolute -top-2 -right-2 bg-amber-500 text-white p-1 rounded-full shadow" title="Leadership Council">
                        <Star className="w-3 h-3 fill-current" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-stone-900 text-base truncate">
                      {member.first_name} {member.middle_name || ''} {member.last_name}
                    </h3>
                    <p className="text-xs font-bold text-blue-600 truncate mt-0.5">{member.designation || member.role}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono font-bold bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded border border-stone-200">
                        {member.employee_id || 'ID N/A'}
                      </span>
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded">
                        {member.employee_category || "Teaching"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-stone-600 pt-2 border-t border-stone-100">
                  <div className="flex justify-between">
                    <span className="text-stone-400 font-bold uppercase text-[10px]">Department</span>
                    <span className="font-bold text-stone-800">{member.department || 'Academics'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-stone-400 font-bold uppercase text-[10px]">Wing</span>
                    <span className="font-medium text-stone-700">{member.wing || 'All Wings'}</span>
                  </div>

                  {member.is_class_teacher && member.class_teacher_for && (
                    <div className="flex justify-between items-center bg-purple-50 p-2 rounded-xl border border-purple-100 text-[11px]">
                      <span className="text-purple-800 font-bold flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-purple-600" /> Class In-Charge:
                      </span>
                      <span className="font-black text-purple-900 font-mono">{member.class_teacher_for}</span>
                    </div>
                  )}

                  {member.subjects_taught && (
                    <div className="flex items-start gap-1.5 text-stone-500 pt-1">
                      <BookOpen className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span className="truncate text-[11px]">{member.subjects_taught}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 360° Dossier Link Button & Delete Option */}
              <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-stone-100">
                <Link
                  href={`/admin/faculty/${member.id}`}
                  className="flex-1 bg-stone-900 hover:bg-stone-800 text-white py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  Open 360° Master File <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(member.id, `${member.first_name} ${member.last_name}`, member.employee_id)}
                  title="Delete Staff Member"
                  className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200 transition-all flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (

        /* 2. Table List View */
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Faculty Member</th>
                  <th className="p-4">Emp ID</th>
                  <th className="p-4">Category & Role</th>
                  <th className="p-4">Department & Wing</th>
                  <th className="p-4">Class In-Charge</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredFaculty.map(member => (
                  <tr key={member.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {member.photo_url ? (
                          <img src={member.photo_url} alt="" className="w-10 h-10 rounded-xl object-cover border border-stone-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center font-bold">
                            {member.first_name[0]}{member.last_name[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-stone-900 text-sm">{member.first_name} {member.last_name}</p>
                          <p className="text-stone-400 text-[11px]">{member.email || member.phone_number || 'No contact'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-stone-700">{member.employee_id || 'N/A'}</td>
                    <td className="p-4">
                      <span className="font-bold text-blue-700 block">{member.designation || member.role}</span>
                      <span className="text-stone-400 text-[11px]">{member.employee_category || "Teaching"}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-stone-800 block">{member.department}</span>
                      <span className="text-stone-500 text-[11px]">{member.wing}</span>
                    </td>
                    <td className="p-4">
                      {member.is_class_teacher ? (
                        <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-md text-[11px]">
                          {member.class_teacher_for || 'Yes'}
                        </span>
                      ) : (
                        <span className="text-stone-400 text-[11px]">Subject Teacher</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-700'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/faculty/${member.id}`}
                          className="inline-flex items-center gap-1 bg-stone-100 hover:bg-stone-200 text-stone-800 px-3 py-1.5 rounded-xl font-bold text-xs"
                        >
                          View File <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(member.id, `${member.first_name} ${member.last_name}`, member.employee_id)}
                          title="Delete Staff Member"
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200 transition-all flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5-Step Enrollment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl border border-stone-100 my-8 space-y-6">
            
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-xl font-black text-stone-900">Onboard Faculty & Staff Member</h3>
                <p className="text-xs text-stone-500">Enter master profile, credentials, and department allocations.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <FileUpload 
                label="Passport Photo"
                value={formData.photo_url}
                onChange={url => setFormData({...formData, photo_url: url})}
                folder="faculty_photos"
                mode="avatar"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-bold text-stone-500 block mb-1">First Name *</label>
                  <input required type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-xs font-bold" />
                </div>
                <div>
                  <label className="font-bold text-stone-500 block mb-1">Middle Name</label>
                  <input type="text" value={formData.middle_name} onChange={e => setFormData({...formData, middle_name: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-xs" />
                </div>
                <div>
                  <label className="font-bold text-stone-500 block mb-1">Last Name *</label>
                  <input required type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-xs font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-bold text-stone-500 block mb-1">Employee Category</label>
                  <select value={formData.employee_category} onChange={e => setFormData({...formData, employee_category: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl font-bold">
                    <option value="Teaching">Teaching Faculty</option>
                    <option value="Non-Teaching">Non-Teaching Staff</option>
                    <option value="Administration">Administrative Office</option>
                    <option value="Support Staff">Support Staff</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-500 block mb-1">Designation</label>
                  <input type="text" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl font-bold" />
                </div>
                <div>
                  <label className="font-bold text-stone-500 block mb-1">Department</label>
                  <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl font-bold">
                    {DEPARTMENTS.filter(d => d !== "All").map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-stone-500 block mb-1">Official / Personal Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-xs" />
                </div>
                <div>
                  <label className="font-bold text-stone-500 block mb-1">Mobile Phone *</label>
                  <input required type="text" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-xs font-mono" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 font-bold text-stone-500 text-xs">Cancel</button>
                <button type="submit" disabled={isSaving} className="bg-stone-900 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md">
                  {isSaving ? "Saving..." : "Enroll Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
