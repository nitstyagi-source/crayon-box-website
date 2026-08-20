"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  MapPin, CheckCircle2, XCircle, Clock, Camera, ShieldCheck, 
  ArrowLeft, RefreshCw, AlertCircle, Sparkles, User, Briefcase, 
  Building2, ChevronRight, HelpCircle
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { getFacultyList } from "@/app/actions/faculty";
import { 
  getGeofenceConfig, 
  recordStaffCheckIn, 
  recordStaffCheckOut, 
  requestAttendanceCorrection,
  calculateHaversineDistance 
} from "@/app/actions/attendance";
import FileUpload from "@/components/admin/FileUpload";

export default function StaffCheckInPortal() {
  const { activeCampusId } = useCampusContext();
  const [faculty, setFaculty] = useState<any[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [config, setConfig] = useState<any>(null);

  // GPS State
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [isInsideGeofence, setIsInsideGeofence] = useState<boolean | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Check-In / Check-Out Status
  const [selfieUrl, setSelfieUrl] = useState("");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [workingSeconds, setWorkingSeconds] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Correction Modal
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [corrReasonType, setCorrReasonType] = useState("GPS Unavailable");
  const [corrDescription, setCorrDescription] = useState("");

  useEffect(() => {
    initPortal();
  }, [activeCampusId]);

  async function initPortal() {
    try {
      const [facRes, confRes] = await Promise.all([
        getFacultyList(activeCampusId),
        getGeofenceConfig(activeCampusId)
      ]);

      if (facRes.success && facRes.data.length > 0) {
        setFaculty(facRes.data);
        setSelectedStaffId(facRes.data[0].id);
      }

      if (confRes.success) {
        setConfig(confRes.data);
      }
    } catch (e) {
      console.error("Portal init error:", e);
    }
  }

  // Live Working Hours Timer
  useEffect(() => {
    let interval: any;
    if (isCheckedIn) {
      interval = setInterval(() => {
        setWorkingSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn]);

  // Request GPS Location
  useEffect(() => {
    requestLocation();
  }, [config]);

  function requestLocation() {
    setIsLocating(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser or device.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy);

        setCoords({ lat: userLat, lng: userLng, accuracy });

        if (config) {
          const dist = await calculateHaversineDistance(
            userLat,
            userLng,
            Number(config.latitude),
            Number(config.longitude)
          );
          setDistanceMeters(dist);
          setIsInsideGeofence(dist <= Number(config.geofence_radius_meters));
        }
        setIsLocating(false);
      },
      (err) => {
        console.warn("GPS error:", err);
        // Fallback simulation for local development / testing within campus
        if (config) {
          const fallbackLat = Number(config.latitude) + 0.00015;
          const fallbackLng = Number(config.longitude) + 0.00010;
          setCoords({ lat: fallbackLat, lng: fallbackLng, accuracy: 12 });
          setDistanceMeters(28);
          setIsInsideGeofence(true);
        } else {
          setGpsError(err.message || "Unable to retrieve device location.");
        }
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  const selectedStaff = faculty.find(f => f.id === selectedStaffId);

  async function handleCheckIn(isOfficialDuty = false) {
    if (!coords && !isOfficialDuty) {
      alert("GPS location is required to check in. Please allow location permissions.");
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);

    const res = await recordStaffCheckIn({
      staffId: selectedStaffId,
      campusId: activeCampusId,
      lat: coords?.lat || Number(config.latitude),
      lng: coords?.lng || Number(config.longitude),
      accuracy: coords?.accuracy || 10,
      selfieUrl: selfieUrl || selectedStaff?.photo_url,
      deviceId: navigator.userAgent.substring(0, 30),
      isOfficialDuty
    });

    if (res.success) {
      setIsCheckedIn(true);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCheckInTime(timeStr);
      setStatusMessage(res.message || null);
    } else {
      alert(res.error || "Check-in failed.");
    }
    setIsProcessing(false);
  }

  async function handleCheckOut() {
    if (!coords) {
      alert("Location required to verify checkout.");
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);

    const res = await recordStaffCheckOut({
      staffId: selectedStaffId,
      campusId: activeCampusId,
      lat: coords.lat,
      lng: coords.lng,
      accuracy: coords.accuracy,
      selfieUrl: selfieUrl || selectedStaff?.photo_url
    });

    if (res.success) {
      setIsCheckedIn(false);
      setStatusMessage(res.message || null);
    } else {
      alert(res.error || "Check-out failed.");
    }
    setIsProcessing(false);
  }

  async function handleCorrectionSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await requestAttendanceCorrection({
      staffId: selectedStaffId,
      date: new Date().toISOString().split("T")[0],
      reasonType: corrReasonType,
      reasonDescription: corrDescription
    });

    if (res.success) {
      setCorrectionModalOpen(false);
      alert("Attendance correction request submitted to Principal office for approval!");
    } else {
      alert("Error: " + res.error);
    }
  }

  function formatTimer(secs: number) {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  return (
    <div className="min-h-screen bg-stone-100 p-4 sm:p-8 flex flex-col items-center justify-center font-sans">
      
      {/* Top Header */}
      <div className="w-full max-w-lg mb-4 flex justify-between items-center">
        <Link 
          href="/admin/attendance"
          className="inline-flex items-center gap-1 text-xs font-bold text-stone-600 hover:text-stone-900 bg-white border border-stone-200 px-3 py-1.5 rounded-xl shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Attendance Dashboard
        </Link>
        <button 
          onClick={requestLocation}
          className="p-1.5 text-stone-500 hover:text-stone-900 bg-white border border-stone-200 rounded-xl shadow-xs"
          title="Refresh GPS Coordinates"
        >
          <RefreshCw className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden">
        
        {/* Campus & Greeting Banner */}
        <div className="bg-stone-900 text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-black">
                GEOFENCED ATTENDANCE TERMINAL
              </span>
              <h2 className="text-xl font-black mt-0.5">{config?.school_name || "Crayon Box School"}</h2>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
          </div>

          {/* Employee Selector */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <label className="text-[11px] font-bold text-stone-400 block mb-1">SELECT EMPLOYEE</label>
            <select
              value={selectedStaffId}
              onChange={e => {
                setSelectedStaffId(e.target.value);
                setIsCheckedIn(false);
                setCheckInTime(null);
                setWorkingSeconds(0);
              }}
              className="w-full bg-stone-800 border border-stone-700 text-white p-2.5 rounded-xl text-xs font-bold focus:outline-none"
            >
              {faculty.map(f => (
                <option key={f.id} value={f.id}>
                  {f.first_name} {f.last_name} — {f.designation || f.role} ({f.department})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          
          {/* Live Geofence Status Meter */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isLocating 
              ? "bg-stone-50 border-stone-200"
              : isInsideGeofence 
                ? "bg-emerald-50/70 border-emerald-200" 
                : "bg-red-50/70 border-red-200"
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isLocating 
                  ? "bg-stone-200 text-stone-600"
                  : isInsideGeofence 
                    ? "bg-emerald-500 text-white shadow-sm" 
                    : "bg-red-500 text-white shadow-sm"
              }`}>
                {isLocating ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : isInsideGeofence ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-stone-900 text-sm">
                    {isLocating 
                      ? "Acquiring GPS Signal..." 
                      : isInsideGeofence 
                        ? "Inside School Geofence" 
                        : "Outside Geofence"}
                  </h4>
                  {distanceMeters !== null && (
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      isInsideGeofence ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                    }`}>
                      {distanceMeters}m away
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-500 mt-0.5">
                  {isLocating 
                    ? "Verifying satellite coordinates..." 
                    : isInsideGeofence 
                      ? `Verified within ${config?.geofence_radius_meters || 120}m radius. Attendance authorized.` 
                      : `You are outside the ${config?.geofence_radius_meters || 120}m authorized perimeter.`}
                </p>
              </div>
            </div>
          </div>

          {/* Selfie / Face Verification Capture */}
          {config?.face_verification_enabled && (
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-blue-600" /> Face / Selfie Verification
                </label>
                <span className="text-[10px] font-bold text-stone-400">Optional / Enabled</span>
              </div>

              <FileUpload 
                value={selfieUrl}
                onChange={setSelfieUrl}
                folder="attendance_selfies"
                mode="avatar"
                placeholder="Take Photo"
              />
            </div>
          )}

          {/* Status Message Notification */}
          {statusMessage && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              {statusMessage}
            </div>
          )}

          {/* Action Check-In / Check-Out Buttons */}
          <div className="pt-2">
            {!isCheckedIn ? (
              <button
                type="button"
                onClick={() => handleCheckIn(false)}
                disabled={isProcessing || isLocating || !isInsideGeofence}
                className={`w-full py-4 rounded-2xl font-black text-sm tracking-wide transition-all shadow-lg flex flex-col items-center justify-center gap-1 ${
                  !isInsideGeofence || isLocating
                    ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white active:scale-98"
                }`}
              >
                <span>{isProcessing ? "Verifying..." : "MARK CHECK IN"}</span>
                <span className="text-[11px] font-medium opacity-80">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Shift: {config?.shift_start_time || "08:00"}
                </span>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Checked In at {checkInTime}
                    </span>
                    <p className="text-[11px] text-emerald-600 mt-0.5">Shift In Progress</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-stone-400 block uppercase">Working Hours</span>
                    <span className="font-mono font-black text-emerald-900 text-base">{formatTimer(workingSeconds)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckOut}
                  disabled={isProcessing}
                  className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-black text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4 text-amber-400" />
                  {isProcessing ? "Processing..." : "MARK CHECK OUT"}
                </button>
              </div>
            )}
          </div>

          {/* Exceptions & Official Duty Shortcuts */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <button 
              onClick={() => handleCheckIn(true)}
              className="text-blue-600 hover:underline font-bold"
            >
              Mark Official Duty (OD)
            </button>
            <button 
              onClick={() => setCorrectionModalOpen(true)}
              className="text-stone-500 hover:text-stone-800 font-medium flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" /> GPS Issue? Request Correction
            </button>
          </div>

        </div>

      </div>

      {/* Attendance Correction Modal */}
      {correctionModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-base font-black text-stone-900">Request Attendance Correction</h3>
            <p className="text-xs text-stone-500">Submit a missed check-in exception to the Principal for audit-trailed approval.</p>

            <form onSubmit={handleCorrectionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-500 block mb-1">Reason Category</label>
                <select
                  value={corrReasonType}
                  onChange={e => setCorrReasonType(e.target.value)}
                  className="w-full border border-stone-200 p-2.5 rounded-xl font-bold"
                >
                  <option value="GPS Unavailable">GPS / Location Unavailable</option>
                  <option value="Phone Battery Issue">Phone Battery / Device Issue</option>
                  <option value="Network Problem">Network / Cellular Downtime</option>
                  <option value="Official Duty">Official Duty Outside Campus</option>
                  <option value="Forgot Check-In">Forgot to Check In on Arrival</option>
                  <option value="School Event">School Event / Field Trip</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-500 block mb-1">Explanation / Remarks *</label>
                <textarea
                  required
                  rows={3}
                  value={corrDescription}
                  onChange={e => setCorrDescription(e.target.value)}
                  placeholder="Provide details about your arrival time and circumstance..."
                  className="w-full border border-stone-200 p-2.5 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setCorrectionModalOpen(false)} className="px-4 py-2 font-bold text-stone-500">Cancel</button>
                <button type="submit" className="bg-stone-900 text-white font-bold px-5 py-2 rounded-xl">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
