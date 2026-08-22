"use client";

import { useState, useEffect } from "react";
import { 
  Video, Radio, ShieldAlert, ShieldCheck, Power, 
  AlertTriangle, Play, Pause, RefreshCw, Plus, Edit3, 
  Trash2, Eye, Lock, Clock, Settings, UserCheck, 
  Server, AlertCircle, Camera, CheckCircle2, XCircle,
  LayoutGrid, Maximize2, Search, Filter, Sparkles, UserX,
  Layers, ChevronRight, UserMinus, Signal
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import CctvStreamPlayer from "@/components/ui/CctvStreamPlayer";
import { 
  getLiveStreamAdminDashboard, toggleGlobalKillSwitch, 
  toggleCameraKillSwitch, saveLiveStreamSettings, 
  saveCamera, deleteCamera, getParentAccessControlList,
  toggleParentStreamAccess, bulkUpdateClassStreamAccess,
  getSchoolClassesWithSections
} from "@/app/actions/live-stream-core";

const ALL_CLASSES = [
  "Nursery", "LKG", "UKG", 
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", 
  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
  "Science Lab", "Computer Lab", "Activity Hall"
];

export default function AdminLiveStreamPage() {
  const { activeCampusId } = useCampusContext();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"videowall" | "cameras" | "parents" | "standalone" | "logs" | "security" | "settings">("videowall");
  
  // Video Wall Spotlight State
  const [spotlightCamera, setSpotlightCamera] = useState<any>(null);
  const [gridColumns, setGridColumns] = useState<2 | 3 | 4>(3);

  // Parent Access Control State
  const [parentList, setParentList] = useState<any[]>([]);
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [selectedAccessCameraId, setSelectedAccessCameraId] = useState<string>("all");
  const [selectedParentClass, setSelectedParentClass] = useState("All");
  const [selectedParentSection, setSelectedParentSection] = useState("All");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [parentSearch, setParentSearch] = useState("");
  const [isUpdatingParent, setIsUpdatingParent] = useState<string | null>(null);

  // Camera Mapping Modal State
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<any>(null);
  const [camForm, setCamForm] = useState({
    classroom_name: "Grade 5",
    room_number: "Room 301",
    camera_name: "Grade 5 Junior High Cam",
    stream_url: "http://localhost:8888/grade5_cam/",
    status: "Online"
  });

  const [settingsForm, setSettingsForm] = useState({
    streaming_start_time: "08:00",
    streaming_end_time: "15:30",
    watermark_enabled: true,
    capture_detection_enabled: true,
    require_student_present: true,
    block_ews_default: true,
    gateway_url: "https://lightweight-episodes-catalog-investigations.trycloudflare.com"
  });

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadDashboard();
    loadClasses();
    loadParentAccessList();
  }, [activeCampusId]);

  useEffect(() => {
    loadParentAccessList();
  }, [selectedParentClass, selectedParentSection, selectedCategoryFilter, parentSearch]);

  async function loadDashboard() {
    setIsLoading(true);
    try {
      const res = await getLiveStreamAdminDashboard(activeCampusId);
      if (res.success && res.data) {
        setData(res.data);
        if (res.data.cameras && res.data.cameras.length > 0 && !spotlightCamera) {
          setSpotlightCamera(res.data.cameras[0]);
        }
        if (res.data.settings) {
          setSettingsForm({
            streaming_start_time: res.data.settings.streaming_start_time || "08:00",
            streaming_end_time: res.data.settings.streaming_end_time || "15:30",
            watermark_enabled: res.data.settings.watermark_enabled ?? true,
            capture_detection_enabled: res.data.settings.capture_detection_enabled ?? true,
            require_student_present: res.data.settings.require_student_present ?? true,
            block_ews_default: res.data.settings.block_ews_default ?? true,
            gateway_url: res.data.settings.gateway_url || "https://lightweight-episodes-catalog-investigations.trycloudflare.com"
          });
        }
      }
    } catch (e) {
      console.error("Error loading live stream dashboard:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadClasses() {
    try {
      const res = await getSchoolClassesWithSections(activeCampusId);
      if (res.success && res.data) {
        setAvailableClasses(res.data);
      }
    } catch (e) {
      console.error("Error loading classes:", e);
    }
  }

  async function loadParentAccessList() {
    try {
      const res = await getParentAccessControlList(
        activeCampusId,
        selectedParentClass,
        parentSearch,
        selectedCategoryFilter,
        selectedParentSection
      );
      if (res.success && res.data) {
        setParentList(res.data);
      }
    } catch (e) {
      console.error("Error loading parent list:", e);
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

  async function handleToggleParentAccess(student: any) {
    const currentAccess = student.live_stream_access !== false;
    const newAccess = !currentAccess;
    let reason = "";

    if (!newAccess) {
      reason = prompt("Optional: Enter reason for revoking live stream access:", "Revoked by School Administration") || "Revoked by School Administration";
    }

    setIsUpdatingParent(student.id);
    try {
      const res = await toggleParentStreamAccess(student.id, newAccess, reason);
      if (res.success) {
        loadParentAccessList();
      } else {
        alert("Error updating access: " + res.error);
      }
    } finally {
      setIsUpdatingParent(null);
    }
  }

  async function handleBulkClassUpdate(allowed: boolean, excludeEws: boolean) {
    if (!confirm(`Are you sure you want to ${allowed ? "GRANT" : "REVOKE"} camera access for ${selectedParentClass === "All" ? "all students" : selectedParentClass}?`)) {
      return;
    }
    setIsProcessing(true);
    try {
      const res = await bulkUpdateClassStreamAccess(selectedParentClass, activeCampusId, allowed, excludeEws);
      if (res.success) {
        alert(`Camera access permissions updated for ${selectedParentClass}!`);
        loadParentAccessList();
      } else {
        alert("Error: " + res.error);
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
      camera_name: "Grade 5 Junior High Cam",
      stream_url: "http://localhost:8888/grade5_cam/",
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
        require_student_present: settingsForm.require_student_present,
        block_ews_default: settingsForm.block_ews_default,
        gateway_url: settingsForm.gateway_url
      });

      if (res.success) {
        alert("Live stream policies & Gateway URL updated successfully!");
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
      
      {/* Top Command Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <Radio className="w-3 h-3 text-purple-600 animate-pulse" /> CCTV Security Command
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">Classroom Mapping & Access Manager</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
            <Camera className="w-8 h-8 text-purple-600" />
            Classroom Live View Command Center
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Watch live multi-camera feeds, map DVR channels to classrooms, grant or restrict parent access, and enforce EWS privacy policies.
          </p>
        </div>

        {/* Master Emergency Kill Switch */}
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

      {/* Global Emergency Alert Banner */}
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
                All external parent classroom streams are currently severed. Admins can still view internal feeds below.
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

      {/* Operational Metrics Strip */}
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
            <span>EWS Category Policy</span>
            <Lock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-lg font-black text-amber-900">
            {settingsForm.block_ews_default ? "BLOCKED BY DEFAULT" : "ALLOWED"}
          </div>
          <span className="text-[11px] text-stone-500 font-bold">
            EWS Quota Excluded by Standard
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-stone-400">
            <span>Presence Enforcement</span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg font-black text-stone-900">
            {settingsForm.require_student_present ? "PRESENT ONLY" : "ALWAYS ON"}
          </div>
          <span className="text-[11px] text-purple-600 font-bold">
            Absent = Stream Blocked
          </span>
        </div>
      </div>

      {/* Tabs Header Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
        
        {/* Tab 1: Live Video Wall (Admin Backend Live View) */}
        <button
          type="button"
          onClick={() => setActiveTab("videowall")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap ${
            activeTab === "videowall"
              ? "bg-purple-900 text-white shadow-xs"
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <LayoutGrid className="w-4 h-4 text-purple-300" />
          <span>📺 Live Admin Video Wall</span>
        </button>

        {/* Tab 2: Camera-to-Classroom Mapping */}
        <button
          type="button"
          onClick={() => setActiveTab("cameras")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap ${
            activeTab === "cameras"
              ? "bg-white text-stone-900 shadow-xs border border-stone-200"
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <Camera className="w-4 h-4 text-purple-600" />
          <span>Classroom Camera Mapping ({data?.cameras?.length || 0})</span>
        </button>

        {/* Tab 3: Parent Access & EWS Control */}
        <button
          type="button"
          onClick={() => setActiveTab("parents")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap ${
            activeTab === "parents"
              ? "bg-white text-stone-900 shadow-xs border border-stone-200 ring-2 ring-amber-500/20"
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <UserCheck className="w-4 h-4 text-amber-600" />
          <span>Parent Access & EWS Permissions 🔐</span>
        </button>

        {/* Tab 4: Access Logs */}
        <button
          type="button"
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap ${
            activeTab === "logs"
              ? "bg-white text-stone-900 shadow-xs border border-stone-200"
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <Eye className="w-4 h-4 text-emerald-600" />
          <span>Access Audit Logs ({data?.accessLogs?.length || 0})</span>
        </button>

        {/* Tab 5: Security Alerts */}
        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap ${
            activeTab === "security"
              ? "bg-white text-stone-900 shadow-xs border border-stone-200"
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-red-600" />
          <span>Screen Capture Alerts ({data?.securityEvents?.length || 0})</span>
        </button>

        {/* Tab 6: 24/7 Cloud Standalone Setup */}
        <button
          type="button"
          onClick={() => setActiveTab("standalone")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap ${
            activeTab === "standalone"
              ? "bg-purple-900 text-white shadow-xs"
              : "text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200"
          }`}
        >
          <Server className="w-4 h-4 text-purple-400" />
          <span>🚀 24/7 Cloud Setup (No Laptop Needed)</span>
        </button>

        {/* Tab 7: Global Settings */}
        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap ${
            activeTab === "settings"
              ? "bg-white text-stone-900 shadow-xs border border-stone-200"
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <Settings className="w-4 h-4 text-stone-700" />
          <span>Policies & EWS Rules</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ADMIN BACKEND LIVE VIDEO WALL & SPOTLIGHT MATRIX */}
      {/* ========================================================================= */}
      {activeTab === "videowall" && (
        <div className="space-y-6">
          
          {/* Top Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-500">Video Matrix Layout:</span>
              <div className="flex bg-stone-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setGridColumns(2)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${gridColumns === 2 ? "bg-white text-purple-950 shadow-xs" : "text-stone-600"}`}
                >
                  2 Columns
                </button>
                <button
                  type="button"
                  onClick={() => setGridColumns(3)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${gridColumns === 3 ? "bg-white text-purple-950 shadow-xs" : "text-stone-600"}`}
                >
                  3 Columns (Standard)
                </button>
                <button
                  type="button"
                  onClick={() => setGridColumns(4)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${gridColumns === 4 ? "bg-white text-purple-950 shadow-xs" : "text-stone-600"}`}
                >
                  4 Columns (Dense)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Direct RTSP DVR Ingestion Active ({data?.stats?.onlineCameras || 0} Feeds Live)</span>
            </div>
          </div>

          {/* SPOTLIGHT EXPANDED CAMERA VIEW (IF SELECTED) */}
          {spotlightCamera && (
            <div className="bg-stone-950 text-white rounded-3xl p-6 shadow-2xl border border-stone-800 space-y-4">
              <div className="flex justify-between items-center border-b border-stone-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      Spotlight Inspection: {spotlightCamera.camera_name} — {spotlightCamera.classroom_name} ({spotlightCamera.room_number})
                    </h3>
                    <span className="text-xs font-mono text-purple-300">{spotlightCamera.stream_url}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleCameraKill(spotlightCamera)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                      spotlightCamera.kill_switch_active
                        ? "bg-emerald-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {spotlightCamera.kill_switch_active ? "Resume Feed" : "Pause Stream"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpotlightCamera(null)}
                    className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white rounded-xl font-bold"
                  >
                    ✕ Close Spotlight
                  </button>
                </div>
              </div>

              {/* Large Spotlight Video Player */}
              <CctvStreamPlayer
                streamUrl={spotlightCamera.stream_url}
                cameraName={spotlightCamera.camera_name}
                roomNumber={spotlightCamera.room_number}
                classroomName={spotlightCamera.classroom_name}
                isPaused={spotlightCamera.kill_switch_active}
                onTogglePause={() => handleToggleCameraKill(spotlightCamera)}
                isSpotlight={true}
              />
            </div>
          )}

          {/* MULTI-CAMERA CCTV VIDEO WALL MATRIX */}
          <div className={`grid gap-4 ${
            gridColumns === 2 ? "grid-cols-1 md:grid-cols-2" :
            gridColumns === 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" :
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          }`}>
            {(data?.cameras || []).map((cam: any) => (
              <CctvStreamPlayer
                key={cam.id}
                streamUrl={cam.stream_url}
                cameraName={cam.camera_name}
                roomNumber={cam.room_number}
                classroomName={cam.classroom_name}
                isPaused={cam.kill_switch_active}
                onTogglePause={() => handleToggleCameraKill(cam)}
                onSpotlight={() => setSpotlightCamera(cam)}
              />
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CAMERA TO CLASSROOM MAPPING */}
      {/* ========================================================================= */}
      {activeTab === "cameras" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <div>
              <h3 className="text-sm font-black text-stone-900">
                Classroom & Section Camera Mapping
              </h3>
              <p className="text-xs text-stone-500">
                Map each physical DVR channel to a specific grade, section, or specialized laboratory.
              </p>
            </div>
            <button
              type="button"
              onClick={openAddCamera}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Map New Camera
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
                      Mapped to: {cam.classroom_name}
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

                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-xs space-y-1.5">
                  <div className="flex justify-between text-stone-500 font-medium">
                    <span>Room Number:</span>
                    <strong className="text-stone-900">{cam.room_number}</strong>
                  </div>
                  <div className="flex justify-between text-stone-500 font-medium">
                    <span>HLS Endpoint:</span>
                    <span className="font-mono text-[10px] text-purple-700 truncate max-w-[160px]">{cam.stream_url}</span>
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
                      title="Edit Mapping"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCamera(cam.id)}
                      className="p-1.5 hover:bg-red-100 text-red-600 rounded-lg"
                      title="Delete Camera"
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
      {/* TAB 3: PARENT ACCESS CONTROL (3-STEP: CAMERA -> CLASS -> STUDENTS) */}
      {/* ========================================================================= */}
      {activeTab === "parents" && (
        <div className="space-y-6">
          
          {/* TOP STEPPER BREADCRUMB */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md">
                Parent Authorization Wizard
              </span>
              <h3 className="text-base sm:text-lg font-black text-stone-900 mt-1">
                Parent Live Stream Access Manager
              </h3>
              <p className="text-xs text-stone-500">
                Follow the 3-step hierarchy: <strong>1. Select Camera</strong> $\rightarrow$ <strong>2. Select Class</strong> $\rightarrow$ <strong>3. Select Authorized Student Parents</strong>.
              </p>
            </div>

            {/* 3-STEP HIERARCHY SELECTOR */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
              
              {/* STEP 1: SELECT CAMERA */}
              <div className="bg-purple-50/60 border-2 border-purple-200 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-purple-950 font-black text-xs uppercase tracking-wider">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[11px] font-bold">1</span>
                    Step 1: Select Camera
                  </span>
                  <span className="text-[10px] font-mono text-purple-700 bg-purple-100 px-2 py-0.5 rounded font-bold">
                    {(data?.cameras || []).length} Cameras
                  </span>
                </div>

                <select
                  value={selectedAccessCameraId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedAccessCameraId(val);
                    if (val === "all") {
                      setSelectedParentClass("All");
                    } else {
                      const matched = data?.cameras?.find((c: any) => c.id === val);
                      if (matched) setSelectedParentClass(matched.classroom_name);
                    }
                  }}
                  className="w-full bg-white border border-purple-300 rounded-xl p-2.5 font-bold text-xs text-purple-950 shadow-2xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
                >
                  <option value="all">🌐 All Cameras (All Campus Wings)</option>
                  {(data?.cameras || []).map((cam: any) => (
                    <option key={cam.id} value={cam.id}>
                      📹 {cam.camera_name} — {cam.classroom_name} ({cam.room_number})
                    </option>
                  ))}
                </select>

                <p className="text-[10px] text-purple-900/70">
                  Selecting a camera automatically links to its mapped classroom.
                </p>
              </div>

              {/* STEP 2: SELECT CLASS */}
              <div className="bg-blue-50/60 border-2 border-blue-200 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-blue-950 font-black text-xs uppercase tracking-wider">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">2</span>
                    Step 2: Select Class / Section
                  </span>
                  <span className="text-[10px] font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-bold">
                    Active: {selectedParentClass}
                  </span>
                </div>

                <select
                  value={selectedParentClass}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedParentClass(val);
                    const matchedCam = data?.cameras?.find((c: any) => c.classroom_name.toLowerCase().includes(val.toLowerCase()));
                    if (matchedCam) setSelectedAccessCameraId(matchedCam.id);
                  }}
                  className="w-full bg-white border border-blue-300 rounded-xl p-2.5 font-bold text-xs text-blue-950 shadow-2xs focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="All">All Classes & Sections</option>
                  {(availableClasses.length > 0 ? availableClasses : [
                    { id: "1", grade: "Nursery", section: "Earth" },
                    { id: "2", grade: "Nursery", section: "Mars" },
                    { id: "3", grade: "UKG", section: "Jupiter" },
                    { id: "4", grade: "UKG", section: "Neptune" },
                    { id: "5", grade: "UKG", section: "Uranus" },
                    { id: "6", grade: "Grade 1", section: "A" },
                    { id: "7", grade: "Grade 1", section: "B" },
                    { id: "8", grade: "Grade 2", section: "A" },
                    { id: "9", grade: "Grade 3", section: "A" },
                    { id: "10", grade: "Grade 4", section: "A" },
                    { id: "11", grade: "Grade 5", section: "A" }
                  ]).map((c: any) => (
                    <option key={c.id} value={c.grade}>
                      🏫 {c.grade} (Section {c.section}) {c.room_number ? `• ${c.room_number}` : ""}
                    </option>
                  ))}
                </select>

                <p className="text-[10px] text-blue-900/70">
                  Select official class to view registered students and parents.
                </p>
              </div>

              {/* STEP 3: QUICK BATCH ACTIONS */}
              <div className="bg-emerald-50/60 border-2 border-emerald-200 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-emerald-950 font-black text-xs uppercase tracking-wider">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">3</span>
                    Step 3: Class Batch Actions
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                    {parentList.length} Students
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleBulkClassUpdate(true, true)}
                    className="px-2.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] transition shadow-xs flex items-center justify-center gap-1"
                    title="Allow live stream for all non-EWS students in this class"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Allow Non-EWS
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleBulkClassUpdate(false, false)}
                    className="px-2.5 py-2 bg-red-100 hover:bg-red-200 text-red-900 font-bold rounded-xl text-[11px] transition shadow-xs flex items-center justify-center gap-1"
                    title="Block live stream for all students in this class"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Revoke All
                  </button>
                </div>

                <p className="text-[10px] text-emerald-900/70">
                  Instantly authorize or revoke stream access for the whole class.
                </p>
              </div>

            </div>
          </div>

          {/* EWS Policy Alert Banner */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-3xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-xs font-black uppercase tracking-wider text-amber-900 block">
                  EWS / DG / RTE Policy: Excluded by Default
                </strong>
                <p className="text-xs text-amber-950/80 mt-0.5">
                  EWS category parents are automatically excluded from live stream viewing. You can click <strong>"Grant Stream Access"</strong> on any individual student below to provide an override.
                </p>
              </div>
            </div>

            <span className="text-xs font-black bg-amber-200/80 text-amber-900 px-3 py-1 rounded-xl shrink-0">
              EWS Protected
            </span>
          </div>

          {/* Search & Filter Strip */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search student / admission no..."
                  value={parentSearch}
                  onChange={(e) => setParentSearch(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold text-stone-900"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1">
                <span className="text-[11px] text-stone-400 font-bold">Filter By:</span>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="bg-transparent text-xs font-black text-stone-900 focus:outline-none"
                >
                  <option value="All">All Students in Roster</option>
                  <option value="General">General Category Only</option>
                  <option value="EWS">EWS / DG / RTE Quota Only</option>
                  <option value="Allowed">🟢 Camera Access Allowed</option>
                  <option value="Blocked">🔴 Camera Access Blocked</option>
                </select>
              </div>
            </div>

            <span className="text-xs font-mono font-bold bg-stone-100 text-stone-600 px-3 py-1 rounded-xl">
              Showing {parentList.length} Students for {selectedParentClass}
            </span>
          </div>

          {/* Parent Access Roster Table */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Student & Adm No.</th>
                    <th className="p-3.5">Class / Grade</th>
                    <th className="p-3.5">Admission Quota</th>
                    <th className="p-3.5">Attendance Today</th>
                    <th className="p-3.5">Live Stream Status</th>
                    <th className="p-3.5 text-right">Access Permission Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {parentList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-stone-400">
                        No students found for this class / camera filter.
                      </td>
                    </tr>
                  ) : (
                    parentList.map((stu) => {
                      const isEws = stu.is_ews || stu.admission_category === "EWS" || stu.admission_category === "DG" || stu.admission_category === "RTE";
                      const isAllowed = stu.live_stream_access !== false;

                      return (
                        <tr key={stu.id} className="hover:bg-stone-50/60 transition">
                          <td className="p-3.5">
                            <strong className="text-stone-900 text-sm block">
                              {stu.first_name} {stu.last_name || ""}
                            </strong>
                            <span className="text-[10px] font-mono text-stone-400">Adm No: {stu.admission_no || "CB-2026-X"}</span>
                          </td>

                          <td className="p-3.5 font-bold text-stone-800">
                            {stu.grade} {stu.section ? `(${stu.section})` : ""}
                          </td>

                          <td className="p-3.5">
                            {isEws ? (
                              <span className="bg-amber-100 text-amber-900 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-amber-300">
                                🔒 EWS / DG Quota
                              </span>
                            ) : (
                              <span className="bg-stone-100 text-stone-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                                General Quota
                              </span>
                            )}
                          </td>

                          <td className="p-3.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              stu.attendance_status === "Present" 
                                ? "bg-emerald-100 text-emerald-900" 
                                : "bg-red-100 text-red-900"
                            }`}>
                              {stu.attendance_status || "Present Today"}
                            </span>
                          </td>

                          <td className="p-3.5">
                            {isAllowed ? (
                              <span className="bg-emerald-100 text-emerald-900 font-black text-[11px] px-2.5 py-1 rounded-xl flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Access Allowed
                              </span>
                            ) : (
                              <div>
                                <span className="bg-red-100 text-red-900 font-black text-[11px] px-2.5 py-1 rounded-xl flex items-center gap-1 w-fit">
                                  <XCircle className="w-3.5 h-3.5 text-red-600" /> Access Blocked
                                </span>
                                {stu.live_stream_revocation_reason && (
                                  <span className="text-[10px] text-red-600 block mt-0.5 max-w-xs truncate">
                                    {stu.live_stream_revocation_reason}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              disabled={isUpdatingParent === stu.id}
                              onClick={() => handleToggleParentAccess(stu)}
                              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition shadow-xs ${
                                isAllowed
                                  ? "bg-red-100 hover:bg-red-200 text-red-900"
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
                              }`}
                            >
                              {isUpdatingParent === stu.id 
                                ? "Updating..." 
                                : isAllowed ? "Revoke Access" : "Grant Stream Access"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ACCESS AUDIT LOGS */}
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
      {/* TAB 5: SECURITY & SCREEN CAPTURE ALERTS */}
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
      {/* TAB: 24/7 STANDALONE CLOUD DVR SETUP (NO LAPTOP NEEDED) */}
      {/* ========================================================================= */}
      {activeTab === "standalone" && (
        <div className="space-y-6 max-w-5xl">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-stone-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                24/7 Standalone Cloud Architecture
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              How to Stream Cameras 24/7 Without Keeping Your Mac Running
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed max-w-3xl">
              Currently, your Hikvision DVR is at a private local IP (<code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-300 font-mono">192.168.1.90:10554</code>) inside the school Wi-Fi. Because private IPs cannot be reached directly over mobile 4G/5G networks, a bridge is needed. Below are the <strong>3 permanent ways</strong> to make the cameras work 24/7 without needing your laptop!
            </p>
          </div>

          {/* Architecture Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Option 1: Direct DVR Cloud RTMP Push */}
            <div className="bg-white p-6 rounded-3xl border-2 border-purple-500/80 shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-purple-100 text-purple-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
                    Method 1 • Zero Extra Hardware
                  </span>
                  <span className="text-emerald-600 text-xs font-black">★ Recommended</span>
                </div>
                <h3 className="text-base font-black text-stone-900">
                  Direct DVR $\rightarrow$ Cloud RTMP Push
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Your Hikvision DVR has built-in <strong>RTMP Push</strong>. It sends the camera feeds directly to a cloud streaming server over the internet.
                </p>
                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-[11px] space-y-1.5 font-mono text-stone-700">
                  <div className="font-bold text-purple-950 font-sans text-xs">Setup in DVR Menu:</div>
                  <div>1. Open DVR Web GUI</div>
                  <div>2. Config $\rightarrow$ Network $\rightarrow$ RTMP</div>
                  <div>3. Enable RTMP &amp; Paste Cloud URL</div>
                  <div>4. Click Save</div>
                </div>
              </div>
              <div className="pt-2 border-t border-stone-100 text-[11px] font-bold text-purple-700">
                ✅ Requires: Zero laptops or PCs. DVR handles everything directly.
              </div>
            </div>

            {/* Option 2: Tiny $35 Raspberry Pi in Server Room */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-indigo-100 text-indigo-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
                    Method 2 • Hardware Gateway
                  </span>
                  <span className="text-indigo-600 text-xs font-bold">Plug &amp; Play</span>
                </div>
                <h3 className="text-base font-black text-stone-900">
                  $35 Raspberry Pi / Mini Box on Router
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Place a dedicated $35 Raspberry Pi (or low-cost mini PC) in the school server room plugged into the router via Ethernet.
                </p>
                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-[11px] space-y-1.5 font-mono text-stone-700">
                  <div className="font-bold text-indigo-950 font-sans text-xs">How it Works:</div>
                  <div>• Runs 24/7 on school UPS</div>
                  <div>• Auto-starts on power restore</div>
                  <div>• Streams all 16 DVR channels</div>
                  <div>• Your laptop is 100% free</div>
                </div>
              </div>
              <div className="pt-2 border-t border-stone-100 text-[11px] font-bold text-indigo-700">
                ✅ Requires: One-time ~$35 mini box in school server rack.
              </div>
            </div>

            {/* Option 3: Router DDNS & Port Forwarding */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
                    Method 3 • Router DDNS
                  </span>
                  <span className="text-stone-500 text-xs font-bold">Direct IP</span>
                </div>
                <h3 className="text-base font-black text-stone-900">
                  School Router Port Forwarding
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Forward port <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">10554</code> in your school's Airtel/Jio Fiber router and create a free DDNS hostname.
                </p>
                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-[11px] space-y-1.5 font-mono text-stone-700">
                  <div className="font-bold text-emerald-950 font-sans text-xs">Router Configuration:</div>
                  <div>• Forward WAN 10554 $\rightarrow$ 192.168.1.90</div>
                  <div>• Set DDNS: crayonschool.ddns.net</div>
                  <div>• Cloud ERP fetches RTSP directly</div>
                </div>
              </div>
              <div className="pt-2 border-t border-stone-100 text-[11px] font-bold text-emerald-700">
                ✅ Requires: School broadband router login credentials.
              </div>
            </div>

          </div>

          {/* Detailed Step-by-Step Guide */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
            <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              Step-by-Step Instructions to Activate 24/7 Cloud Streaming
            </h3>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2">
                <h4 className="font-black text-purple-950 text-sm">
                  Option A: Quick Cloud VPS Relay (Recommended for 100% Autonomous Uptime)
                </h4>
                <p className="text-purple-900/90 leading-relaxed">
                  Deploy MediaMTX on a lightweight cloud server (e.g. AWS EC2, DigitalOcean $4/mo droplet, or Cloudflare Stream). The cloud server will continuously fetch the DVR RTSP feeds or receive the RTMP push from the DVR and serve HLS streams to <code className="bg-purple-200/60 px-1 py-0.5 rounded font-mono">crayonboxschool.com</code> with SSL encryption.
                </p>
                <div className="bg-stone-950 text-emerald-400 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
                  # 1-Line Cloud Server Setup Command:<br />
                  docker run -d --name mediamtx -p 8554:8554 -p 8888:8888 bluenviron/mediamtx
                </div>
              </div>

              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                <h4 className="font-black text-stone-900 text-sm">
                  Option B: Local Testing on This Mac (Active Right Now)
                </h4>
                <p className="text-stone-600 leading-relaxed">
                  While paired on the school Wi-Fi, the system automatically uses the native endpoint <code className="bg-stone-200 px-1 py-0.5 rounded font-mono">/api/cameras/[channel]/live</code> to convert the DVR RTSP stream into high-speed MJPEG video directly in your browser.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: STREAMING SETTINGS & POLICY CONFIG */}
      {/* ========================================================================= */}
      {activeTab === "settings" && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6 max-w-3xl">
          <div>
            <h3 className="text-lg font-black text-stone-900">
              Classroom Live Streaming Policies & EWS Rules
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

            {/* Cloud Streaming Gateway / Tunnel URL */}
            <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-1.5">
              <label className="font-bold text-purple-950 block text-xs">
                🌐 Live Streaming Cloud Gateway / Tunnel URL (For crayonboxschool.com Remote Access)
              </label>
              <input
                type="url"
                value={settingsForm.gateway_url}
                onChange={(e) => setSettingsForm({ ...settingsForm, gateway_url: e.target.value })}
                placeholder="https://your-tunnel.trycloudflare.com or https://stream.crayonboxschool.com"
                className="w-full bg-white border border-purple-300 rounded-xl p-2.5 font-mono font-bold text-purple-950 text-xs shadow-2xs"
              />
              <p className="text-[11px] text-purple-900/80">
                Pipes live camera feeds from your local school DVR (192.168.1.90:10554) to <strong>crayonboxschool.com</strong> so parents and admins can view feeds from outside the school Wi-Fi.
              </p>
            </div>

            {/* EWS Policy Toggle */}
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <strong className="block text-amber-950 font-bold text-xs">
                  EWS / DG / RTE Category Default Policy: Excluded by Default
                </strong>
                <p className="text-[11px] text-amber-900/80 mt-0.5">
                  When enabled, EWS category parents are automatically blocked from live streams unless individually granted an override.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settingsForm.block_ews_default}
                onChange={(e) => setSettingsForm({ ...settingsForm, block_ews_default: e.target.checked })}
                className="w-5 h-5 accent-amber-600 rounded"
              />
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
      {/* MODAL: MAP / EDIT CAMERA */}
      {/* ========================================================================= */}
      {cameraModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-lg font-black text-stone-900">
                {editingCamera ? "Edit Camera Mapping" : "Map Classroom Camera"}
              </h3>
              <button onClick={() => setCameraModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveCamera} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Classroom / Wing *</label>
                  <select
                    value={camForm.classroom_name}
                    onChange={(e) => setCamForm({ ...camForm, classroom_name: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900"
                  >
                    {ALL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
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
                <label className="font-bold text-stone-700 block mb-1">Stream Endpoint / HLS Web URL *</label>
                <input
                  type="url"
                  value={camForm.stream_url}
                  onChange={(e) => setCamForm({ ...camForm, stream_url: e.target.value })}
                  placeholder="http://localhost:8888/grade5_cam/ or https://..."
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
                  {isProcessing ? "Saving..." : "Save Mapping"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
