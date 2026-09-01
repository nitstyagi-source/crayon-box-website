"use client";

import { useState, useEffect } from "react";
import { 
  Video, Radio, ShieldAlert, ShieldCheck, Power, 
  AlertTriangle, Play, Pause, RefreshCw, Plus, Edit3, 
  Trash2, Eye, Lock, Clock, Settings, UserCheck, 
  Server, AlertCircle, Camera, CheckCircle2, XCircle,
  LayoutGrid, Maximize2, Search, Filter, Sparkles, UserX,
  Layers, ChevronRight, UserMinus, Signal, Zap
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
  
  // Video Wall Spotlight & School Filter State
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState("ALL");
  const [spotlightCamera, setSpotlightCamera] = useState<any>(null);
  const [gridColumns, setGridColumns] = useState<2 | 3 | 4>(3);
  // Active Streaming Method State (Router Port Forwarding vs Cloud VPS vs Local)
  const [activeStreamingMethod, setActiveStreamingMethod] = useState<"ROUTER" | "VPS" | "LOCAL">("ROUTER");

  useEffect(() => {
    const savedMethod = localStorage.getItem("cctv_streaming_method") as "ROUTER" | "VPS" | "LOCAL";
    if (savedMethod) setActiveStreamingMethod(savedMethod);
  }, []);

  const handleSelectStreamingMethod = (method: "ROUTER" | "VPS" | "LOCAL") => {
    setActiveStreamingMethod(method);
    localStorage.setItem("cctv_streaming_method", method);
    if (method === "ROUTER") {
      setSettingsForm((prev) => ({
        ...prev,
        dvr_ip: "110.225.249.200",
        dvr_port: "10554",
        gateway_url: "http://110.225.249.200:10554"
      }));
      localStorage.setItem("cctv_gateway_host", "110.225.249.200");
    } else if (method === "VPS") {
      setSettingsForm((prev) => ({
        ...prev,
        dvr_ip: "110.225.249.200",
        dvr_port: "8888",
        gateway_url: "http://110.225.249.200:8888"
      }));
      localStorage.setItem("cctv_gateway_host", "110.225.249.200:1984");
    } else {
      setSettingsForm((prev) => ({
        ...prev,
        dvr_ip: "192.168.1.90",
        dvr_port: "80",
        gateway_url: "http://192.168.1.50:1984"
      }));
      localStorage.setItem("cctv_gateway_host", "192.168.1.50");
    }
  };

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
    gateway_url: "https://think-planned-leads-family.trycloudflare.com",
    dvr_ip: "192.168.1.90",
    dvr_port: "10554",
    dvr_username: "admin",
    dvr_password: "master123"
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

  const [testState, setTestState] = useState<{ loading: boolean; result: any | null }>({ loading: false, result: null });

  async function handleTestNvrConnection() {
    setTestState({ loading: true, result: null });
    try {
      const res = await fetch("/api/cctv/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: settingsForm.dvr_ip,
          port: settingsForm.dvr_port,
          username: settingsForm.dvr_username,
          password: settingsForm.dvr_password
        })
      });
      const data = await res.json();
      setTestState({ loading: false, result: data });
    } catch (e: any) {
      setTestState({ loading: false, result: { success: false, error: e.message } });
    }
  }

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
            gateway_url: res.data.settings.gateway_url || "https://think-planned-leads-family.trycloudflare.com",
            dvr_ip: res.data.settings.dvr_ip || "192.168.1.90",
            dvr_port: res.data.settings.dvr_port || "10554",
            dvr_username: res.data.settings.dvr_username || "admin",
            dvr_password: res.data.settings.dvr_password || "master123"
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
        gateway_url: settingsForm.gateway_url,
        dvr_ip: settingsForm.dvr_ip,
        dvr_port: settingsForm.dvr_port,
        dvr_username: settingsForm.dvr_username,
        dvr_password: settingsForm.dvr_password
      });

      if (res.success) {
        alert(res.message || "Live stream policies & Gateway URL updated successfully!");
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
          
          {/* School Differentiated Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { code: "ALL", label: "📺 All 16 DVR Channels (16 Cams)" },
              { code: "CBS", label: "🎒 Crayon Box School (15 Cams)" },
              { code: "CBPS", label: "🎨 Crayon Box Pre School (Camera #11)" },
              { code: "AS", label: "🌱 Avinya School" },
              { code: "AVM", label: "🎓 Avinya Vidya Mandir" },
            ].map((s) => {
              const isCurrent = (selectedSchoolFilter || "ALL") === s.code;
              return (
                <button
                  key={s.code}
                  type="button"
                  onClick={() => setSelectedSchoolFilter(s.code)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    isCurrent
                      ? "bg-purple-600 text-white shadow-md font-black"
                      : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

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
              <span>Direct RTSP Surveillance Engine Active ({data?.stats?.onlineCameras || 0} Feeds Live)</span>
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
            {(data?.cameras || [])
              .filter((cam: any) => selectedSchoolFilter === "ALL" || cam.institution_code === selectedSchoolFilter)
              .map((cam: any) => (
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

          {/* Architecture Selector Cards (Click to Select & Activate) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Method 1: Router Port Forwarding / Static IP (Verified & Active) */}
            <div
              onClick={() => handleSelectStreamingMethod("ROUTER")}
              className={`p-6 rounded-3xl border-2 transition cursor-pointer flex flex-col justify-between space-y-4 ${
                activeStreamingMethod === "ROUTER"
                  ? "bg-emerald-50/50 border-emerald-500 shadow-lg ring-4 ring-emerald-500/20"
                  : "bg-white border-stone-200 hover:border-emerald-300 shadow-xs"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${
                    activeStreamingMethod === "ROUTER" ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-900"
                  }`}>
                    Method 1 • Router Port Forwarding
                  </span>
                  {activeStreamingMethod === "ROUTER" ? (
                    <span className="text-emerald-600 text-xs font-black flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
                    </span>
                  ) : (
                    <span className="text-stone-400 text-xs font-bold hover:text-emerald-600">Click to Select</span>
                  )}
                </div>
                <h3 className="text-base font-black text-stone-900">
                  Router Port Forwarding (110.225.249.200)
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Streams directly from your school router at <code className="bg-stone-100 px-1 py-0.5 rounded font-mono font-bold text-emerald-800">110.225.249.200:10554</code>. Zero extra PCs or cloud servers required.
                </p>
                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-[11px] space-y-1.5 font-mono text-stone-700">
                  <div className="font-bold text-emerald-950 font-sans text-xs">Live Router Configuration:</div>
                  <div>• Public IP: 110.225.249.200</div>
                  <div>• RTSP Port: 10554 (Open &amp; Verified)</div>
                  <div>• NVR Target: 192.168.1.90</div>
                </div>
              </div>
              <div className="pt-2 border-t border-stone-100 text-[11px] font-bold text-emerald-700 flex items-center justify-between">
                <span>✅ Zero Hardware Needed</span>
                <span className="text-xs underline">Selected Engine</span>
              </div>
            </div>

            {/* Method 2: Cloud VPS Relay (AWS / DigitalOcean / go2rtc) */}
            <div
              onClick={() => handleSelectStreamingMethod("VPS")}
              className={`p-6 rounded-3xl border-2 transition cursor-pointer flex flex-col justify-between space-y-4 ${
                activeStreamingMethod === "VPS"
                  ? "bg-purple-50/50 border-purple-500 shadow-lg ring-4 ring-purple-500/20"
                  : "bg-white border-stone-200 hover:border-purple-300 shadow-xs"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${
                    activeStreamingMethod === "VPS" ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-900"
                  }`}>
                    Method 2 • Cloud VPS Relay
                  </span>
                  {activeStreamingMethod === "VPS" ? (
                    <span className="text-purple-600 text-xs font-black flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
                    </span>
                  ) : (
                    <span className="text-stone-400 text-xs font-bold hover:text-purple-600">Click to Select</span>
                  )}
                </div>
                <h3 className="text-base font-black text-stone-900">
                  go2rtc / MediaMTX Cloud VPS Relay
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  A $4/mo cloud server (AWS, DigitalOcean, or GCP) fetches the NVR RTSP stream and broadcasts WebRTC &amp; HLS to 500+ parents simultaneously.
                </p>
                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-[11px] space-y-1.5 font-mono text-stone-700">
                  <div className="font-bold text-purple-950 font-sans text-xs">Cloud Server Configuration:</div>
                  <div>• WebRTC WHEP: Port 8889 / 1984</div>
                  <div>• HLS Streaming: Port 8888</div>
                  <div>• Automatic parent fanout</div>
                </div>
              </div>
              <div className="pt-2 border-t border-stone-100 text-[11px] font-bold text-purple-700 flex items-center justify-between">
                <span>☁️ Multi-Parent High Concurrency</span>
                <span className="text-xs underline">Switch Engine</span>
              </div>
            </div>

            {/* Method 3: Local Network / Hardware Gateway (192.168.1.50) */}
            <div
              onClick={() => handleSelectStreamingMethod("LOCAL")}
              className={`p-6 rounded-3xl border-2 transition cursor-pointer flex flex-col justify-between space-y-4 ${
                activeStreamingMethod === "LOCAL"
                  ? "bg-indigo-50/50 border-indigo-500 shadow-lg ring-4 ring-indigo-500/20"
                  : "bg-white border-stone-200 hover:border-indigo-300 shadow-xs"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${
                    activeStreamingMethod === "LOCAL" ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-900"
                  }`}>
                    Method 3 • Local Hardware Gateway
                  </span>
                  {activeStreamingMethod === "LOCAL" ? (
                    <span className="text-indigo-600 text-xs font-black flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
                    </span>
                  ) : (
                    <span className="text-stone-400 text-xs font-bold hover:text-indigo-600">Click to Select</span>
                  )}
                </div>
                <h3 className="text-base font-black text-stone-900">
                  Local Mini PC / School Gateway (192.168.1.x)
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  A small PC or Raspberry Pi running in the school reception on local IP <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">192.168.1.50</code>.
                </p>
                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-[11px] space-y-1.5 font-mono text-stone-700">
                  <div className="font-bold text-indigo-950 font-sans text-xs">Local Configuration:</div>
                  <div>• Host: 192.168.1.50 / localhost</div>
                  <div>• Runs go2rtc or start_both_windows.bat</div>
                  <div>• Zero cloud hosting cost</div>
                </div>
              </div>
              <div className="pt-2 border-t border-stone-100 text-[11px] font-bold text-indigo-700 flex items-center justify-between">
                <span>💻 School PC Gateway</span>
                <span className="text-xs underline">Switch Engine</span>
              </div>
            </div>

          </div>

          {/* NVR Router Configuration Panel for Method 1 */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                  <Server className="w-5 h-5 text-emerald-600" />
                  Router Port Forwarding Live Linkage (Method 1 Active)
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Your router's public static IP and forwarded ports for direct 24/7 streaming without PCs.
                </p>
              </div>
              <span className="text-xs font-black bg-emerald-100 text-emerald-900 px-3 py-1 rounded-xl">
                Port 10554 Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="font-bold text-stone-700 block mb-1">
                  Public Static IP / DDNS Host
                </label>
                <input
                  type="text"
                  value={settingsForm.dvr_ip}
                  onChange={(e) => setSettingsForm({ ...settingsForm, dvr_ip: e.target.value })}
                  placeholder="e.g. 110.225.249.200"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-bold text-stone-900 focus:bg-white focus:outline-none"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">Your school's verified public broadband IP</span>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">HTTP / ISAPI Port</label>
                <input
                  type="text"
                  value={settingsForm.dvr_port}
                  onChange={(e) => setSettingsForm({ ...settingsForm, dvr_port: e.target.value })}
                  placeholder="8080 or 80"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-bold text-stone-900 focus:bg-white focus:outline-none"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">Router port for Web / ISAPI</span>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">NVR RTSP Port</label>
                <input
                  type="text"
                  value="10554"
                  readOnly
                  className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 font-mono font-bold text-emerald-900"
                />
                <span className="text-[10px] text-emerald-600 mt-0.5 block">RTSP Live Video Port</span>
              </div>
            </div>

            {/* Test Connection Result Box */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestNvrConnection}
                disabled={testState.loading}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition active:scale-95 disabled:opacity-50"
              >
                {testState.loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Testing Port Connectivity...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    ⚡ Test Direct NVR Connection
                  </>
                )}
              </button>

              {testState.result && (
                <div className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  testState.result.success ? "bg-emerald-100 text-emerald-900 border border-emerald-300" : "bg-red-100 text-red-900 border border-red-300"
                }`}>
                  {testState.result.success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{testState.result.data?.status || "✓ NVR Stream Port Online & Active"}</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span>{testState.result.error || "Connection Failed"}</span>
                    </>
                  )}
                </div>
              )}
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
            <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              Classroom Live Streaming Policies, DVR Hardware &amp; Gateway Settings
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Control the local Hikvision DVR connection parameters, cloud streaming tunnel, active streaming hours, and EWS access policies.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
            
            {/* Local DVR / Static IP / DDNS Hardware Configuration */}
            <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
                <strong className="text-stone-900 font-bold text-xs flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-600" />
                  NVR Static IP / DDNS & Port Forwarding Settings
                </strong>
                <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded">
                  Hikvision 16-Channel
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-stone-700 block mb-1">
                    Static Public IP / DDNS Host / Local IP
                  </label>
                  <input
                    type="text"
                    value={settingsForm.dvr_ip}
                    onChange={(e) => setSettingsForm({ ...settingsForm, dvr_ip: e.target.value })}
                    placeholder="e.g. 122.161.54.20 or crayonbox.ddns.net or 192.168.1.90"
                    className="w-full bg-white border border-stone-200 rounded-xl p-2 font-mono font-bold text-stone-900"
                    required
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">Enter your school broadband Static IP or DDNS domain.</span>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">HTTP / ISAPI Port</label>
                  <input
                    type="text"
                    value={settingsForm.dvr_port}
                    onChange={(e) => setSettingsForm({ ...settingsForm, dvr_port: e.target.value })}
                    placeholder="80 or 8000"
                    className="w-full bg-white border border-stone-200 rounded-xl p-2 font-mono font-bold text-stone-900"
                    required
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">Router port forwarded to NVR:80</span>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">NVR Username</label>
                  <input
                    type="text"
                    value={settingsForm.dvr_username}
                    onChange={(e) => setSettingsForm({ ...settingsForm, dvr_username: e.target.value })}
                    placeholder="admin"
                    className="w-full bg-white border border-stone-200 rounded-xl p-2 font-mono font-bold text-stone-900"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-stone-700 block mb-1">NVR Password</label>
                  <input
                    type="password"
                    value={settingsForm.dvr_password}
                    onChange={(e) => setSettingsForm({ ...settingsForm, dvr_password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-white border border-stone-200 rounded-xl p-2 font-mono font-bold text-stone-900"
                    required
                  />
                </div>

                <div className="sm:col-span-2 flex items-end">
                  <button
                    type="button"
                    disabled={testState.loading}
                    onClick={handleTestNvrConnection}
                    className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-xs"
                  >
                    {testState.loading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Testing NVR Port Forwarding...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>⚡ Test Direct NVR Connection</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Connection Test Result Badge */}
              {testState.result && (
                <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  testState.result.success
                    ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                    : "bg-red-50 border-red-300 text-red-950"
                }`}>
                  {testState.result.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong className="block font-bold">
                      {testState.result.success ? "✅ NVR Connected Successfully!" : "❌ Connection Failed"}
                    </strong>
                    <span className="text-[11px] block mt-0.5">
                      {testState.result.success
                        ? `Model: ${testState.result.data?.model || "Hikvision NVR"} • SN: ${testState.result.data?.serialNumber || "Online"} (Direct Cloud-to-NVR Active)`
                        : `Error: ${testState.result.error}. Ensure Router Port Forwarding forwards external port ${settingsForm.dvr_port} to NVR 192.168.1.90.`}
                    </span>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-stone-500">
                When using <strong>Option 4 (Static IP / DDNS + Port Forwarding)</strong>, the Cloud ERP connects directly to your school router's public IP / DDNS domain without needing any laptop or gateway PC.
              </p>
            </div>

            {/* Cloud Streaming Gateway / Tunnel URL */}
            <div className="p-5 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-purple-950 block text-xs">
                  🌐 Live Streaming Cloud Gateway / Tunnel URL (HTTPS)
                </label>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Cloudflare Tunnel Active
                </span>
              </div>
              <input
                type="url"
                value={settingsForm.gateway_url}
                onChange={(e) => setSettingsForm({ ...settingsForm, gateway_url: e.target.value })}
                placeholder="https://think-planned-leads-family.trycloudflare.com"
                className="w-full bg-white border border-purple-300 rounded-xl p-2.5 font-mono font-bold text-purple-950 text-xs shadow-2xs"
                required
              />
              <p className="text-[11px] text-purple-900/80">
                Pipes live camera feeds from your local school DVR (<code className="font-mono">{settingsForm.dvr_ip}:{settingsForm.dvr_port}</code>) to <strong>crayonboxschool.com</strong> so parents and admins can view feeds securely from anywhere.
              </p>
            </div>

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

            <div className="pt-3 flex items-center justify-between">
              <button
                type="submit"
                disabled={isProcessing}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2"
              >
                {isProcessing ? "Saving..." : "⚡ Save Settings & Sync All 16 Cameras"}
              </button>

              <span className="text-[11px] text-stone-400 font-mono">
                Auto-syncs all 16 channels to gateway
              </span>
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
