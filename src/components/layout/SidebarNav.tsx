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
  MessageSquare,
  Sparkles,
  CreditCard,
  LogOut,
  X
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { clearServerAuthSession } from '@/app/actions/auth';
import { useInstitution } from '@/components/providers/InstitutionContext';

interface SidebarNavProps {
  currentRole?: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function SidebarNav({ currentRole = 'SUPER_ADMIN', isMobileOpen = false, onCloseMobile }: SidebarNavProps) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();

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

  const activeSchoolName = isAllInstitutions 
    ? 'Trust HQ (All Campuses)' 
    : (selectedInstitutionObj?.name || 'Crayon Box School');
    
  const activeLogo = selectedInstitutionObj?.logoUrl || '/logo.png';
  const activeBrandColor = selectedInstitutionObj?.brandColor || '#2563eb';

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
        { name: 'Enquiries & CRM', href: '/admin/enquiries', icon: PhoneCall, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS'] },
        { name: 'Admissions Analytics', href: '/admin/admissions/analytics', icon: BarChart3, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS'] },
        { name: 'Admissions Desk', href: '/admin/admissions', icon: GraduationCap, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS'] },
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
        { name: 'Smart Timetable Solver', href: '/admin/timetable/smart-builder', icon: Clock, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'Master Timetable', href: '/admin/timetable', icon: Clock, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'Exams & Moderation', href: '/admin/exams', icon: FileText, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'AI Question Paper Studio', href: '/admin/exams/question-paper-generator', icon: Sparkles, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'CBSE Report Cards (HPC)', href: '/admin/exams/report-cards', icon: Award, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'Academic Calendar & Events', href: '/admin/calendar', icon: Calendar, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
      ],
    },
    {
      group: 'Finance & Procurement',
      allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS', 'PARENT'],
      items: [
        { name: 'Executive Finance & GL', href: '/admin/finance', icon: DollarSign, roles: ['SUPER_ADMIN', 'ACCOUNTS'] },
        { name: 'Sibling Fee Cart (UPI)', href: '/fees/pay', icon: CreditCard, roles: ['SUPER_ADMIN', 'ACCOUNTS', 'PARENT'] },
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
        { name: 'Live GPS Fleet Radar', href: '/admin/transport/radar', icon: Bus, roles: ['SUPER_ADMIN', 'PRINCIPAL'] },
        { name: 'Transport Fleet Roster', href: '/admin/transport', icon: Bus, roles: ['SUPER_ADMIN', 'PRINCIPAL'] },
        { name: 'Digital Gate Pass (OTP)', href: '/admin/visitors/gate-pass', icon: ShieldCheck, roles: ['SUPER_ADMIN', 'PRINCIPAL'] },
        { name: 'Library Barcode POS', href: '/admin/library/circulation', icon: Library, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'Child Safeguarding', href: '/admin/incidents', icon: ShieldAlert, roles: ['SUPER_ADMIN', 'PRINCIPAL'] },
        { name: 'Health Clinic Infirmary', href: '/admin/health', icon: HeartPulse, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'Digital Library Master', href: '/admin/library', icon: Library, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'Live CCTV Security Stream', href: '/admin/live-stream', icon: Video, roles: ['SUPER_ADMIN', 'PRINCIPAL'] },
        { name: 'Emergency Red Broadcast', href: '/admin/emergency', icon: AlertOctagon, roles: ['SUPER_ADMIN', 'PRINCIPAL'] },
      ],
    },
    {
      group: 'Parent & Community Services',
      allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT'],
      items: [
        { name: 'WhatsApp Bot & Alerts', href: '/admin/communications/whatsapp', icon: MessageSquare, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
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
    <aside className="w-24 bg-[#0A1A44] text-white flex flex-col h-full shrink-0 font-sans shadow-2xl rounded-r-2xl z-40 border-r border-white/10">
      
      {/* Top Sidebar Header: Emblem on Top, Campus Badge Below */}
      <div className="py-3 px-1.5 border-b border-white/10 flex flex-col items-center justify-center text-center">
        <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-md mb-1 border"
             style={{ borderColor: activeBrandColor }}>
          <img 
            src={activeLogo} 
            alt="School Logo" 
            className="w-full h-full object-contain" 
            onError={(e) => { e.currentTarget.src = '/logo.png'; }}
          />
        </div>
        <span className="text-[9px] font-black text-white tracking-wider uppercase block truncate max-w-full px-1">
          {isAllInstitutions ? 'TRUST HQ' : (selectedInstitutionObj?.code || 'CAMPUS')}
        </span>
        
        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden mt-2 p-1 rounded-md bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Nav List: Icon on Top, Name Below */}
      <div className="flex-1 overflow-y-auto px-1.5 py-3 space-y-4 custom-scrollbar">
        {filteredGroups.map((group, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-center px-1">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/40 text-center border-b border-white/10 pb-0.5 w-full">
                {group.group.split(' ')[0]}
              </span>
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => { if (onCloseMobile) onCloseMobile(); }}
                    title={item.name}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition group ${
                      isActive
                        ? 'bg-white text-[#0A1A44] shadow-md'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 transition ${
                      isActive 
                        ? 'bg-[#0A1A44] text-white shadow-xs' 
                        : 'bg-white/10 text-white group-hover:bg-white/20 group-hover:scale-105'
                    }`}>
                      <Icon className="w-4 h-4 shrink-0" />
                    </div>
                    <span className={`text-[9px] font-black leading-tight text-center px-0.5 ${isActive ? 'text-[#0A1A44]' : 'text-white/80 group-hover:text-white'}`}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom User Area: Icon on Top, Persona & Sign Out */}
      <div className="p-1.5 border-t border-white/10 bg-transparent space-y-1.5 flex flex-col items-center">
        <div className="w-full flex flex-col items-center justify-center py-1.5 px-1 rounded-xl bg-white/10 border border-white/10 text-center">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mb-0.5" />
          <span className="text-[8px] font-extrabold uppercase tracking-wider text-white/50 block">
            ROLE
          </span>
          <span className="text-[9px] font-black text-white truncate max-w-full block">
            {currentRole.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Sidebar Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          title="Sign Out of ERP"
          className="w-full flex flex-col items-center justify-center py-1.5 px-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-rose-100 border border-rose-500/30 text-[9px] font-black transition shadow-xs cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400 mb-0.5" />
          <span>{isLoggingOut ? '...' : 'Sign Out'}</span>
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
