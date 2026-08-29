"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  Shuffle,
  BookOpen,
  Clock,
  FileText,
  Calendar,
  DollarSign,
  Receipt,
  Layers,
  Package,
  Bus,
  ShieldAlert,
  HeartPulse,
  Library,
  Video,
  ShieldCheck,
  AlertOctagon,
  PhoneCall,
  LifeBuoy,
  QrCode,
  Globe,
  KeyRound,
  Database,
  BarChart3,
  Award,
  LogOut,
  X
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { clearServerAuthSession } from '@/app/actions/auth';

interface SidebarNavProps {
  currentRole?: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function SidebarNav({ currentRole = 'SUPER_ADMIN', isMobileOpen = false, onCloseMobile }: SidebarNavProps) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      await clearServerAuthSession();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      window.location.href = '/login';
    }
  };

  const allGroups = [
    {
      group: 'Governance & Overview',
      allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS', 'TEACHER', 'PARENT'],
      items: [
        { name: 'Unified Command Desk', href: '/admin/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS'] },
        { name: 'Multi-Campus Matrix', href: '/admin/institutions', icon: Building2, roles: ['SUPER_ADMIN'] },
        { name: 'Trust Master Governance', href: '/admin/trust', icon: Award, roles: ['SUPER_ADMIN', 'PRINCIPAL'] },
        { name: 'Governance MIS Analytics', href: '/admin/reports/governance', icon: BarChart3, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS'] },
      ],
    },
    {
      group: 'Students & Admissions',
      allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTS', 'PARENT'],
      items: [
        { name: 'Student Roster Directory', href: '/admin/students', icon: Users, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTS'] },
        { name: 'Admissions Pipeline (CRM)', href: '/admin/admissions', icon: GraduationCap, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS'] },
        { name: 'Family 360° Household Master', href: '/admin/families', icon: Users, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS', 'PARENT'] },
      ],
    },
    {
      group: 'Academic Operations',
      allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'],
      items: [
        { name: 'Faculty Staff Directory', href: '/admin/faculty', icon: Users, roles: ['SUPER_ADMIN', 'PRINCIPAL'] },
        { name: 'Daily Student Attendance', href: '/admin/attendance', icon: GraduationCap, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'Teacher Substitutions Engine', href: '/admin/faculty/substitutions', icon: Shuffle, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'Curriculum & Syllabus', href: '/admin/curriculum', icon: BookOpen, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'Teacher Lesson Diary', href: '/admin/lesson-diary', icon: BookOpen, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'Master Timetable', href: '/admin/timetable', icon: Clock, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'Exams & Moderation', href: '/admin/exams', icon: FileText, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'Academic Calendar & Events', href: '/admin/calendar', icon: Calendar, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
      ],
    },
    {
      group: 'Finance & Procurement',
      allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS'],
      items: [
        { name: 'Executive Finance & GL', href: '/admin/finance', icon: DollarSign, roles: ['SUPER_ADMIN', 'ACCOUNTS'] },
        { name: 'Fee Collections & Invoices', href: '/admin/finance/collections', icon: Receipt, roles: ['SUPER_ADMIN', 'ACCOUNTS'] },
        { name: 'Fee Structure & Concessions', href: '/admin/finance/structure', icon: Layers, roles: ['SUPER_ADMIN', 'ACCOUNTS'] },
        { name: 'HR & Statutory Payroll', href: '/admin/hr/payroll', icon: Users, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS'] },
        { name: 'Spend & Procurement', href: '/admin/procurement', icon: Package, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS'] },
        { name: 'Fixed Asset Inventory', href: '/admin/inventory', icon: Package, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS'] },
      ],
    },
    {
      group: 'Campus Logistics & Safety',
      allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'],
      items: [
        { name: 'Transport Fleet Radar', href: '/admin/transport', icon: Bus, roles: ['SUPER_ADMIN', 'PRINCIPAL'] },
        { name: 'Child Safeguarding', href: '/admin/incidents', icon: ShieldAlert, roles: ['SUPER_ADMIN', 'PRINCIPAL'] },
        { name: 'Health Clinic Infirmary', href: '/admin/health', icon: HeartPulse, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'Digital Library Master', href: '/admin/library', icon: Library, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'Live CCTV Security Stream', href: '/admin/live-stream', icon: Video, roles: ['SUPER_ADMIN', 'PRINCIPAL'] },
        { name: 'Visitor Gate Pass', href: '/admin/visitors', icon: ShieldCheck, roles: ['SUPER_ADMIN', 'PRINCIPAL'] },
        { name: 'Emergency Red Broadcast', href: '/admin/emergency', icon: AlertOctagon, roles: ['SUPER_ADMIN', 'PRINCIPAL'] },
      ],
    },
    {
      group: 'Parent & Community Services',
      allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT'],
      items: [
        { name: 'Broadcasts & Circulars', href: '/admin/campaigns', icon: PhoneCall, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT'] },
        { name: 'Digital Parent Consent', href: '/admin/consent', icon: FileText, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'PARENT'] },
        { name: 'PTM Slot Booking', href: '/admin/ptm', icon: Calendar, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT'] },
        { name: 'Parent Grievance Desk', href: '/admin/grievances', icon: LifeBuoy, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'PARENT'] },
        { name: 'Early Departure Passes', href: '/admin/early-departure', icon: QrCode, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'PARENT'] },
        { name: 'Website CMS & News', href: '/admin/cms', icon: Globe, roles: ['SUPER_ADMIN', 'PRINCIPAL'] },
      ],
    },
    {
      group: 'System & Security',
      allowedRoles: ['SUPER_ADMIN'],
      items: [
        { name: 'Identity & Access (IAM)', href: '/admin/iam', icon: KeyRound, roles: ['SUPER_ADMIN'] },
        { name: 'Data Quality & Integrity', href: '/admin/data-quality', icon: Database, roles: ['SUPER_ADMIN'] },
      ],
    },
  ];

  const filteredGroups = allGroups
    .filter((g) => g.allowedRoles.includes(currentRole))
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => !i.roles || i.roles.includes(currentRole)),
    }))
    .filter((g) => g.items.length > 0);

  const roleLabelMap: Record<string, string> = {
    SUPER_ADMIN: 'Super Administrator',
    PRINCIPAL: 'Principal / Head',
    TEACHER: 'Classroom Teacher',
    ACCOUNTS: 'Accounts Officer',
    PARENT: 'Parent / Guardian',
  };

  const sidebarContent = (
    <aside className="w-72 bg-[#0A1A44] text-white flex flex-col h-full shrink-0 font-sans shadow-2xl rounded-r-3xl z-40">
      
      {/* Top Sidebar Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 p-1 flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-xs font-black tracking-tight text-white block">ERP CONSOLE</span>
            <span className="text-[10px] text-white/50 block font-semibold">Crayon Box School</span>
          </div>
        </div>
        
        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
        {filteredGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">
              {group.group}
            </h4>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => { if (onCloseMobile) onCloseMobile(); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-white text-[#0A1A44] shadow-md font-bold'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0A1A44]' : 'text-white/70 group-hover:text-white'}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom User Area: Persona + Logout */}
      <div className="p-3 border-t border-white/10 bg-transparent space-y-2">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-white/10 border border-white/10">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div className="overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 block">
              Active Persona
            </span>
            <span className="text-xs font-bold text-white truncate block">
              {roleLabelMap[currentRole] || currentRole}
            </span>
          </div>
        </div>

        {/* Sidebar Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-rose-100 border border-rose-500/30 text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>{isLoggingOut ? 'Signing out...' : 'Sign Out / Logout'}</span>
        </button>
      </div>

    </aside>
  );

  return (
    <>
      {/* Desktop Static Sidebar */}
      <div className="hidden lg:flex h-full">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Slide-over */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer content */}
          <div className="relative z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
