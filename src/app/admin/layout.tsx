"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserCheck, Search, Bell, Settings, FileSearch, Building2, LifeBuoy, CreditCard, Bus, Package, HeartPulse, Brain, FileBarChart, PhoneCall, LayoutTemplate, GraduationCap, FileText, ImageIcon, BarChart3, MapPin, QrCode, Clock, BookOpen, Radio, Calendar, Briefcase, Receipt, ShieldAlert, ShieldCheck, FileSpreadsheet, Link2, KeyRound } from "lucide-react";
import { CampusProvider, useCampusContext } from "@/components/providers/CampusProvider";

const NAV_ITEMS = [
  { name: "🏛️ Trust HQ Command", href: "/admin/trust", icon: Building2 },
  { name: "Admissions CRM", href: "/admin/admissions/crm", icon: PhoneCall },
  { name: "Daily Operations", href: "/admin/operations", icon: LayoutDashboard },
  { name: "Students Master", href: "/admin/students", icon: Users },
  { name: "Student 360° Dossier", href: "/admin/students/std-001", icon: Users },
  { name: "Family 360°", href: "/admin/families/fam-012", icon: Users },
  { name: "Classes & Rooms", href: "/admin/classes", icon: GraduationCap },
  { name: "Inter-Institution Transfers", href: "/admin/transfers", icon: Link2 },
  { name: "Curriculum Radar", href: "/admin/curriculum", icon: BookOpen },
  { name: "Teacher Lesson Diary", href: "/admin/lesson-diary", icon: BookOpen },
  { name: "Master Timetable", href: "/admin/timetable", icon: Clock },
  { name: "Exams & Moderation", href: "/admin/exams", icon: FileText },
  { name: "Executive Finance & GL", href: "/admin/finance", icon: CreditCard },
  { name: "Procurement & Budgets", href: "/admin/procurement", icon: Package },
  { name: "HR & Statutory Payroll", href: "/admin/hr", icon: Users },
  { name: "Transport Fleet Radar", href: "/admin/transport", icon: Bus },
  { name: "Safeguarding & POCSO", href: "/admin/incidents", icon: ShieldAlert },
  { name: "Health Clinic", href: "/admin/health", icon: HeartPulse },
  { name: "Asset & Stock Inventory", href: "/admin/inventory", icon: Package },
  { name: "Visitor & Gate Pass", href: "/admin/visitors", icon: ShieldCheck },
  { name: "Safety & Maintenance", href: "/admin/safety", icon: ShieldCheck },
  { name: "Broadcasts & Circulars", href: "/admin/campaigns", icon: PhoneCall },
  { name: "Digital Parent Consent", href: "/admin/consent", icon: FileText },
  { name: "PTM Slot Scheduling", href: "/admin/ptm", icon: Calendar },
  { name: "Parent Grievance Desk", href: "/admin/grievances", icon: LifeBuoy },
  { name: "Early Departure Passes", href: "/admin/early-departure", icon: QrCode },
  { name: "Classroom Live CCTV", href: "/admin/live-stream", icon: Radio },
  { name: "Library & Media", href: "/admin/library", icon: BookOpen },
  { name: "Data Quality Scanner", href: "/admin/data-quality", icon: ShieldCheck },
  { name: "🚨 Emergency Mode", href: "/admin/emergency", icon: ShieldAlert },
  { name: "Dynamic BI Reports", href: "/admin/reports", icon: FileBarChart },
  { name: "Identity & Access (IAM)", href: "/admin/iam", icon: KeyRound },
  { name: "Master Data Hub", href: "/admin/master-data", icon: Link2 },
];

import { useState } from "react";
import GlobalSearchModal from "@/components/layout/GlobalSearchModal";
import TrustScopeSelector from "@/components/layout/TrustScopeSelector";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-800">
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full shrink-0">
        <div className="p-5 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-md shrink-0 flex items-center justify-center overflow-hidden">
            <Image src="/logo.png" alt="Crayon Box Logo" width={40} height={40} className="object-contain" priority />
          </div>
          <div>
            <span className="font-black text-white tracking-wider uppercase text-xs block">Vani Trust ERP</span>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block">Multi-Institution</span>
          </div>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white cursor-pointer transition-colors">
            <Settings className="w-4 h-4" /> System Settings
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        
        {/* Global Top Bar */}
        <header className="bg-white border-b border-slate-200 h-16 shrink-0 flex items-center justify-between px-6 z-10 shadow-sm">
          
          <div className="flex items-center gap-4">
            {/* Multi-Institution Scope Selector */}
            <TrustScopeSelector />

            {/* Global Search Button (Cmd + K) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 w-64 text-slate-400 text-xs font-medium text-left transition"
            >
              <Search className="w-4 h-4 text-blue-600" />
              <span className="flex-1 text-slate-600 font-semibold truncate">Search records (⌘K)...</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/emergency"
              className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-black text-xs rounded-xl border border-rose-200 flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              Emergency Mode
            </Link>
            <div className="w-8 h-8 bg-indigo-600 text-white font-black rounded-full flex items-center justify-center text-xs shadow-xs">
              VT
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {children}
        </div>
      </main>

    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <CampusProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </CampusProvider>
  );
}
