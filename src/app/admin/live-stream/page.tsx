"use client";

import { useState, useEffect } from "react";
import { 
  Video, Radio, ShieldAlert, ShieldCheck, Power, 
  AlertTriangle, Play, Pause, RefreshCw, Plus, Edit3, 
  Trash2, Eye, Lock, Clock, Settings, UserCheck, 
  Server, AlertCircle, Camera, CheckCircle2, XCircle
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getLiveStreamAdminDashboard, toggleGlobalKillSwitch, 
  toggleCameraKillSwitch, saveLiveStreamSettings, 
  saveCamera, deleteCamera 
} from "@/app/actions/live-stream-core";

export default function AdminLiveStreamPage() {
  const { activeCampusId } = useCampusContext();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"cameras" | "logs" | "security" | "settings">("cameras");
  
  // Modals
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<any>(null);
  const [camForm, setCamForm] = useState({
    classroom_name: "Grade 5",
    room_number: "Room 301",
    camera_name: "",
    stream_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    status: "Online"
  });

  const [settingsForm, setSettingsForm] = useState({
    streaming_start_time: "08:00",
    streaming_end_time: "15:30",
    watermark_enabled: true,
    capture_detection_enabled: true,
    require_student_present: true
  });

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, [activeCampusId]);

  async function loadDashboard() {
    setIsLoading(true);
    try {
      const res = await getLiveStreamAdminDashboard(activeCampusId);
      if (res.success && res.data) {
        setData(res.data);
        if (res.data.settings) {
          setSettingsForm({
            streaming_start_time: res.data.settings.streaming_start_time || "08:00",
            streaming_end_time: res.data.settings.streaming_end_time || "15:30",
            watermark_enabled: res.data.settings.watermark_enabled ?? true,
            capture_detection_enabled: res.data.settings.capture_detection_enabled ?? true,
            require_student_present: res.data.settings.require_student_present ?? true
          });
        }
      }
    } catch (e) {
      console.error("Error loading live stream admin dashboard:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleGlobalKillSwitch() {
    const isCurrentlyActive = data?.stats?.globalKillSwitchActive;
    const confirmMsg = isCurrentlyActive
      ? "Resume campus-wide live streaming for authorized parents?"
      : "🚨 EMERGENCY KILL SWITCH: This will immediately disconnect ALL live streams for all parents across the entire school. Proceed?";
    
    if (!confirm(confirmMsg)) return;

    setIsProcessing(true);
    try {
      const res = await toggleGlobalKillSwitch(activeCampusId, !isCurrentlyActive);
      if (res.success) {
        loadDashboard();
      }
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleToggleCameraKill(cam: any) {
    const newStatus = !cam.kill_switch_active;
    setIsProcessing(true);
    try {
      const res = await toggleCameraKillSwitch(cam.id, newStatus);
      if (res.success) {
        loadDashboard();
      }
    } finally {
      setIsProcessing(false);
    }
  }

  function openAddCamera() {
    setEditingCamera(null);
    setCamForm({
      classroom_name: "Grade 5",
      room_number: "Room 301",
      camera_name: "Grade 5 Classroom Cam A",
      stream_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      status: "Online"
    });
    setCameraModalOpen(true);
  }

  function openEditCamera(cam: any) {
    setEditingCamera(cam);
    setCamForm({
      classroom_name: cam.classroom_name,
      room_number: cam.room_number,
      camera_name: cam.camera_name,
      stream_url: cam.stream_url,
      status: cam.status
    });
    setCameraModalOpen(true);
  }

  async function handleSaveCamera(e: React.FormEvent) {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await saveCamera({
        id: editingCamera?.id,
        campus_id: activeCampusId,
        classroom_name: camForm.classroom_name,
        room_number: camForm.room_number,
        camera_name: camForm.camera_name,
        stream_url: camForm.stream_url,
        status: camForm.status
      });

      if (res.success) {
        setCameraModalOpen(false);
        loadDashboard();
      } else {
        alert("Error saving camera: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleDeleteCamera(id: string) {
    if (!confirm("Delete this camera from ERP?")) return;
    setIsProcessing(true);
    try {
      const res = await deleteCamera(id);
      if (res.success) loadDashboard();
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await saveLiveStreamSettings({
        campus_id: activeCampusId,
        streaming_start_time: settingsForm.streaming_start_time,
        streaming_end_time: settingsForm.streaming_end_time,
        watermark_enabled: settingsForm.watermark_enabled,
        capture_detection_enabled: settingsForm.capture_detection_enabled,
        require_student_present: settingsForm.require_student_present
      });

      if (res.success) {
        alert("Live stream policies updated successfully!");
        loadDashboard();
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  const isGlobalKillActive = data?.stats?.globalKillSwitchActive;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Restricted Classroom Video Engine
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Parent Live View Security Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
            <Radio className="w-8 h-8 text-purple-600 animate-pulse" />
            Classroom Live View Command Center
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Manage classroom IP cameras, enforce student attendance verification, configure dynamic watermarks, and control emergency kill switches.
          </p>
        </div>

        {/* EMERGENCY GLOBAL KILL SWITCH BUTTON */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleGlobalKillSwitch}
            disabled={isProcessing}
            className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-lg transition flex items-center gap-2.5 ${
              isGlobalKillActive
                ? "bg-emerald-600 hover:bg-emerald-700 text-white animate-bounce"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            <Power className="w-5 h-5" />
            {isGlobalKillActive ? "RESUME ALL LIVE STREAMS" : "🚨 STOP ALL LIVE STREAMING"}
          </button>
        </div>
      </div>

      {/* GLOBAL EMERGENCY ALERT BANNER (IF KILL SWITCH ACTIVE) */}
      {isGlobalKillActive && (
        <div className="bg-red-600 text-white p-4 sm:p-5 rounded-3xl shadow-xl flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold shrink-0">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-wider">
                Emergency Shutdown Active: All Parent Streams Terminated
              </h3>
              <p className="text-xs text-red-100 mt-0.5">
                No parent can view any classroom camera. All active video tokens have been revoked.
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleGlobalKillSwitch}
            className="px-4 py-2 bg-white text-red-700 font-bold text-xs rounded-xl hover:bg-red-50 transition shrink-0"
          >
            Deactivate Kill Switch
          </button>
        </div>
      )}

      {/* Operational Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-stone-400">
            <span>Total Cameras</span>
            <Camera className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-stone-900 font-mono">
            {data?.stats?.totalCameras || 0}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold">
            {data?.stats?.onlineCameras || 0} Online • {data?.stats?.offlineCameras || 0} Offline
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-stone-400">
            <span>Active Parent Viewers</span>
            <Eye className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {data?.stats?.activeViewers || 0}
          </div>
          <span className="text-[11px] text-stone-500 font-bold">
            Authorized Short-Lived Sessions
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-stone-400">
            <span>Screen Capture Alerts</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">
            {data?.stats?.captureAlertsCount || 0}
          </div>
          <span className="text-[11px] text-stone-500 font-bold">
            Incidents Obscured & Logged
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-stone-400">
            <span>Presence Enforcement</span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-stone-900">
            {data?.settings?.require_student_present ? "ACTIVE" : "OFF"}
          </div>
          <span className="text-[11px] text-purple-600 font-bold">
            Absent = Stream Blocked
          </span>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("cameras")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition ${
            activeTab === "cameras"
              ? "bg-white text-stone-900 shadow-xs border border-stone-200"
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <Camera className="w-4 h-4 text-purple-600" />
          <span>Classroom Cameras ({data?.cameras?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition ${
            activeTab === "logs"
              ? "bg-white text-stone-900 shadow-xs border border-stone-200"
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>Parent Access Audit Logs ({data?.accessLogs?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition ${
            activeTab === "security"
              ? "bg-white text-stone-900 shadow-xs border border-stone-200"
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-red-600" />
          <span>Security & Screen-Capture Alerts ({data?.securityEvents?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition ${
            activeTab === "settings"
              ? "bg-white text-stone-900 shadow-xs border border-stone-200"
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <Settings className="w-4 h-4 text-stone-700" />
          <span>Streaming Policies & Schedule</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CAMERAS LIST & ROOM CONTROLS */}
      {/* ========================================================================= */}
      {activeTab === "cameras" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-xs font-bold text-stone-600">
              Manage live camera feeds mapped to individual classrooms & activity wings.
            </span>
            <button
              type="button"
              onClick={openAddCamera}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Classroom Camera
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(data?.cameras || []).map((cam: any) => (
              <div 
                key={cam.id}
                className={`bg-white rounded-3xl border p-5 space-y-4 shadow-xs transition ${
                  cam.kill_switch_active ? "border-red-300 bg-red-50/20" : "border-stone-200 hover:border-purple-300"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 px-2 py-0.5 rounded">
                      {cam.classroom_name} • {cam.room_number}
                    </span>
                    <h3 className="text-base font-black text-stone-900 mt-1.5">
                      {cam.camera_name}
                    </h3>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                    cam.kill_switch_active 
                      ? "bg-red-100 text-red-800" 
                      : cam.status === "Online" ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"
                  }`}>
                    {cam.kill_switch_active ? "Paused (Kill Switch)" : cam.status}
                  </span>
                </div>

                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-xs space-y-1">
                  <div className="flex justify-between text-stone-500 font-medium">
                    <span>Stream Endpoint:</span>
                    <span className="font-mono text-[10px] truncate max-w-[160px]">{cam.stream_url}</span>
                  </div>
                  <div className="flex justify-between text-stone-500 font-medium">
                    <span>Access Rule:</span>
                    <span className="font-bold text-purple-950">Parents of {cam.classroom_name} (Present Only)</span>
                  </div>
                </div>

                {/* Camera Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => handleToggleCameraKill(cam)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                      cam.kill_switch_active
                        ? "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                        : "bg-red-100 text-red-900 hover:bg-red-200"
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {cam.kill_switch_active ? "Resume Feed" : "Stop Class Stream"}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditCamera(cam)}
                      className="p-1.5 hover:bg-stone-100 text-stone-600 rounded-lg"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCamera(cam.id)}
                      className="p-1.5 hover:bg-red-100 text-red-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ACCESS AUDIT LOGS */}
      {/* ========================================================================= */}
      {activeTab === "logs" && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-100">
            <h3 className="font-black text-sm text-stone-900">
              Real-Time Parent Stream Access History
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Logs of every live classroom stream authorization decision.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Parent</th>
                  <th className="p-3.5">Student & Class</th>
                  <th className="p-3.5">Camera / Room</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Reason / Decision</th>
                  <th className="p-3.5">Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {(data?.accessLogs || []).map((log: any) => (
                  <tr key={log.id} className="hover:bg-stone-50/60">
                    <td className="p-3.5 text-stone-500 font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleString("en-IN")}
                    </td>
                    <td className="p-3.5 font-bold text-stone-900">
                      {log.parent_name}
                      <span className="block text-[10px] font-mono text-stone-400">{log.parent_id}</span>
                    </td>
                    <td className="p-3.5 font-bold text-stone-800">
                      {log.student_name}
                      <span className="block text-[10px] text-purple-700">{log.class_name}</span>
                    </td>
                    <td className="p-3.5 font-medium text-stone-700">
                      {log.camera_name}
                      <span className="block text-[10px] text-stone-400">{log.room_number}</span>
                    </td>
                    <td className="p-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        log.access_status === "Granted" ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"
                      }`}>
                        {log.access_status}
                      </span>
                    </td>
                    <td className="p-3.5 text-stone-600 text-[11px]">
                      {log.reason}
                    </td>
                    <td className="p-3.5 text-stone-400 font-mono text-[10px]">
                      {log.device_info}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SECURITY & SCREEN CAPTURE ALERTS */}
      {/* ========================================================================= */}
      {activeTab === "security" && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex justify-between items-center">
            <div>
              <h3 className="font-black text-sm text-stone-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                Screen Capture & Recording Incident Audit
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Incidents where parent device attempted to take screenshots, record the stream, or inspect elements.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-red-100 text-red-900 px-2.5 py-1 rounded-xl">
              {data?.securityEvents?.length || 0} Incident Alerts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Incident Time</th>
                  <th className="p-3.5">Parent</th>
                  <th className="p-3.5">Student & Class</th>
                  <th className="p-3.5">Event Type</th>
                  <th className="p-3.5">Action Taken</th>
                  <th className="p-3.5">Device Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {(data?.securityEvents || []).map((sec: any) => (
                  <tr key={sec.id} className="hover:bg-red-50/30">
                    <td className="p-3.5 text-stone-500 font-mono text-[11px]">
                      {new Date(sec.created_at).toLocaleString("en-IN")}
                    </td>
                    <td className="p-3.5 font-bold text-stone-900">
                      {sec.parent_name}
                      <span className="block text-[10px] font-mono text-stone-400">{sec.parent_id}</span>
                    </td>
                    <td className="p-3.5 font-bold text-stone-800">
                      {sec.student_name} ({sec.class_name})
                    </td>
                    <td className="p-3.5 font-black text-red-600">
                      {sec.event_type}
                    </td>
                    <td className="p-3.5 text-stone-700 font-medium">
                      {sec.action_taken}
                    </td>
                    <td className="p-3.5 text-stone-400 font-mono text-[10px]">
                      {sec.device_info}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: STREAMING SETTINGS & POLICY CONFIG */}
      {/* ========================================================================= */}
      {activeTab === "settings" && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6 max-w-3xl">
          <div>
            <h3 className="text-lg font-black text-stone-900">
              Classroom Live Streaming Policies & Timetable Window
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Control the exact hours and security guardrails under which parents are authorized to view live feeds.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
            
            {/* Streaming Hours */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Streaming Start Time</label>
                <input
                  type="time"
                  value={settingsForm.streaming_start_time}
                  onChange={(e) => setSettingsForm({ ...settingsForm, streaming_start_time: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-bold text-stone-900"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Streaming End Time</label>
                <input
                  type="time"
                  value={settingsForm.streaming_end_time}
                  onChange={(e) => setSettingsForm({ ...settingsForm, streaming_end_time: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-bold text-stone-900"
                />
              </div>
            </div>

            {/* Attendance Toggle */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <strong className="block text-stone-900 font-bold text-xs">
                  Enforce Student Attendance Requirement
                </strong>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  When enabled, live streams are strictly blocked for parents whose child is marked Absent today.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settingsForm.require_student_present}
                onChange={(e) => setSettingsForm({ ...settingsForm, require_student_present: e.target.checked })}
                className="w-5 h-5 accent-purple-600 rounded"
              />
            </div>

            {/* Dynamic Watermark Toggle */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <strong className="block text-stone-900 font-bold text-xs">
                  Moving Dynamic Anti-Screenshot Watermark
                </strong>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Overlays floating parent name, student name, live timestamp, and session token across video.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settingsForm.watermark_enabled}
                onChange={(e) => setSettingsForm({ ...settingsForm, watermark_enabled: e.target.checked })}
                className="w-5 h-5 accent-purple-600 rounded"
              />
            </div>

            {/* Screen Capture Detection Toggle */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <strong className="block text-stone-900 font-bold text-xs">
                  Screen-Capture & DevTools Obscuration
                </strong>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Immediately pauses/blurs video feed when print screen, screen recording, or tab unfocus is detected.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settingsForm.capture_detection_enabled}
                onChange={(e) => setSettingsForm({ ...settingsForm, capture_detection_enabled: e.target.checked })}
                className="w-5 h-5 accent-purple-600 rounded"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isProcessing}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition"
              >
                {isProcessing ? "Saving..." : "Save Policy Settings"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT CAMERA */}
      {/* ========================================================================= */}
      {cameraModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-lg font-black text-stone-900">
                {editingCamera ? "Edit Classroom Camera" : "Add Classroom Camera"}
              </h3>
              <button onClick={() => setCameraModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveCamera} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Classroom Name *</label>
                  <input
                    type="text"
                    value={camForm.classroom_name}
                    onChange={(e) => setCamForm({ ...camForm, classroom_name: e.target.value })}
                    placeholder="e.g. Grade 5 or Nursery"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Room Number *</label>
                  <input
                    type="text"
                    value={camForm.room_number}
                    onChange={(e) => setCamForm({ ...camForm, room_number: e.target.value })}
                    placeholder="e.g. Room 301"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Camera Friendly Name *</label>
                <input
                  type="text"
                  value={camForm.camera_name}
                  onChange={(e) => setCamForm({ ...camForm, camera_name: e.target.value })}
                  placeholder="e.g. Grade 5 Junior High Cam A"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Stream Endpoint / RTSP HLS URL *</label>
                <input
                  type="url"
                  value={camForm.stream_url}
                  onChange={(e) => setCamForm({ ...camForm, stream_url: e.target.value })}
                  placeholder="https://... or rtsp://..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono text-stone-900 text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Status</label>
                <select
                  value={camForm.status}
                  onChange={(e) => setCamForm({ ...camForm, status: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button type="button" onClick={() => setCameraModalOpen(false)} className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={isProcessing} className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition">
                  {isProcessing ? "Saving..." : "Save Camera"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
