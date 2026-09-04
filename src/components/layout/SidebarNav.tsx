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
  ShieldAlert
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { clearServerAuthSession } from "@/app/actions/auth";
import { useInstitution } from "@/components/providers/InstitutionContext";

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

export function SidebarNav({ currentRole = "SUPER_ADMIN", isMobileOpen = false, onCloseMobile }: SidebarNavProps) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { selectedInstitutionObj, isAllInstitutions } = useInstitution();

  // Load user preference for sidebar collapsed state
  useEffect(() => {
    const saved = localStorage.getItem("cbs_sidebar_collapsed");
    if (saved === "true") setIsCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("cbs_sidebar_collapsed", String(next));
      return next;
    });
  };

  // The 7 Executive Domains (Consolidated 20 Master Hubs)
  const EXECUTIVE_DOMAINS: ExecutiveDomain[] = [
    {
      id: "governance",
      title: "Governance & Board",
      shortName: "Governance",
      icon: Building2,
      accentColor: "#D4AF37",
      allowedRoles: ["SUPER_ADMIN", "PRINCIPAL", "ACCOUNTS"],
      items: [
        { name: "Executive Command Desk", href: "/admin/dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "PRINCIPAL", "ACCOUNTS"] },
        { name: "Trust Board & MIS Intelligence", href: "/admin/trust", icon: Award, roles: ["SUPER_ADMIN", "PRINCIPAL", "ACCOUNTS"] },
        { name: "Enterprise Audit Vault", href: "/admin/audit-logs", icon: ShieldAlert, badge: "ISO & DPDP", roles: ["SUPER_ADMIN", "ACCOUNTS"] },
        { name: "Statutory Board Exporter", href: "/admin/reports/compliance", icon: Award, badge: "CBSE & U-DISE", roles: ["SUPER_ADMIN", "PRINCIPAL"] },
        { name: "Security & IAM Data Vault", href: "/admin/iam", icon: KeyRound, roles: ["SUPER_ADMIN"] },
      ],
    },
    {
      id: "admissions",
      title: "Admissions & Student 360",
      shortName: "Admissions",
      icon: GraduationCap,
      accentColor: "#0284C7",
      allowedRoles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "ACCOUNTS", "PARENT"],
      items: [
        { name: "Admissions Command Suite", href: "/admin/admissions", icon: GraduationCap, badge: "Pipeline & CRM", roles: ["SUPER_ADMIN", "PRINCIPAL", "ACCOUNTS"] },
        { name: "Student & Family 360 Master", href: "/admin/students", icon: Users, badge: "Enrolled & TC", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "ACCOUNTS"] },
      ],
    },
    {
      id: "academics",
      title: "Academic LMS & Faculty",
      shortName: "Academics",
      icon: BookOpen,
      accentColor: "#059669",
      allowedRoles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER"],
      items: [
        { name: "Daily Attendance & Muster Hub", href: "/admin/attendance", icon: GraduationCap, badge: "Roll-Call", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER"] },
        { name: "Curriculum, Diary & Homework LMS", href: "/admin/curriculum", icon: BookOpen, badge: "LMS", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER"] },
        { name: "Timetable & Substitutions Hub", href: "/admin/timetable", icon: Clock, badge: "AI Solver", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER"] },
        { name: "Faculty Directory & Academic Calendar", href: "/admin/faculty", icon: Users, badge: "Staff", roles: ["SUPER_ADMIN", "PRINCIPAL"] },
      ],
    },
    {
      id: "exams",
      title: "Exams & Evaluation",
      shortName: "Exams",
      icon: Award,
      accentColor: "#D97706",
      allowedRoles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER"],
      items: [
        { name: "Examination & Gradebook Center", href: "/admin/exams", icon: Award, badge: "HPC & AI Studio", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER"] },
      ],
    },
    {
      id: "finance",
      title: "Finance & Treasury",
      shortName: "Finance",
      icon: IndianRupee,
      accentColor: "#C85A32",
      allowedRoles: ["SUPER_ADMIN", "PRINCIPAL", "ACCOUNTS", "PARENT"],
      items: [
        { name: "Student Fees & Collections Hub", href: "/admin/finance", icon: IndianRupee, badge: "POS & Ledger", roles: ["SUPER_ADMIN", "ACCOUNTS"] },
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
      allowedRoles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER"],
      items: [
        { name: "Smart Fleet Telematics & Transport", href: "/admin/transport", icon: Bus, badge: "GPS Radar", roles: ["SUPER_ADMIN", "PRINCIPAL"] },
        { name: "Campus Security & Gate Pass Hub", href: "/admin/visitors", icon: ShieldCheck, badge: "Gate & CCTV", roles: ["SUPER_ADMIN", "PRINCIPAL"] },
        { name: "Student Wellness, Clinic & POCSO", href: "/admin/health", icon: HeartPulse, badge: "Infirmary", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER"] },
        { name: "Digital Library & Knowledge Media", href: "/admin/library", icon: Library, badge: "Catalog", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER"] },
      ],
    },
    {
      id: "community",
      title: "Parent Community",
      shortName: "Community",
      icon: MessageSquare,
      accentColor: "#7C3AED",
      allowedRoles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "PARENT"],
      items: [
        { name: "Omnichannel Comms & WhatsApp Hub", href: "/admin/communications", icon: MessageSquare, badge: "AI & WhatsApp", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER"] },
        { name: "Parent Engagement & Grievance Hub", href: "/admin/parent-care", icon: HeartHandshake, badge: "PTM & SLA", roles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "PARENT"] },
        { name: "Public Website CMS & Portal Hub", href: "/admin/cms", icon: Globe, badge: "Newsroom", roles: ["SUPER_ADMIN", "PRINCIPAL"] },
      ],
    },
  ];

  // Filter accessible domains for active role
  const accessibleDomains = EXECUTIVE_DOMAINS.filter(domain => domain.allowedRoles.includes(currentRole));

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      await clearServerAuthSession();
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
          title="Crayon Box School — Executive Dashboard"
        >
          <div className="w-10 h-10 rounded-xl bg-white p-1 border border-[#D4AF37]/50 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition">
            <img
              src="/trust-logo.png"
              alt="Vaani Educational Trust"
              className="w-full h-full object-contain"
              onError={(e) => { e.currentTarget.src = "/logo.png"; }}
            />
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs sm:text-sm font-black text-[#2D2319] truncate tracking-tight">
                  Crayon Box
                </h1>
                <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-[#D97706]/15 text-[#92400E] border border-[#D97706]/30 uppercase">
                  {activeCampusCode}
                </span>
              </div>
              <p className="text-[10px] text-stone-500 font-semibold truncate">
                CBSE Enterprise Portal
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
          const visibleItems = domain.items.filter(item => !item.roles || item.roles.includes(currentRole));
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
        {/* Dual-Role Switcher (Faculty / Parent Mode) */}
        {!isCollapsed ? (
          <button
            onClick={() => {
              const nextRole = currentRole === "TEACHER" || currentRole === "SUPER_ADMIN" ? "PARENT" : "TEACHER";
              localStorage.setItem("cbs_active_role", nextRole);
              window.location.href = nextRole === "PARENT" ? "/parent/live-stream" : "/admin/dashboard";
            }}
            title={`Switch to ${currentRole === "PARENT" ? "Faculty Mode" : "Parent Mode"}`}
            className="w-full py-1.5 px-2.5 rounded-xl bg-white hover:bg-stone-50 border border-[#E8DFC8] text-[#92400E] font-bold text-xs flex items-center justify-between transition shadow-2xs cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
              <span>{currentRole === "PARENT" ? "Parent View" : "Faculty Desk"}</span>
            </div>
            <span className="text-[9px] uppercase font-black tracking-wider bg-[#D97706]/10 px-1.5 py-0.5 rounded text-[#92400E]">
              Switch
            </span>
          </button>
        ) : (
          <button
            onClick={() => {
              const nextRole = currentRole === "TEACHER" || currentRole === "SUPER_ADMIN" ? "PARENT" : "TEACHER";
              localStorage.setItem("cbs_active_role", nextRole);
              window.location.href = nextRole === "PARENT" ? "/parent/live-stream" : "/admin/dashboard";
            }}
            title={`Switch to ${currentRole === "PARENT" ? "Faculty Mode" : "Parent Mode"}`}
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
                NT
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-900 truncate leading-tight">Nitin Tyagi</p>
                <p className="text-[9px] text-stone-500 font-semibold truncate leading-tight uppercase tracking-wider">{currentRole}</p>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-7 h-7 rounded-full bg-[#D97706]/20 text-[#92400E] flex items-center justify-center font-bold text-xs shrink-0 border border-[#D97706]/30">
                NT
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
