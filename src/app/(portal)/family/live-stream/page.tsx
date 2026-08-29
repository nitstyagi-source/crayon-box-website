"use client";

import { useState, useEffect } from "react";
import { useSiblingContext } from "@/components/providers/SiblingProvider";
import { 
  Radio, ShieldCheck, ShieldAlert, CheckCircle2, 
  XCircle, Clock, MapPin, UserCheck, RefreshCw, 
  Eye, Lock, Sparkles, BookOpen, AlertCircle, AlertTriangle
} from "lucide-react";
import SecureClassroomPlayer from "@/components/ui/SecureClassroomPlayer";
import { getLiveStreamAuthorization } from "@/app/actions/live-stream-core";

export default function ParentLiveStreamPage() {
  const { activeSibling, siblings, setActiveSiblingId } = useSiblingContext();
  const [authData, setAuthData] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [errorReason, setErrorReason] = useState<string | null>(null);

  // Demo Parent Credentials
  const parentId = "PAR-9821";
  const parentName = "Mr. Nitin Tyagi";

  const studentName = activeSibling?.firstName 
    ? `${activeSibling.firstName} Sharma` 
    : "Aarav Sharma";
  const studentId = activeSibling?.id || "STU-1008";
  const className = activeSibling?.grade || "Grade 5";

  useEffect(() => {
    verifyAndStartStream();
  }, [activeSibling]);

  async function verifyAndStartStream() {
    setIsVerifying(true);
    setErrorReason(null);
    try {
      const res = await getLiveStreamAuthorization({
        studentId,
        studentName,
        className,
        parentId,
        parentName,
        deviceInfo: typeof navigator !== "undefined" ? navigator.userAgent : "Web Device"
      });

      if (res.authorized) {
        setAuthData(res);
      } else {
        setAuthData(null);
        setErrorReason(res.reason || "Live stream access could not be authorized.");
      }
    } catch (e: any) {
      setErrorReason(e.message || "Failed to authorize stream.");
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      
      {/* Top Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <Radio className="w-3 h-3 text-purple-600 animate-pulse" /> Restricted Classroom Stream
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-slate-500 text-xs font-bold">{className}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Live Classroom View
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time observational feed for <strong className="text-slate-800">{studentName}'s</strong> current active room.
          </p>
        </div>

        {/* Multi-Child Sibling Switcher */}
        {siblings && siblings.length > 1 && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5">
            <span className="text-xs font-bold text-slate-400 pl-2">Child:</span>
            {siblings.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSiblingId(s.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeSibling?.id === s.id
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/60"
                }`}
              >
                {s.firstName} ({s.grade})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pre-Flight Attendance & Child Status Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Child Profile Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 font-black flex items-center justify-center text-sm">
            {studentName.charAt(0)}
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">My Child</span>
            <strong className="text-sm font-black text-slate-900 block">{studentName}</strong>
            <span className="text-xs text-purple-700 font-bold">{className}</span>
          </div>
        </div>

        {/* Student Attendance Status (Must be Present) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today's Attendance</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <strong className="text-sm font-black text-emerald-700">Present Today</strong>
            </div>
            <span className="text-[11px] text-slate-500">Marked at 08:15 AM</span>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
        </div>

        {/* Current Timetable Period & Room */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Period</span>
            <strong className="text-sm font-black text-slate-900 block">Mathematics</strong>
            <span className="text-[11px] text-purple-700 font-medium">Mr. Sharma • {authData?.roomNumber || "Room 301"}</span>
          </div>
          <BookOpen className="w-6 h-6 text-purple-500" />
        </div>

      </div>

      {/* Main Video Stream Container / Authorization Failure View */}
      {isVerifying ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-xs space-y-3">
          <RefreshCw className="w-10 h-10 text-purple-600 animate-spin mx-auto" />
          <h3 className="text-base font-black text-slate-900">
            Verifying Student Presence & Generating Secure Token...
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Checking school timetable, parent linkage, and active classroom camera endpoints.
          </p>
        </div>
      ) : authData?.authorized ? (
        <div className="space-y-4">
          
          {/* Secure Video Player */}
          <SecureClassroomPlayer
            streamUrl={authData.streamUrl}
            cameraName={authData.cameraName}
            roomNumber={authData.roomNumber}
            className={className}
            studentName={studentName}
            studentId={studentId}
            parentId={parentId}
            parentName={parentName}
            token={authData.token}
            expiresAt={authData.expiresAt}
            watermarkData={authData.watermark}
            onSessionExpired={verifyAndStartStream}
          />

          {/* Quick Refresh Status Bar */}
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 text-xs shadow-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>Token auto-renews dynamically during active school hours.</span>
            </div>

            <button
              type="button"
              onClick={verifyAndStartStream}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center gap-1.5 transition text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Session
            </button>
          </div>

        </div>
      ) : (
        /* Access Denied Card (e.g. Student Absent / Emergency Kill Switch / Out of Hours) */
        <div className="bg-white rounded-3xl p-12 text-center border border-red-200 shadow-md space-y-5 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-900">
              Classroom Live View Unavailable
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {errorReason || "Access could not be authorized at this time."}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 text-left space-y-1.5">
            <strong className="block text-slate-900 font-bold">Access Verification Criteria:</strong>
            <ul className="list-disc pl-5 space-y-1 text-[11px]">
              <li>Parent account authenticated & linked to student</li>
              <li>Student marked <strong>PRESENT</strong> for today's school session</li>
              <li>Current time is within active school hours (08:00 AM – 03:30 PM)</li>
              <li>Classroom camera is online with no active administrative maintenance</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={verifyAndStartStream}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Re-Check Authorization
          </button>
        </div>
      )}

    </div>
  );
}
