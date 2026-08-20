"use client";

import { useEffect, useState } from "react";
import { 
  Users, Plus, Search, Filter, Mail, Phone, GraduationCap, 
  Award, ShieldCheck, Edit3, Trash2, X, Check, LayoutGrid, 
  Table as TableIcon, Sparkles, BookOpen, Star, UserCheck, 
  ExternalLink, Building2, Briefcase, FileText, ChevronRight
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getFacultyList, 
  getFacultyStats, 
  createFacultyMember, 
  updateFacultyMember, 
  deleteFacultyMember 
} from "@/app/actions/faculty";
import { getClasses } from "@/app/actions/classes";
import FileUpload from "@/components/admin/FileUpload";

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
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedWing, setSelectedWing] = useState("All Wings");
  const [statusFilter, setStatusFilter] = useState<"Active" | "On Leave" | "Former" | "All">("Active");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "academic" | "compliance">("basic");
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    employee_id: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "Female",
    dob: "",
    blood_group: "",
    email: "",
    phone_number: "",
    emergency_contact: "",
    photo_url: "",
    designation: "PRT Teacher",
    role: "Teacher",
    department: "Sciences & Robotics",
    wing: "Primary (1-5)",
    qualification: "",
    experience_years: "",
    joining_date: "",
    employment_type: "Full-Time",
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
    police_verification_status: "Verified"
  });

  useEffect(() => {
    loadFacultyData();
  }, [activeCampusId, selectedDept, selectedWing, statusFilter]);

  async function loadFacultyData() {
    setIsLoading(true);
    try {
      const [facRes, statsRes, classRes] = await Promise.all([
        getFacultyList(activeCampusId, {
          search: searchTerm,
          department: selectedDept,
          wing: selectedWing,
          status: statusFilter === "Former" ? "Resigned" : statusFilter
        }),
        getFacultyStats(activeCampusId),
        getClasses(activeCampusId)
      ]);

      if (facRes.success) setFaculty(facRes.data);
      if (statsRes.success) setStats(statsRes.data);
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
      first_name: "",
      middle_name: "",
      last_name: "",
      gender: "Female",
      dob: "",
      blood_group: "",
      email: "",
      phone_number: "",
      emergency_contact: "",
      photo_url: "",
      designation: "Teacher",
      role: "Teacher",
      department: "Sciences & Robotics",
      wing: "Primary (1-5)",
      qualification: "",
      experience_years: "",
      joining_date: new Date().toISOString().split("T")[0],
      employment_type: "Full-Time",
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
      police_verification_status: "Verified"
    });
    setModalOpen(true);
  }

  function handleOpenEdit(member: any) {
    setIsEditing(true);
    setActiveTab("basic");
    setFormData({
      id: member.id,
      employee_id: member.employee_id || "",
      first_name: member.first_name || "",
      middle_name: member.middle_name || "",
      last_name: member.last_name || "",
      gender: member.gender || "Female",
      dob: member.dob || "",
      blood_group: member.blood_group || "",
      email: member.email || "",
      phone_number: member.phone_number || "",
      emergency_contact: member.emergency_contact || "",
      photo_url: member.photo_url || "",
      designation: member.designation || member.role || "Teacher",
      role: member.role || "Teacher",
      department: member.department || "General Academics",
      wing: member.wing || "Primary (1-5)",
      qualification: member.qualification || "",
      experience_years: member.experience_years || "",
      joining_date: member.joining_date || "",
      employment_type: member.employment_type || "Full-Time",
      status: member.status || "Active",
      subjects_taught: member.subjects_taught || "",
      is_class_teacher: Boolean(member.is_class_teacher),
      class_teacher_for: member.class_teacher_for || "",
      bio: member.bio || "",
      is_leadership: Boolean(member.is_leadership),
      order_index: member.order_index || 0,
      aadhaar_no: member.aadhaar_no || "",
      pan_no: member.pan_no || "",
      resume_url: member.resume_url || "",
      police_verification_status: member.police_verification_status || "Verified"
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

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to permanently remove ${name} from the staff records?`)) return;
    const res = await deleteFacultyMember(id);
    if (res.success) {
      loadFacultyData();
    } else {
      alert("Failed to delete member: " + res.error);
    }
  }

  const filteredFaculty = faculty.filter(f => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const fullName = `${f.first_name} ${f.middle_name || ''} ${f.last_name}`.toLowerCase();
    return (
      fullName.includes(term) ||
      (f.employee_id && f.employee_id.toLowerCase().includes(term)) ||
      (f.designation && f.designation.toLowerCase().includes(term)) ||
      (f.subjects_taught && f.subjects_taught.toLowerCase().includes(term)) ||
      (f.department && f.department.toLowerCase().includes(term))
    );
  });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-800 text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Staff & Mentors Hub
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Academic Year 2026-2027</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Faculty & Staff Management</h1>
          <p className="text-stone-500 text-sm mt-1">Manage educators, leadership profiles, class teacher allocations, and public mentors directory.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleOpenAdd}
            className="flex-1 md:flex-none bg-stone-900 hover:bg-stone-800 text-white font-bold px-5 py-3 rounded-2xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 text-amber-400" /> Add Faculty Member
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-stone-400 text-xs font-bold uppercase tracking-wider">Total Staff</p>
          <h3 className="text-2xl font-black text-stone-900 mt-1">{stats?.totalStaff ?? faculty.length}</h3>
          <p className="text-stone-400 text-xs mt-1">Across all branches</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-stone-400 text-xs font-bold uppercase tracking-wider">Active Teachers</p>
          <h3 className="text-2xl font-black text-green-600 mt-1">{stats?.activeStaffCount ?? faculty.filter(f => f.status === 'Active').length}</h3>
          <p className="text-stone-400 text-xs mt-1">In active classrooms</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-stone-400 text-xs font-bold uppercase tracking-wider">Student-Teacher Ratio</p>
          <h3 className="text-2xl font-black text-blue-600 mt-1">{stats?.studentTeacherRatio ?? "1:12"}</h3>
          <p className="text-stone-400 text-xs mt-1">Personalized attention</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-stone-400 text-xs font-bold uppercase tracking-wider">Class Teachers</p>
          <h3 className="text-2xl font-black text-purple-600 mt-1">{stats?.classTeachersCount ?? faculty.filter(f => f.is_class_teacher).length}</h3>
          <p className="text-stone-400 text-xs mt-1">Class in-charges</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm col-span-2 lg:col-span-1">
          <p className="text-stone-400 text-xs font-bold uppercase tracking-wider">Leadership & HODs</p>
          <h3 className="text-2xl font-black text-amber-600 mt-1">{stats?.leadershipCount ?? faculty.filter(f => f.is_leadership).length}</h3>
          <p className="text-stone-400 text-xs mt-1">Mentors & governance</p>
        </div>
      </div>

      {/* Filter & View Controls */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Instant Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search name, emp ID, subject..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-900 transition-all font-medium"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Wing & Status Selectors */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <select 
              value={selectedWing}
              onChange={e => setSelectedWing(e.target.value)}
              className="bg-stone-50 border border-stone-200 px-3.5 py-2 rounded-xl text-xs font-bold text-stone-700"
            >
              {WINGS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>

            {/* Status Segmented Buttons */}
            <div className="flex bg-stone-100 p-1 rounded-xl">
              {(["Active", "On Leave", "Former", "All"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    statusFilter === tab ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* View Switcher */}
            <div className="flex bg-stone-100 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-lg transition-all ${viewMode === "cards" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"}`}
                title="Cards Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-all ${viewMode === "table" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"}`}
                title="Table List View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Department Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-100 items-center">
          <span className="text-[11px] font-bold text-stone-400 uppercase mr-1">Department:</span>
          {DEPARTMENTS.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedDept === dept 
                  ? "bg-stone-900 text-white shadow-sm" 
                  : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200/60"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Content Rendering: Cards vs Table */}
      {isLoading ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200">
          <p className="text-stone-400 font-bold text-sm animate-pulse">Loading faculty & staff directory...</p>
        </div>
      ) : filteredFaculty.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 space-y-3">
          <Users className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">No faculty members found</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">Try clearing search filters or click &quot;Add Faculty Member&quot; to enroll your educators.</p>
          <button onClick={handleOpenAdd} className="mt-2 bg-stone-900 text-white font-bold text-xs px-4 py-2 rounded-xl">
            Add First Faculty Member
          </button>
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
                {/* Header: Photo & Quick Meta */}
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
                      <span className="absolute -top-2 -right-2 bg-amber-500 text-white p-1 rounded-full shadow" title="Leadership Team">
                        <Star className="w-3 h-3 fill-current" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-stone-900 text-base truncate">
                        {member.first_name} {member.middle_name || ''} {member.last_name}
                      </h3>
                    </div>
                    <p className="text-xs font-bold text-blue-600 truncate mt-0.5">{member.designation || member.role}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono font-bold bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded border border-stone-200">
                        {member.employee_id || 'ID N/A'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-700'
                      }`}>
                        {member.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Badges */}
                <div className="space-y-2.5 text-xs text-stone-600 pt-2 border-t border-stone-100">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400 font-bold uppercase text-[10px]">Department</span>
                    <span className="font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded-md text-[11px]">{member.department || 'Academics'}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-stone-400 font-bold uppercase text-[10px]">Wing</span>
                    <span className="font-medium text-stone-700">{member.wing || 'All Wings'}</span>
                  </div>

                  {member.is_class_teacher && member.class_teacher_for && (
                    <div className="flex justify-between items-center bg-purple-50 p-2 rounded-xl border border-purple-100">
                      <span className="text-purple-800 font-bold flex items-center gap-1 text-[11px]">
                        <Award className="w-3.5 h-3.5 text-purple-600" /> Class In-Charge:
                      </span>
                      <span className="font-black text-purple-900 text-xs font-mono">{member.class_teacher_for}</span>
                    </div>
                  )}

                  {member.qualification && (
                    <div className="flex items-start gap-1.5 text-stone-500 pt-1">
                      <GraduationCap className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span className="truncate text-[11px]">{member.qualification} ({member.experience_years || 'Experienced'})</span>
                    </div>
                  )}

                  {member.subjects_taught && (
                    <div className="flex items-start gap-1.5 text-stone-500">
                      <BookOpen className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span className="truncate text-[11px]">{member.subjects_taught}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Actions */}
              <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-stone-100">
                <div className="flex items-center gap-1">
                  {member.email && (
                    <a 
                      href={`mailto:${member.email}`} 
                      className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      title={member.email}
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                  {member.phone_number && (
                    <a 
                      href={`tel:${member.phone_number}`} 
                      className="p-2 text-stone-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors"
                      title={member.phone_number}
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => handleOpenEdit(member)} 
                    className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(member.id, `${member.first_name} ${member.last_name}`)} 
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete Staff Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
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
                  <th className="p-4">Designation & Role</th>
                  <th className="p-4">Department & Wing</th>
                  <th className="p-4">Class In-Charge</th>
                  <th className="p-4">Compliance</th>
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
                      <span className="text-stone-400 text-[11px]">{member.employment_type}</span>
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
                      <span className="inline-flex items-center gap-1 text-green-700 font-bold text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-green-600" /> Verified
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-700'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button 
                          onClick={() => handleOpenEdit(member)}
                          className="bg-stone-100 hover:bg-stone-200 text-stone-700 p-2 rounded-xl"
                          title="Edit Faculty Member"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(member.id, `${member.first_name} ${member.last_name}`)}
                          className="text-stone-400 hover:text-red-600 p-2 rounded-xl"
                          title="Delete"
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

      {/* Modal: Add / Edit Faculty Member */}
      {modalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl border border-stone-100 my-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-2xl font-black text-stone-900">
                  {isEditing ? "Edit Faculty Profile" : "Enroll Faculty Member"}
                </h3>
                <p className="text-stone-500 text-xs mt-0.5">Enter demographics, credentials, department allocation, and class responsibility.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Sub Tabs */}
            <div className="flex gap-2 border-b border-stone-200 pb-3 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab("basic")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "basic" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                1. Identity & Photo
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("academic")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "academic" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                2. Academic & Classes
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("compliance")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "compliance" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                3. Employment & Legal
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              
              {/* Tab 1: Basic */}
              {activeTab === "basic" && (
                <div className="space-y-4">
                  <FileUpload 
                    label="Faculty Passport Photo"
                    value={formData.photo_url}
                    onChange={url => setFormData({...formData, photo_url: url})}
                    folder="faculty_photos"
                    mode="avatar"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">First Name *</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.first_name} 
                        onChange={e => setFormData({...formData, first_name: e.target.value})} 
                        className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" 
                        placeholder="e.g. Meenakshi"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Middle Name</label>
                      <input 
                        type="text" 
                        value={formData.middle_name} 
                        onChange={e => setFormData({...formData, middle_name: e.target.value})} 
                        className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Last Name *</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.last_name} 
                        onChange={e => setFormData({...formData, last_name: e.target.value})} 
                        className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" 
                        placeholder="e.g. Sundaram"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Employee ID *</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.employee_id} 
                        onChange={e => setFormData({...formData, employee_id: e.target.value})} 
                        className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-mono font-bold text-blue-700" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Gender</label>
                      <select 
                        value={formData.gender} 
                        onChange={e => setFormData({...formData, gender: e.target.value})}
                        className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-medium"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Date of Birth</label>
                      <input 
                        type="date" 
                        value={formData.dob} 
                        onChange={e => setFormData({...formData, dob: e.target.value})} 
                        className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Blood Group</label>
                      <input 
                        type="text" 
                        placeholder="e.g. O+, B+" 
                        value={formData.blood_group} 
                        onChange={e => setFormData({...formData, blood_group: e.target.value})} 
                        className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Official / Personal Email</label>
                      <input 
                        type="email" 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                        className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" 
                        placeholder="teacher@crayonboxschool.com"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Mobile Phone Number *</label>
                      <input 
                        required
                        type="text" 
                        value={formData.phone_number} 
                        onChange={e => setFormData({...formData, phone_number: e.target.value})} 
                        className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-mono" 
                        placeholder="10-digit mobile number"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Academic & Classes */}
              {activeTab === "academic" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Designation / Title *</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.designation} 
                        onChange={e => setFormData({...formData, designation: e.target.value})} 
                        className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-bold" 
                        placeholder="e.g. Senior Science Teacher"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Department *</label>
                      <select 
                        value={formData.department} 
                        onChange={e => setFormData({...formData, department: e.target.value})}
                        className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-bold text-stone-800"
                      >
                        {DEPARTMENTS.filter(d => d !== "All").map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">School Wing *</label>
                      <select 
                        value={formData.wing} 
                        onChange={e => setFormData({...formData, wing: e.target.value})}
                        className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-bold text-stone-800"
                      >
                        {WINGS.filter(w => w !== "All Wings").map(w => (
                          <option key={w} value={w}>{w}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Academic Qualifications</label>
                      <input 
                        type="text" 
                        placeholder="e.g. M.Sc Physics, B.Ed, CTET Qualified" 
                        value={formData.qualification} 
                        onChange={e => setFormData({...formData, qualification: e.target.value})} 
                        className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Teaching Experience</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 8+ Years" 
                        value={formData.experience_years} 
                        onChange={e => setFormData({...formData, experience_years: e.target.value})} 
                        className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-500 block mb-1">Subjects Taught (Comma-separated)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. General Science, Physics, Robotics & STEAM Lab" 
                      value={formData.subjects_taught} 
                      onChange={e => setFormData({...formData, subjects_taught: e.target.value})} 
                      className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" 
                    />
                  </div>

                  {/* Class Teacher Allocation */}
                  <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-purple-900">
                        <input 
                          type="checkbox" 
                          checked={formData.is_class_teacher} 
                          onChange={e => setFormData({...formData, is_class_teacher: e.target.checked})}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        Designate as Class Teacher (Class In-Charge)
                      </label>
                    </div>

                    {formData.is_class_teacher && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-purple-200">
                        <div>
                          <label className="text-xs font-bold text-purple-800 block mb-1">Select Assigned Class *</label>
                          <select 
                            value={formData.class_teacher_for} 
                            onChange={e => setFormData({...formData, class_teacher_for: e.target.value})}
                            className="w-full border border-purple-200 p-2 rounded-xl text-xs font-bold text-stone-800 bg-white"
                          >
                            <option value="">Choose Class</option>
                            {classes.map(c => (
                              <option key={c.id} value={`${c.grade}-${c.section}`}>
                                {c.grade} - Section {c.section}
                              </option>
                            ))}
                            <option value="Pre-Nursery">Pre-Nursery</option>
                            <option value="Nursery">Nursery</option>
                            <option value="Kindergarten">Kindergarten</option>
                            <option value="Grade 1-A">Grade 1-A</option>
                            <option value="Grade 2-A">Grade 2-A</option>
                            <option value="Grade 3-A">Grade 3-A</option>
                            <option value="Grade 4-A">Grade 4-A</option>
                            <option value="Grade 5-A">Grade 5-A</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-500 block mb-1">Mentor Bio / Profile Summary (For Website)</label>
                    <textarea 
                      rows={2}
                      placeholder="Brief note about teaching philosophy and experience..."
                      value={formData.bio}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                      className="w-full border border-stone-200 p-2.5 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Employment & Legal */}
              {activeTab === "compliance" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Employment Type</label>
                      <select 
                        value={formData.employment_type} 
                        onChange={e => setFormData({...formData, employment_type: e.target.value})}
                        className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-medium"
                      >
                        <option value="Full-Time">Full-Time Permanent</option>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Contractual">Contractual / Visiting</option>
                        <option value="Probation">Probation Period</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Joining Date</label>
                      <input 
                        type="date" 
                        value={formData.joining_date} 
                        onChange={e => setFormData({...formData, joining_date: e.target.value})} 
                        className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Status</label>
                      <select 
                        value={formData.status} 
                        onChange={e => setFormData({...formData, status: e.target.value})}
                        className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-bold text-stone-800"
                      >
                        <option value="Active">Active Staff</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Resigned">Resigned / Former</option>
                        <option value="Retired">Retired</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Aadhaar Card UID</label>
                      <input 
                        type="text" 
                        placeholder="12-digit UID" 
                        value={formData.aadhaar_no} 
                        onChange={e => setFormData({...formData, aadhaar_no: e.target.value})} 
                        className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-mono" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">PAN Card Number</label>
                      <input 
                        type="text" 
                        placeholder="10-digit PAN" 
                        value={formData.pan_no} 
                        onChange={e => setFormData({...formData, pan_no: e.target.value.toUpperCase()})} 
                        className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-mono" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Police Verification</label>
                      <select 
                        value={formData.police_verification_status} 
                        onChange={e => setFormData({...formData, police_verification_status: e.target.value})}
                        className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-bold text-green-700"
                      >
                        <option value="Verified">Verified & Cleared</option>
                        <option value="Pending">Under Process / Pending</option>
                        <option value="Exempt">Not Applicable</option>
                      </select>
                    </div>
                  </div>

                  <FileUpload 
                    label="Teacher Resume / CV (PDF or Image)"
                    value={formData.resume_url}
                    onChange={url => setFormData({...formData, resume_url: url})}
                    folder="faculty_resumes"
                    accept="application/pdf,image/*"
                    mode="document"
                    placeholder="Upload Resume / Certificates"
                  />

                  <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-amber-900 block">Feature in Public Leadership Section</label>
                      <p className="text-[11px] text-amber-700">Display prominently on the public /faculty page (Director, Principal, Headmistress).</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={formData.is_leadership} 
                      onChange={e => setFormData({...formData, is_leadership: e.target.checked})}
                      className="w-5 h-5 text-amber-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-stone-100">
                <div className="flex gap-2">
                  {activeTab !== "basic" && (
                    <button 
                      type="button" 
                      onClick={() => setActiveTab(activeTab === "compliance" ? "academic" : "basic")}
                      className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
                    >
                      ← Back
                    </button>
                  )}
                  {activeTab !== "compliance" && (
                    <button 
                      type="button" 
                      onClick={() => setActiveTab(activeTab === "basic" ? "academic" : "compliance")}
                      className="px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl"
                    >
                      Next Step →
                    </button>
                  )}
                </div>

                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setModalOpen(false)} 
                    className="px-5 py-2.5 font-bold text-stone-500 text-sm hover:bg-stone-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSaving} 
                    className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-7 py-2.5 rounded-xl text-sm disabled:opacity-50 shadow-md"
                  >
                    {isSaving ? "Saving..." : isEditing ? "Update Profile" : "Enroll Faculty Member"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
