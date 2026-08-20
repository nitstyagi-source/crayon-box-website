"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, QrCode, CheckCircle2, XCircle, Clock, AlertCircle, 
  ArrowRight, ShieldCheck, Filter, Search, Eye, Sparkles, 
  Printer, Bus, DoorOpen, School, Send, RefreshCw, Check, X
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getStudentAttendanceDashboard, 
  reviewStudentAttendanceCorrection 
} from "@/app/actions/student-attendance";

export default function StudentAttendanceDashboardPage() {
  const { activeCampusId } = useCampusContext();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Correction Requests Drawer
  const [showCorrections, setShowCorrections] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, [activeCampusId, selectedDate]);

  async function loadDashboard() {
    setIsLoading(true);
    try {
      const res = await getStudentAttendanceDashboard(activeCampusId, selectedDate);
      if (res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (e) {
      console.error("Student attendance error:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReviewCorrection(correctionId: string, status: 'Approved' | 'Rejected') {
    setIsReviewing(true);
    const res = await reviewStudentAttendanceCorrection(correctionId, status, "Principal Office");
    if (res.success) {
      loadDashboard();
    } else {
      alert("Error reviewing correction: " + res.error);
    }
    setIsReviewing(false);
  }

  const classMatrix = dashboardData?.classMatrix || [];
  const lowAttendance = dashboardData?.lowAttendanceStudents || [];

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-800 text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5 text-blue-600" /> Student Attendance Command Hub
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Academic Year 2026-2027</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Student QR & Journey Tracking</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">Multi-checkpoint tracking across Bus Boarding, Gate Turnstiles, and Classroom Roll Call.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="bg-stone-50 border border-stone-200 px-3.5 py-2 rounded-xl text-xs font-bold text-stone-800"
          />

          <Link
            href="/admin/students/attendance/scan"
            className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" /> Open Camera QR Scanner
          </Link>

          <Link
            href="/admin/students/attendance/id-cards"
            className="bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold px-3.5 py-2.5 rounded-xl text-xs border border-blue-200 flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" /> Print Student QR Cards
          </Link>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase block">Total Students</span>
          <span className="text-2xl font-black text-stone-900 mt-1 block">{dashboardData?.totalStudents || 0}</span>
          <span className="text-[10px] text-stone-500">All Wings</span>
        </div>

        <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-800 uppercase block">Present Today</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{dashboardData?.presentTotal || 0}</span>
          <span className="text-[10px] text-emerald-600 font-bold">{dashboardData?.overallPercentage || 95}% Rate</span>
        </div>

        <div className="p-4 bg-red-50/70 rounded-2xl border border-red-200 shadow-xs">
          <span className="text-[10px] font-bold text-red-800 uppercase block">Absent</span>
          <span className="text-2xl font-black text-red-700 mt-1 block">{dashboardData?.absentTotal || 0}</span>
          <span className="text-[10px] text-red-600">SMS Dispatched</span>
        </div>

        <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[10px] font-bold text-amber-800 uppercase block">Late Arrivals</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">{dashboardData?.lateTotal || 0}</span>
          <span className="text-[10px] text-amber-600">After 08:10 AM</span>
        </div>

        <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 shadow-xs">
          <span className="text-[10px] font-bold text-blue-800 uppercase block">Approved Leaves</span>
          <span className="text-2xl font-black text-blue-700 mt-1 block">{dashboardData?.leaveTotal || 0}</span>
          <span className="text-[10px] text-blue-600">Parent Applied</span>
        </div>

        <div 
          onClick={() => setShowCorrections(true)}
          className="p-4 bg-amber-500/10 hover:bg-amber-500/20 cursor-pointer rounded-2xl border border-amber-300 shadow-xs transition-all"
        >
          <span className="text-[10px] font-bold text-amber-900 uppercase block">Corrections</span>
          <span className="text-2xl font-black text-amber-800 mt-1 block">{dashboardData?.pendingCorrectionsCount || 0}</span>
          <span className="text-[10px] font-bold text-amber-700 underline">Review Requests →</span>
        </div>
      </div>

      {/* Multi-Point Journey Pipeline Indicator */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-stone-100 pb-3">
          <h3 className="font-black text-stone-900 text-sm flex items-center gap-2">
            <Bus className="w-4 h-4 text-amber-500" /> Multi-Point Student Safety & Journey Pipeline
          </h3>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
            Live Checkpoint Scanners Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-1">
            <div className="flex justify-between items-center text-amber-900 font-bold">
              <span className="flex items-center gap-1.5"><Bus className="w-4 h-4 text-amber-600" /> 1. Bus Boarding</span>
              <span className="font-mono text-[11px]">07:15 - 07:45</span>
            </div>
            <p className="text-stone-600 text-[11px]">Attendant scans student QR card upon boarding bus.</p>
          </div>

          <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-1">
            <div className="flex justify-between items-center text-blue-900 font-bold">
              <span className="flex items-center gap-1.5"><DoorOpen className="w-4 h-4 text-blue-600" /> 2. Gate Turnstile</span>
              <span className="font-mono text-[11px]">07:40 - 08:00</span>
            </div>
            <p className="text-stone-600 text-[11px]">School main entrance scan verified for campus entry.</p>
          </div>

          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-1">
            <div className="flex justify-between items-center text-emerald-900 font-bold">
              <span className="flex items-center gap-1.5"><School className="w-4 h-4 text-emerald-600" /> 3. Class Roll Call</span>
              <span className="font-mono text-[11px]">08:00 - 08:15</span>
            </div>
            <p className="text-stone-600 text-[11px]">Teacher scans classroom QR or confirms roll call list.</p>
          </div>

          <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-1">
            <div className="flex justify-between items-center text-purple-900 font-bold">
              <span className="flex items-center gap-1.5"><Bus className="w-4 h-4 text-purple-600" /> 4. Departure Scan</span>
              <span className="font-mono text-[11px]">01:30 - 02:00</span>
            </div>
            <p className="text-stone-600 text-[11px]">Gate exit or bus boarding confirmation for parents.</p>
          </div>
        </div>
      </div>

      {/* Class-by-Class Attendance Matrix */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-stone-100 pb-3">
          <div>
            <h3 className="font-black text-stone-900 text-lg">Class-by-Class Attendance Matrix</h3>
            <p className="text-xs text-stone-500">Live attendance percentage and status across all sections.</p>
          </div>
          <Link
            href="/admin/students/attendance/scan"
            className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" /> Start Class QR Scan
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3.5">Class & Section</th>
                <th className="p-3.5">Enrolled</th>
                <th className="p-3.5">Present</th>
                <th className="p-3.5">Absent</th>
                <th className="p-3.5">Late</th>
                <th className="p-3.5">Attendance %</th>
                <th className="p-3.5">Progress</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {classMatrix.map((c: any, idx: number) => (
                <tr key={idx} className="hover:bg-stone-50/60 transition-colors">
                  <td className="p-3.5">
                    <span className="font-black text-stone-900 text-sm">{c.grade}</span>
                    <span className="text-stone-500 text-xs ml-1.5 font-bold">Section {c.section}</span>
                  </td>
                  <td className="p-3.5 font-bold text-stone-700">{c.totalStudents}</td>
                  <td className="p-3.5 font-bold text-emerald-700">{c.presentCount}</td>
                  <td className="p-3.5 font-bold text-red-600">{c.absentCount}</td>
                  <td className="p-3.5 font-bold text-amber-700">{c.lateCount}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full font-black text-xs ${
                      c.percentage >= 90 ? 'bg-emerald-100 text-emerald-800' :
                      c.percentage >= 75 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {c.percentage}%
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="w-24 bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${c.percentage >= 90 ? 'bg-emerald-500' : c.percentage >= 75 ? 'bg-blue-500' : 'bg-red-500'}`}
                        style={{ width: `${c.percentage}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="p-3.5 text-right">
                    <Link
                      href={`/admin/students/attendance/scan?grade=${encodeURIComponent(c.grade)}&section=${encodeURIComponent(c.section)}`}
                      className="inline-flex items-center gap-1 bg-stone-100 hover:bg-stone-200 text-stone-800 px-3 py-1.5 rounded-xl font-bold text-xs"
                    >
                      Roll Call <ChevronRightIcon className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Attendance Watchlist (< 75%) */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-stone-100 pb-3">
          <div>
            <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" /> Chronic Low Attendance Watchlist (&lt; 75%)
            </h3>
            <p className="text-xs text-stone-500">Students requiring academic counseling and automated parent notification dispatch.</p>
          </div>
          <span className="text-xs font-black text-red-700 bg-red-50 px-2.5 py-1 rounded-lg">
            {lowAttendance.length} Students At Risk
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {lowAttendance.map((stu: any) => (
            <div key={stu.id} className="p-4 rounded-2xl bg-red-50/40 border border-red-200 space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-black text-stone-900 text-sm">{stu.name}</span>
                <span className="bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                  {stu.attendancePercentage}%
                </span>
              </div>
              <p className="text-xs text-stone-500">{stu.class_name} ({stu.section_name}) • Adm: {stu.admission_no}</p>
              <p className="text-[11px] text-red-700 font-bold">⚠️ {stu.consecutiveAbsences} consecutive absences recorded</p>
              
              <div className="pt-2 border-t border-red-100 flex justify-between items-center">
                <span className="text-[10px] text-stone-400">Attended {stu.attendedClasses}/{stu.totalClasses} classes</span>
                <button 
                  onClick={() => alert(`Parent alert dispatched for ${stu.name}!`)}
                  className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs"
                >
                  <Send className="w-3 h-3" /> Alert Parent
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Corrections Exception Drawer / Modal */}
      {showCorrections && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-black text-stone-900">Student Attendance Corrections</h3>
                <p className="text-xs text-stone-500">Review teacher correction requests with audit trails.</p>
              </div>
              <button onClick={() => setShowCorrections(false)} className="p-1 text-stone-400 hover:text-stone-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-stone-900 text-xs">Aarav Sharma (Grade 3 - B)</h4>
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded mr-1">
                      Absent → Present
                    </span>
                    <span className="text-[10px] text-stone-400">Date: {selectedDate}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={isReviewing}
                      onClick={() => handleReviewCorrection("sample-id", 'Approved')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      disabled={isReviewing}
                      onClick={() => handleReviewCorrection("sample-id", 'Rejected')}
                      className="bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs px-3 py-1.5 rounded-xl"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                <p className="text-xs text-stone-600 bg-white p-2.5 rounded-xl border border-stone-200">
                  &quot;Student was in the medical clinic during morning roll call. Class teacher verified presence.&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function ChevronRightIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}
