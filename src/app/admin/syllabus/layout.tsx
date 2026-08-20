"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, BookOpen, Calendar, BookMarked, 
  AlertTriangle, FileQuestion, FolderDown, BarChart2, Printer
} from "lucide-react";

const SYLLABUS_NAV = [
  { name: "Executive Dashboard", href: "/admin/syllabus", icon: LayoutDashboard },
  { name: "Curriculum Master", href: "/admin/syllabus/curriculum", icon: BookOpen },
  { name: "Annual & Monthly Planner", href: "/admin/syllabus/planner", icon: Calendar },
  { name: "Teacher Diary & Periods", href: "/admin/syllabus/teaching", icon: BookMarked },
  { name: "Catch-Up & Remedials", href: "/admin/syllabus/remedial", icon: AlertTriangle },
  { name: "Exam Blueprints", href: "/admin/syllabus/exams", icon: FileQuestion },
  { name: "Question Paper Generator", href: "/admin/syllabus/question-papers", icon: Printer },
  { name: "Resources & PDFs", href: "/admin/syllabus/resources", icon: FolderDown },
  { name: "Variance & Reports", href: "/admin/syllabus/reports", icon: BarChart2 },
];

export default function SyllabusLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-100 overflow-hidden font-sans">
      
      {/* Sub-Navigation Header Bar */}
      <div className="bg-white border-b border-stone-200 px-6 py-3 shrink-0 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {SYLLABUS_NAV.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin/syllabus" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  isActive 
                    ? "bg-stone-900 text-white shadow-xs" 
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
            CBSE / NEP 2020 Aligned
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {children}
      </div>

    </div>
  );
}
