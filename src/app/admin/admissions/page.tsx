import { getAdmissions } from "@/app/actions/forms";
import { Users, FileText, CheckCircle2, Clock } from "lucide-react";

export const dynamic = 'force-dynamic'; // Ensure we always fetch fresh data

export default async function AdmissionsDashboard() {
  const applications = await getAdmissions();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> Admissions Overview
          </h1>
          <p className="text-sm text-slate-500">Review and manage incoming student applications.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <a 
            href="/admin/admissions/pipeline" 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            Open Interactive Kanban Pipeline →
          </a>
          <a 
            href="/admin/admissions/crm" 
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition"
          >
            CRM Candidate Directory
          </a>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center text-slate-400">
          <FileText className="w-16 h-16 mb-4 opacity-20" />
          <p className="font-bold text-lg">No Applications Yet</p>
          <p className="text-sm mt-1">When parents fill out the "Apply Now" form, applications will appear here.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4 font-bold">App ID</th>
                  <th className="px-6 py-4 font-bold">Date Received</th>
                  <th className="px-6 py-4 font-bold">Student Name</th>
                  <th className="px-6 py-4 font-bold">Grade</th>
                  <th className="px-6 py-4 font-bold">Parent Contact</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app: any) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-700">{app.id}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(app.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{app.childName}</td>
                    <td className="px-6 py-4"><span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{app.grade}</span></td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900 font-medium">{app.parentName}</div>
                      <div className="text-slate-500 text-xs">{app.email}</div>
                      <div className="text-slate-500 text-xs">{app.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${app.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                        {app.status === 'Pending' ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
