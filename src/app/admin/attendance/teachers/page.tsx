"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UserCheck, Users, MapPin, Compass, ShieldCheck, AlertTriangle,
  Clock, CheckCircle2, RefreshCw, Sparkles, Filter, Search,
  Radio, Smartphone, Building2, Eye, Printer, Send, Save, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { useInstitution } from '@/components/providers/InstitutionContext';
import {
  getStaffDailyAttendanceRosterAction,
  adminMarkStaffAttendanceAction,
  adminBulkMarkStaffAttendanceAction,
  getCampusGeofenceConfigsAction,
  saveCampusGeofenceConfigAction
} from '@/app/actions/teacher-attendance-actions';

export default function AdminTeacherAttendancePage() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions, institutionsList } = useInstitution();

  const [activeTab, setActiveTab] = useState<'MUSTER' | 'GEOFENCE'>('MUSTER');

  // Filters
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Data State
  const [roster, setRoster] = useState<any[]>([]);
  const [counts, setCounts] = useState({
    totalStaff: 0,
    present: 0,
    late: 0,
    halfDay: 0,
    onLeave: 0,
    absent: 0,
    notRecorded: 0,
    geofenceVerified: 0
  });
  const [isLoadingRoster, setIsLoadingRoster] = useState(true);

  // Geofence Configs State
  const [geofences, setGeofences] = useState<any[]>([]);
  const [selectedGeofenceInst, setSelectedGeofenceInst] = useState<string>('');
  const [isSavingGeofence, setIsSavingGeofence] = useState(false);
  const [geofenceForm, setGeofenceForm] = useState({
    campusName: selectedInstitutionObj?.name || 'Campus Geofence Terminal',
    latitude: 28.7183200,
    longitude: 77.2144500,
    radiusMeters: 250,
    address: selectedInstitutionObj?.address || 'Institutional Campus'
  });

  useEffect(() => {
    if (!selectedGeofenceInst && institutionsList.length > 0) {
      setSelectedGeofenceInst(institutionsList[0].code);
    }
  }, [institutionsList, selectedGeofenceInst]);

  const fetchRoster = async () => {
    setIsLoadingRoster(true);
    const res = await getStaffDailyAttendanceRosterAction({
      date: selectedDate,
      institutionCode: currentInstitution,
      department: selectedDept !== 'ALL' ? selectedDept : undefined
    });
    if (res.success) {
      setRoster(res.data || []);
      setCounts(res.counts || {
        totalStaff: 0,
        present: 0,
        late: 0,
        halfDay: 0,
        onLeave: 0,
        absent: 0,
        notRecorded: 0,
        geofenceVerified: 0
      });
    }
    setIsLoadingRoster(false);
  };

  const fetchGeofences = async () => {
    const res = await getCampusGeofenceConfigsAction();
    if (res.success) {
      setGeofences(res.data || []);
      const current = res.data?.find((g: any) => g.institution_code === selectedGeofenceInst);
      if (current) {
        setGeofenceForm({
          campusName: current.campus_name,
          latitude: Number(current.latitude),
          longitude: Number(current.longitude),
          radiusMeters: Number(current.radius_meters),
          address: current.address || ''
        });
      }
    }
  };

  useEffect(() => {
    fetchRoster();
  }, [currentInstitution, selectedDate, selectedDept]);

  useEffect(() => {
    fetchGeofences();
  }, [selectedGeofenceInst]);

  // Handle 1-Click Status Update for single teacher
  const handleMarkStatus = async (staffId: string, status: any) => {
    const res = await adminMarkStaffAttendanceAction({
      staffId,
      date: selectedDate,
      status,
      overrideGeofence: true
    });
    if (res.success) {
      fetchRoster();
    }
  };

  // Handle Bulk Mark All Filtered Present
  const handleBulkMarkPresent = async () => {
    const targetIds = filteredRoster.map(r => r.staff_id);
    if (targetIds.length === 0) return;
    const res = await adminBulkMarkStaffAttendanceAction({
      staffIds: targetIds,
      date: selectedDate,
      status: 'PRESENT'
    });
    if (res.success) {
      fetchRoster();
    }
  };

  // Handle Save Geofence Form
  const handleSaveGeofence = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGeofence(true);
    await saveCampusGeofenceConfigAction({
      institutionCode: selectedGeofenceInst,
      campusName: geofenceForm.campusName,
      latitude: geofenceForm.latitude,
      longitude: geofenceForm.longitude,
      radiusMeters: geofenceForm.radiusMeters,
      address: geofenceForm.address
    });
    setIsSavingGeofence(false);
    fetchGeofences();
  };

  const filteredRoster = roster.filter(r =>
    searchQuery === '' ||
    `${r.first_name} ${r.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              Faculty Attendance & Geofence Command Center
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-indigo-300 text-xs font-semibold">
              {isAllInstitutions ? 'All Institutions' : selectedInstitutionObj?.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-indigo-400" />
            Teacher Attendance & Geofence Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Review live teacher mobile self-check-ins, verify GPS geofence perimeters, or mark and override staff muster roll directly.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/teacher/attendance">
            <Button variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white" leftIcon={<Smartphone className="w-4 h-4" />}>
              Open Teacher Mobile App
            </Button>
          </Link>
          <Link href="/admin/attendance">
            <Button variant="outline" size="sm" className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700" leftIcon={<Users className="w-4 h-4" />}>
              Student Attendance
            </Button>
          </Link>
        </div>
      </div>

      {/* 🌟 TELEMATICS COUNTERS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Faculty</span>
          <span className="text-2xl font-black text-slate-900 mt-0.5 block">{counts.totalStaff}</span>
          <span className="text-[10px] text-slate-500 font-semibold">Active Staff</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Present</span>
          <span className="text-2xl font-black text-emerald-700 mt-0.5 block">{counts.present}</span>
          <span className="text-[10px] text-emerald-600 font-semibold">On Duty Today</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-indigo-200 bg-indigo-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Geofence Verified</span>
          <span className="text-2xl font-black text-indigo-700 mt-0.5 block">{counts.geofenceVerified}</span>
          <span className="text-[10px] text-indigo-600 font-semibold">Mobile GPS Check-in</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Late Arrival</span>
          <span className="text-2xl font-black text-amber-700 mt-0.5 block">{counts.late}</span>
          <span className="text-[10px] text-amber-600 font-semibold">Past Shift Start</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-sky-200 bg-sky-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">On Leave</span>
          <span className="text-2xl font-black text-sky-700 mt-0.5 block">{counts.onLeave}</span>
          <span className="text-[10px] text-sky-600 font-semibold">Approved Leave</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-rose-200 bg-rose-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Absent / Unmarked</span>
          <span className="text-2xl font-black text-rose-700 mt-0.5 block">{counts.absent + counts.notRecorded}</span>
          <span className="text-[10px] text-rose-600 font-semibold">Action Required</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('MUSTER')}
          className={`px-5 py-2.5 rounded-xl transition ${
            activeTab === 'MUSTER'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          📋 Daily Staff Muster Roll ({roster.length})
        </button>
        <button
          onClick={() => setActiveTab('GEOFENCE')}
          className={`px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'GEOFENCE'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Compass className="w-4 h-4" />
          Campus Geofence Perimeters & Radius Manager
        </button>
      </div>

      {/* ============================================================== */}
      {/* 🌟 TAB 1: DAILY STAFF MUSTER ROLL */}
      {/* ============================================================== */}
      {activeTab === 'MUSTER' && (
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-52">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="w-56">
                <Input
                  placeholder="Search faculty name, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="w-48">
                <Select
                  options={[
                    { value: 'ALL', label: 'All Departments' },
                    { value: 'Academics', label: 'Academics' },
                    { value: 'Science & Laboratories', label: 'Science' },
                    { value: 'Mathematics', label: 'Mathematics' },
                    { value: 'Languages', label: 'Languages' },
                    { value: 'Montessori', label: 'Montessori' },
                    { value: 'Sports', label: 'Sports' },
                    { value: 'Transport', label: 'Transport' },
                  ]}
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={handleBulkMarkPresent} leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                Mark Filtered Present ({filteredRoster.length})
              </Button>
              <Button size="sm" variant="outline" onClick={fetchRoster} isLoading={isLoadingRoster} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                Refresh
              </Button>
            </div>
          </div>

          {/* Muster Table */}
          <Card header={<h3 className="font-bold text-slate-900 text-sm">Faculty & Staff Attendance Roll — {selectedDate}</h3>}>
            {filteredRoster.length === 0 ? (
              <EmptyState
                icon={<UserCheck className="w-8 h-8 text-slate-400" />}
                title="No Faculty Members Found"
                description="Try clearing your search query or choosing another department."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">Faculty / Staff Member</th>
                      <th className="py-3 px-3">Department</th>
                      <th className="py-3 px-3">Check-In</th>
                      <th className="py-3 px-3">Check-Out</th>
                      <th className="py-3 px-3">Working Hrs</th>
                      <th className="py-3 px-3">Geofence & Method</th>
                      <th className="py-3 px-3 text-center">Mark Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRoster.map((staff) => (
                      <tr key={staff.staff_id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden">
                              {staff.photo_url ? <img src={staff.photo_url} alt={staff.first_name} className="w-full h-full object-cover" /> : staff.first_name[0]}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{staff.first_name} {staff.last_name}</span>
                              <span className="text-[10px] text-slate-400 font-medium">{staff.designation} • {staff.institution_code}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {staff.department}
                        </td>

                        <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                          {staff.check_in_time_fmt}
                        </td>

                        <td className="py-3 px-3 font-mono font-bold text-amber-700">
                          {staff.check_out_time_fmt}
                        </td>

                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {staff.working_hours ? `${staff.working_hours} hrs` : '--'}
                        </td>

                        <td className="py-3 px-3">
                          {staff.is_inside_geofence_checkin ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1 w-fit">
                              <Compass className="w-3 h-3" />
                              Geofence ({staff.check_in_distance_meters || 35}m)
                            </span>
                          ) : staff.verification_method === 'ADMIN_MANUAL_OVERRIDE' || staff.verification_method === 'ADMIN_BULK_ACTION' ? (
                            <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold w-fit block">
                              📍 Admin Override
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold w-fit block">
                              Unverified
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-1 text-[10px] font-black">
                            <button
                              type="button"
                              onClick={() => handleMarkStatus(staff.staff_id, 'PRESENT')}
                              className={`px-2 py-1 rounded-md transition ${
                                staff.attendance_status === 'PRESENT'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-700 hover:bg-emerald-100'
                              }`}
                            >
                              P
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMarkStatus(staff.staff_id, 'LATE')}
                              className={`px-2 py-1 rounded-md transition ${
                                staff.attendance_status === 'LATE'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-700 hover:bg-amber-100'
                              }`}
                            >
                              L
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMarkStatus(staff.staff_id, 'HALF_DAY')}
                              className={`px-2 py-1 rounded-md transition ${
                                staff.attendance_status === 'HALF_DAY'
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-700 hover:bg-indigo-100'
                              }`}
                            >
                              HD
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMarkStatus(staff.staff_id, 'ON_LEAVE')}
                              className={`px-2 py-1 rounded-md transition ${
                                staff.attendance_status === 'ON_LEAVE'
                                  ? 'bg-sky-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-700 hover:bg-sky-100'
                              }`}
                            >
                              LV
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMarkStatus(staff.staff_id, 'ABSENT')}
                              className={`px-2 py-1 rounded-md transition ${
                                staff.attendance_status === 'ABSENT'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-700 hover:bg-rose-100'
                              }`}
                            >
                              A
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

        </div>
      )}

      {/* ============================================================== */}
      {/* 🌟 TAB 2: CAMPUS GEOFENCE PERIMETERS & RADIUS MANAGER */}
      {/* ============================================================== */}
      {activeTab === 'GEOFENCE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left 4 Cols: Campus Selector */}
          <div className="lg:col-span-4 space-y-4">
            <Card header={<h3 className="font-bold text-slate-900 text-sm">Select Campus Geofence</h3>}>
              <div className="space-y-2">
                {institutionsList.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No campuses configured in database.</p>
                ) : (
                  institutionsList.map((camp) => (
                    <div
                      key={camp.code}
                      onClick={() => setSelectedGeofenceInst(camp.code)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between text-xs ${
                        selectedGeofenceInst === camp.code
                          ? 'bg-indigo-50 border-indigo-300 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{camp.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">Code: {camp.code}</span>
                      </div>
                      <Compass className="w-4 h-4 text-indigo-600" />
                    </div>
                  ))
                )}
              </div>
            </Card>

            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 text-indigo-950 space-y-2 text-xs">
              <span className="font-bold flex items-center gap-1.5 text-indigo-900">
                <Compass className="w-4 h-4 text-indigo-600" />
                How Geofencing Works:
              </span>
              <p className="text-[11px] leading-relaxed text-indigo-800">
                When a teacher opens the Mobile Teacher App and taps <strong>"Punch Attendance"</strong>, their smartphone GPS coordinates are verified in real-time against this radius using the Haversine geodesic algorithm. Check-ins outside this perimeter are automatically rejected.
              </p>
            </div>
          </div>

          {/* Right 8 Cols: Geofence Coordinates & Radius Form */}
          <div className="lg:col-span-8 space-y-4">
            <Card header={<h3 className="font-bold text-slate-900 text-sm">Configure Geofence Perimeter for {selectedGeofenceInst}</h3>}>
              <form onSubmit={handleSaveGeofence} className="space-y-4 text-xs">
                
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Campus Display Name</label>
                  <input
                    type="text"
                    value={geofenceForm.campusName}
                    onChange={(e) => setGeofenceForm({ ...geofenceForm, campusName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Center Latitude (° N)</label>
                    <input
                      type="number"
                      step="any"
                      value={geofenceForm.latitude}
                      onChange={(e) => setGeofenceForm({ ...geofenceForm, latitude: parseFloat(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Center Longitude (° E)</label>
                    <input
                      type="number"
                      step="any"
                      value={geofenceForm.longitude}
                      onChange={(e) => setGeofenceForm({ ...geofenceForm, longitude: parseFloat(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Allowed Geofence Radius</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[100, 200, 250, 500].map((radius) => (
                      <button
                        key={radius}
                        type="button"
                        onClick={() => setGeofenceForm({ ...geofenceForm, radiusMeters: radius })}
                        className={`py-2 rounded-xl border font-bold text-xs transition ${
                          geofenceForm.radiusMeters === radius
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {radius} Meters
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Physical Campus Address</label>
                  <textarea
                    rows={2}
                    value={geofenceForm.address}
                    onChange={(e) => setGeofenceForm({ ...geofenceForm, address: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSavingGeofence}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Save Geofence Perimeter
                </Button>

              </form>
            </Card>
          </div>

        </div>
      )}

    </div>
  );
}
