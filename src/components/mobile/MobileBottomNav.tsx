"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, QrCode, CheckSquare, Wallet, Bell, 
  Settings, FileText, CheckCircle, Users, BookOpen, 
  Bus, ShieldCheck, CreditCard, User
} from "lucide-react";
import { useMobileAuth, RoleType } from "./MobileAuthProvider";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { activeRole } = useMobileAuth();

  // Dynamic Navigation Items based on active role
  const getNavItems = (role: RoleType) => {
    switch (role) {
      case "Super Admin":
      case "Management":
        return [
          { label: "Home", href: "/mobile", icon: Home },
          { label: "Approvals", href: "/mobile/approvals", icon: CheckCircle, badge: "4" },
          { label: "Reports", href: "/mobile/reports", icon: FileText },
          { label: "Alerts", href: "/mobile/notifications", icon: Bell, badge: "3" },
          { label: "Settings", href: "/mobile/settings", icon: Settings },
        ];

      case "Principal":
      case "Vice Principal":
        return [
          { label: "Home", href: "/mobile", icon: Home },
          { label: "Approvals", href: "/mobile/approvals", icon: CheckCircle, badge: "2" },
          { label: "Attendance", href: "/mobile/attendance", icon: CheckSquare },
          { label: "Alerts", href: "/mobile/notifications", icon: Bell, badge: "3" },
          { label: "Settings", href: "/mobile/settings", icon: Settings },
        ];

      case "Faculty":
        return [
          { label: "Home", href: "/mobile", icon: Home },
          { label: "Attendance", href: "/mobile/attendance", icon: CheckSquare },
          { label: "Scan QR", href: "/mobile/qr-scanner", icon: QrCode },
          { label: "Alerts", href: "/mobile/notifications", icon: Bell, badge: "2" },
          { label: "Settings", href: "/mobile/settings", icon: Settings },
        ];

      case "Parent":
        return [
          { label: "Home", href: "/mobile", icon: Home },
          { label: "Pay Fees", href: "/mobile/fees", icon: Wallet, badge: "Due" },
          { label: "Track Bus", href: "/mobile/transport", icon: Bus },
          { label: "Alerts", href: "/mobile/notifications", icon: Bell, badge: "1" },
          { label: "Settings", href: "/mobile/settings", icon: Settings },
        ];

      case "Student":
        return [
          { label: "Home", href: "/mobile", icon: Home },
          { label: "ID Card", href: "/mobile/id-card", icon: CreditCard },
          { label: "Track Bus", href: "/mobile/transport", icon: Bus },
          { label: "Notices", href: "/mobile/notifications", icon: Bell },
          { label: "Profile", href: "/mobile/settings", icon: User },
        ];

      default:
        return [
          { label: "Home", href: "/mobile", icon: Home },
          { label: "Scan QR", href: "/mobile/qr-scanner", icon: QrCode },
          { label: "Alerts", href: "/mobile/notifications", icon: Bell },
          { label: "Settings", href: "/mobile/settings", icon: Settings },
        ];
    }
  };

  const navItems = getNavItems(activeRole);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-2 py-1.5 shadow-lg shadow-slate-900/5 select-none">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all relative ${
                isActive 
                  ? "text-amber-600 font-bold" 
                  : "text-slate-500 hover:text-slate-800 font-medium"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110 stroke-[2.5]" : "stroke-[1.75]"}`} />
                {item.badge && (
                  <span className={`absolute -top-1.5 -right-2.5 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full border border-white leading-tight ${
                    item.badge === "Due" ? "bg-rose-500 text-white" : "bg-amber-500 text-slate-950"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10.5px] mt-1 tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
