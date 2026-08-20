"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  QrCode, Camera, CheckCircle2, XCircle, Clock, AlertCircle, 
  ArrowLeft, Check, Users, Sparkles, Send, RefreshCw, X, ShieldCheck
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getClassStudentRosterForAttendance, 
  recordSingleStudentQRScan, 
  batchSubmitClassAttendance 
} from "@/app/actions/student-attendance";

const GRADES = [
  "Pre-Nursery", "Nursery", "Kindergarten", 
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"
];

export default function TeacherQRScannerTerminal() {
  const searchParams = useSearchParams();
  const initialGrade = searchParams.get("grade") || "Grade 3";
  const initialSection = searchParams.get("section") || "B";

  const [selectedGrade, setSelectedGrade] = useState(initialGrade);
  const [selectedSection, setSelectedSection] = useState(initialSection);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const [roster, setRoster] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Scanner simulation
  const [isScanning, setIsScanning] = useState(true);
  const [manualToken, setManualToken] = useState("");
  const [scannedPopup, setScannedPopup] = useState<any>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);

  useEffect(() => {
    loadClassRoster();
  }, [selectedGrade, selectedSection, selectedDate]);

  async function loadClassRoster() {
    setIsLoading(true);
    try {
      const res = await getClassStudentRosterForAttendance(selectedGrade, selectedSection, selectedDate);
      if (res.success && res.data) {
        setRoster(res.data);
        const map: Record<string, string> = {};
        res.data.forEach((s: any) => {
          map[s.id] = s.status === 'Unmarked' ? 'Unmarked' : s.status;
        });
        setAttendanceMap(map);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleScanSubmit(tokenToScan: string) {
    if (!tokenToScan.trim()) return;

    try {
      const res = await recordSingleStudentQRScan({
        qrToken: tokenToScan.trim(),
        className: selectedGrade,
        sectionName: selectedSection,
        date: selectedDate
      });

      if (res.success && res.student) {
        // Play subtle sound or vibrate
        setScannedPopup(res.student);
        setAttendanceMap(prev => ({
          ...prev,
          [res.student.id]: res.student.status
        }));
        setManualToken("");

        // Auto dismiss popup after 2.5 seconds
        setTimeout(() => {
          setScannedPopup(null);
        }, 2500);
      } else {
        alert(res.error || "QR code not recognized.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  }

  function handleStatusChange(studentId: string, newStatus: string) {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: newStatus
    }));
  }

  async function handleFinalizeAttendance() {
    setIsFinalizing(true);
    const finalMap: Record<string, string> = {};
    
    // Auto-convert any remaining 'Unmarked' students to 'Absent'
    roster.forEach(s => {
      const current = attendanceMap[s.id];
      finalMap[s.id] = current === 'Unmarked' ? 'Absent' : (current || 'Present');
    });

    const res = await batchSubmitClassAttendance({
      className: selectedGrade,
      sectionName: selectedSection,
      date: selectedDate,
      attendanceMap: finalMap
    });

    if (res.success) {
      setAttendanceMap(finalMap);
      alert(`Attendance for ${selectedGrade} - Section ${selectedSection} finalized and locked! Parent SMS alerts dispatched.`);
    } else {
      alert("Error: " + res.error);
    }
    setIsFinalizing(false);
  }

  const presentCount = Object.values(attendanceMap).filter(v => v === 'Present').length;
  const lateCount = Object.values(attendanceMap).filter(v => v === 'Late').length;
  const absentCount = Object.values(attendanceMap).filter(v => v === 'Absent').length;
  const leaveCount = Object.values(attendanceMap).filter(v => v === 'Leave').length;
  const unmarkedCount = Object.values(attendanceMap).filter(v => v === 'Unmarked').length;
  const totalStudents = roster.length;

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <Link 
            href="/admin/students/attendance"
            className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-stone-900 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Attendance Hub
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">Teacher Fast QR Scanner Terminal</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">High-speed camera roll call, instant audio confirmations, and automated absence triage.</p>
        </div>

        {/* Class and Date Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedGrade}
            onChange={e => setSelectedGrade(e.target.value)}
            className="bg-stone-50 border border-stone-200 px-3 py-2 rounded-xl text-xs font-bold text-stone-800"
          >
            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <select
            value={selectedSection}
            onChange={e => setSelectedSection(e.target.value)}
            className="bg-stone-50 border border-stone-200 px-3 py-2 rounded-xl text-xs font-bold text-stone-800"
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="bg-stone-50 border border-stone-200 px-3 py-2 rounded-xl text-xs font-bold text-stone-800"
          />
        </div>
      </div>

      {/* Main Grid: Left Scanner / Right Class Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Camera Viewfinder & Instant Scan Input */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4 lg:col-span-1">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <h3 className="font-black text-stone-900 text-sm flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-600" /> Active QR Scanner
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Ready to Scan
            </span>
          </div>

          {/* Animated Scanner Viewfinder */}
          <div className="relative aspect-4/3 bg-stone-950 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-6 border-2 border-stone-800">
            {/* Target Reticle */}
            <div className="w-44 h-44 border-2 border-dashed border-emerald-400/80 rounded-2xl relative flex items-center justify-center">
              <div className="absolute inset-x-0 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-bounce"></div>
              <QrCode className="w-16 h-16 text-stone-700" />
            </div>

            <p className="text-[11px] text-stone-400 font-bold mt-4 text-center">
              Hold Student ID Card QR in front of camera
            </p>

            {/* Scanned Student Popup Card Overlay */}
            {scannedPopup && (
              <div className="absolute inset-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-2xl animate-in zoom-in-95 duration-200 border-2 border-emerald-500">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500 mb-2 shadow">
                  {scannedPopup.photo_url ? (
                    <img src={scannedPopup.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-black">
                      {scannedPopup.name[0]}
                    </div>
                  )}
                </div>
                <h4 className="font-black text-stone-900 text-sm">{scannedPopup.name}</h4>
                <p className="text-[11px] text-stone-500">Adm: {scannedPopup.admission_no}</p>
                <span className="mt-2 bg-emerald-100 text-emerald-800 font-black text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Marked {scannedPopup.status}!
                </span>
              </div>
            )}
          </div>

          {/* Quick Simulation Token Clicker / Barcode Laser Input */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <label className="text-[11px] font-bold text-stone-500 block">
              Direct Barcode Gun / Manual Token Entry
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste token or scan..."
                value={manualToken}
                onChange={e => setManualToken(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleScanSubmit(manualToken);
                }}
                className="flex-1 border border-stone-200 px-3 py-2 rounded-xl text-xs font-mono"
              />
              <button
                onClick={() => handleScanSubmit(manualToken)}
                className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-3 py-2 rounded-xl text-xs shadow-xs"
              >
                Verify
              </button>
            </div>

            {/* Quick 1-Click Test Buttons for Demo */}
            <div className="pt-2">
              <span className="text-[10px] font-bold text-stone-400 block mb-1 uppercase">1-Click Test Scanners:</span>
              <div className="flex flex-wrap gap-1.5">
                {roster.slice(0, 4).map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleScanSubmit(s.qrToken)}
                    className="text-[10px] font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-1 rounded-lg"
                  >
                    Scan {s.first_name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Class Roll Call Roster & Summary */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4 lg:col-span-2 flex flex-col justify-between">
          
          {/* Header Stats */}
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-black text-stone-900 text-base">
                  {selectedGrade} (Section {selectedSection}) Roster
                </h3>
                <p className="text-xs text-stone-500">Live attendance count and manual exception overrides.</p>
              </div>

              {/* Progress Counters */}
              <div className="flex items-center gap-2">
                <span className="bg-emerald-50 text-emerald-800 text-xs font-black px-2.5 py-1 rounded-xl">
                  {presentCount} Present
                </span>
                <span className="bg-red-50 text-red-700 text-xs font-black px-2.5 py-1 rounded-xl">
                  {absentCount} Absent
                </span>
                {unmarkedCount > 0 && (
                  <span className="bg-amber-50 text-amber-800 text-xs font-black px-2.5 py-1 rounded-xl flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> {unmarkedCount} Pending
                  </span>
                )}
              </div>
            </div>

            {/* Student Roster Table */}
            <div className="overflow-x-auto mt-4 max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider border-b border-stone-200 sticky top-0">
                  <tr>
                    <th className="p-3">Roll</th>
                    <th className="p-3">Student</th>
                    <th className="p-3">Admission No</th>
                    <th className="p-3">Scan Time</th>
                    <th className="p-3 text-right">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {roster.map(student => {
                    const status = attendanceMap[student.id] || 'Unmarked';
                    return (
                      <tr key={student.id} className="hover:bg-stone-50/60">
                        <td className="p-3 font-mono font-bold text-stone-500">{student.roll_no}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            {student.photo_url ? (
                              <img src={student.photo_url} alt="" className="w-8 h-8 rounded-xl object-cover border border-stone-200" />
                            ) : (
                              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-[10px]">
                                {student.first_name[0]}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-stone-900">{student.first_name} {student.last_name || ''}</p>
                              <span className="text-[10px] font-mono text-stone-400">{student.qrToken}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-stone-600">{student.admission_no}</td>
                        <td className="p-3 font-mono text-emerald-700 font-bold">{student.time || '—'}</td>
                        <td className="p-3 text-right">
                          <div className="inline-flex gap-1 bg-stone-100 p-1 rounded-xl">
                            {['Present', 'Absent', 'Late', 'Leave'].map(st => (
                              <button
                                key={st}
                                onClick={() => handleStatusChange(student.id, st)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                  status === st 
                                    ? st === 'Present' ? 'bg-emerald-600 text-white shadow-xs' :
                                      st === 'Absent' ? 'bg-red-600 text-white shadow-xs' :
                                      st === 'Late' ? 'bg-amber-500 text-white shadow-xs' : 'bg-blue-600 text-white shadow-xs'
                                    : 'text-stone-600 hover:text-stone-900'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Action: Finalize Class Session */}
          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="text-xs text-stone-500">
              <span>Class Status: </span>
              <span className="font-bold text-stone-900">
                {unmarkedCount > 0 ? `⚠️ ${unmarkedCount} students unmarked` : '✓ All students marked'}
              </span>
            </div>

            <button
              onClick={handleFinalizeAttendance}
              disabled={isFinalizing}
              className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 text-white font-black text-xs px-6 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              {isFinalizing ? "Locking Attendance..." : "Mark Remaining as Absent & Finalize Session"}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
