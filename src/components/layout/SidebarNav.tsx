"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  Clock,
  IndianRupee,
  Banknote,
  Package,
  Bus,
  HeartPulse,
  Library,
  ShieldCheck,
  Award,
  MessageSquare,
  Sparkles,
  HeartHandshake,
  Globe,
  KeyRound,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  ShieldAlert,
  Bot,
  Bell,
  Calendar,
  Trophy,
  Video,
  CheckSquare,
  QrCode,
  FileText,
  CreditCard,
  UserCheck,
  FileCheck2,
  Send
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { clearServerAuthSession } from "@/app/actions/auth";
import { useInstitution } from "@/components/providers/InstitutionContext";
import { getDisabledModuleHrefsAction } from "@/app/actions/rbac-actions";

interface SidebarNavProps {
  currentRole?: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavSubItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  roles?: string[];
}

interface ExecutiveDomain {
  id: string;
  title: string;
  shortName: string;
  icon: any;
  accentColor: string;
  allowedRoles: string[];
  items: NavSubItem[];
}

function roleHasAccess(allowedRoles?: string[], userRole: string = "SUPER_ADMIN"): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!userRole) return true;

  const norm = userRole.toUpperCase().replace(/_/g, " ");

  // 1. Super Admin / Trustee / Chairman has global master access to all modules
  if (
    norm.includes("SUPER ADMIN") ||
    norm.includes("SUPERADMIN") ||
    norm.includes("TRUSTEE") ||
    norm.includes("CHAIRMAN")
  ) {
    return true;
  }

  // 2. Direct exact or normalized match
  if (allowedRoles.includes(userRole)) return true;
  if (allowedRoles.some(r => r.toUpperCase() === norm)) return true;

  // 3. School Administrator / Principal access (all admin, academic, finance, logistics, community modules)
  const hasAdmin = norm.includes("ADMIN") || norm.includes("PRINCIPAL") || norm.includes("OFFICER") || norm.includes("MANAGER");
  if (hasAdmin && (
    allowedRoles.includes("ADMIN") ||
    allowedRoles.includes("PRINCIPAL") ||
    allowedRoles.includes("SUPER_ADMIN") ||
    allowedRoles.includes("TEACHER") ||
    allowedRoles.includes("FACULTY") ||
    allowedRoles.includes("STAFF") ||
    allowedRoles.includes("ACCOUNTS")
  )) {
    return true;
  }

  // 4. Faculty / Teacher access
  const isFacultyOrTeacher = norm.includes("TEACHER") || norm.includes("FACULTY") || norm.includes("STAFF");
  if (isFacultyOrTeacher && (
    allowedRoles.includes("TEACHER") ||
    allowedRoles.includes("FACULTY") ||
    allowedRoles.includes("STAFF")
  )) {
    return true;
  }

  // 5. Finance / Accounts access
  const isFinance = norm.includes("ACCOUNT") || norm.includes("FINANCE") || norm.includes("CASHIER");
  if (isFinance && (
    allowedRoles.includes("ACCOUNTS") ||
    allowedRoles.includes("ACCOUNTANT") ||
    allowedRoles.includes("FINANCE")
  )) {
    return true;
  }

  // 6. Parent access
  if (norm.includes("PARENT") && allowedRoles.includes("PARENT")) {
    return true;
  }

  return false;
}

