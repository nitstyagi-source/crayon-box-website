"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HeartPulse, Activity, Thermometer, ShieldCheck,
  RefreshCw, CheckCircle2, AlertCircle, Plus, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useInstitution } from '@/components/providers/InstitutionContext';
import { getStudentHealthMedicalDashboardAction } from '@/app/actions/safety-health-actions';

export default function StudentHealthInfirmaryPage() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();

  const [logs, setLogs] = useState<any[]>([]);
  const [counts, setCounts] = useState({ totalVisits: 0, resolvedVisits: 0, referredVisits: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchHealthLogs = async () => {
    setIsLoading(true);
    const res = await getStudentHealthMedicalDashboardAction();
    if (res.success) {
      setLogs(res.logs || []);
      setCounts(res.counts || { totalVisits: 0, resolvedVisits: 0, referredVisits: 0 });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchHealthLogs();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-rose-500/20 text-rose-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-rose-500/30 flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
              Campus Health & First-Aid Infirmary
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-indigo-300 text-xs font-semibold">
              {isAllInstitutions ? 'All Institutions' : selectedInstitutionObj?.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <HeartPulse className="w-8 h-8 text-rose-400" />
            Student Health & Infirmary Clinical Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Campus clinic visits, first-aid administration, vital temperature monitoring, and parent emergency alerts.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/admin/incidents">
            <Button
              size="sm"
              variant="outline"
              className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs"
              leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-rose-400" />}
            >
              Safeguarding Vault
            </Button>
          </Link>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchHealthLogs}
            isLoading={isLoading}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Health Logs
          </Button>
        </div>
      </div>

      {/* 🌟 TELEMATICS COUNTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Infirmary Visits</span>
          <span className="text-3xl font-black text-slate-900 mt-1 block">{counts.totalVisits}</span>
          <span className="text-[11px] text-slate-500 font-semibold">Clinical Encounters</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Resolved on Campus</span>
          <span className="text-3xl font-black text-emerald-600 mt-1 block">{counts.resolvedVisits}</span>
          <span className="text-[11px] text-emerald-700 font-bold">First-Aid & Rest Treated</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Hospital Referrals</span>
          <span className="text-3xl font-black text-rose-600 mt-1 block">{counts.referredVisits}</span>
          <span className="text-[11px] text-rose-700 font-bold">External Emergency Referrals</span>
        </div>
      </div>

      {/* 🌟 INFIRMARY LOGS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Clinical Encounter Registry ({logs.length})
            </h3>
            <p className="text-xs text-slate-400">
              Audit log of medical treatments, vitals, and parent notifications.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="py-3 px-4">Student & Class</th>
                <th className="py-3 px-4">Symptoms & Complaint</th>
                <th className="py-3 px-4">Diagnosis</th>
                <th className="py-3 px-4">Treatment Administered</th>
                <th className="py-3 px-4">Vitals / Temp</th>
                <th className="py-3 px-4">Attending Nurse</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4">
                    <strong className="text-slate-900 block font-bold">{log.student_name}</strong>
                    <span className="text-[10px] font-mono text-indigo-600 font-bold">{log.class_name} ({log.admission_no})</span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700 font-medium max-w-xs">
                    {log.symptoms}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200 inline-block">
                      {log.diagnosis}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-800 text-xs">
                    <div>{log.action_taken}</div>
                    {log.medication_administered && (
                      <span className="text-[10px] text-emerald-700 font-bold block">Med: {log.medication_administered}</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {log.temperature ? `${log.temperature}°F` : '98.4°F'}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    {log.logged_by_name}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                      ✓ {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
