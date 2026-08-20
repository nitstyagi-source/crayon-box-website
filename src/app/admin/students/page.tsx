"use client";

import { useState, useEffect } from "react";
import { Users, Search, Plus, Filter, Download, GraduationCap, X, UserMinus, UserCheck, AlertCircle, Sparkles } from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getStudents, createStudent } from "@/app/actions/students";
import Link from "next/link";

export default function StudentsDirectory() {
  const { activeCampusId } = useCampusContext();
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "former" | "ews" | "all">("active");
  const [classFilter, setClassFilter] = useState("All");
  
  // Modal State
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    admission_no: "",
    first_name: "",
    last_name: "",
    dob: "",
    gender: "Male",
    class_name: "Grade 1",
    section_name: "A",
    category: "General",
    parent_name: "",
    parent_mobile: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeCampusId) loadStudents();
  }, [activeCampusId]);

  async function loadStudents() {
    setIsLoading(true);
    const res = await getStudents(activeCampusId);
    if (res.success && res.data) {
      setStudents(res.data);
    }
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
      loadStudents();
      setFormData({
        admission_no: "", first_name: "", last_name: "", dob: "", gender: "Male", class_name: "Grade 1", section_name: "A",
        category: "General", parent_name: "", parent_mobile: ""
      });
    } else {
      alert("Error: " + res.error);
    }
  }

  // Segmentations
  const activeStudents = students.filter(s => s.status === 'Active' || s.status === 'Promoted');
  const formerStudents = students.filter(s => ['Withdrawn', 'TC Issued', 'Suspended', 'Alumni'].includes(s.status));
  const ewsStudents = activeStudents.filter(s => s.category === 'EWS');

  // Filter based on active tab
  let tabFiltered = activeStudents;
  if (activeTab === "former") tabFiltered = formerStudents;
  else if (activeTab === "ews") tabFiltered = ewsStudents;
  else if (activeTab === "all") tabFiltered = students;

  // Filter by search & class
  const filteredStudents = tabFiltered.filter(s => {
    const currentAc = (s.student_academic_history as any[])?.find((a: any) => a.is_current_session) || (s.student_academic_history as any[])?.[0];
    const matchSearch = s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admission_no.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClass = classFilter === "All" || currentAc?.class_name === classFilter;
    return matchSearch && matchClass;
  });

  const availableClasses = ["All", ...Array.from(new Set(students.map(s => {
    const ac = (s.student_academic_history as any[])?.find((a: any) => a.is_current_session) || (s.student_academic_history as any[])?.[0];
    return ac?.class_name;
  }).filter(Boolean)))];

  function exportCSV() {
    if (filteredStudents.length === 0) return;
    const headers = ["Admission No", "First Name", "Last Name", "DOB", "Gender", "Category", "Class", "Section", "Status"];
    const rows = filteredStudents.map(s => {
      const ac = (s.student_academic_history as any[])?.find((a: any) => a.is_current_session) || (s.student_academic_history as any[])?.[0];
      return [
        s.admission_no,
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
          <p className="text-stone-500 mt-1">Manage current admissions, class promotions, and archive former students.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportCSV}
            disabled={filteredStudents.length === 0}
            className="bg-stone-100 text-stone-700 font-bold py-2.5 px-4 rounded-xl hover:bg-stone-200 transition-colors flex items-center gap-2 shadow-sm text-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => setIsAdding(true)} className="bg-stone-900 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-stone-800 transition-colors flex items-center gap-2 shadow-sm text-sm">
            <Plus className="w-4 h-4 text-amber-400" /> Add New Student
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
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Gender</th>
                <th className="p-4 font-bold">Enrollment Status</th>
                <th className="p-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr><td colSpan={7} className="p-10 text-center text-stone-400 font-bold">Loading student records...</td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-stone-400 font-bold">
                    {activeTab === "former" 
                      ? "No former / left students in the archive. When a student is withdrawn or issued a TC, they appear here."
                      : "No students matching your search criteria."}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const currentAcademic = (student.student_academic_history as any[])?.find((a: any) => a.is_current_session) || (student.student_academic_history as any[])?.[0];
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
                      <td className="p-4 font-mono font-medium text-stone-800 text-xs">{student.admission_no}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                           <GraduationCap className="w-4 h-4 text-stone-400" />
                           <span className="font-bold text-stone-800">{currentAcademic?.class_name || "N/A"} {currentAcademic?.section_name || ""}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {student.category === 'EWS' ? (
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200 shadow-sm">EWS</span>
                        ) : (
                          <span className="text-xs font-bold text-stone-500">General</span>
                        )}
                      </td>
                      <td className="p-4 text-stone-600 text-xs">{student.gender || 'N/A'}</td>
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
                      <td className="p-4 text-right">
                        <Link href={`/admin/students/${student.id}`} className="text-blue-700 hover:text-blue-900 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-lg transition-colors inline-block">
                          View Profile
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-stone-900">New Registration</h2>
              <button onClick={() => setIsAdding(false)} className="p-2 bg-stone-100 rounded-full hover:bg-stone-200"><X className="w-5 h-5"/></button>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">Admission No *</label>
                  <input required type="text" value={formData.admission_no} onChange={e => setFormData({...formData, admission_no: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" placeholder="e.g. ADM-2026-001" />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">Date of Birth *</label>
                  <input required type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">First Name *</label>
                  <input required type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">Last Name *</label>
                  <input required type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">Gender</label>
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-medium">
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

              <div className="pt-4 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">Class / Grade *</label>
                  <input required type="text" value={formData.class_name} onChange={e => setFormData({...formData, class_name: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">Section</label>
                  <input type="text" value={formData.section_name} onChange={e => setFormData({...formData, section_name: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">Primary Parent Name *</label>
                  <input required type="text" value={formData.parent_name} onChange={e => setFormData({...formData, parent_name: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">Parent Mobile *</label>
                  <input required type="text" value={formData.parent_mobile} onChange={e => setFormData({...formData, parent_mobile: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-stone-100">
                <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2.5 text-stone-600 font-bold hover:bg-stone-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-stone-900 text-white px-8 py-2.5 font-bold rounded-xl shadow-sm hover:bg-stone-800 disabled:opacity-50">
                  {isSubmitting ? "Saving..." : "Register Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
