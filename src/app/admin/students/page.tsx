"use client";

import { useState, useEffect } from "react";
import { Users, Search, Plus, Filter, Download, GraduationCap } from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getStudents } from "@/app/actions/students";
import Link from "next/link";

export default function StudentsDirectory() {
  const { activeCampusId } = useCampusContext();
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
          <button className="bg-primary text-white font-bold py-2.5 px-4 rounded-xl hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

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
