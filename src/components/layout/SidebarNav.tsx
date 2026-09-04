"use client";

import React, { useState, useEffect } from 'react';
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
  IndianRupee,
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
  Gamepad2,
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

interface NavSubItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  roles?: string[];
}

interface ExecutiveHub {
  id: string;
  title: string;
  shortName: string;
  subtitle: string;
  icon: any;
  accentColor: string;
  allowedRoles: string[];
  items: NavSubItem[];
}

export function SidebarNav({ currentRole = 'SUPER_ADMIN', isMobileOpen = false, onCloseMobile }: SidebarNavProps) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { selectedInstitutionObj, isAllInstitutions } = useInstitution();

  // The 7 Reconfigured Executive Hubs (Consolidating all 41+ modules)
  const EXECUTIVE_HUBS: ExecutiveHub[] = [
    {
      id: 'governance',
      title: 'Governance',
      shortName: 'Governance',
      subtitle: 'Board & Trust HQ',
      icon: Building2,
      accentColor: '#D4AF37',
      allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS'],
      items: [
        { name: 'Executive Command Desk', href: '/admin/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS'] },
        { name: 'Trust Board & MIS Intelligence', href: '/admin/trust', icon: Award, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS'] },
        { name: 'Security & Data Vault', href: '/admin/iam', icon: KeyRound, roles: ['SUPER_ADMIN'] },
      ],
    },
    {
      id: 'admissions',
      title: 'Admissions & Student Lifecycle',
      shortName: 'Admissions',
      subtitle: 'Intake & Student 360',
      icon: GraduationCap,
      accentColor: '#38BDF8',
      allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTS', 'PARENT'],
      items: [
        { name: 'Admissions Command Suite', href: '/admin/admissions', icon: GraduationCap, badge: 'Pipeline & CRM', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS'] },
        { name: 'Student & Family 360 Master', href: '/admin/students', icon: Users, badge: 'Enrolled & TC', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTS'] },
      ],
    },
    {
      id: 'academics',
      title: 'Academic LMS',
      shortName: 'Academics',
      subtitle: 'Classes & Learning',
      icon: BookOpen,
      accentColor: '#10B981',
      allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'],
      items: [
        { name: 'Daily Attendance & Muster Hub', href: '/admin/attendance', icon: GraduationCap, badge: 'Live Roll-Call', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'Curriculum, Lesson Diary & Homework LMS', href: '/admin/curriculum', icon: BookOpen, badge: 'LMS & Diary', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'Timetable, Solver & Substitutions Hub', href: '/admin/timetable', icon: Clock, badge: 'AI Solver', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'Faculty Directory & Academic Calendar', href: '/admin/faculty', icon: Users, badge: 'Staff & Calendar', roles: ['SUPER_ADMIN', 'PRINCIPAL'] },
      ],
    },
    {
      id: 'exams',
      title: 'Exams & Evaluation',
      shortName: 'Exams',
      subtitle: 'Assessments & HPC',
      icon: Award,
      accentColor: '#EAB308',
      allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'],
      items: [
        { name: 'Examination Command Center & Gradebook', href: '/admin/exams', icon: Award, badge: 'HPC & AI Studio', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
      ],
    },
    {
      id: 'finance',
      title: 'Finance & Treasury',
      shortName: 'Finance',
      subtitle: 'Fees, Payroll & POs',
      icon: IndianRupee,
      accentColor: '#C85A32',
      allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS', 'PARENT'],
      items: [
        { name: 'Student Fees, Collections & Ledger Hub', href: '/admin/finance', icon: IndianRupee, badge: 'Collections & POS', roles: ['SUPER_ADMIN', 'ACCOUNTS'] },
        { name: 'HR, Statutory Payroll & Disbursals Hub', href: '/admin/hr/payroll', icon: Users, badge: 'EPF & NEFT Payout', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS'] },
        { name: 'Procurement, Vouchers & Asset Inventory Hub', href: '/admin/procurement', icon: Package, badge: 'CapEx & PO Studio', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTS'] },
      ],
    },
    {
      id: 'logistics',
      title: 'Logistics & Safety',
      shortName: 'Logistics',
      subtitle: 'Fleet, Gate & Health',
      icon: Bus,
      accentColor: '#F59E0B',
      allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'],
      items: [
        { name: 'Smart Fleet Telematics & Transport Hub', href: '/admin/transport', icon: Bus, badge: 'GPS Radar & Roster', roles: ['SUPER_ADMIN', 'PRINCIPAL'] },
        { name: 'Campus Security, Gate Pass & CCTV Hub', href: '/admin/visitors', icon: ShieldCheck, badge: 'Gate & Video Wall', roles: ['SUPER_ADMIN', 'PRINCIPAL'] },
        { name: 'Student Wellness, Clinic & POCSO Hub', href: '/admin/health', icon: HeartPulse, badge: 'Infirmary & POCSO', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'Digital Library & Knowledge Media Hub', href: '/admin/library', icon: Library, badge: 'Catalog & Circulation', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
      ],
    },
    {
      id: 'community',
      title: 'Parent Community',
      shortName: 'Community',
      subtitle: 'Comms, PTM & Care',
      icon: MessageSquare,
      accentColor: '#8B5CF6',
      allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT'],
      items: [
        { name: 'AI Comms Studio', href: '/admin/communications/ai-writer', icon: Sparkles, badge: 'AI', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'WhatsApp Bot & Alerts', href: '/admin/communications/whatsapp', icon: MessageSquare, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'Broadcasts & Circulars', href: '/admin/campaigns', icon: PhoneCall, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT'] },
        { name: 'Digital Parent Consent', href: '/admin/consent', icon: FileText, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'PARENT'] },
        { name: 'PTM Slot Booking', href: '/admin/ptm', icon: Calendar, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT'] },
        { name: 'Parent Grievance Desk', href: '/admin/grievances', icon: LifeBuoy, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'PARENT'] },
        { name: 'Early Departure QR Passes', href: '/admin/early-departure', icon: QrCode, roles: ['SUPER_ADMIN', 'PRINCIPAL', 'PARENT'] },
        { name: 'Website CMS & News', href: '/admin/cms', icon: Globe, roles: ['SUPER_ADMIN', 'PRINCIPAL'] },
      ],
    },
  ];

  // Filter Hubs by active role
  const accessibleHubs = EXECUTIVE_HUBS.filter(hub => hub.allowedRoles.includes(currentRole));

  // Determine active Hub from current pathname
  const findActiveHubId = () => {
    for (const hub of accessibleHubs) {
      if (hub.items.some(item => pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href)))) {
        return hub.id;
      }
    }
    return accessibleHubs[0]?.id || 'governance';
  };

  const [activeHubId, setActiveHubId] = useState<string>(findActiveHubId());
  const [isTier2Open, setIsTier2Open] = useState<boolean>(false);
  const [isPinned, setIsPinned] = useState<boolean>(false);

  useEffect(() => {
    setActiveHubId(findActiveHubId());
  }, [pathname]);

  const activeHub = accessibleHubs.find(h => h.id === activeHubId) || accessibleHubs[0];

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

  const handleSubItemClick = () => {
    if (!isPinned) {
      setIsTier2Open(false);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const activeCampusCode = isAllInstitutions ? 'TRUST HQ' : (selectedInstitutionObj?.code || 'CAMPUS');

  const sidebarContent = (
    <div 
      className="relative flex h-full font-sans antialiased z-40"
      onMouseLeave={() => {
        if (!isPinned) {
          setIsTier2Open(false);
        }
      }}
    >
      
      {/* ========================================================================= */}
      {/* TIER 1: PRIMARY ICON RAIL (OPTION 6: WARM SANDALWOOD SATTVA-DIGITAL)      */}
      {/* ========================================================================= */}
      <aside className="w-20 bg-[#F7F2E9] text-[#2D2319] flex flex-col justify-between items-center py-4 px-1 shrink-0 z-50 shadow-sm border-r border-[#E8DFC8]">
        
        {/* Top Trust Emblem */}
        <div className="flex flex-col items-center gap-1">
          <Link href="/admin/dashboard" className="group" onClick={() => setIsTier2Open(false)}>
            <div className="w-11 h-11 rounded-2xl bg-white p-1.5 border border-[#D4AF37]/50 flex items-center justify-center shadow-xs group-hover:scale-105 transition">
              <img 
                src="/trust-logo.png" 
                alt="Vaani Educational Trust" 
                className="w-full h-full object-contain" 
                onError={(e) => { e.currentTarget.src = '/logo.png'; }} 
              />
            </div>
          </Link>
          <span className="text-[8px] font-black text-[#A16207] tracking-wider uppercase">
            {activeCampusCode}
          </span>
        </div>

        {/* The 7 Hub Icons with Names Below */}
        <div className="flex-1 flex flex-col justify-center gap-1.5 py-3">
          {accessibleHubs.map((hub) => {
            const Icon = hub.icon;
            const isSelected = activeHubId === hub.id;
            return (
              <button
                key={hub.id}
                onMouseEnter={() => {
                  setActiveHubId(hub.id);
                  setIsTier2Open(true);
                }}
                onClick={() => {
                  setActiveHubId(hub.id);
                  setIsTier2Open(prev => (activeHubId === hub.id ? !prev : true));
                }}
                title={`${hub.title} — ${hub.subtitle}`}
                className={`relative w-[72px] py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                  isSelected && isTier2Open
                    ? 'bg-[#E5D7BE] text-[#2D2319] shadow-sm border border-[#D5C4A3] scale-105 font-bold'
                    : isSelected
                    ? 'bg-[#EFE7D8] text-[#2D2319] border border-[#DDD0B7]'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-[#EFE7D8]/70'
                }`}
              >
                <Icon className="w-4 h-4 mb-1 shrink-0" />
                <span className="text-[8px] font-black uppercase tracking-tight text-center leading-tight truncate max-w-full px-0.5">
                  {hub.shortName}
                </span>
                {isSelected && (
                  <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-3.5 rounded-l-full bg-[#D97706]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Dual-Role Toggle & Sign Out */}
        <div className="flex flex-col items-center gap-2">
          {/* Dual-Role Switcher */}
          <button
            onClick={() => {
              const nextRole = currentRole === 'TEACHER' || currentRole === 'SUPER_ADMIN' ? 'PARENT' : 'TEACHER';
              localStorage.setItem('cbs_active_role', nextRole);
              window.location.href = nextRole === 'PARENT' ? '/parent/live-stream' : '/admin/dashboard';
            }}
            title={`Switch to ${currentRole === 'PARENT' ? 'Faculty Mode' : 'Parent Mode'}`}
            className="w-9 h-9 rounded-xl bg-[#EFE7D8] hover:bg-[#E5D7BE] border border-[#DDD0B7] text-[#A16207] flex items-center justify-center transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Sign Out"
            className="w-9 h-9 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </aside>

      {/* Backdrop for click-away when Tier 2 is open (and not pinned) */}
      {isTier2Open && !isPinned && (
        <div 
          className="fixed inset-0 z-30 bg-black/10 backdrop-blur-[1px] transition-opacity"
          onClick={() => setIsTier2Open(false)}
        />
      )}

      {/* ========================================================================= */}
      {/* TIER 2: DYNAMIC CONTEXTUAL SUB-DRAWER (APPEARS ON REACH, COLLAPSES ON SELECTION) */}
      {/* ========================================================================= */}
      <div 
        className={`absolute left-20 top-0 bottom-0 w-64 bg-[#FAF7F2] border-r border-[#EFE8DC] shadow-2xl z-40 flex flex-col justify-between py-4 px-3.5 transition-all duration-200 ease-out origin-left ${
          isTier2Open 
            ? 'translate-x-0 opacity-100 pointer-events-auto' 
            : '-translate-x-4 opacity-0 pointer-events-none'
        }`}
      >
        {activeHub && (
          <div className="space-y-3">
            
            {/* Hub Header */}
            <div className="px-1.5 pb-2.5 border-b border-[#E8DFD3]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black tracking-widest text-[#C85A32] uppercase">
                  Executive Hub
                </span>
                <div className="flex items-center gap-1">
                  {/* Pin / Unpin button */}
                  <button
                    onClick={() => setIsPinned(!isPinned)}
                    title={isPinned ? "Unpin Drawer (Auto-Collapse)" : "Pin Drawer Open"}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${
                      isPinned 
                        ? 'bg-[#0B1B30] text-white' 
                        : 'bg-stone-200/70 text-stone-600 hover:bg-stone-300'
                    }`}
                  >
                    {isPinned ? "Pinned" : "Pin"}
                  </button>
                  {/* Close button */}
                  <button
                    onClick={() => setIsTier2Open(false)}
                    className="p-1 rounded-md hover:bg-stone-200 text-stone-500 transition cursor-pointer"
                    title="Close Sub-menu"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h2 className="text-sm font-bold text-[#0B1B30] truncate mt-1">
                {activeHub.title}
              </h2>
              <p className="text-[11px] text-stone-500 truncate">
                {activeHub.subtitle}
              </p>
            </div>

            {/* Sub-Items List: Clicking any item instantly navigates & collapses the drawer */}
            <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar pr-1">
              {activeHub.items
                .filter(item => !item.roles || item.roles.includes(currentRole))
                .map((item) => {
                  const ItemIcon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleSubItemClick}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition group ${
                        isActive
                          ? 'bg-white text-[#0B1B30] font-bold shadow-xs border border-[#E8DFD3]'
                          : 'text-stone-600 hover:text-[#0B1B30] hover:bg-[#F2ECE1]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition ${
                          isActive
                            ? 'bg-[#0B1B30] text-white'
                            : 'bg-stone-200/60 text-stone-600 group-hover:bg-[#0B1B30] group-hover:text-white'
                        }`}>
                          <ItemIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">{item.name}</span>
                      </div>

                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-[#C85A32]/10 text-[#C85A32] border border-[#C85A32]/20">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
            </div>

          </div>
        )}

        {/* Quick Help & Hotline */}
        <div className="p-2.5 rounded-xl bg-white border border-[#EFE8DC] text-[11px] text-stone-500 space-y-0.5">
          <p className="font-bold text-[#0B1B30]">Front Desk Helpline</p>
          <p className="font-semibold text-[#C85A32]">+91 98111 02008</p>
        </div>

      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Dynamic 2-Tier Sidebar */}
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

