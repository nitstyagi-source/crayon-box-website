"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Layers, FileSignature, Play, Receipt, 
  Wallet, Clock, AlertTriangle, Percent, RotateCcw, 
  FileText, BarChart, CreditCard, Settings 
} from "lucide-react";

const FINANCE_NAV = [
  { name: "Dashboard", href: "/admin/finance", icon: LayoutDashboard },
  { name: "Fee Structure", href: "/admin/finance/structure", icon: Layers },
  { name: "Fee Templates", href: "/admin/finance/templates", icon: FileSignature },
  { name: "Generate Fees", href: "/admin/finance/generate", icon: Play },
  { name: "Invoices", href: "/admin/finance/invoices", icon: Receipt },
  { name: "Collections", href: "/admin/finance/collections", icon: Wallet },
  { name: "Pending Fees", href: "/admin/finance/pending", icon: Clock },
  { name: "Late Fees", href: "/admin/finance/late-fees", icon: AlertTriangle },
  { name: "Discounts", href: "/admin/finance/discounts", icon: Percent },
  { name: "Refunds", href: "/admin/finance/refunds", icon: RotateCcw },
  { name: "Receipts", href: "/admin/finance/receipts", icon: FileText },
  { name: "Reports", href: "/admin/finance/reports", icon: BarChart },
  { name: "Payment Gateway", href: "/admin/finance/gateway", icon: CreditCard },
  { name: "Settings", href: "/admin/finance/settings", icon: Settings },
];

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      {/* Finance Top Navigation (Scrollable) */}
      <div className="border-b border-stone-100 bg-stone-50/50">
        <div className="flex overflow-x-auto hide-scrollbar p-2 gap-1 items-center">
          {FINANCE_NAV.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                  isActive 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Finance Content Area */}
      <div className="flex-1 overflow-y-auto bg-stone-50">
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
