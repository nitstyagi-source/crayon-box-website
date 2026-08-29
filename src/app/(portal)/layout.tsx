"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, MessageSquare, Wallet, Bus, Bell, User, ChevronDown, Grid, Radio } from "lucide-react";
import { SiblingProvider, useSiblingContext } from "@/components/providers/SiblingProvider";
import { NotificationCenter } from "@/components/layout/NotificationCenter";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/family/dashboard", icon: LayoutDashboard },
  { name: "Live Classroom 🔴", href: "/family/live-stream", icon: Radio },
  { name: "Academics", href: "/family/academics", icon: BookOpen },
  { name: "Fees & Payments", href: "/family/fees", icon: Wallet },
  { name: "Communication", href: "/family/communication", icon: MessageSquare },
  { name: "App Hub", href: "/family/hub", icon: Grid },
];

function PortalLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { siblings, activeSibling, setActiveSiblingId } = useSiblingContext();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-full shadow-sm">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-serif font-bold text-lg">C</div>
          <span className="font-bold text-lg text-slate-800 tracking-tight">Family Portal</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-blue-50 text-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 shrink-0 flex items-center justify-between px-4 md:px-8 z-10 shadow-sm">
          {/* Mobile Brand (visible only on mobile) */}
          <div className="md:hidden font-bold text-lg text-slate-800">
            Crayon Box
          </div>

          {/* Sibling Switcher Context */}
          <div className="hidden md:flex items-center gap-4 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Viewing:</span>
            <div className="flex items-center gap-2">
              <img src={activeSibling?.avatar} alt="Avatar" className="w-6 h-6 rounded-full" />
              <select 
                className="bg-transparent border-none text-sm font-bold text-slate-800 focus:outline-none focus:ring-0 cursor-pointer appearance-none pr-4"
                value={activeSibling?.id}
                onChange={(e) => setActiveSiblingId(e.target.value)}
              >
                {siblings.map(sib => (
                  <option key={sib.id} value={sib.id}>{sib.firstName} ({sib.grade})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationCenter role="PARENT" institutionCode="CBS" />
            <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
               <User className="w-5 h-5 text-slate-500" />
            </div>
          </div>
        </header>

        {/* Mobile Sibling Switcher (Visible only on mobile below header) */}
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Viewing Profile:</span>
          <select 
            className="bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none px-3 py-1.5"
            value={activeSibling?.id}
            onChange={(e) => setActiveSiblingId(e.target.value)}
          >
            {siblings.map(sib => (
              <option key={sib.id} value={sib.id}>{sib.firstName}</option>
            ))}
          </select>
        </div>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 z-50 pb-safe">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-primary' : 'text-slate-400'}`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'fill-blue-50' : ''}`} />
              <span className="text-[10px] font-bold">{item.name}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiblingProvider>
      <PortalLayoutContent>{children}</PortalLayoutContent>
    </SiblingProvider>
  );
}