export function SidebarNav({ currentRole = "SUPER_ADMIN", isMobileOpen = false, onCloseMobile }: SidebarNavProps) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();

  const [disabledHrefs, setDisabledHrefs] = useState<string[]>([]);

  // Load user preference for sidebar collapsed state
  useEffect(() => {
    const saved = localStorage.getItem("cbs_sidebar_collapsed");
    if (saved === "true") setIsCollapsed(true);
  }, []);

  // Fetch school-scoped active/inactive module status
  useEffect(() => {
    async function loadDisabled() {
      try {
        const instCode = selectedInstitutionObj?.code || (currentInstitution !== "ALL" ? currentInstitution : "CBS");
        const hrefs = await getDisabledModuleHrefsAction(instCode);
        setDisabledHrefs(hrefs || []);
      } catch (e) {}
    }
    loadDisabled();

    // Listen for live module changes from IAM
    const handleLiveModuleUpdate = () => loadDisabled();
    window.addEventListener("erp_modules_updated", handleLiveModuleUpdate);
    return () => window.removeEventListener("erp_modules_updated", handleLiveModuleUpdate);
  }, [currentInstitution, selectedInstitutionObj?.code]);

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("cbs_sidebar_collapsed", String(next));
      return next;
    });
  };

  // The 7 Executive Domains (Complete 36 Enterprise Modules)
  const EXECUTIVE_DOMAINS: ExecutiveDomain[] = [
    {
      id: "governance",
      title: "Governance & Board",
      shortName: "Governance",
      icon: Building2,
      accentColor: "#D4AF37",
      allowedRoles: ["SUPER_ADMIN", "PRINCIPAL", "ACCOUNTS", "TEACHER", "FACULTY", "STAFF"],
      items: [
        { name: "Executive Command Desk", href: "/admin/dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "PRINCIPAL", "ACCOUNTS", "TEACHER", "FACULTY", "STAFF"] },
        { name: "Multi-Campus Matrix", href: "/admin/institutions", icon: Building2, badge: "Campuses", roles: ["SUPER_ADMIN"] },
        { name: "Trust Board & MIS Intelligence", href: "/admin/trust", icon: Award, badge: "Trust MIS", roles: ["SUPER_ADMIN", "PRINCIPAL", "ACCOUNTS"] },
        { name: "Executive Approvals Desk", href: "/admin/approvals", icon: CheckSquare, badge: "Approvals", roles: ["SUPER_ADMIN", "PRINCIPAL"] },
        { name: "Enterprise Audit Vault", href: "/admin/audit-logs", icon: ShieldAlert, badge: "ISO & DPDP", roles: ["SUPER_ADMIN", "ACCOUNTS"] },
        { name: "Statutory Board Exporter", href: "/admin/reports/compliance", icon: FileText, badge: "Board & U-DISE", roles: ["SUPER_ADMIN", "PRINCIPAL"] },
        { name: "OneRoster & LTI 1.3 Gateway", href: "/admin/integrations/oneroster", icon: Globe, badge: "EdTech API", roles: ["SUPER_ADMIN"] },
        { name: "Security & IAM Data Vault", href: "/admin/iam", icon: KeyRound, badge: "IAM", roles: ["SUPER_ADMIN"] },
        { name: "Faculty Classroom Desk", href: "/teacher", icon: GraduationCap, badge: "Classroom", roles: ["TEACHER", "FACULTY", "STAFF", "SUPER_ADMIN", "PRINCIPAL"] },
      ],
    },
    {
      id: "admissions",
      title: "Admissions & Student 360",
      shortName: "Admissions",
      icon: GraduationCap,
      accentColor: "#0284C7",
      allowedRoles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "FACULTY", "STAFF", "ACCOUNTS", "PARENT"],
      items: [
        { name: "Admissions Command Suite", href: "/admin/admissions", icon: GraduationCap, badge: "Pipeline & CRM", roles: ["SUPER_ADMIN", "PRINCIPAL", "ACCOUNTS"] },
        { name: "Admissions Analytics & Matrix", href: "/admin/admissions/analytics", icon: Sparkles, badge: "Analytics", roles: ["SUPER_ADMIN", "PRINCIPAL", "ACCOUNTS"] },
        { name: "Student & Family 360 Master", href: "/admin/students", icon: Users, badge: "Enrolled", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "FACULTY", "STAFF", "ACCOUNTS"] },
        { name: "Student & Escort ID Cards Studio", href: "/admin/id-cards", icon: CreditCard, badge: "ID Studio", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "FACULTY", "STAFF"] },
        { name: "Transfer Certificate (TC) Desk", href: "/admin/students/tc", icon: FileCheck2, badge: "TC Desk", roles: ["SUPER_ADMIN", "PRINCIPAL"] },
        { name: "SEN & Inclusive Education Studio", href: "/admin/students/sen-iep", icon: HeartPulse, badge: "IEP & Needs", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "FACULTY", "STAFF"] },
        { name: "Predictive Retention Radar", href: "/admin/students/retention", icon: Sparkles, badge: "AI Early Warning", roles: ["SUPER_ADMIN", "PRINCIPAL"] },
      ],
    },
    {
      id: "academics",
      title: "Academic LMS & Faculty",
      shortName: "Academics",
      icon: BookOpen,
      accentColor: "#059669",
      allowedRoles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "FACULTY", "STAFF"],
      items: [
        { name: "Daily Attendance & Muster Hub", href: "/admin/attendance", icon: CheckSquare, badge: "Roll-Call", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "FACULTY", "STAFF"] },
        { name: "Curriculum, Diary & Homework LMS", href: "/admin/curriculum", icon: BookOpen, badge: "LMS", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "FACULTY", "STAFF"] },
        { name: "AI Genetic Timetable & Proxy Hub", href: "/admin/timetable", icon: Clock, badge: "Genetic GA", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "FACULTY", "STAFF"] },
        { name: "Teacher Substitutions Engine", href: "/admin/faculty/substitutions", icon: UserCheck, badge: "Proxy", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "FACULTY", "STAFF"] },
        { name: "Faculty Directory & Staff Records", href: "/admin/faculty", icon: Users, badge: "Staff", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "FACULTY", "STAFF"] },
        { name: "Academic Calendar & Events Planner", href: "/admin/calendar", icon: Calendar, badge: "Events", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "FACULTY", "STAFF"] },
      ],
    },
    {
      id: "exams",
      title: "Exams & Evaluation",
      shortName: "Exams",
      icon: Award,
      accentColor: "#D97706",
      allowedRoles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "FACULTY", "STAFF"],
      items: [
        { name: "Examination & Gradebook Center", href: "/admin/exams", icon: Award, badge: "HPC Studio", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "FACULTY", "STAFF"] },
        { name: "Question Paper AI Generator", href: "/admin/exams/question-paper-generator", icon: Bot, badge: "AI Paper", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "FACULTY", "STAFF"] },
        { name: "Term Report Cards & HPC Center", href: "/admin/exams/report-cards", icon: FileText, badge: "Report Cards", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "FACULTY", "STAFF"] },
        { name: "Assessment Rubrics Builder", href: "/admin/academics/rubrics", icon: BookOpen, badge: "NEP 2020", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "FACULTY", "STAFF"] },
        { name: "360° Holistic Progress Card", href: "/admin/reports/holistic-card", icon: Sparkles, badge: "Printable", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "FACULTY", "STAFF"] },
        { name: "CBT Quiz & Lockdown Arena", href: "/admin/academic/quiz-arena", icon: Trophy, badge: "CBT Arena", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "FACULTY", "STAFF"] },
      ],
    },
    {
      id: "finance",
      title: "Finance & Treasury",
      shortName: "Finance",
      icon: IndianRupee,
      accentColor: "#C85A32",
      allowedRoles: ["SUPER_ADMIN", "PRINCIPAL", "ACCOUNTS", "PARENT", "TEACHER", "FACULTY", "STAFF"],
      items: [
        { name: "⚡ Cashier POS Terminal", href: "/billing", icon: Banknote, badge: "Counter POS", roles: ["SUPER_ADMIN", "ACCOUNTS"] },
        { name: "Student Fees & Collections Hub", href: "/admin/finance", icon: IndianRupee, badge: "POS & Ledger", roles: ["SUPER_ADMIN", "ACCOUNTS"] },
        { name: "Fee Structure & Concessions", href: "/admin/finance/structure", icon: CreditCard, badge: "Fee Slabs", roles: ["SUPER_ADMIN", "ACCOUNTS"] },
        { name: "Pending Dues & Defaulters Desk", href: "/admin/finance/pending", icon: ShieldAlert, badge: "Dues", roles: ["SUPER_ADMIN", "ACCOUNTS"] },
        { name: "HR, Statutory Payroll & Disbursals", href: "/admin/hr/payroll", icon: Users, badge: "EPF & Salary", roles: ["SUPER_ADMIN", "PRINCIPAL", "ACCOUNTS"] },
        { name: "Procurement & Asset Inventory Hub", href: "/admin/procurement", icon: Package, badge: "PO Studio", roles: ["SUPER_ADMIN", "PRINCIPAL", "ACCOUNTS"] },
      ],
    },
    {
      id: "logistics",
      title: "Logistics & Safety",
      shortName: "Logistics",
      icon: Bus,
      accentColor: "#EA580C",
      allowedRoles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "FACULTY", "STAFF"],
      items: [
        { name: "Smart Fleet Telematics & Transport", href: "/admin/transport", icon: Bus, badge: "GPS Radar", roles: ["SUPER_ADMIN", "PRINCIPAL"] },
        { name: "Live Classroom CCTV Stream", href: "/admin/live-stream", icon: Video, badge: "CCTV Wall", roles: ["SUPER_ADMIN", "PRINCIPAL"] },
        { name: "Campus Security & Gate Pass Hub", href: "/admin/visitors", icon: ShieldCheck, badge: "Gate Pass", roles: ["SUPER_ADMIN", "PRINCIPAL"] },
        { name: "Offline Gate Scanner Terminal", href: "/admin/gate-scanner", icon: QrCode, badge: "Scanner", roles: ["SUPER_ADMIN", "PRINCIPAL"] },
        { name: "Student Wellness, Clinic & POCSO", href: "/admin/health", icon: HeartPulse, badge: "Infirmary", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "FACULTY", "STAFF"] },
        { name: "Child Safeguarding Incidents", href: "/admin/incidents", icon: ShieldAlert, badge: "POCSO", roles: ["SUPER_ADMIN", "PRINCIPAL"] },
        { name: "Digital Library & Knowledge Media", href: "/admin/library", icon: Library, badge: "Catalog", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "FACULTY", "STAFF"] },
      ],
    },
    {
      id: "community",
      title: "Parent Community",
      shortName: "Community",
      icon: MessageSquare,
      accentColor: "#7C3AED",
      allowedRoles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "FACULTY", "STAFF", "PARENT"],
      items: [
        { name: "Omnichannel Comms & WhatsApp Hub", href: "/admin/communications", icon: MessageSquare, badge: "AI & WhatsApp", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "FACULTY", "STAFF"] },
        { name: "Broadcasts & Circulars Center", href: "/admin/campaigns", icon: Send, badge: "Broadcast", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "FACULTY", "STAFF"] },
        { name: "AI Circular & Content Writer", href: "/admin/communications/ai-writer", icon: Bot, badge: "AI Studio", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "FACULTY", "STAFF"] },
        { name: "PBIS House Cup & Pastoral Care", href: "/admin/pastoral/house-points", icon: Trophy, badge: "House Cup", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "FACULTY", "STAFF", "PARENT"] },
        { name: "2-Way WhatsApp Bot Simulator", href: "/admin/communications/whatsapp-bot", icon: Bot, badge: "Interactive", roles: ["SUPER_ADMIN", "PRINCIPAL"] },
        { name: "Native Mobile Push Center", href: "/admin/communications/push", icon: Bell, badge: "FCM & Web", roles: ["SUPER_ADMIN", "PRINCIPAL"] },
        { name: "Parent Engagement & Grievance Hub", href: "/admin/parent-care", icon: HeartHandshake, badge: "Grievance", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "FACULTY", "STAFF", "PARENT"] },
        { name: "Early Departure Gate Pass", href: "/admin/early-departure", icon: Clock, badge: "Early Exit", roles: ["SUPER_ADMIN", "PRINCIPAL"] },
        { name: "PTM Appointment Desk", href: "/admin/parent-care?tab=ptm", icon: Calendar, badge: "Self-Service", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "FACULTY", "STAFF", "PARENT"] },
        { name: "Public Website CMS & Portal Hub", href: "/admin/cms", icon: Globe, badge: "Newsroom", roles: ["SUPER_ADMIN", "PRINCIPAL"] },
      ],
    },
  ];

  const [userName, setUserName] = useState<string>("Staff Member");
  const [userRole, setUserRole] = useState<string>(currentRole);
  const [isElevated, setIsElevated] = useState<boolean>(false);

  useEffect(() => {
    let resolvedName = "";
    let resolvedRole = currentRole;
    let hasElevated = false;

    if (typeof document !== "undefined") {
      const matchName = document.cookie.match(/(?:^| )cb_user_name=([^;]+)/);
      if (matchName) resolvedName = decodeURIComponent(matchName[1]);
      const matchRole = document.cookie.match(/(?:^| )cb_user_role=([^;]+)/);
      if (matchRole) resolvedRole = decodeURIComponent(matchRole[1]);
    }

    if (typeof window !== "undefined") {
      const localUserRaw = localStorage.getItem("cbs_auth_user");
      if (localUserRaw) {
        try {
          const parsed = JSON.parse(localUserRaw);
          resolvedName = parsed.faculty?.name || parsed.parent?.name || parsed.admin?.name || parsed.name || resolvedName;
          
          const rawRoleStr = `${parsed.primaryRole || ""} ${parsed.faculty?.role || ""} ${parsed.role || ""} ${Array.isArray(parsed.roles) ? parsed.roles.join(" ") : ""}`.toUpperCase();
          if (
            rawRoleStr.includes("SUPER") ||
            rawRoleStr.includes("TRUSTEE") ||
            rawRoleStr.includes("CHAIRMAN") ||
            parsed.isSuperAdmin === true
          ) {
            hasElevated = true;
            resolvedRole = "SUPER_ADMIN";
          } else if (rawRoleStr.includes("ADMIN") || rawRoleStr.includes("PRINCIPAL")) {
            hasElevated = true;
            resolvedRole = "ADMIN";
          } else {
            resolvedRole = parsed.primaryRole || parsed.faculty?.role || resolvedRole;
          }
        } catch {}
      }

      const localName = localStorage.getItem("cb_user_name");
      if (localName && !resolvedName) resolvedName = localName;

      const activeChoice = localStorage.getItem("cbs_active_role") || localStorage.getItem("vet_current_role") || localStorage.getItem("cb_user_role");
      if (hasElevated) {
        if (activeChoice === "PARENT") {
          resolvedRole = "PARENT";
        } else if (activeChoice === "FACULTY") {
          resolvedRole = "FACULTY";
        } else {
          resolvedRole = "SUPER_ADMIN";
        }
      } else if (activeChoice) {
        resolvedRole = activeChoice;
      }
    }

    if (resolvedName) setUserName(resolvedName);
    if (resolvedRole) setUserRole(resolvedRole);
    setIsElevated(hasElevated);
  }, [currentRole]);

  // Normalize effective role to ensure multi-role strings like "Teacher, Super Admin / Trustee" map to SUPER_ADMIN
  const normalizedUserRole = (userRole || currentRole || "SUPER_ADMIN").toUpperCase();
  const effectiveActiveRole = (
    normalizedUserRole.includes("SUPER") ||
    normalizedUserRole.includes("TRUSTEE") ||
    normalizedUserRole.includes("CHAIRMAN")
  ) ? "SUPER_ADMIN" : (
    (normalizedUserRole.includes("ADMIN") || normalizedUserRole.includes("PRINCIPAL")) ? "ADMIN" : (userRole || currentRole || "SUPER_ADMIN")
  );

  // Filter accessible domains for active role and exclude dynamically disabled modules
  const accessibleDomains = EXECUTIVE_DOMAINS
    .filter(domain => roleHasAccess(domain.allowedRoles, effectiveActiveRole))
    .map(domain => ({
      ...domain,
      items: domain.items.filter(item => !disabledHrefs.includes(item.href) && roleHasAccess(item.roles, effectiveActiveRole))
    }))
    .filter(domain => domain.items.length > 0);

  const userInitials = userName
    .split(" ")
    .filter(Boolean)
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CB";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      await clearServerAuthSession();
      if (typeof window !== "undefined") {
        localStorage.removeItem("cbs_auth_user");
        localStorage.removeItem("cbs_active_role");
        localStorage.removeItem("cbs_auth_token");
        localStorage.removeItem("vet_current_role");
        localStorage.removeItem("cb_user_role");
        localStorage.removeItem("cb_user_name");
        localStorage.removeItem("cb_user_email");
        localStorage.removeItem("cb_auth_token");
      }
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      window.location.href = "/login";
    }
  };

  const handleItemClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const activeCampusCode = isAllInstitutions ? "TRUST HQ" : (selectedInstitutionObj?.code || "CAMPUS");

  // Single-Tier Navigation Content
  const sidebarContent = (
    <aside
      className={`h-full bg-[#F7F2E9] text-[#2D2319] flex flex-col justify-between shrink-0 shadow-sm border-r border-[#E8DFC8] transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-68 sm:w-70"
      }`}
    >
      {/* 1. Header: Trust Emblem & Brand */}
      <div className="p-3 sm:p-4 border-b border-[#E8DFC8] bg-[#F2ECE1]/60 flex items-center justify-between">
        <Link
          href="/admin/dashboard"
          onClick={handleItemClick}
          className="flex items-center gap-3 min-w-0 group"
          title="Vani ERP — Executive Dashboard"
        >
          <div className="w-10 h-10 rounded-xl bg-white p-1 border border-[#D4AF37]/50 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition">
            <img
              src={selectedInstitutionObj?.logoUrl || "/trust-logo.png"}
              alt={selectedInstitutionObj?.name || "Vani ERP"}
              className="w-full h-full object-contain"
              onError={(e) => { e.currentTarget.src = "/trust-logo.png"; }}
            />
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs sm:text-sm font-black text-[#2D2319] truncate tracking-tight">
                  Vani
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-[#D97706]/15 text-[#92400E] border border-[#D97706]/30 uppercase tracking-wider">
                  {activeCampusCode}
                </span>
              </div>
              <p 
                className="text-[10px] text-stone-500 font-semibold truncate"
                title={selectedInstitutionObj?.name || (isAllInstitutions ? "Multi-Campus Trust HQ" : "Enterprise Portal")}
              >
                {selectedInstitutionObj?.name || (isAllInstitutions ? "Multi-Campus Trust HQ" : "Enterprise Portal")}
              </p>
            </div>
          )}
        </Link>

        {/* Desktop Collapse / Expand Toggle Button */}
        <button
          onClick={toggleCollapse}
          title={isCollapsed ? "Expand Sidebar (w-68)" : "Collapse Sidebar (w-20)"}
          className="hidden lg:flex w-7 h-7 rounded-lg bg-white/80 hover:bg-white text-stone-600 hover:text-stone-900 border border-[#E8DFC8] items-center justify-center transition shadow-2xs cursor-pointer shrink-0"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-white/80 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Scrollable Navigation: 7 Domains & 20 Master Hubs */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-5 custom-scrollbar">
        {accessibleDomains.map((domain) => {
          const visibleItems = domain.items;
          if (visibleItems.length === 0) return null;

          return (
            <div key={domain.id} className="space-y-1">
              {/* Domain Category Header */}
              {!isCollapsed ? (
                <div className="px-2 pb-1 pt-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: domain.accentColor }}
                    />
                    <span className="text-[10px] font-black tracking-wider uppercase text-stone-500">
                      {domain.title}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-stone-400 font-mono">
                    {visibleItems.length}
                  </span>
                </div>
              ) : (
                <div className="w-full flex justify-center py-1">
                  <div
                    className="w-6 h-0.5 rounded-full opacity-60"
                    style={{ backgroundColor: domain.accentColor }}
                    title={domain.title}
                  />
                </div>
              )}

              {/* Domain Items */}
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const ItemIcon = item.icon;
                  const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleItemClick}
                      title={`${item.name}${item.badge ? ` (${item.badge})` : ""}`}
                      className={`flex items-center ${
                        isCollapsed ? "justify-center p-2.5" : "justify-between px-2.5 py-2"
                      } rounded-xl text-xs font-semibold transition group ${
                        isActive
                          ? "bg-white text-[#2D2319] font-bold shadow-xs border border-[#E8DFC8] border-l-4 border-l-[#D97706]"
                          : "text-stone-700 hover:text-stone-900 hover:bg-[#EFE7D8]/70"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition ${
                            isActive
                              ? "bg-[#D97706]/15 text-[#92400E]"
                              : "bg-white/60 text-stone-600 group-hover:bg-white group-hover:text-[#92400E] border border-[#E8DFC8]/60"
                          }`}
                        >
                          <ItemIcon className="w-4 h-4" />
                        </div>

                        {!isCollapsed && (
                          <span className="truncate leading-tight">{item.name}</span>
                        )}
                      </div>

                      {!isCollapsed && item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black tracking-tight uppercase bg-[#D97706]/10 text-[#92400E] border border-[#D97706]/20 shrink-0 ml-1.5">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Footer: Persona Switcher & User Identity */}
      <div className="p-3 border-t border-[#E8DFC8] bg-[#F2ECE1]/70 space-y-2 shrink-0">
        {/* Dual-Role Switcher (Executive Desk / Faculty Desk / Parent View) */}
        {!isCollapsed ? (
          <button
            onClick={() => {
              let nextRole = "SUPER_ADMIN";
              if (effectiveActiveRole === "SUPER_ADMIN") {
                nextRole = "FACULTY";
              } else if (effectiveActiveRole === "FACULTY") {
                nextRole = isElevated ? "SUPER_ADMIN" : "PARENT";
              } else {
                nextRole = isElevated ? "SUPER_ADMIN" : "FACULTY";
              }

              localStorage.setItem("cbs_active_role", nextRole);
              localStorage.setItem("vet_current_role", nextRole);
              localStorage.setItem("cb_user_role", nextRole);
              if (typeof document !== "undefined") {
                document.cookie = `cb_user_role=${encodeURIComponent(nextRole)}; path=/; max-age=2592000; SameSite=Lax`;
                document.cookie = `vet_current_role=${encodeURIComponent(nextRole)}; path=/; max-age=2592000; SameSite=Lax`;
              }
              window.location.href = nextRole === "PARENT" ? "/parent/live-stream" : (nextRole === "FACULTY" ? "/teacher" : "/admin/dashboard");
            }}
            title={
              effectiveActiveRole === "SUPER_ADMIN"
                ? "Switch to Faculty Classroom Desk"
                : "Switch to Super Admin Executive Desk"
            }
            className="w-full py-1.5 px-2.5 rounded-xl bg-white hover:bg-stone-50 border border-[#E8DFC8] text-[#92400E] font-bold text-xs flex items-center justify-between transition shadow-2xs cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
              <span>
                {effectiveActiveRole === "SUPER_ADMIN"
                  ? "Executive View"
                  : (effectiveActiveRole === "PARENT" ? "Parent View" : "Faculty Desk")}
              </span>
            </div>
            <span className="text-[9px] uppercase font-black tracking-wider bg-[#D97706]/10 px-1.5 py-0.5 rounded text-[#92400E]">
              {effectiveActiveRole === "SUPER_ADMIN" ? "→ Faculty" : "→ Exec"}
            </span>
          </button>
        ) : (
          <button
            onClick={() => {
              let nextRole = "SUPER_ADMIN";
              if (effectiveActiveRole === "SUPER_ADMIN") {
                nextRole = "FACULTY";
              } else if (effectiveActiveRole === "FACULTY") {
                nextRole = isElevated ? "SUPER_ADMIN" : "PARENT";
              } else {
                nextRole = isElevated ? "SUPER_ADMIN" : "FACULTY";
              }

              localStorage.setItem("cbs_active_role", nextRole);
              localStorage.setItem("vet_current_role", nextRole);
              localStorage.setItem("cb_user_role", nextRole);
              if (typeof document !== "undefined") {
                document.cookie = `cb_user_role=${encodeURIComponent(nextRole)}; path=/; max-age=2592000; SameSite=Lax`;
                document.cookie = `vet_current_role=${encodeURIComponent(nextRole)}; path=/; max-age=2592000; SameSite=Lax`;
              }
              window.location.href = nextRole === "PARENT" ? "/parent/live-stream" : (nextRole === "FACULTY" ? "/teacher" : "/admin/dashboard");
            }}
            title={effectiveActiveRole === "SUPER_ADMIN" ? "Switch to Faculty Desk" : "Switch to Executive Desk"}
            className="w-full py-2 rounded-xl bg-white hover:bg-stone-50 border border-[#E8DFC8] text-[#92400E] flex items-center justify-center transition shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#D97706]" />
          </button>
        )}

        {/* User Identity & Logout */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {!isCollapsed ? (
            <div className="min-w-0 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#D97706]/20 text-[#92400E] flex items-center justify-center font-bold text-xs shrink-0 border border-[#D97706]/30">
                {userInitials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-900 truncate leading-tight">{userName}</p>
                <p className="text-[9px] text-stone-500 font-semibold truncate leading-tight uppercase tracking-wider">
                  {isElevated ? "Trustee / Super Admin" : userRole.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-7 h-7 rounded-full bg-[#D97706]/20 text-[#92400E] flex items-center justify-center font-bold text-xs shrink-0 border border-[#D97706]/30" title={`${userName} (${userRole})`}>
                {userInitials}
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Sign Out"
            className={`p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center transition cursor-pointer shrink-0 ${
              isCollapsed ? "w-full mt-1" : ""
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Single-Tier Sidebar */}
      <div className="hidden lg:flex h-full relative z-40">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Slide-over */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#0B1B30]/60 backdrop-blur-xs animate-in fade-in"
            onClick={onCloseMobile}
          />
          <div className="relative z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
