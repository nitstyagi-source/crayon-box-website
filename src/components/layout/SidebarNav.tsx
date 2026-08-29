"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Building2, Users, GraduationCap, PhoneCall,
  Link2, BookOpen, Clock, FileText, CreditCard, Package,
  Bus, ShieldAlert, HeartPulse, ShieldCheck, Calendar,
  LifeBuoy, QrCode, FileBarChart, Radio, KeyRound, CheckSquare, Sparkles,
  UserCheck, ScanLine, Compass, Video, Library, AlertOctagon,
  Shuffle, Award, Globe, Database, Receipt, Layers, DollarSign
} from 'lucide-react';

export interface SidebarNavProps {
  currentRole: string; // 'SUPER_ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'ACCOUNTS' | 'PARENT'
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

interface NavGroup {
  group: string;
  allowedRoles: string[];
  items: NavItem[];
}

export function SidebarNav({ currentRole }: SidebarNavProps) {
  const pathname = usePathname();

  // Comprehensive V1 + V2 Menu Structure
  const allGroups: NavGroup[] = [
    {
      group: 'Overview & Governance',
      allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS'],
      items: [
        { name: '🏛️ Command Center', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: '⚖️ Executive Approvals', href: '/admin/approvals', icon: ShieldCheck },
        { name: 'Institutional Analytics', href: '/admin/analytics', icon: FileBarChart },
        { name: 'Master Data Quality (100%)', href: '/admin/data-quality', icon: Database },
      ],
    },
    {
      group: 'Master Data & Identity',
      allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTS', 'PARENT'],
      items: [
        { name: 'Students Master Directory', href: '/admin/students', icon: Users, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTS', 'PARENT'] },
        { name: 'Faculty & Staff Master', href: '/admin/hr', icon: UserCheck, roles: ['SUPER_ADMIN', 'PRINCIPAL'] },
        { name: 'Family 360° Household Master', href: '/admin/families', icon: Users, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS', 'PARENT'] },
        { name: '🪪 ID & Escort Card Hub', href: '/admin/id-cards', icon: CreditCard, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'Classes & Sections', href: '/admin/classes', icon: GraduationCap, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'Inter-School Transfers', href: '/admin/transfers', icon: Link2, roles: ['SUPER_ADMIN', 'PRINCIPAL'] },
        { name: 'Alumni Engagement Network', href: '/admin/alumni', icon: Award, roles: ['SUPER_ADMIN', 'PRINCIPAL'] },
      ],
    },
    {
      group: 'Admissions & Academics',
      allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'],
      items: [
        { name: 'Admissions CRM & Pipeline', href: '/admin/admissions/crm', icon: PhoneCall, roles: ['SUPER_ADMIN', 'PRINCIPAL'] },
        { name: 'Teacher Geofence Attendance', href: '/admin/attendance/teachers', icon: Compass, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'QR Gate Attendance Scanner', href: '/admin/gate-scanner', icon: ScanLine, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
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

  // Filter groups and items by active role
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

  return (
    <aside className="w-64 w-64 bg-[#0A1A44] text-white flex flex-col h-full shrink-0 font-sans shadow-xl rounded-r-3xl z-20">
      
      {/* Top Sidebar Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-white/60">
          Navigation
        </span>
        <span className="px-2 py-0.5 rounded-md bg-white/10 text-white text-[10px] font-bold border border-transparent">
          v2.0 Active
        </span>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
        {filteredGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-white/60 mb-2">
              {group.group}
            </h4>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-white text-[#0A1A44] text-[#0A1A44] shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#0A1A44]' : 'text-white/60 group-hover:text-white'}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Role Persona Indicator */}
      <div className="p-3 border-t border-white/10 bg-transparent">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-white/10 border border-white/10">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div className="overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 block">
              Active Persona
            </span>
            <span className="text-xs font-bold text-white truncate block">
              {roleLabelMap[currentRole] || currentRole}
            </span>
          </div>
        </div>
      </div>

    </aside>
  );
}
