"use client";

import { useState } from "react";
import { 
  createColumnHelper, 
  flexRender, 
  createCoreRowModel, 
  useTable,
  createPaginatedRowModel
} from "@tanstack/react-table";
import { Download, Filter, UserCog, Mail, Search, ChevronRight, X } from "lucide-react";

type Student = {
  id: string;
  name: string;
  grade: string;
  section: string;
  bloodGroup: string;
  busRoute: string;
  parentName: string;
  phone: string;
  status: string;
};

const defaultData: Student[] = [
  { id: "S-2026-001", name: "Aarav Sharma", grade: "Grade 4", section: "A", bloodGroup: "O+", busRoute: "Route 4", parentName: "Rajesh Sharma", phone: "+91 9876543210", status: "Active" },
  { id: "S-2026-002", name: "Diya Patel", grade: "Grade 8", section: "B", bloodGroup: "B+", busRoute: "Walk-in", parentName: "Amit Patel", phone: "+91 9123456789", status: "Active" },
  { id: "S-2026-003", name: "Rohan Verma", grade: "Grade 1", section: "A", bloodGroup: "A-", busRoute: "Route 2", parentName: "Sanjay Verma", phone: "+91 9988776655", status: "Active" },
  { id: "S-2026-004", name: "Neha Gupta", grade: "Grade 6", section: "C", bloodGroup: "O-", busRoute: "Route 4", parentName: "Vikram Gupta", phone: "+91 9876512345", status: "Active" },
  { id: "S-2026-005", name: "Kunal Singh", grade: "Pre-K", section: "A", bloodGroup: "AB+", busRoute: "Route 1", parentName: "Rahul Singh", phone: "+91 9111122222", status: "Active" },
  { id: "S-2026-006", name: "Anita Roy", grade: "Grade 3", section: "B", bloodGroup: "B-", busRoute: "Walk-in", parentName: "Suman Roy", phone: "+91 9333344444", status: "Active" },
];

const columnHelper = createColumnHelper<any, any>();

const columns: any[] = [
  columnHelper.accessor("id", {
    header: "Student ID",
    cell: info => <span className="font-mono text-xs font-bold text-slate-500">{info.getValue()}</span>,
  }),
  columnHelper.accessor("name", {
    header: "Full Name",
    cell: info => <span className="font-bold text-slate-900">{info.getValue()}</span>,
  }),
  columnHelper.accessor("grade", {
    header: "Class",
    cell: info => <span className="font-medium text-slate-800">{info.getValue()}</span>,
  }),
  columnHelper.accessor("section", {
    header: "Section",
    cell: info => <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">{info.getValue()}</span>,
  }),
  columnHelper.accessor("bloodGroup", {
    header: "Blood Group",
    cell: info => <span className="text-red-500 font-bold">{info.getValue()}</span>,
  }),
  columnHelper.accessor("busRoute", {
    header: "Transport",
    cell: info => <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">{info.getValue()}</span>,
  }),
  columnHelper.accessor("parentName", {
    header: "Parent/Guardian",
    cell: info => info.getValue(),
  }),
  columnHelper.accessor("phone", {
    header: "Contact",
    cell: info => info.getValue(),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: info => (
      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-widest">
        {info.getValue()}
      </span>
    ),
  }),
];

export default function MasterSIS() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string>("All");
  const [selectedSection, setSelectedSection] = useState<string>("All");

  const filteredData = defaultData.filter(student => {
    const gradeMatch = selectedGrade === "All" || student.grade === selectedGrade;
    const sectionMatch = selectedSection === "All" || student.section === selectedSection;
    return gradeMatch && sectionMatch;
  });
  // @ts-expect-error v9 types changed
  const table = useTable({
    data: filteredData,
    columns
  });

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      
      {/* Header & Actions */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Master Student Directory</h1>
          <p className="text-sm text-slate-500">View and manage all enrolled students.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2">
            <select 
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
            >
              <option value="All">All Classes</option>
              <option value="Pre-K">Pre-K</option>
              <option value="Grade 1">Grade 1</option>
              <option value="Grade 3">Grade 3</option>
              <option value="Grade 4">Grade 4</option>
              <option value="Grade 6">Grade 6</option>
              <option value="Grade 8">Grade 8</option>
            </select>
            <select 
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              <option value="All">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search records..." className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-48" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Advanced Data Grid */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs border-b border-slate-200 whitespace-nowrap">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs border-b border-slate-200 text-right sticky right-0 bg-slate-50 shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">
                    Actions
                  </th>
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-blue-50/50 transition-colors cursor-pointer group" onClick={() => setSelectedStudent(row.original as any)}>
                  {row.getAllCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-slate-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right sticky right-0 bg-white group-hover:bg-blue-50/50 transition-colors shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">
                    <button className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-widest flex items-center justify-end gap-1 ml-auto">
                      View Profile <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between shrink-0">
          <span className="text-sm text-slate-500 font-medium">Showing {table.getRowModel().rows.length} entries for {selectedGrade !== "All" ? selectedGrade : "All Classes"} {selectedSection !== "All" ? `(Sec ${selectedSection})` : ''}</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-white border border-slate-300 rounded text-sm font-medium text-slate-500 disabled:opacity-50" onClick={() => table.previousPage()}>Prev</button>
            <button className="px-3 py-1 bg-white border border-slate-300 rounded text-sm font-medium text-slate-700 disabled:opacity-50" onClick={() => table.nextPage()}>Next</button>
          </div>
        </div>

        {/* 360 Profile Sliding Modal Overlay */}
        {selectedStudent && (
          <div className="absolute inset-y-0 right-0 w-[400px] bg-white shadow-2xl border-l border-slate-200 z-20 transform transition-transform animate-in slide-in-from-right flex flex-col">
            <div className="p-6 border-b border-slate-200 flex justify-between items-start bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedStudent.name}</h2>
                <p className="text-sm text-slate-500 font-mono mt-1">{selectedStudent.id}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setSelectedStudent(null); }} className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Quick Actions</h3>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-bold hover:bg-blue-100">
                    <Mail className="w-4 h-4" /> Message Parent
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-2 rounded-lg text-sm font-bold hover:bg-slate-200">
                    <UserCog className="w-4 h-4" /> Edit Profile
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Academic Summary</h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm space-y-2">
                  <div className="flex justify-between"><span className="text-slate-500">Current Grade</span><span className="font-bold text-slate-900">{selectedStudent.grade}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Attendance (YTD)</span><span className="font-bold text-slate-900">94%</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Last Term GPA</span><span className="font-bold text-slate-900 text-green-600">A-</span></div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Financial Ledger</h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm space-y-2">
                  <div className="flex justify-between"><span className="text-slate-500">Q2 Fee Status</span><span className="font-bold text-slate-900">Paid (₹24,500)</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Smart Wallet</span><span className="font-bold text-slate-900">₹1,250</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
