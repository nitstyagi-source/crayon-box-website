"use client";

import { Calendar, ShieldAlert, CheckCircle2, Clock, MapPin, XCircle, Users } from "lucide-react";

export default function AttendanceHeatmap() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Calendar className="w-6 h-6 text-indigo-600" /> Attendance Heatmap</h1>
          <p className="text-sm text-slate-500">Live monitoring of staff check-ins and GPS verification logs.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">Export CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Heatmap Grid */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">August 2026</h2>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Present</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-400 rounded-sm"></div> Late</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> Absent</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Leave</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr>
                  <th className="p-4 font-bold text-slate-800 border-b-2 border-slate-200 bg-slate-50 min-w-[200px]">Staff Member</th>
                  {[16, 17, 18, 19, 20].map(day => (
                    <th key={day} className="p-4 font-bold text-slate-800 text-center border-b-2 border-slate-200 bg-slate-50">Aug {day}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-800">Sarah Newton <span className="block text-xs font-normal text-slate-500">Teacher (Grade 4)</span></td>
                  <td className="p-4 text-center"><div className="w-8 h-8 mx-auto bg-emerald-500 rounded-lg shadow-sm flex items-center justify-center text-white"><CheckCircle2 className="w-4 h-4" /></div></td>
                  <td className="p-4 text-center"><div className="w-8 h-8 mx-auto bg-emerald-500 rounded-lg shadow-sm flex items-center justify-center text-white"><CheckCircle2 className="w-4 h-4" /></div></td>
                  <td className="p-4 text-center"><div className="w-8 h-8 mx-auto bg-amber-400 rounded-lg shadow-sm flex items-center justify-center text-white"><Clock className="w-4 h-4" /></div></td>
                  <td className="p-4 text-center"><div className="w-8 h-8 mx-auto bg-blue-500 rounded-lg shadow-sm flex items-center justify-center text-white"><Calendar className="w-4 h-4" /></div></td>
                  <td className="p-4 text-center"><div className="w-8 h-8 mx-auto bg-blue-500 rounded-lg shadow-sm flex items-center justify-center text-white"><Calendar className="w-4 h-4" /></div></td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-800">Michael Ross <span className="block text-xs font-normal text-slate-500">Coordinator</span></td>
                  <td className="p-4 text-center"><div className="w-8 h-8 mx-auto bg-emerald-500 rounded-lg shadow-sm flex items-center justify-center text-white"><CheckCircle2 className="w-4 h-4" /></div></td>
                  <td className="p-4 text-center"><div className="w-8 h-8 mx-auto bg-emerald-500 rounded-lg shadow-sm flex items-center justify-center text-white"><CheckCircle2 className="w-4 h-4" /></div></td>
                  <td className="p-4 text-center"><div className="w-8 h-8 mx-auto bg-emerald-500 rounded-lg shadow-sm flex items-center justify-center text-white"><CheckCircle2 className="w-4 h-4" /></div></td>
                  <td className="p-4 text-center"><div className="w-8 h-8 mx-auto bg-red-500 rounded-lg shadow-sm flex items-center justify-center text-white"><XCircle className="w-4 h-4" /></div></td>
                  <td className="p-4 text-center"><div className="w-8 h-8 mx-auto bg-emerald-500 rounded-lg shadow-sm flex items-center justify-center text-white"><CheckCircle2 className="w-4 h-4" /></div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Geofence Anomalies Widget */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
          <div className="p-6 border-b border-slate-100 bg-red-50/50 flex items-center gap-3 rounded-t-3xl">
            <ShieldAlert className="w-6 h-6 text-red-600" />
            <h2 className="font-bold text-slate-800">Flagged Check-Ins</h2>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            
            <div className="p-4 border border-red-200 bg-red-50 rounded-2xl">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800 text-sm">John Doe</h3>
                <span className="text-[10px] font-bold text-red-700 bg-red-200 px-2 py-1 rounded uppercase">Spoof Detected</span>
              </div>
              <p className="text-xs text-slate-600 mb-2">System detected Mock Location / VPN usage during check-in attempt.</p>
              <div className="flex items-center gap-1 text-xs font-mono text-slate-500 bg-white p-2 rounded border border-red-100">
                <MapPin className="w-3 h-3 text-red-400" /> Lat: 37.7749, Lng: -122.4194
              </div>
              <button className="mt-3 w-full text-xs font-bold bg-white text-slate-700 py-2 rounded-lg border border-slate-200 hover:bg-slate-50">Review Log</button>
            </div>

            <div className="p-4 border border-amber-200 bg-amber-50 rounded-2xl">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800 text-sm">Emily Chen</h3>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-200 px-2 py-1 rounded uppercase">Low Accuracy</span>
              </div>
              <p className="text-xs text-slate-600 mb-2">GPS accuracy was 150m (threshold: 50m). TOTP QR scanned successfully.</p>
              <button className="mt-3 w-full text-xs font-bold bg-white text-slate-700 py-2 rounded-lg border border-slate-200 hover:bg-slate-50">Approve Manual Check-In</button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
