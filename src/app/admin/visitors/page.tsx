"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Users, UserCheck, ShieldCheck, Clock, Plus,
  RefreshCw, CheckCircle2, QrCode, Printer, X, DoorOpen,
  Video, AlertOctagon, KeyRound, Lock, Send, ShieldAlert, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useInstitution } from '@/components/providers/InstitutionContext';
import {
  getCampusVisitorsAction,
  checkInCampusVisitorAction,
  checkOutCampusVisitorAction
} from '@/app/actions/safety-health-actions';
import { VastuModuleBanner } from '@/components/common/VastuModuleBanner';
import { DigitalGatePassDesk } from '@/components/logistics/DigitalGatePassDesk';
import { CctvVideoWallDesk } from '@/components/logistics/CctvVideoWallDesk';
import { EmergencyBroadcastDesk } from '@/components/logistics/EmergencyBroadcastDesk';

function CampusSecurityHubContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();

  const [activeTab, setActiveTab] = useState<'visitors' | 'gate-pass' | 'cctv' | 'emergency'>('visitors');

  useEffect(() => {
    if (tabParam === 'gate-pass' || tabParam === 'early-departure') setActiveTab('gate-pass');
    else if (tabParam === 'cctv') setActiveTab('cctv');
    else if (tabParam === 'emergency') setActiveTab('emergency');
    else if (tabParam === 'visitors') setActiveTab('visitors');
  }, [tabParam]);

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
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      {/* Vastu Mandala Module Banner */}
      <VastuModuleBanner
        title="Campus Security, Gate Pass & CCTV Command Hub"
        description="Integrated security lifecycle uniting Visitor Badges & DL OCR, Parent OTP Early Departure Clearance, 16-Camera CCTV Video Wall, and NDMA Emergency Lockdown Command."
        badgeText="Gate & Video Wall"
        badgeIcon={<ShieldCheck className="w-3.5 h-3.5" />}
        titleIcon={<ShieldCheck className="w-7 h-7 text-amber-600" />}
        institutionText={selectedInstitutionObj?.name || "Campus Gate Command"}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchVisitors}
              className="border-[#E8DFC8] text-xs font-bold bg-white"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Sync DB
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsNewModalOpen(true)}
              className="bg-[#D97706] hover:bg-[#B45309] text-white font-black shadow-md text-xs px-4 py-2 rounded-xl"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Issue Visitor Badge
            </Button>
          </div>
        }
      />

      {/* 4 Synchronized Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E8DFC8] pb-2 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('visitors')}
          className={`px-4 py-2.5 rounded-2xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'visitors'
              ? 'bg-[#0B1B30] text-amber-300 font-extrabold shadow-xs'
              : 'text-stone-600 hover:text-stone-950 hover:bg-white/80'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          1. Gate Pass &amp; Visitor Badges
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
            {counts.currentlyCheckedIn} On-Campus
          </span>
        </button>

        <button
          onClick={() => setActiveTab('gate-pass')}
          className={`px-4 py-2.5 rounded-2xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'gate-pass'
              ? 'bg-[#0B1B30] text-amber-300 font-extrabold shadow-xs'
              : 'text-stone-600 hover:text-stone-950 hover:bg-white/80'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5 text-sky-400" />
          2. Early Departure &amp; Parent OTP Clearance
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300">
            Admissions Photo Match
          </span>
        </button>

        <button
          onClick={() => setActiveTab('cctv')}
          className={`px-4 py-2.5 rounded-2xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'cctv'
              ? 'bg-[#0B1B30] text-amber-300 font-extrabold shadow-xs'
              : 'text-stone-600 hover:text-stone-950 hover:bg-white/80'
          }`}
        >
          <Video className="w-3.5 h-3.5 text-purple-400" />
          3. 16-Camera CCTV Video Wall
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
            Timed Parent Access
          </span>
        </button>

        <button
          onClick={() => setActiveTab('emergency')}
          className={`px-4 py-2.5 rounded-2xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'emergency'
              ? 'bg-[#0B1B30] text-amber-300 font-extrabold shadow-xs'
              : 'text-stone-600 hover:text-stone-950 hover:bg-white/80'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
          4. Emergency Red Broadcast &amp; Lockdown
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
            NDMA Protocol
          </span>
        </button>
      </div>

      {/* 🌟 TAB 1: VISITOR BADGES & GATE LOGS */}
      {activeTab === 'visitors' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#FAF7F2] p-5 rounded-3xl border border-[#E8DFC8] shadow-xs">
              <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider block">Total Visitors Today</span>
              <span className="text-3xl font-black text-stone-900 mt-1 block">{counts.totalVisitors}</span>
              <span className="text-[11px] text-amber-800 font-bold">Gate Registrations</span>
            </div>

            <div className="bg-[#FAF7F2] p-5 rounded-3xl border border-[#E8DFC8] shadow-xs">
              <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider block">Currently In Campus</span>
              <span className="text-3xl font-black text-amber-700 mt-1 block">{counts.currentlyCheckedIn}</span>
              <span className="text-[11px] text-amber-900 font-bold">Active Visitor Badges</span>
            </div>

            <div className="bg-[#FAF7F2] p-5 rounded-3xl border border-[#E8DFC8] shadow-xs">
              <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider block">Checked Out Today</span>
              <span className="text-3xl font-black text-emerald-700 mt-1 block">{counts.checkedOutToday}</span>
              <span className="text-[11px] text-emerald-900 font-bold">Completed Visits</span>
            </div>
          </div>

          {/* Visitors Table Card */}
          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-stone-900 text-sm">Today's Campus Gate Visitors Log ({visitors.length})</h3>
                <p className="text-xs text-stone-500">Real-time visitor badge records, vehicle entry tags, and escort clearances.</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchVisitors}
                  className="border-stone-200 text-xs font-bold"
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Refresh
                </Button>
              </div>
            </div>

            {visitors.length === 0 ? (
              <div className="p-12 text-center text-xs text-stone-400 space-y-2">
                <Users className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="font-bold text-stone-600">No visitors logged at the gate yet today.</p>
                <p>Click "Issue Visitor Badge" to check in guests, parents, or delivery contractors.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-100">
                      <th className="py-3 px-4">Visitor &amp; Badge</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Phone Number</th>
                      <th className="py-3 px-4">Host Person &amp; Purpose</th>
                      <th className="py-3 px-4">Vehicle No</th>
                      <th className="py-3 px-4">In / Out Time</th>
                      <th className="py-3 px-4">Status &amp; Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {visitors.map((v) => (
                      <tr key={v.id} className="hover:bg-stone-50 transition">
                        <td className="py-3.5 px-4">
                          <strong className="text-stone-900 block font-bold">{v.full_name}</strong>
                          <span className="text-[10px] font-mono text-indigo-600 font-bold">{v.badge_number}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-stone-100 text-stone-700">
                            {v.visitor_type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-stone-600 font-medium">
                          {v.phone_number}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-stone-900 font-bold block">{v.host_person}</span>
                          <span className="text-[10px] text-stone-500">{v.purpose}</span>
                        </td>
                        <td className="py-3.5 px-4 text-stone-600 font-mono text-[11px]">
                          {v.vehicle_number || 'Walking Entry'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-stone-900 font-bold block">In: {v.entry_time}</span>
                          <span className="text-[10px] text-stone-500">Out: {v.exit_time || 'Pending Exit'}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {v.status === 'CHECKED_IN' ? (
                              <>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Inside
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCheckOut(v.id)}
                                  className="border-rose-200 text-rose-700 hover:bg-rose-50 text-[10px] px-2 py-1 h-auto"
                                >
                                  Check Out
                                </Button>
                                <button
                                  type="button"
                                  onClick={() => setActivePrintBadge(v)}
                                  className="p-1 rounded-lg text-stone-400 hover:text-stone-900"
                                  title="Print Badge"
                                >
                                  <Printer className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-500">
                                Left Campus
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🌟 TAB 2: STUDENT EARLY DEPARTURE & PARENT OTP CLEARANCE */}
      {activeTab === 'gate-pass' && (
        <div className="space-y-6">
          <DigitalGatePassDesk defaultTab="early_exit" />
        </div>
      )}

      {/* 🌟 TAB 3: 16-CAMERA CCTV VIDEO WALL & PARENT STREAMING */}
      {activeTab === 'cctv' && (
        <div className="space-y-6">
          <CctvVideoWallDesk defaultTab="videowall" />
        </div>
      )}

      {/* 🌟 TAB 4: EMERGENCY RED BROADCAST & NDMA LOCKDOWN */}
      {activeTab === 'emergency' && (
        <div className="space-y-6">
          <EmergencyBroadcastDesk />
        </div>
      )}

      {/* 🌟 NEW VISITOR MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-5">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-extrabold text-stone-900 text-base">Issue Gate Entry Pass</h3>
                <p className="text-xs text-stone-500">Register visitor, verify host, and print QR access badge.</p>
              </div>
              <button onClick={() => setIsNewModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCheckIn} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Visitor Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98111 00000"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Visitor Type</label>
                  <select
                    value={visitorType}
                    onChange={(e) => setVisitorType(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold"
                  >
                    <option value="PARENT">Parent / Guardian</option>
                    <option value="VENDOR">Vendor / Contractor</option>
                    <option value="OFFICIAL">Govt / CBSE Official</option>
                    <option value="ALUMNI">School Alumni</option>
                    <option value="GUEST">General Guest</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Vehicle Number</label>
                  <input
                    type="text"
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    placeholder="DL-01-AB-1234 (Optional)"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Host Department / Person *</label>
                <input
                  type="text"
                  required
                  value={hostPerson}
                  onChange={(e) => setHostPerson(e.target.value)}
                  placeholder="e.g. Principal Office / Grade 5 Class Teacher"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Purpose of Visit</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Fee Payment / PTM Discussion"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsNewModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit" isLoading={isSubmitting} className="bg-[#D97706] hover:bg-[#B45309] text-white font-bold">
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
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-stone-200 space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
              <span className="text-[10px] font-black uppercase text-amber-700">Official Visitor Pass</span>
              <button onClick={() => setActivePrintBadge(null)} className="text-stone-400 hover:text-stone-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border-2 border-dashed border-stone-300 p-6 rounded-2xl bg-stone-50 space-y-3">
              <div className="w-20 h-20 mx-auto bg-white border border-stone-300 rounded-xl flex items-center justify-center shadow-xs">
                <QrCode className="w-14 h-14 text-stone-900" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-mono font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 inline-block">
                  {activePrintBadge.badge_number}
                </span>
                <h4 className="font-extrabold text-stone-900 text-sm mt-1">{activePrintBadge.full_name}</h4>
                <p className="text-[11px] text-stone-600 font-medium">{activePrintBadge.visitor_type} • Host: {activePrintBadge.host_person}</p>
                <p className="text-[10px] text-stone-400 font-mono">Vehicle: {activePrintBadge.vehicle_number || 'None'}</p>
              </div>
            </div>

            <Button size="sm" variant="primary" onClick={() => window.print()} className="w-full bg-[#0B1B30] hover:bg-slate-800 text-amber-300 font-bold" leftIcon={<Printer className="w-4 h-4" />}>
              Print Visitor Pass
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function VisitorsManagementPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center text-stone-500 font-bold text-xs flex flex-col items-center justify-center space-y-2">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
        <span>Loading Campus Security, Gate Pass &amp; CCTV Command Hub...</span>
      </div>
    }>
      <CampusSecurityHubContent />
    </Suspense>
  );
}
