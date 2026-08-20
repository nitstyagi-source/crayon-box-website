"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Layers, Wallet, Receipt, 
  Clock, RotateCcw, BarChart, CreditCard, Settings,
  Users, CheckCircle2, ShieldAlert
} from "lucide-react";

const FINANCE_NAV = [
  { name: "Executive Dashboard", href: "/admin/finance", icon: LayoutDashboard },
  { name: "Fee Master & Structures", href: "/admin/finance/structure", icon: Layers },
  { name: "Collect Fee (POS)", href: "/admin/finance/collections", icon: Wallet },
  { name: "Official Receipts Hub", href: "/admin/finance/receipts", icon: Receipt },
  { name: "Defaulters & Aging Dues", href: "/admin/finance/pending", icon: Clock },
  { name: "Refunds Workflow", href: "/admin/finance/refunds", icon: RotateCcw },
  { name: "Management Reports", href: "/admin/finance/reports", icon: BarChart },
  { name: "Payment Gateway", href: "/admin/finance/gateway", icon: CreditCard },
  { name: "Cash Closing & Settings", href: "/admin/finance/settings", icon: Settings },
];

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden font-sans">
      {/* Finance Top Navigation (Scrollable) */}
      <div className="border-b border-stone-100 bg-stone-50/70 p-2">
        <div className="flex overflow-x-auto hide-scrollbar gap-1.5 items-center">
          {FINANCE_NAV.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition ${
                  isActive 
                    ? 'bg-stone-900 text-white shadow-xs' 
                    : 'text-stone-600 hover:bg-stone-200/70 hover:text-stone-900'
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Finance Content Area */}
      <div className="flex-1 overflow-y-auto bg-stone-50/60 p-4 sm:p-6 lg:p-8">
        {children}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
