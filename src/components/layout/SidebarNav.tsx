"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, UserCog, CalendarCheck, IndianRupee,
  GraduationCap, Bus, BookOpen, FileText, MessageSquare,
  BarChart3, Settings
} from 'lucide-react';

export interface SidebarNavProps {
  currentRole?: string;
}

const menuItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Students', href: '/admin/students', icon: Users },
  { name: 'Staff', href: '/admin/staff', icon: UserCog },
  { name: 'Attendance', href: '/admin/attendance', icon: CalendarCheck },
  { name: 'Fees', href: '/admin/finance', icon: IndianRupee },
  { name: 'Academics', href: '/admin/academics', icon: GraduationCap },
  { name: 'Transport', href: '/admin/transport', icon: Bus },
  { name: 'Library', href: '/admin/library', icon: BookOpen },
  { name: 'Exams', href: '/admin/exams', icon: FileText },
  { name: 'Communication', href: '/admin/communication', icon: MessageSquare, badge: 8 },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function SidebarNav({ currentRole }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <div className="w-[100px] h-full bg-[#0A1A44] flex flex-col items-center py-6 shadow-xl rounded-r-3xl overflow-y-auto no-scrollbar relative z-20">
      <div className="flex flex-col gap-5 w-full items-center mt-2 pb-10">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.name} href={item.href} className="w-full flex justify-center group relative">
              <div className={`flex flex-col items-center justify-center w-16 py-3 rounded-2xl transition-all duration-200 relative ${isActive ? 'bg-white shadow-md' : 'hover:bg-white/10'}`}>
                <item.icon className={`w-6 h-6 mb-1 ${isActive ? 'text-[#0A1A44]' : 'text-white/70 group-hover:text-white'}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] font-semibold tracking-wide ${isActive ? 'text-[#0A1A44]' : 'text-white/70 group-hover:text-white'}`}>
                  {item.name}
                </span>
                
                {/* Red Badge for Notification */}
                {item.badge && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#C8102E] rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                    {item.badge}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
