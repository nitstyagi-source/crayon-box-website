"use client";

import { useState, useEffect } from "react";
import { 
  Users, Search, Plus, Filter, Download, GraduationCap, X, 
  UserMinus, UserCheck, Sparkles, Trash2, AlertTriangle, ChevronRight,
  Phone, User
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getStudents, createStudent, deleteStudentPermanently } from "@/app/actions/students";
import { getClasses } from "@/app/actions/classes";
import Link from "next/link";

export default function StudentsDirectory() {
  const { activeCampusId } = useCampusContext();
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "former" | "ews" | "all">("active");
  const [classFilter, setClassFilter] = useState("All");
  
  // Registration Modal State
  const [isAdding, setIsAdding] = useState(false);
  const [regTab, setRegTab] = useState<"student" | "father" | "mother" | "guardian">("student");
  const [formData, setFormData] = useState({
    // Student
    admission_no: "",
    pen_no: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    dob: "",
    gender: "Male",
    category: "General",
    blood_group: "",
    aadhaar_no: "",
    nationality: "Indian",
    class_name: "Grade 1",
    section_name: "A",
    roll_no: "",

    // Father
    father_name: "",
    father_mobile: "",
    father_email: "",
    father_occupation: "",
    father_income: "",
    father_qualification: "",
    father_aadhaar: "",

    // Mother
    mother_name: "",
    mother_mobile: "",
    mother_email: "",
    mother_occupation: "",
    mother_income: "",
    mother_qualification: "",
    mother_aadhaar: "",

    // Guardian
    guardian_name: "",
    guardian_mobile: "",
    guardian_email: "",
    guardian_occupation: "",

    // Primary
    primary_contact: "Father"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<any>(null);

  useEffect(() => {
    if (activeCampusId) loadData();
  }, [activeCampusId]);

  async function loadData() {
    setIsLoading(true);
    const [stRes, clsRes] = await Promise.all([
      getStudents(activeCampusId),
      getClasses(activeCampusId)
    ]);
    if (stRes.success && stRes.data) setStudents(stRes.data);
    if (clsRes.success && clsRes.data) setClasses(clsRes.data);
    setIsLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await createStudent({
      ...formData,
      campus_id: activeCampusId
    });
    
    setIsSubmitting(false);
    if (res.success) {
      setIsAdding(false);
      loadData();
      // Reset form
      setFormData({
        admission_no: "", pen_no: "", first_name: "", middle_name: "", last_name: "", dob: "", gender: "Male",
        category: "General", blood_group: "", aadhaar_no: "", nationality: "Indian",
        class_name: "Grade 1", section_name: "A", roll_no: "",
        father_name: "", father_mobile: "", father_email: "", father_occupation: "", father_income: "", father_qualification: "", father_aadhaar: "",
        mother_name: "", mother_mobile: "", mother_email: "", mother_occupation: "", mother_income: "", mother_qualification: "", mother_aadhaar: "",
        guardian_name: "", guardian_mobile: "", guardian_email: "", guardian_occupation: "",
        primary_contact: "Father"
      });
      setRegTab("student");
    } else {
      alert("Error: " + res.error);
    }
  }

  async function handleDelete(studentId: string) {
    setIsSubmitting(true);
    const res = await deleteStudentPermanently(studentId);
    setIsSubmitting(false);
    if (res.success) {
      setDeleteModal(null);
      loadData();
    } else {
      alert("Failed to delete student: " + res.error);
    }
  }

  // Segmentations
  const activeStudents = students.filter(s => s.status === 'Active' || s.status === 'Promoted');
  const formerStudents = students.filter(s => ['Withdrawn', 'TC Issued', 'Suspended', 'Alumni'].includes(s.status));
  const ewsStudents = activeStudents.filter(s => s.category === 'EWS');

  let tabFiltered = activeStudents;
  if (activeTab === "former") tabFiltered = formerStudents;
  else if (activeTab === "ews") tabFiltered = ewsStudents;
  else if (activeTab === "all") tabFiltered = students;

  const filteredStudents = tabFiltered.filter(s => {
    const currentAc = (s.student_academic_history as any[])?.find((a: any) => a.is_current_session) || (s.student_academic_history as any[])?.[0];
    const matchSearch = s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admission_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.pen_no && s.pen_no.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchClass = classFilter === "All" || currentAc?.class_name === classFilter;
    return matchSearch && matchClass;
  });

  const availableClasses = ["All", ...Array.from(new Set(students.map(s => {
    const ac = (s.student_academic_history as any[])?.find((a: any) => a.is_current_session) || (s.student_academic_history as any[])?.[0];
    return ac?.class_name;
  }).filter(Boolean)))];

  function exportCSV() {
    if (filteredStudents.length === 0) return;
    const headers = ["Admission No", "PEN (Permanent Education No)", "First Name", "Last Name", "DOB", "Gender", "Category", "Class", "Section", "Status"];
    const rows = filteredStudents.map(s => {
      const ac = (s.student_academic_history as any[])?.find((a: any) => a.is_current_session) || (s.student_academic_history as any[])?.[0];
      return [
        s.admission_no,
        s.pen_no || "",
        `"${s.first_name}"`,
        `"${s.last_name}"`,
        s.dob || "",
        s.gender || "",
        s.category || "General",
        `"${ac?.class_name || 'N/A'}"`,
        `"${ac?.section_name || ''}"`,
        s.status
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Students_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 flex items-center gap-3">
             <Users className="w-8 h-8 text-blue-600" />
             Master Student Information System (SIS)
          </h1>
          <p className="text-stone-500 mt-1">Manage admissions, class transfers, multi-parent contacts, and permanent records.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/admin/classes"
            className="bg-white border border-stone-200 text-stone-700 font-bold py-2.5 px-4 rounded-xl hover:bg-stone-50 transition-colors flex items-center gap-2 text-sm shadow-sm"
          >
            <GraduationCap className="w-4 h-4 text-blue-600" /> Manage Classes
          </Link>
          <button 
            onClick={exportCSV}
            disabled={filteredStudents.length === 0}
            className="bg-stone-100 text-stone-700 font-bold py-2.5 px-4 rounded-xl hover:bg-stone-200 transition-colors flex items-center gap-2 shadow-sm text-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => setIsAdding(true)} className="bg-stone-900 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-stone-800 transition-colors flex items-center gap-2 shadow-sm text-sm">
            <Plus className="w-4 h-4 text-amber-400" /> Register Student
          </button>
        </div>
      </div>

      {/* Segmented Filter Navigation Tabs */}
      <div className="flex flex-wrap gap-2 pt-2 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === "active" 
              ? "bg-stone-900 text-white shadow-md" 
              : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <UserCheck className="w-4 h-4 text-green-400" /> Active Enrolled ({activeStudents.length})
        </button>

        <button
          onClick={() => setActiveTab("former")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === "former" 
              ? "bg-stone-900 text-white shadow-md" 
              : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <UserMinus className="w-4 h-4 text-stone-400" /> Former / Left Students ({formerStudents.length})
        </button>

        <button
          onClick={() => setActiveTab("ews")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === "ews" 
              ? "bg-orange-600 text-white shadow-md" 
              : "bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200"
          }`}
        >
          <Sparkles className="w-4 h-4" /> EWS Students ({ewsStudents.length})
        </button>

        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === "all" 
              ? "bg-stone-900 text-white shadow-md" 
              : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          All Records ({students.length})
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by student name, admission no..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-bold text-stone-500 whitespace-nowrap">Filter Class:</span>
          <select 
            value={classFilter} 
            onChange={e => setClassFilter(e.target.value)}
            className="border border-stone-200 p-2 rounded-xl text-sm bg-stone-50 text-stone-700 font-bold focus:outline-none"
          >
            {availableClasses.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <span className="text-xs text-stone-400 font-bold whitespace-nowrap">{filteredStudents.length} Students</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Student</th>
                <th className="p-4 font-bold">Admission No</th>
                <th className="p-4 font-bold">Class & Section</th>
                <th className="p-4 font-bold">Parents / Contact</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr><td colSpan={7} className="p-10 text-center text-stone-400 font-bold">Loading student records...</td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-stone-400 font-bold">
                    {activeTab === "former" 
                      ? "No former / left students in the archive."
                      : "No students matching your search criteria."}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const currentAcademic = (student.student_academic_history as any[])?.find((a: any) => a.is_current_session) || (student.student_academic_history as any[])?.[0];
                  const primaryParent = (student.student_parents as any[])?.find((p: any) => p.is_primary_contact) || (student.student_parents as any[])?.[0];
                  const isEWS = student.category === 'EWS';
                  const isFormer = ['Withdrawn', 'TC Issued', 'Suspended', 'Alumni'].includes(student.status);

                  return (
                    <tr key={student.id} className={`transition-colors ${
                      isFormer 
                        ? 'bg-stone-50/70 hover:bg-stone-100 opacity-85'
                        : isEWS 
                          ? 'bg-orange-50/40 hover:bg-orange-50' 
                          : 'hover:bg-stone-50'
                    }`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            isFormer ? 'bg-stone-200 text-stone-600' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {student.first_name[0]}{student.last_name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-stone-900">{student.first_name} {student.middle_name || ''} {student.last_name}</p>
                            <p className="text-xs text-stone-400">DOB: {student.dob || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-xs">
                        <p className="font-mono font-bold text-stone-800">{student.admission_no}</p>
                        {student.pen_no && (
                          <p className="font-mono text-[11px] text-blue-600 font-bold mt-0.5">PEN: {student.pen_no}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                           <GraduationCap className="w-4 h-4 text-stone-400" />
                           <span className="font-bold text-stone-800">{currentAcademic?.class_name || "N/A"} {currentAcademic?.section_name || ""}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs">
                        {primaryParent ? (
                          <div>
                            <p className="font-bold text-stone-800">{primaryParent.name} <span className="text-stone-400 font-normal">({primaryParent.parent_type})</span></p>
                            <p className="text-stone-500 font-mono mt-0.5">{primaryParent.mobile}</p>
                          </div>
                        ) : (
                          <span className="text-stone-400">No Contact</span>
                        )}
                      </td>
                      <td className="p-4">
                        {student.category === 'EWS' ? (
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200 shadow-sm">EWS</span>
                        ) : (
                          <span className="text-xs font-bold text-stone-500">General</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          isFormer 
                            ? 'bg-stone-200 text-stone-700' 
                            : student.status === 'Active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Link href={`/admin/students/${student.id}`} className="text-blue-700 hover:text-blue-900 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors inline-block">
                          View 360°
                        </Link>
                        <button
                          onClick={() => setDeleteModal(student)}
                          className="p-1.5 text-stone-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-block"
                          title="Permanently Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Full Multi-Parent Registration */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl my-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-black text-stone-900">New Student Registration</h2>
                <p className="text-stone-500 text-xs mt-0.5">Enter complete student demographics, academic allocation, and parents details.</p>
              </div>
              <button onClick={() => setIsAdding(false)} className="p-2 bg-stone-100 rounded-full hover:bg-stone-200"><X className="w-5 h-5"/></button>
            </div>

            {/* Registration Sub-Tabs */}
            <div className="flex gap-2 border-b border-stone-200 pb-3 mb-6">
              {[
                { id: "student", label: "1. Student Demographics", icon: User },
                { id: "father", label: "2. Father Details", icon: Phone },
                { id: "mother", label: "3. Mother Details", icon: Phone },
                { id: "guardian", label: "4. Guardian (Optional)", icon: Users }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setRegTab(t.id as any)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    regTab === t.id ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" /> {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              
              {/* Tab 1: Student Details */}
              {regTab === "student" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Admission No *</label>
                      <input required type="text" value={formData.admission_no} onChange={e => setFormData({...formData, admission_no: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-mono" placeholder="e.g. ADM-2026-001" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Class / Grade *</label>
                      <input required type="text" value={formData.class_name} onChange={e => setFormData({...formData, class_name: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-bold" placeholder="e.g. Grade 1" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Section</label>
                      <input type="text" value={formData.section_name} onChange={e => setFormData({...formData, section_name: e.target.value.toUpperCase()})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-bold" placeholder="A" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">First Name *</label>
                      <input required type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Middle Name</label>
                      <input type="text" value={formData.middle_name} onChange={e => setFormData({...formData, middle_name: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Last Name *</label>
                      <input required type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Date of Birth *</label>
                      <input required type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Gender *</label>
                      <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm">
                        <option>Male</option><option>Female</option><option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Category *</label>
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-bold text-stone-800">
                        <option value="General">General</option>
                        <option value="EWS">EWS (Economically Weaker Section)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Permanent Education No. (PEN)</label>
                      <input type="text" placeholder="e.g. PEN-2026-991" value={formData.pen_no} onChange={e => setFormData({...formData, pen_no: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-mono text-blue-700 font-bold" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Blood Group</label>
                      <input type="text" placeholder="e.g. B+, O+" value={formData.blood_group} onChange={e => setFormData({...formData, blood_group: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Aadhaar Number (UID)</label>
                      <input type="text" placeholder="12-digit Aadhaar" value={formData.aadhaar_no} onChange={e => setFormData({...formData, aadhaar_no: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-mono" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Roll Number</label>
                      <input type="text" placeholder="Optional" value={formData.roll_no} onChange={e => setFormData({...formData, roll_no: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-mono" />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Father Details */}
              {regTab === "father" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Father&apos;s Full Name *</label>
                      <input type="text" value={formData.father_name} onChange={e => setFormData({...formData, father_name: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" placeholder="Enter father's name" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Father&apos;s Mobile Phone *</label>
                      <input type="text" value={formData.father_mobile} onChange={e => setFormData({...formData, father_mobile: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-mono" placeholder="10-digit mobile" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Email Address</label>
                      <input type="email" value={formData.father_email} onChange={e => setFormData({...formData, father_email: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Occupation</label>
                      <input type="text" value={formData.father_occupation} onChange={e => setFormData({...formData, father_occupation: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" placeholder="e.g. Software Engineer, Business" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Annual Income</label>
                      <input type="text" value={formData.father_income} onChange={e => setFormData({...formData, father_income: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" placeholder="e.g. ₹8,00,000" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Highest Qualification</label>
                      <input type="text" value={formData.father_qualification} onChange={e => setFormData({...formData, father_qualification: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" placeholder="e.g. B.Tech, MBA" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Father&apos;s Aadhaar No</label>
                      <input type="text" value={formData.father_aadhaar} onChange={e => setFormData({...formData, father_aadhaar: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-mono" />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Mother Details */}
              {regTab === "mother" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Mother&apos;s Full Name</label>
                      <input type="text" value={formData.mother_name} onChange={e => setFormData({...formData, mother_name: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" placeholder="Enter mother's name" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Mother&apos;s Mobile Phone</label>
                      <input type="text" value={formData.mother_mobile} onChange={e => setFormData({...formData, mother_mobile: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-mono" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Email Address</label>
                      <input type="email" value={formData.mother_email} onChange={e => setFormData({...formData, mother_email: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Occupation</label>
                      <input type="text" value={formData.mother_occupation} onChange={e => setFormData({...formData, mother_occupation: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" placeholder="e.g. Teacher, Homemaker" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Annual Income</label>
                      <input type="text" value={formData.mother_income} onChange={e => setFormData({...formData, mother_income: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Qualification</label>
                      <input type="text" value={formData.mother_qualification} onChange={e => setFormData({...formData, mother_qualification: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Mother&apos;s Aadhaar</label>
                      <input type="text" value={formData.mother_aadhaar} onChange={e => setFormData({...formData, mother_aadhaar: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-mono" />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Guardian Details */}
              {regTab === "guardian" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Local Guardian Full Name</label>
                      <input type="text" value={formData.guardian_name} onChange={e => setFormData({...formData, guardian_name: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" placeholder="Enter guardian name" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Guardian Mobile Phone</label>
                      <input type="text" value={formData.guardian_mobile} onChange={e => setFormData({...formData, guardian_mobile: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-mono" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Email Address</label>
                      <input type="email" value={formData.guardian_email} onChange={e => setFormData({...formData, guardian_email: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 block mb-1">Occupation</label>
                      <input type="text" value={formData.guardian_occupation} onChange={e => setFormData({...formData, guardian_occupation: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                    </div>
                  </div>

                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                    <label className="text-xs font-bold text-stone-700 block mb-2">Designate Primary Communication Contact:</label>
                    <div className="flex gap-6 text-sm font-bold text-stone-800">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="primary_contact" checked={formData.primary_contact === "Father"} onChange={() => setFormData({...formData, primary_contact: "Father"})} />
                        Father
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="primary_contact" checked={formData.primary_contact === "Mother"} onChange={() => setFormData({...formData, primary_contact: "Mother"})} />
                        Mother
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="primary_contact" checked={formData.primary_contact === "Guardian"} onChange={() => setFormData({...formData, primary_contact: "Guardian"})} />
                        Local Guardian
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-stone-100">
                <div className="flex gap-2">
                  {regTab !== "student" && (
                    <button type="button" onClick={() => setRegTab(regTab === "guardian" ? "mother" : regTab === "mother" ? "father" : "student")} className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl">
                      Back
                    </button>
                  )}
                  {regTab !== "guardian" && (
                    <button type="button" onClick={() => setRegTab(regTab === "student" ? "father" : regTab === "father" ? "mother" : "guardian")} className="px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl">
                      Next Step →
                    </button>
                  )}
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 text-stone-600 font-bold hover:bg-stone-100 rounded-xl text-sm">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="bg-stone-900 text-white px-8 py-2.5 font-bold rounded-xl shadow-md hover:bg-stone-800 disabled:opacity-50 text-sm">
                    {isSubmitting ? "Registering..." : "Submit Registration"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Permanent Delete Confirmation */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-red-100 animate-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-stone-900 mb-2">Delete Student Entirely?</h3>
            <p className="text-stone-500 text-xs mb-4">
              This action will <strong>permanently purge</strong> the student record for <span className="font-bold text-stone-900">{deleteModal.first_name} {deleteModal.last_name}</span> (Admission No: {deleteModal.admission_no}) along with all invoices, ledgers, parents, and document files from the database.
            </p>
            <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs font-bold mb-6">
              ⚠️ This action cannot be undone.
            </div>

            <div className="flex gap-3 justify-end">
              <button 
                type="button" 
                onClick={() => setDeleteModal(null)} 
                className="px-5 py-2.5 font-bold text-stone-500 text-sm hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="button" 
                disabled={isSubmitting}
                onClick={() => handleDelete(deleteModal.id)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm disabled:opacity-50 shadow-md"
              >
                {isSubmitting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
