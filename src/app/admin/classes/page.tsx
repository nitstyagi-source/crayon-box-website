"use client";

import { useState, useEffect } from "react";
import { 
  GraduationCap, Plus, Users, ArrowRightLeft, Trash2, 
  Search, DoorOpen, Sparkles, X, CheckCircle2, UserCheck, AlertCircle 
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getClasses, createClass, deleteClass } from "@/app/actions/classes";
import { getStudents, transferStudentClass } from "@/app/actions/students";
import Link from "next/link";

export default function ClassManagementHub() {
  const { activeCampusId } = useCampusContext();
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Class Modal State
  const [addClassModal, setAddClassModal] = useState(false);
  const [newClassData, setNewClassData] = useState({
    grade: "Grade 1",
    section: "A",
    room_number: "",
    capacity: 40
  });

  // Transfer Student Modal State
  const [transferModal, setTransferModal] = useState(false);
  const [selectedStudentToTransfer, setSelectedStudentToTransfer] = useState<any>(null);
  const [transferData, setTransferData] = useState({
    target_class: "Grade 1",
    target_section: "A",
    target_roll_no: "",
    reason: "Administrative Section Reallocation"
  });

  useEffect(() => {
    if (activeCampusId) loadAll();
  }, [activeCampusId]);

  async function loadAll() {
    setIsLoading(true);
    const [clsRes, stRes] = await Promise.all([
      getClasses(activeCampusId),
      getStudents(activeCampusId)
    ]);

    if (clsRes.success) {
      setClasses(clsRes.data || []);
      if (clsRes.data && clsRes.data.length > 0 && !selectedClass) {
        setSelectedClass(clsRes.data[0]);
      }
    }
    if (stRes.success) {
      setStudents(stRes.data || []);
    }
    setIsLoading(false);
  }

  async function handleCreateClass(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await createClass(activeCampusId, newClassData);
    setIsSubmitting(false);
    if (res.success) {
      setAddClassModal(false);
      setNewClassData({ grade: "Grade 1", section: "A", room_number: "", capacity: 40 });
      loadAll();
    } else {
      alert("Error creating class: " + res.error);
    }
  }

  async function handleDeleteClass(classId: string, className: string) {
    if (!confirm(`Are you sure you want to delete ${className}?`)) return;
    setIsSubmitting(true);
    const res = await deleteClass(classId);
    setIsSubmitting(false);
    if (res.success) {
      loadAll();
    } else {
      alert("Error deleting class: " + res.error);
    }
  }

  async function handleTransferSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudentToTransfer) return;
    setIsSubmitting(true);
    const res = await transferStudentClass(selectedStudentToTransfer.id, transferData);
    setIsSubmitting(false);
    if (res.success) {
      setTransferModal(false);
      setSelectedStudentToTransfer(null);
      loadAll();
    } else {
      alert("Failed to transfer student: " + res.error);
    }
  }

  // Active students in selected class
  const classStudents = selectedClass ? students.filter(s => {
    const ac = (s.student_academic_history as any[])?.find((a: any) => a.is_current_session) || (s.student_academic_history as any[])?.[0];
    const matchGrade = ac?.class_name?.trim() === selectedClass.grade?.trim();
    const matchSection = (ac?.section_name?.trim() || 'A').toUpperCase() === (selectedClass.section?.trim() || 'A').toUpperCase();
    return matchGrade && matchSection && (s.status === 'Active' || s.status === 'Promoted');
  }) : [];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            Class & Section Management
          </h1>
          <p className="text-stone-500 mt-1">Configure academic classes, manage section rosters, and perform live student transfers.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/admin/students"
            className="bg-stone-100 text-stone-700 font-bold py-2.5 px-4 rounded-xl hover:bg-stone-200 transition-colors flex items-center gap-2 text-sm shadow-sm"
          >
            <Users className="w-4 h-4" /> All Students
          </Link>
          <button 
            onClick={() => setAddClassModal(true)}
            className="bg-stone-900 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-stone-800 transition-colors flex items-center gap-2 text-sm shadow-sm"
          >
            <Plus className="w-4 h-4 text-amber-400" /> Add New Class / Section
          </button>
        </div>
      </div>

      {/* Main Grid: Class Selector Cards (Left 4 cols) & Class Roster (Right 8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 4 Cols: Class & Section Directory */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">Classes & Sections ({classes.length})</h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs font-bold text-stone-400 bg-white rounded-3xl border border-stone-200">
              Loading classes...
            </div>
          ) : classes.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-stone-300">
              <DoorOpen className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-stone-700">No classes created yet</p>
              <p className="text-xs text-stone-400 mt-1">Add your school&apos;s grades and sections to start organizing students.</p>
              <button 
                onClick={() => setAddClassModal(true)}
                className="mt-4 bg-stone-900 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Create First Class
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {classes.map((cls) => {
                const isSelected = selectedClass?.id === cls.id;
                return (
                  <div
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected 
                        ? 'bg-blue-50/80 border-blue-500 shadow-sm ring-1 ring-blue-500' 
                        : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-stone-100 text-stone-700'
                      }`}>
                        {cls.grade.replace(/[^0-9]/g, '') || cls.grade[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm">{cls.grade} - Section {cls.section}</h4>
                        <p className="text-xs text-stone-400">
                          {cls.room_number ? `Room ${cls.room_number} • ` : ''}Capacity: {cls.capacity || 40}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        cls.enrolledCount > 0 ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'
                      }`}>
                        {cls.enrolledCount} Enrolled
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClass(cls.id, `${cls.grade} - ${cls.section}`);
                        }}
                        className="p-1 text-stone-300 hover:text-red-600 rounded"
                        title="Delete Class"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 8 Cols: Selected Class Active Student Roster & Transfer Actions */}
        <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          {selectedClass ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-stone-900">{selectedClass.grade} - Section {selectedClass.section}</h2>
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-lg">
                      {classStudents.length} Active Students
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    {selectedClass.room_number ? `Room: ${selectedClass.room_number} • ` : ''}Max Capacity: {selectedClass.capacity || 40}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    href="/admin/students"
                    className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" /> Enroll New Student
                  </Link>
                </div>
              </div>

              {/* Students Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
                      <th className="p-3.5 font-bold rounded-l-xl">Student</th>
                      <th className="p-3.5 font-bold">Admission No</th>
                      <th className="p-3.5 font-bold">Roll No</th>
                      <th className="p-3.5 font-bold">Category</th>
                      <th className="p-3.5 font-bold text-right rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {classStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-10 text-center text-stone-400 text-sm font-medium">
                          No students currently assigned to {selectedClass.grade} Section {selectedClass.section}.
                        </td>
                      </tr>
                    ) : (
                      classStudents.map((st) => {
                        const currentAc = (st.student_academic_history as any[])?.find((a: any) => a.is_current_session) || (st.student_academic_history as any[])?.[0];
                        return (
                          <tr key={st.id} className="hover:bg-stone-50">
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                  {st.first_name[0]}{st.last_name[0]}
                                </div>
                                <div>
                                  <p className="font-bold text-stone-900">{st.first_name} {st.last_name}</p>
                                  <p className="text-xs text-stone-400">{st.gender || 'Student'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3.5 font-mono text-xs text-stone-800">{st.admission_no}</td>
                            <td className="p-3.5 font-mono text-xs text-stone-800">{currentAc?.roll_no || 'Unassigned'}</td>
                            <td className="p-3.5">
                              {st.category === 'EWS' ? (
                                <span className="bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded text-[11px] font-bold">
                                  EWS
                                </span>
                              ) : (
                                <span className="text-xs text-stone-500 font-medium">General</span>
                              )}
                            </td>
                            <td className="p-3.5 text-right space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedStudentToTransfer(st);
                                  setTransferData({
                                    target_class: selectedClass.grade,
                                    target_section: selectedClass.section === "A" ? "B" : "A",
                                    target_roll_no: "",
                                    reason: "Section / Class Reallocation"
                                  });
                                  setTransferModal(true);
                                }}
                                className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5" /> Transfer / Shift
                              </button>
                              <Link
                                href={`/admin/students/${st.id}`}
                                className="inline-block text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Profile
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-stone-400">Select a class on the left to view roster.</div>
          )}
        </div>

      </div>

      {/* Modal 1: Add New Class / Section */}
      {addClassModal && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-stone-100 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-stone-900">Add New Class & Section</h3>
              <button onClick={() => setAddClassModal(false)} className="p-2 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-stone-500 text-xs mb-6">Create an academic class and section in the school database.</p>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-500 block mb-1">Grade / Class Name *</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Grade 1, Grade 2, Pre-Nursery, Nursery, KG"
                  value={newClassData.grade}
                  onChange={e => setNewClassData({...newClassData, grade: e.target.value})}
                  className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-bold text-stone-900" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">Section *</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. A, B, C"
                    value={newClassData.section}
                    onChange={e => setNewClassData({...newClassData, section: e.target.value.toUpperCase()})}
                    className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-bold uppercase" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">Room No. (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 102, Room A"
                    value={newClassData.room_number}
                    onChange={e => setNewClassData({...newClassData, room_number: e.target.value})}
                    className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-500 block mb-1">Max Student Capacity</label>
                <input 
                  type="number" 
                  value={newClassData.capacity}
                  onChange={e => setNewClassData({...newClassData, capacity: parseInt(e.target.value) || 40})}
                  className="w-full border border-stone-200 p-2.5 rounded-xl text-sm" 
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-stone-100">
                <button type="button" onClick={() => setAddClassModal(false)} className="px-5 py-2.5 font-bold text-stone-500 text-sm hover:bg-stone-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm disabled:opacity-50 shadow-md">
                  {isSubmitting ? "Creating..." : "Save Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Transfer / Shift Student */}
      {transferModal && selectedStudentToTransfer && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-stone-100 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-xl font-bold text-stone-900">Transfer Student</h3>
                <p className="text-stone-500 text-xs mt-0.5">Shift student to another class or section.</p>
              </div>
              <button onClick={() => setTransferModal(false)} className="p-2 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 mb-4 text-xs font-bold text-stone-800">
              Transferring: <span className="text-blue-700">{selectedStudentToTransfer.first_name} {selectedStudentToTransfer.last_name}</span> ({selectedStudentToTransfer.admission_no})
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-500 block mb-1">Target Class / Grade *</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Grade 1"
                  value={transferData.target_class}
                  onChange={e => setTransferData({...transferData, target_class: e.target.value})}
                  className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-bold text-stone-900" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">Target Section *</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. B"
                    value={transferData.target_section}
                    onChange={e => setTransferData({...transferData, target_section: e.target.value.toUpperCase()})}
                    className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-bold uppercase" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">New Roll No.</label>
                  <input 
                    type="text" 
                    placeholder="Optional"
                    value={transferData.target_roll_no}
                    onChange={e => setTransferData({...transferData, target_roll_no: e.target.value})}
                    className="w-full border border-stone-200 p-2.5 rounded-xl text-sm font-mono" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-500 block mb-1">Reason for Transfer</label>
                <textarea 
                  value={transferData.reason}
                  onChange={e => setTransferData({...transferData, reason: e.target.value})}
                  rows={2}
                  className="w-full border border-stone-200 p-2.5 rounded-xl text-sm text-stone-800" 
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-stone-100">
                <button type="button" onClick={() => setTransferModal(false)} className="px-5 py-2.5 font-bold text-stone-500 text-sm hover:bg-stone-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm disabled:opacity-50 shadow-md">
                  {isSubmitting ? "Transferring..." : "Complete Transfer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
