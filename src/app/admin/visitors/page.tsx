"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, UserCheck, ShieldCheck, Clock, Plus,
  RefreshCw, CheckCircle2, QrCode, Printer, X, DoorOpen
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useInstitution } from '@/components/providers/InstitutionContext';
import {
  getCampusVisitorsAction,
  checkInCampusVisitorAction,
  checkOutCampusVisitorAction
} from '@/app/actions/safety-health-actions';

export default function VisitorsManagementPage() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();

  const [visitors, setVisitors] = useState<any[]>([]);
  const [counts, setCounts] = useState({ totalVisitors: 0, currentlyCheckedIn: 0, checkedOutToday: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // New Visitor Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [visitorType, setVisitorType] = useState('PARENT');
  const [hostPerson, setHostPerson] = useState('Principal Office');
  const [purpose, setPurpose] = useState('Parent-Teacher Academic Inquiry');
  const [vehicleNo, setVehicleNo] = useState('DL-01-AB-1234');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Print Badge Modal
  const [activePrintBadge, setActivePrintBadge] = useState<any | null>(null);

  const fetchVisitors = async () => {
    setIsLoading(true);
    const res = await getCampusVisitorsAction();
    if (res.success) {
      setVisitors(res.visitors || []);
      setCounts(res.counts || { totalVisitors: 0, currentlyCheckedIn: 0, checkedOutToday: 0 });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  // Handle Check-in
  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    const res = await checkInCampusVisitorAction({
      fullName,
      phoneNumber: phone,
      visitorType,
      hostPerson,
      purpose,
      vehicleNumber: vehicleNo
    });
    setIsSubmitting(false);

    if (res.success) {
      setIsNewModalOpen(false);
      setFullName('');
      setPhone('');
      fetchVisitors();
    } else {
      alert("Error checking in visitor: " + res.error);
    }
  };

  // Handle Check-out
  const handleCheckOut = async (visitorId: string) => {
    const res = await checkOutCampusVisitorAction(visitorId);
    if (res.success) {
      fetchVisitors();
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-indigo-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Campus Gate Security & Visitor Screening
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-indigo-300 text-xs font-semibold">
              {isAllInstitutions ? 'All Institutions' : selectedInstitutionObj?.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-400" />
            Visitor Pass & Campus Entry Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Visitor badge issuance, host verification, vehicle logging, and timestamped exit tracking.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsNewModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-lg shadow-indigo-600/20"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            🪪 Issue Visitor Badge
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchVisitors}
            isLoading={isLoading}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Logs
          </Button>
        </div>
      </div>

      {/* 🌟 TELEMATICS COUNTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Currently on Campus</span>
          <span className="text-3xl font-black text-emerald-600 mt-1 block">{counts.currentlyCheckedIn}</span>
          <span className="text-[11px] text-emerald-700 font-bold">Active Visitor Badges</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Checked Out Today</span>
          <span className="text-3xl font-black text-slate-900 mt-1 block">{counts.checkedOutToday}</span>
          <span className="text-[11px] text-slate-500 font-semibold">Exited Through Main Gate</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Entry Logs</span>
          <span className="text-3xl font-black text-indigo-600 mt-1 block">{counts.totalVisitors}</span>
          <span className="text-[11px] text-indigo-700 font-bold">Session 2026–2027</span>
        </div>
      </div>

      {/* 🌟 VISITORS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Today's Visitor Entry Registry ({visitors.length})
            </h3>
            <p className="text-xs text-slate-400">
              Verified campus visitors with vehicle plate numbers and host approvals.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="py-3 px-4">Badge # & Type</th>
                <th className="py-3 px-4">Visitor Details</th>
                <th className="py-3 px-4">Host & Purpose</th>
                <th className="py-3 px-4">Vehicle #</th>
                <th className="py-3 px-4">Check-in Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visitors.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    <span className="block">{v.badge_number}</span>
                    <span className="text-[10px] font-bold uppercase text-indigo-600">{v.visitor_type}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <strong className="text-slate-900 block font-bold">{v.full_name}</strong>
                    <span className="text-[10px] text-slate-400 font-mono">{v.phone_number}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="text-slate-900 font-bold block">{v.host_person}</span>
                    <span className="text-[11px] text-slate-500">{v.purpose}</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-700 font-semibold">
                    {v.vehicle_number || 'No Vehicle'}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {v.check_in_time}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      v.status === 'CHECKED_IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {v.status === 'CHECKED_IN' ? '🟢 ON CAMPUS' : '✓ CHECKED OUT'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActivePrintBadge(v)}
                      className="text-[11px] py-1 px-2.5 hover:bg-indigo-50 border-slate-300"
                      leftIcon={<QrCode className="w-3.5 h-3.5 text-indigo-600" />}
                    >
                      Badge
                    </Button>

                    {v.status === 'CHECKED_IN' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleCheckOut(v.id)}
                        className="text-[11px] py-1 px-2.5 bg-rose-600 hover:bg-rose-500 text-white"
                        leftIcon={<DoorOpen className="w-3.5 h-3.5" />}
                      >
                        Exit Gate
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🌟 ISSUE BADGE MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 font-sans space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-black text-slate-900">Issue Campus Visitor Badge</h3>
              </div>
              <button onClick={() => setIsNewModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCheckIn} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Visitor Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                    placeholder="e.g. Dr. Alok Nath"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900"
                    placeholder="+91 98112 34567"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Visitor Classification</label>
                  <select
                    value={visitorType}
                    onChange={(e) => setVisitorType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="PARENT">Parent / Guardian</option>
                    <option value="VENDOR">Vendor / Contractor</option>
                    <option value="INSPECTOR">Government / Education Official</option>
                    <option value="ALUMNI">Alumni Guest</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vehicle Plate Number</label>
                  <input
                    type="text"
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900"
                    placeholder="e.g. DL-01-AB-1234"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Host Faculty / Office to Meet</label>
                <input
                  type="text"
                  value={hostPerson}
                  onChange={(e) => setHostPerson(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                  placeholder="e.g. Principal Office / Grade 5 Class Teacher"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Purpose of Visit</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  placeholder="e.g. Admissions inquiry, Fee clearance..."
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsNewModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit" isLoading={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                  Issue Entry Badge
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 PRINT BADGE MODAL */}
      {activePrintBadge && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-[10px] font-black uppercase text-indigo-700">Official Visitor Pass</span>
              <button onClick={() => setActivePrintBadge(null)} className="text-slate-400 hover:text-slate-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-300 p-6 rounded-2xl bg-slate-50 space-y-3">
              <div className="w-20 h-20 mx-auto bg-white border border-slate-300 rounded-xl flex items-center justify-center shadow-xs">
                <QrCode className="w-14 h-14 text-slate-900" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-mono font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 inline-block">
                  {activePrintBadge.badge_number}
                </span>
                <h4 className="font-extrabold text-slate-900 text-sm mt-1">{activePrintBadge.full_name}</h4>
                <p className="text-[11px] text-slate-600 font-medium">{activePrintBadge.visitor_type} • Host: {activePrintBadge.host_person}</p>
                <p className="text-[10px] text-slate-400 font-mono">Vehicle: {activePrintBadge.vehicle_number || 'None'}</p>
              </div>
            </div>

            <Button size="sm" variant="primary" onClick={() => window.print()} className="w-full bg-slate-900 text-white" leftIcon={<Printer className="w-4 h-4" />}>
              Print Visitor Pass
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
