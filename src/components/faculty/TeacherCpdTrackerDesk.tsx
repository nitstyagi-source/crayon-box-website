"use client";

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Award,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  Search,
  Download,
  Printer,
  ShieldCheck,
  Building2,
  FileText,
  Sliders,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  getTeacherCpdOverviewAction,
  logTeacherCpdWorkshopAction,
  TeacherCpdRecord
} from '@/app/actions/teacher-cpd-actions';

export function TeacherCpdTrackerDesk() {
  const [teachers, setTeachers] = useState<TeacherCpdRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'COMPLIANT' | 'IN_PROGRESS' | 'ACTION_REQUIRED'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Log Workshop Modal State
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [workshopTitle, setWorkshopTitle] = useState('');
  const [agency, setAgency] = useState('CBSE_COE');
  const [hours, setHours] = useState('10');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // OASIS Report Modal
  const [showOasisModal, setShowOasisModal] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const res = await getTeacherCpdOverviewAction();
    if (res.success && res.teachers) {
      setTeachers(res.teachers);
      if (res.teachers.length > 0 && !selectedTeacherId) {
        setSelectedTeacherId(res.teachers[0].id);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogWorkshop = async () => {
    if (!selectedTeacherId || !workshopTitle) return;
    setIsSubmitting(true);
    try {
      const res = await logTeacherCpdWorkshopAction({
        teacher_id: selectedTeacherId,
        workshop_title: workshopTitle,
        conducting_agency: agency,
        hours_credited: Number(hours),
        completion_date: date
      });

      if (res.success) {
        setSuccessMessage(res.message || 'Workshop hours logged successfully!');
        setShowLogModal(false);
        setWorkshopTitle('');
        await loadData();
      }
    } catch (e: any) {
      alert(`Error logging workshop: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.teacher_name.toLowerCase().includes(search.toLowerCase()) ||
      t.employee_code.toLowerCase().includes(search.toLowerCase()) ||
      t.department.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const compliantCount = teachers.filter((t) => t.status === 'COMPLIANT').length;
  const inProgressCount = teachers.filter((t) => t.status === 'IN_PROGRESS').length;
  const actionRequiredCount = teachers.filter((t) => t.status === 'ACTION_REQUIRED').length;
  const totalHoursLogged = teachers.reduce((acc, curr) => acc + curr.total_hours, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#FAF7F2] to-[#F5EFE6] border border-[#E8DFC8] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D97706] shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900">
                Mandatory 50-Hour Teacher CPD Credit Tracker
              </h3>
              <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-900 rounded-full border border-amber-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D97706]" />
                Accreditation Bye-Laws §5.3
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              Tracks mandatory 50 hours/year in-service teacher training (minimum 25 hrs External/Council + 25 hrs School/NCERT) with 1-click statutory audit reporting.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOasisModal(true)}
            className="border-[#E8DFC8] bg-white text-stone-700 hover:bg-stone-50 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-stone-500" />
            Accreditation &amp; OASIS Audit Export
          </Button>
          <Button
            size="sm"
            onClick={() => setShowLogModal(true)}
            className="bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1 text-amber-100" />
            Log Training Credit
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-[#E8DFC8] bg-[#FAF7F2] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              100% Compliant Faculty
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-900 mt-2">
            {compliantCount} / {teachers.length}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 mt-1 font-medium">
            <span>Completed 50+ hours target</span>
          </div>
        </Card>

        <Card className="p-4 border-[#E8DFC8] bg-[#FAF7F2] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Training In Progress
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#D97706] border border-amber-200 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-900 mt-2">
            {inProgressCount} Teachers
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-[#D97706] mt-1 font-medium">
            <span>25–49 hours completed</span>
          </div>
        </Card>

        <Card className="p-4 border-[#E8DFC8] bg-[#FAF7F2] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Action Required
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-900 mt-2">
            {actionRequiredCount} Teachers
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-rose-700 mt-1">
            <span>Below 25 hours minimum</span>
          </div>
        </Card>

        <Card className="p-4 border-[#E8DFC8] bg-[#FAF7F2] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Total In-Service Hours
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-900 mt-2">
            {totalHoursLogged} Hours
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-indigo-700 mt-1">
            <span>Academic Year 2026–2027</span>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E8DFC8] p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto">
          {(['ALL', 'COMPLIANT', 'IN_PROGRESS', 'ACTION_REQUIRED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-amber-100 text-[#D97706] border border-amber-300'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {st === 'ALL' ? 'All Faculty' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <Input
            placeholder="Search teacher, code, dept..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs border-[#E8DFC8] h-8"
          />
        </div>
      </div>

      {/* Faculty CPD Roster Table */}
      <div className="border border-[#E8DFC8] rounded-2xl bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#FAF7F2] text-stone-600 font-semibold border-b border-[#E8DFC8]">
              <tr>
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-4">Department & Wing</th>
                <th className="py-3 px-4">Annual CPD Progress</th>
                <th className="py-3 px-4 text-center">Board / External</th>
                <th className="py-3 px-4 text-center">School Internal</th>
                <th className="py-3 px-4 text-center">Compliance Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DFC8]">
              {filteredTeachers.map((t) => (
                <tr key={t.id} className="hover:bg-amber-50/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-stone-900 text-xs">{t.teacher_name}</div>
                    <div className="text-[11px] text-stone-500 font-mono">Code: {t.employee_code}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-stone-800 font-medium">{t.department}</div>
                    <div className="text-[10px] text-stone-400">{t.designation}</div>
                  </td>
                  <td className="py-3 px-4 min-w-[200px]">
                    <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
                      <span className="text-stone-700">{t.total_hours} / 50 Hours</span>
                      <span className={t.compliance_percentage >= 100 ? 'text-emerald-700' : 'text-[#D97706]'}>
                        {t.compliance_percentage}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden border border-stone-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          t.compliance_percentage >= 100
                            ? 'bg-emerald-600'
                            : t.compliance_percentage >= 50
                            ? 'bg-[#D97706]'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, t.compliance_percentage)}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-stone-800">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[11px]">
                      {t.cbse_external_hours} hrs
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-stone-800">
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-[11px]">
                      {t.internal_school_hours} hrs
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                        t.status === 'COMPLIANT'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : t.status === 'IN_PROGRESS'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}
                    >
                      {t.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedTeacherId(t.id);
                        setShowLogModal(true);
                      }}
                      className="text-[11px] h-7 px-2.5 border-[#E8DFC8] bg-white hover:bg-stone-50 text-stone-700"
                    >
                      + Credit Hours
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Log Workshop Training Credit */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-[#E8DFC8] rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#D97706]" />
                <h3 className="font-bold text-stone-900 text-base">
                  Log CPD Workshop Training Hours
                </h3>
              </div>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-stone-400 hover:text-stone-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Select Faculty Member</label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full text-xs border border-[#E8DFC8] rounded-lg p-2 bg-white text-stone-800"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.teacher_name} ({t.employee_code} - {t.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Workshop Title</label>
                <Input
                  value={workshopTitle}
                  onChange={(e) => setWorkshopTitle(e.target.value)}
                  placeholder="e.g. NEP 2020 Pedagogical Leadership"
                  className="text-xs border-[#E8DFC8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Conducting Agency</label>
                  <select
                    value={agency}
                    onChange={(e) => setAgency(e.target.value)}
                    className="w-full text-xs border border-[#E8DFC8] rounded-lg p-2 bg-white text-stone-800"
                  >
                    <option value="EXTERNAL_BOARD">Board / Council (External)</option>
                    <option value="CBSE_COE">COE (External)</option>
                    <option value="SAHODAYA">Sahodaya / Cluster (External)</option>
                    <option value="NCERT">NCERT / DIET (External)</option>
                    <option value="INTERNAL">School In-House (Internal)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Hours Credited</label>
                  <Input
                    type="number"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="text-xs border-[#E8DFC8]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Date of Completion</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="text-xs border-[#E8DFC8]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DFC8]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLogModal(false)}
                className="border-[#E8DFC8] text-stone-700"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleLogWorkshop}
                disabled={isSubmitting || !workshopTitle}
                className="bg-[#D97706] hover:bg-[#B45309] text-white font-semibold"
              >
                {isSubmitting ? 'Logging...' : 'Approve & Credit CPD Hours'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Accreditation & OASIS Report Preview */}
      {showOasisModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-[#E8DFC8] rounded-2xl shadow-xl max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-3">
              <div>
                <h3 className="font-bold text-stone-900 text-base">
                  Continuous Professional Development Compliance Report
                </h3>
                <p className="text-xs text-stone-500">
                  Affiliation Code: 2132891 • Session 2026–2027 • Form §5.3
                </p>
              </div>
              <button
                onClick={() => setShowOasisModal(false)}
                className="text-stone-400 hover:text-stone-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="border border-[#E8DFC8] rounded-xl p-4 bg-[#FAF7F2] text-xs space-y-3">
              <div className="flex justify-between border-b border-[#E8DFC8] pb-2 font-semibold text-stone-800">
                <span>Total Teaching Faculty: {teachers.length}</span>
                <span className="text-emerald-800">Overall Compliance: {Math.round((compliantCount / (teachers.length || 1)) * 100)}%</span>
              </div>

              <div className="divide-y divide-[#E8DFC8]">
                {teachers.map((t) => (
                  <div key={t.id} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-stone-900">{t.teacher_name}</span>
                      <span className="text-stone-500 ml-2 font-mono">({t.employee_code})</span>
                      <div className="text-[11px] text-stone-500">{t.designation} - {t.department}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-stone-900">{t.total_hours} / 50 hrs</span>
                      <div className="text-[10px] text-stone-500">
                        External: {t.cbse_external_hours}h | Internal: {t.internal_school_hours}h
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E8DFC8]">
              <span className="text-xs text-stone-500">
                Authorized by Principal &amp; Academic Director
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOasisModal(false)}
                  className="border-[#E8DFC8]"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => window.print()}
                  className="bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-semibold"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" />
                  Print Official OASIS Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
