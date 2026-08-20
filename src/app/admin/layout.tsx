"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserCheck, Search, Bell, Settings, FileSearch, Building2, LifeBuoy, CreditCard, Bus, Package, HeartPulse, Brain, FileBarChart, PhoneCall, LayoutTemplate, GraduationCap, FileText, ImageIcon, BarChart3, MapPin, QrCode, Clock, BookOpen } from "lucide-react";
import { CampusProvider, useCampusContext } from "@/components/providers/CampusProvider";

const NAV_ITEMS = [
  { name: "Global Command", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Syllabus & Curriculum", href: "/admin/syllabus", icon: BookOpen },
  { name: "Website CMS", href: "/admin/cms", icon: LayoutTemplate },
  { name: 'Faculty & Mentors', href: '/admin/faculty', icon: Users },
  { name: 'Staff Attendance', href: '/admin/attendance', icon: MapPin },
  { name: "Master SIS", href: "/admin/students", icon: Users },
  { name: "Student Attendance", href: "/admin/students/attendance", icon: QrCode },
  { name: "ID & Escort Cards", href: "/admin/id-cards", icon: CreditCard },
  { name: "Classes & Sections", href: "/admin/classes", icon: GraduationCap },
  { name: "Master Timetable", href: "/admin/timetable", icon: Clock },
  { name: 'News & Events', href: '/admin/news', icon: FileText },
  { name: 'Alumni', href: '/admin/alumni', icon: GraduationCap },
  { name: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: "Enquiry CRM", href: "/admin/enquiries", icon: PhoneCall },
  { name: "HR Command Center", href: "/admin/hr", icon: Users },
  { name: "Health Clinic", href: "/admin/health", icon: HeartPulse },
  { name: "Smart Inventory", href: "/admin/inventory", icon: Package },
  { name: "Live Transport", href: "/admin/transport", icon: Bus },
  { name: "Fee Management", href: "/admin/finance", icon: CreditCard },
  { name: "Dynamic Reports", href: "/admin/reports", icon: FileBarChart },
  { name: "Helpdesk Triage", href: "/admin/helpdesk", icon: LifeBuoy },
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { campuses, activeCampusId, setActiveCampusId } = useCampusContext();

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-800">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full shrink-0">
        <div className="p-5 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-md shrink-0 flex items-center justify-center overflow-hidden">
            <Image src="/logo.png" alt="Crayon Box Logo" width={40} height={40} className="object-contain" priority />
          </div>
          <div>
            <span className="font-black text-white tracking-wider uppercase text-xs block">Crayon Box</span>
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest block">Super Admin</span>
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
          
          <div className="flex items-center gap-6">
            {/* Campus Switcher Removed per user request */}

            {/* Global Search (Command Palette Simulation) */}
            <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 w-64 text-slate-400 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
              <Search className="w-4 h-4" />
              <input type="text" placeholder="Search students, IDs..." className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm w-full text-slate-800" />
              <div className="bg-slate-200 text-[10px] font-bold px-1.5 py-0.5 rounded text-slate-500 flex gap-0.5">
                <span>⌘</span><span>K</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="w-8 h-8 bg-blue-100 text-blue-700 font-bold rounded-full flex items-center justify-center border border-blue-200 text-sm">
               JS
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
