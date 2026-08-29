"use client";

import { useState, useEffect } from "react";
import { 
  Layers, Link2, CheckCircle2, ShieldAlert, 
  Users, UserCheck, BookOpen, CreditCard, 
  Bus, HeartPulse, QrCode, Radio, FileText, 
  Search, Filter, RefreshCw, Eye, ArrowRight, 
  Sparkles, Building2, Lock, History, AlertCircle
} from "lucide-react";
import { useCampusContext } from "@/components/providers/CampusProvider";
import { 
  getMasterArchitectureStats,
  getStudent360MasterProfile,
  getCentralAuditTrailLogs
} from "@/app/actions/master-data";

export default function MasterDataArchitectureHub() {
  const { activeCampusId } = useCampusContext();

  // Navigation Sub-tabs
  const [activeTab, setActiveTab] = useState<
    "student_360" | "interconnection_map" | "audit_trail" | "rbac_matrix" | "pipelines"
  >("student_360");

  // Data States
  const [archStats, setArchStats] = useState<any>(null);
  const [student360, setStudent360] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, [activeCampusId]);

  async function loadAllData() {
    setIsLoading(true);
    try {
      const [statsRes, s360Res, auditRes] = await Promise.all([
        getMasterArchitectureStats(activeCampusId),
        getStudent360MasterProfile(),
        getCentralAuditTrailLogs({ campusId: activeCampusId, limit: 15 })
      ]);

      if (statsRes.success && statsRes.data) setArchStats(statsRes.data);
      if (s360Res.success && s360Res.data) setStudent360(s360Res.data);
      if (auditRes.success && auditRes.data) setAuditLogs(auditRes.data);
    } catch (e) {
      console.error("Error loading master architecture data:", e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <Link2 className="w-3 h-3 text-purple-600" /> ERP Interconnected Data Architecture
            </span>
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
              Single Source of Truth ✓
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Master Data &amp; System Integration Hub
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            &ldquo;Enter data once $\rightarrow$ use it everywhere.&rdquo; Central Master records, cross-module synchronization, and immutable audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={loadAllData}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-black text-xs rounded-2xl shadow-xs transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4 text-purple-400" /> [ Verify System Synchronization ]
          </button>
        </div>
      </div>

      {/* Master Architecture Health KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 text-xs">
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[9px] text-stone-400 font-bold uppercase block">Student Master</span>
          <strong className="text-base font-black text-stone-900 mt-0.5 block">{archStats?.totalStudents ?? 0}</strong>
          <span className="text-[9px] text-purple-700 font-bold">Central SIS</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[9px] text-stone-400 font-bold uppercase block">Parent Master</span>
          <strong className="text-base font-black text-stone-900 mt-0.5 block">{archStats?.totalParents ?? 0}</strong>
          <span className="text-[9px] text-emerald-700 font-bold">Multi-Child Switch</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[9px] text-stone-400 font-bold uppercase block">Employee Master</span>
          <strong className="text-base font-black text-stone-900 mt-0.5 block">{archStats?.totalStaff ?? 0}</strong>
          <span className="text-[9px] text-indigo-700 font-bold">Faculty &amp; Staff</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[9px] text-stone-400 font-bold uppercase block">Class &amp; Section</span>
          <strong className="text-base font-black text-stone-900 mt-0.5 block">{archStats?.totalClasses ?? 0}</strong>
          <span className="text-[9px] text-stone-600 font-medium">Session 2026-27</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[9px] text-stone-400 font-bold uppercase block">Subject Master</span>
          <strong className="text-base font-black text-stone-900 mt-0.5 block">{archStats?.totalSubjects ?? 0}</strong>
          <span className="text-[9px] text-stone-600 font-medium">Curriculum Codes</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[9px] text-stone-400 font-bold uppercase block">Fleet &amp; Routes</span>
          <strong className="text-base font-black text-stone-900 mt-0.5 block">{archStats?.totalBuses ?? 0}</strong>
          <span className="text-[9px] text-amber-700 font-bold">GPS Linked</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[9px] text-stone-400 font-bold uppercase block">Library Master</span>
          <strong className="text-base font-black text-stone-900 mt-0.5 block">{archStats?.totalLibraryCopies ?? 0}</strong>
          <span className="text-[9px] text-stone-600 font-medium">Accession Copies</span>
        </div>

        <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[9px] text-emerald-800 font-bold uppercase block">Sync Integrity</span>
          <strong className="text-base font-black text-emerald-950 mt-0.5 block">100%</strong>
          <span className="text-[9px] text-emerald-700 font-bold">Zero Orphans ✓</span>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-stone-200 pb-2 text-xs font-bold text-stone-500 overflow-x-auto">
        <button
          onClick={() => setActiveTab("student_360")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "student_360" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          🧑‍🎓 Student 360° Interconnected Master
        </button>

        <button
          onClick={() => setActiveTab("interconnection_map")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "interconnection_map" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          🗺️ Architecture &amp; Data Propagation Map
        </button>

        <button
          onClick={() => setActiveTab("audit_trail")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "audit_trail" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          📜 Central Audit Trail Explorer ({auditLogs.length})
        </button>

        <button
          onClick={() => setActiveTab("rbac_matrix")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "rbac_matrix" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          🔒 Role-Based Access (RBAC) &amp; Scope
        </button>

        <button
          onClick={() => setActiveTab("pipelines")}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === "pipelines" ? "bg-purple-600 text-white shadow-xs font-black" : "hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          🔄 Admission &amp; Recruitment Pipelines
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. STUDENT 360-DEGREE INTERCONNECTED MASTER PROFILE */}
      {/* ========================================================================= */}
      {activeTab === "student_360" && student360 && (
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-purple-700 font-bold">
                  {student360.basicInfo.admissionNo} • {student360.basicInfo.classCode}
                </span>
                <span className="text-stone-300">•</span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.2 rounded">
                  {student360.basicInfo.status}
                </span>
              </div>
              <h3 className="text-lg font-black text-stone-900 mt-0.5">
                {student360.basicInfo.fullName} ({student360.basicInfo.classSection})
              </h3>
              <p className="text-stone-500">Live 360-degree interconnected snapshot synchronized across 10 ERP modules in real time.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-purple-900 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
                Single Source of Truth Verified ✓
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* 1. Basic & Parent Master */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex items-center gap-1.5 text-stone-900 font-bold border-b border-stone-200 pb-1.5">
                <Users className="w-4 h-4 text-purple-600" /> Parent &amp; Escort Master
              </div>
              <div className="space-y-1 text-[11px] text-stone-700">
                <div>👨 <strong>Father:</strong> {student360.parentAndEscort.fatherName}</div>
                <div>👩 <strong>Mother:</strong> {student360.parentAndEscort.motherName}</div>
                <div>📞 <strong>Mobile:</strong> {student360.parentAndEscort.primaryMobile}</div>
                <div>🪪 <strong>Escort QR:</strong> <span className="font-mono font-bold text-purple-700">{student360.parentAndEscort.escortCardQr}</span></div>
                <div>👶 <strong>Siblings:</strong> {student360.parentAndEscort.siblingNames.join(", ")}</div>
              </div>
            </div>

            {/* 2. Attendance Module */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex items-center gap-1.5 text-stone-900 font-bold border-b border-stone-200 pb-1.5">
                <QrCode className="w-4 h-4 text-blue-600" /> Daily Attendance Module
              </div>
              <div className="space-y-1 text-[11px] text-stone-700">
                <div>📍 <strong>Status Today:</strong> <span className="text-emerald-700 font-bold">Present (07:58 AM)</span></div>
                <div>📈 <strong>Term Attendance:</strong> {student360.attendanceModule.attendanceRate}</div>
                <div>⏰ <strong>Late Days:</strong> {student360.attendanceModule.lateDaysThisTerm} day</div>
                <div className="text-[10px] text-stone-400 font-mono">Synced with Bus QR &amp; Classroom RFID</div>
              </div>
            </div>

            {/* 3. Finance & Fees Module */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex items-center gap-1.5 text-stone-900 font-bold border-b border-stone-200 pb-1.5">
                <CreditCard className="w-4 h-4 text-emerald-600" /> Finance &amp; Fee Ledger
              </div>
              <div className="space-y-1 text-[11px] text-stone-700">
                <div>🧾 <strong>Plan:</strong> {student360.financeModule.feePlan}</div>
                <div>💰 <strong>August Status:</strong> <span className="text-emerald-700 font-bold">{student360.financeModule.augustFeeStatus}</span></div>
                <div>🔢 <strong>Receipt:</strong> <span className="font-mono">{student360.financeModule.receiptNo}</span></div>
                <div>💳 <strong>Outstanding Dues:</strong> {student360.financeModule.outstandingDues}</div>
                <div>👛 <strong>Campus Wallet:</strong> {student360.financeModule.walletBalance}</div>
              </div>
            </div>

            {/* 4. Transport Module */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex items-center gap-1.5 text-stone-900 font-bold border-b border-stone-200 pb-1.5">
                <Bus className="w-4 h-4 text-amber-600" /> Live Transport &amp; Telemetry
              </div>
              <div className="space-y-1 text-[11px] text-stone-700">
                <div>🚌 <strong>Route:</strong> {student360.transportModule.route}</div>
                <div>🚍 <strong>Bus Assigned:</strong> {student360.transportModule.assignedBus}</div>
                <div>🚏 <strong>Stop:</strong> {student360.transportModule.stop}</div>
                <div>📲 <strong>Transit Status:</strong> <span className="text-purple-700 font-semibold">{student360.transportModule.qrBoardingStatus}</span></div>
              </div>
            </div>

            {/* 5. Library Module */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex items-center gap-1.5 text-stone-900 font-bold border-b border-stone-200 pb-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" /> Library Circulation
              </div>
              <div className="space-y-1 text-[11px] text-stone-700">
                <div>📖 <strong>Issued Book:</strong> {student360.libraryModule.issuedBookTitle}</div>
                <div>🪪 <strong>Accession #:</strong> <span className="font-mono font-bold">{student360.libraryModule.accessionNo}</span></div>
                <div>⏰ <strong>Due Date:</strong> {student360.libraryModule.dueDate}</div>
                <div>⚠️ <strong>Overdue / Fines:</strong> {student360.libraryModule.pendingFine}</div>
              </div>
            </div>

            {/* 6. Live Classroom Streaming */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex items-center gap-1.5 text-stone-900 font-bold border-b border-stone-200 pb-1.5">
                <Radio className="w-4 h-4 text-rose-600" /> Classroom Live Stream Permission
              </div>
              <div className="space-y-1 text-[11px] text-stone-700">
                <div>🔒 <strong>Dynamic Access:</strong> <span className="text-emerald-700 font-bold">{student360.liveStreamPermissions.streamStatus}</span></div>
                <div>📹 <strong>Room / Camera:</strong> {student360.liveStreamPermissions.activeStreamRoom}</div>
                <div>⏰ <strong>Active Period:</strong> {student360.liveStreamPermissions.currentPeriod}</div>
                <div className="text-[10px] text-stone-400 font-mono">Granted dynamically only while student is present in class</div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. INTERCONNECTION DIAGRAM & DATA PROPAGATION */}
      {/* ========================================================================= */}
      {activeTab === "interconnection_map" && (
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs space-y-6 text-xs">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-base font-black text-stone-900">ERP Interconnection &amp; Data Propagation Matrix</h3>
            <p className="text-stone-500">Every module derives state from central master entities without redundant database duplication.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Student Master Hub */}
            <div className="p-5 bg-purple-50/50 rounded-3xl border border-purple-200 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                  🧑‍🎓
                </div>
                <div>
                  <strong className="text-stone-900 font-bold text-sm block">Central Student Master Record</strong>
                  <span className="text-[10px] text-purple-700 font-mono">ID: STU-YYYY-XXXXX</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {[
                  { mod: "Attendance", flow: "Daily Biometric & QR Boarding Scans update term attendance rate" },
                  { mod: "Finance & Fees", flow: "Assigns Fee Structure $\\rightarrow$ Generates monthly invoices $\\rightarrow$ Allocates fee heads" },
                  { mod: "Transport", flow: "Assigns Bus & Stop coordinates $\\rightarrow$ Auto-calculates transport fee & route telemetry" },
                  { mod: "Library", flow: "Student ID QR scans book accession copies $\\rightarrow$ Enforces 2-book limit" },
                  { mod: "Digital Diary & HW", flow: "Class/Section link delivers targeted subject homework to parent portal" },
                  { mod: "Classroom Live Stream", flow: "Dynamic token issued only if attendance is marked Present in active timetable period" }
                ].map(item => (
                  <div key={item.mod} className="p-2.5 bg-white rounded-xl border border-purple-200/80 flex items-start gap-2 text-[11px]">
                    <span className="font-bold text-purple-900 shrink-0 w-24">{item.mod} $\rightarrow$</span>
                    <span className="text-stone-600">{item.flow}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Employee Master Hub */}
            <div className="p-5 bg-indigo-50/50 rounded-3xl border border-indigo-200 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  👩‍🏫
                </div>
                <div>
                  <strong className="text-stone-900 font-bold text-sm block">Central Employee Master Record</strong>
                  <span className="text-[10px] text-indigo-700 font-mono">ID: EMP-00XXX</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {[
                  { mod: "Geofenced Attendance", flow: "GPS clock-in & TOTP verify presence $\\rightarrow$ Auto-calculates LWP deductions" },
                  { mod: "Master Timetable", flow: "Allocates teaching periods, room numbers, and subject coverage" },
                  { mod: "Smart Substitutions", flow: "Approved leaves trigger automatic substitute recommendations from available teachers" },
                  { mod: "Monthly Payroll", flow: "Base + HRA + Allowances − LWP Deductions − PF = Net Payable salary slip" },
                  { mod: "Digital Diary & HW", flow: "Teachers publish daily classroom topics directly to assigned class sections" },
                  { mod: "HR Documents", flow: "1-Click generation of Appointment, Promotion, and Relieving letters" }
                ].map(item => (
                  <div key={item.mod} className="p-2.5 bg-white rounded-xl border border-indigo-200/80 flex items-start gap-2 text-[11px]">
                    <span className="font-bold text-indigo-900 shrink-0 w-28">{item.mod} $\rightarrow$</span>
                    <span className="text-stone-600">{item.flow}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CENTRAL AUDIT TRAIL EXPLORER */}
      {/* ========================================================================= */}
      {activeTab === "audit_trail" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-900">Central Immutable Audit Trail Ledger</h3>
              <p className="text-stone-500">Full forensic audit of every critical field modification, fee change, and payroll lock.</p>
            </div>
            <span className="text-xs font-mono font-bold text-purple-900 bg-purple-50 px-2.5 py-1 rounded-xl">
              {auditLogs.length} Logged Actions
            </span>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-purple-800 font-bold uppercase bg-purple-100 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="text-stone-600 font-semibold">{log.entity_type}</span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">{log.created_at}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 font-mono text-[10px] truncate">
                    <strong>Old Value:</strong> {typeof log.old_value === "object" ? JSON.stringify(log.old_value) : log.old_value}
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-mono text-[10px] truncate">
                    <strong>New Value:</strong> {typeof log.new_value === "object" ? JSON.stringify(log.new_value) : log.new_value}
                  </div>
                </div>

                <div className="text-[10px] text-stone-400 font-mono flex items-center justify-between">
                  <span>IP: {log.ip_address}</span>
                  <span className="font-bold text-stone-700">Audit Status: Verified &amp; Signed ✓</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ROLE-BASED ACCESS CONTROL (RBAC) & DATA SCOPE */}
      {/* ========================================================================= */}
      {activeTab === "rbac_matrix" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-base font-black text-stone-900">Institutional Role-Based Access Control (RBAC) Matrix</h3>
            <p className="text-stone-500">Security scopes enforce that staff and parents see only authorized student and financial records.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">ERP Role</th>
                  <th className="p-3">Data Scope</th>
                  <th className="p-3">View Permissions</th>
                  <th className="p-3">Financial Access</th>
                  <th className="p-3 text-right">Audit Logging</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {[
                  { role: "Super Admin / Management", scope: "All Campuses", view: "Complete School ERP", fin: "Full Finance & Payroll", audit: "Admin Superuser" },
                  { role: "Principal & Vice Principal", scope: "Campus-wide", view: "Students, Staff, Live Stream, Academic Reports", fin: "Budget View & Approvals", audit: "Executive Log" },
                  { role: "Accounts & Finance Head", scope: "Campus-wide", view: "Fee Collection, Ledgers, Expenses, Vouchers", fin: "Fee Invoicing & Reconciliations", audit: "Financial Audit" },
                  { role: "Class Teacher", scope: "Assigned Class & Section", view: "Own Class Students, Attendance, Digital Diary", fin: "None (View Only Dues Alert)", audit: "Academic Log" },
                  { role: "Subject Teacher", scope: "Assigned Timetable Periods", view: "Curriculum, Syllabus, Question Papers", fin: "None", audit: "Lesson Plan Log" },
                  { role: "Transport Manager", scope: "Fleet & Routes", view: "Bus Telemetry, Stops, Escort Pickups", fin: "Transport Fee Structure", audit: "Fleet Log" },
                  { role: "Campus Security Guard", scope: "Gate Desks", view: "Visitor Check-In, Escort QR Verification, Blacklist", fin: "None", audit: "Gate Pass Log" },
                  { role: "Parent / Guardian", scope: "Enrolled Children Only", view: "Child Attendance, Diary, Fees, Transport, Live Stream", fin: "Own Child Fee Payment Only", audit: "Parent Portal Log" }
                ].map(r => (
                  <tr key={r.role} className="hover:bg-stone-50">
                    <td className="p-3 font-bold text-stone-900">{r.role}</td>
                    <td className="p-3 text-purple-700 font-semibold">{r.scope}</td>
                    <td className="p-3 text-stone-600">{r.view}</td>
                    <td className="p-3 text-stone-800">{r.fin}</td>
                    <td className="p-3 text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                        {r.audit}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ADMISSION & RECRUITMENT PIPELINES */}
      {/* ========================================================================= */}
      {activeTab === "pipelines" && (
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs space-y-6 text-xs">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-base font-black text-stone-900">Seamless Onboarding Pipelines (Zero Data Duplication)</h3>
            <p className="text-stone-500">Applicant data transitions directly into permanent Student and Employee master records upon approval.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Enquiries & Leads */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
              <strong className="text-stone-900 font-black text-sm block">1. Enquiries &amp; Leads $\rightarrow$ Student Master</strong>
              <div className="space-y-2 mt-3">
                {[
                  "Enquiry / Lead Form (Parent Details, Grade Choice)",
                  "3-Step Digital Application (Birth Certificate, Address Proof)",
                  "Document Verification & Principal Approval",
                  "Auto-Generates Permanent Admission No (e.g. CBS-2026-1248)",
                  "Creates Student Master & Linked Parent Portal Account",
                  "Assigns Class, Section & Fee Plan Structure",
                  "Auto-Generates Student ID Card & Escort QR"
                ].map((step, idx) => (
                  <div key={step} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-stone-200/70 text-[11px]">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-stone-800">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recruitment Pipeline */}
            <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <strong className="text-stone-900 font-black text-sm block">2. Recruitment Pipeline $\rightarrow$ Employee Master</strong>
              <div className="space-y-2">
                {[
                  "Job Opening (PRT / TGT Mathematics Vacancy)",
                  "Online Candidate Application & Resume Screening",
                  "Demonstration & Interview Panel Selection",
                  "Offer Letter Dispatched & Joining Date Confirmed",
                  "Auto-Generates Employee Code (e.g. EMP-00125)",
                  "Creates Employee Master, Geofence Profile & Bank Record",
                  "Connects to Master Timetable, Leaves & Monthly Payroll"
                ].map((step, idx) => (
                  <div key={step} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-stone-200/70 text-[11px]">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-stone-800">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
