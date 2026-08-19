"use client";

import { useState, useEffect } from "react";
import { Users, Search, Plus, Filter, Download, GraduationCap, X } from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getStudents, createStudent } from "@/app/actions/students";
import Link from "next/link";

export default function StudentsDirectory() {
  const { activeCampusId } = useCampusContext();
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
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
      // Reset form
      setFormData({
        admission_no: "", first_name: "", last_name: "", dob: "", gender: "Male", class_name: "Grade 1", section_name: "A", parent_name: "", parent_mobile: ""
      });
    } else {
      alert("Error: " + res.error);
    }
  }

  const filteredStudents = students.filter(s => 
    s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.admission_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 flex items-center gap-3">
             <Users className="w-7 h-7 text-stone-400" />
             Student Directory
          </h1>
          <p className="text-stone-500 mt-1">Manage all active, inactive, and alumni students.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-stone-100 text-stone-700 font-bold py-2.5 px-4 rounded-xl hover:bg-stone-200 transition-colors flex items-center gap-2 shadow-sm">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setIsAdding(true)} className="bg-primary text-white font-bold py-2.5 px-4 rounded-xl hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Add Student
          </button>
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
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm">
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">Class</label>
                  <input required type="text" value={formData.class_name} onChange={e => setFormData({...formData, class_name: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">Section</label>
                  <input type="text" value={formData.section_name} onChange={e => setFormData({...formData, section_name: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">Primary Parent Name</label>
                  <input required type="text" value={formData.parent_name} onChange={e => setFormData({...formData, parent_name: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">Parent Mobile</label>
                  <input required type="text" value={formData.parent_mobile} onChange={e => setFormData({...formData, parent_mobile: e.target.value})} className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-stone-100">
                <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2.5 text-stone-600 font-bold hover:bg-stone-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-primary text-white px-8 py-2.5 font-bold rounded-xl shadow-sm hover:bg-blue-900 disabled:opacity-50">
                  {isSubmitting ? "Saving..." : "Register Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by name, admission no..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          <select className="border border-stone-200 p-2.5 rounded-xl text-sm bg-stone-50 text-stone-700 focus:outline-none">
            <option>All Classes</option>
            <option>Grade 1</option>
            <option>Grade 2</option>
          </select>
          <button className="p-2.5 border border-stone-200 rounded-xl bg-stone-50 text-stone-700 hover:bg-stone-100"><Filter className="w-4 h-4"/></button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Student</th>
                <th className="p-4 font-bold">Admission No</th>
                <th className="p-4 font-bold">Class & Section</th>
                <th className="p-4 font-bold">Gender</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-stone-500 font-bold">Loading Students...</td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-stone-500 font-bold">No students found.</td></tr>
              ) : (
                filteredStudents.map((student) => {
                  const currentAcademic = student.student_academic_history?.[0];
                  return (
                    <tr key={student.id} className="hover:bg-stone-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                            {student.first_name[0]}{student.last_name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-stone-900">{student.first_name} {student.last_name}</p>
                            <p className="text-xs text-stone-500">DOB: {student.dob}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-sm">{student.admission_no}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                           <GraduationCap className="w-4 h-4 text-stone-400" />
                           <span className="font-bold text-stone-700">{currentAcademic?.class_name || "N/A"} {currentAcademic?.section_name || ""}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-stone-700">{student.gender}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                          student.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/admin/students/${student.id}`} className="text-primary hover:text-blue-900 font-bold text-sm bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                          View Profile
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
