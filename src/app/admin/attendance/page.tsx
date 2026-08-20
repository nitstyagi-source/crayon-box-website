"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, MapPin, CheckCircle2, XCircle, Clock, AlertCircle, 
  Settings, ArrowRight, ShieldCheck, Filter, Search, Eye, 
  Sparkles, ShieldAlert, Check, X, Camera, RefreshCw, Radio
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getAttendanceLiveDashboard, 
  reviewAttendanceCorrection 
} from "@/app/actions/attendance";

export default function AttendanceLiveDashboard() {
  const { activeCampusId } = useCampusContext();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Corrections Drawer
  const [showCorrections, setShowCorrections] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, [activeCampusId, selectedDate]);

  async function loadDashboard() {
    setIsLoading(true);
    try {
      const res = await getAttendanceLiveDashboard(activeCampusId, selectedDate);
      if (res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (e) {
      console.error("Dashboard error:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReviewCorrection(correctionId: string, status: 'Approved' | 'Rejected') {
    setIsReviewing(true);
    const res = await reviewAttendanceCorrection(correctionId, status, "Principal Office");
    if (res.success) {
      loadDashboard();
    } else {
      alert("Error reviewing correction: " + res.error);
    }
    setIsReviewing(false);
  }

  const logs = dashboardData?.logs || [];
  const corrections = dashboardData?.corrections || [];
  const config = dashboardData?.config || {};

  const filteredLogs = logs.filter((log: any) => {
    if (statusFilter !== "All" && log.status !== statusFilter) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const staffName = `${log.staff?.first_name || ''} ${log.staff?.last_name || ''}`.toLowerCase();
    const dept = (log.staff?.department || '').toLowerCase();
    return staffName.includes(term) || dept.includes(term);
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse text-emerald-600" /> Live Geofence Radar
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">{config.school_name || "Main Campus"}</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Staff Attendance Control Center</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">Real-time GPS geofence tracking, face verification logs, and exception approvals.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="bg-stone-50 border border-stone-200 px-3.5 py-2 rounded-xl text-xs font-bold text-stone-800"
          />

          <Link
            href="/admin/attendance/checkin"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" /> Staff Check-In Terminal
          </Link>

          <Link
            href="/admin/attendance/settings"
            className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold p-2.5 rounded-xl transition-all"
            title="Geofence & Shift Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Real-Time KPI Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase block">Total Staff</span>
          <span className="text-2xl font-black text-stone-900 mt-1 block">{dashboardData?.totalStaff || 0}</span>
          <span className="text-[10px] text-stone-500">Enrolled</span>
        </div>

        <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-800 uppercase block">Present</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{dashboardData?.presentCount || 0}</span>
          <span className="text-[10px] text-emerald-600">On Time</span>
        </div>

        <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[10px] font-bold text-amber-800 uppercase block">Late</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">{dashboardData?.lateCount || 0}</span>
          <span className="text-[10px] text-amber-600">After 08:10</span>
        </div>

        <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 shadow-xs">
          <span className="text-[10px] font-bold text-purple-800 uppercase block">Official Duty</span>
          <span className="text-2xl font-black text-purple-700 mt-1 block">{dashboardData?.officialDutyCount || 0}</span>
          <span className="text-[10px] text-purple-600">Off-Campus</span>
        </div>

        <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 shadow-xs">
          <span className="text-[10px] font-bold text-blue-800 uppercase block">On Leave</span>
          <span className="text-2xl font-black text-blue-700 mt-1 block">{dashboardData?.onLeaveCount || 0}</span>
          <span className="text-[10px] text-blue-600">Approved</span>
        </div>

        <div className="p-4 bg-red-50/70 rounded-2xl border border-red-200 shadow-xs">
          <span className="text-[10px] font-bold text-red-800 uppercase block">Absent</span>
          <span className="text-2xl font-black text-red-700 mt-1 block">{dashboardData?.absentCount || 0}</span>
          <span className="text-[10px] text-red-600">Unexplained</span>
        </div>

        <div className="p-4 bg-stone-100 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] font-bold text-stone-600 uppercase block">Not Checked Out</span>
          <span className="text-2xl font-black text-stone-800 mt-1 block">{dashboardData?.notCheckedOutCount || 0}</span>
          <span className="text-[10px] text-stone-500">In Shift</span>
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

      {/* Geofence Radar Visualization & Settings Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Geofence Radar Card */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4 lg:col-span-1">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <h3 className="font-black text-stone-900 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" /> Geofence Perimeter ({config.geofence_radius_meters || 120}m)
            </h3>
            <span className="text-[10px] font-bold font-mono text-stone-400">GPS: ±{config.gps_accuracy_threshold_meters || 35}m</span>
          </div>

          <div className="relative aspect-square max-h-64 mx-auto rounded-full bg-stone-50 border-2 border-dashed border-emerald-300 flex items-center justify-center p-4">
            {/* Center Campus Landmark */}
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-md z-10">
              CBS
            </div>
            
            {/* Concentric Circle Wave */}
            <div className="absolute inset-4 rounded-full border border-emerald-200/60 pointer-events-none animate-ping opacity-20"></div>
            <div className="absolute inset-12 rounded-full border border-emerald-300/40 pointer-events-none"></div>

            {/* Random Floating Verified Pins */}
            <div className="absolute top-8 left-12 w-3.5 h-3.5 rounded-full bg-emerald-500 shadow border border-white" title="Verified: Teacher 1 (24m)"></div>
            <div className="absolute bottom-10 right-14 w-3.5 h-3.5 rounded-full bg-emerald-500 shadow border border-white" title="Verified: Teacher 2 (48m)"></div>
            <div className="absolute top-16 right-10 w-3.5 h-3.5 rounded-full bg-amber-500 shadow border border-white" title="Late Check-in (35m)"></div>
            <div className="absolute -top-1 right-4 w-3.5 h-3.5 rounded-full bg-red-500 shadow border border-white" title="Outside Perimeter Attempt"></div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-stone-600 pt-2">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Inside Radius</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Late In Radius</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Official Duty</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Outside Attempt</div>
          </div>
        </div>

        {/* Live Attendance Table */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4 lg:col-span-2 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-black text-stone-900 text-base">Today&apos;s Staff Log Roster</h3>
              <p className="text-xs text-stone-500">Live verified timestamps, distance, and selfie proofs.</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-xl text-xs font-bold"
              >
                <option value="All">All Status</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Official Duty">Official Duty</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-3">Staff Member</th>
                  <th className="p-3">In Time</th>
                  <th className="p-3">Out Time</th>
                  <th className="p-3">Hours</th>
                  <th className="p-3">Distance</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-stone-50/60">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        {log.staff?.photo_url ? (
                          <img src={log.staff.photo_url} alt="" className="w-8 h-8 rounded-xl object-cover border border-stone-200" />
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[10px]">
                            {log.staff?.first_name?.[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-stone-900">{log.staff?.first_name} {log.staff?.last_name}</p>
                          <p className="text-[10px] text-stone-400">{log.staff?.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-700">{log.check_in_time || '—'}</td>
                    <td className="p-3 font-mono font-bold text-blue-700">{log.check_out_time || 'In Shift'}</td>
                    <td className="p-3 font-bold text-stone-800">{log.working_hours || 0} hrs</td>
                    <td className="p-3 font-mono text-stone-600">
                      {log.check_in_distance_meters !== null ? `${log.check_in_distance_meters}m` : '—'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === 'Present' ? 'bg-green-100 text-green-800' :
                        log.status === 'Late' ? 'bg-amber-100 text-amber-800' :
                        log.status === 'Official Duty' ? 'bg-purple-100 text-purple-800' : 'bg-stone-200 text-stone-700'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-stone-500 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> {log.verification_method}
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-stone-400 font-medium">
                      No attendance records found for this criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Corrections Exception Drawer / Modal */}
      {showCorrections && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-black text-stone-900">Attendance Exception & Correction Requests</h3>
                <p className="text-xs text-stone-500">Review employee requests for missed GPS check-ins and official duty approvals.</p>
              </div>
              <button onClick={() => setShowCorrections(false)} className="p-1 text-stone-400 hover:text-stone-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {corrections.map((corr: any) => (
                <div key={corr.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-stone-900 text-xs">{corr.staff?.first_name} {corr.staff?.last_name}</h4>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded mr-2">
                        {corr.reason_type}
                      </span>
                      <span className="text-[10px] text-stone-400">Date: {corr.date}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={isReviewing}
                        onClick={() => handleReviewCorrection(corr.id, 'Approved')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        disabled={isReviewing}
                        onClick={() => handleReviewCorrection(corr.id, 'Rejected')}
                        className="bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs px-3 py-1.5 rounded-xl"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 bg-white p-2.5 rounded-xl border border-stone-200">
                    &quot;{corr.reason_description}&quot;
                  </p>
                </div>
              ))}

              {corrections.length === 0 && (
                <div className="py-12 text-center text-stone-400 text-xs">
                  No pending correction requests.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
