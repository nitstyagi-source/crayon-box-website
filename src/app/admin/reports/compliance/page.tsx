"use client";

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  Building2,
  Users,
  ShieldCheck,
  RefreshCw,
  Printer,
  Table,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { VastuModuleBanner } from '@/components/common/VastuModuleBanner';
import {
  generateCbseLocReportAction,
  generateUdisePlusProfileReportAction,
  generateCbseOasisSchoolProfileReportAction
} from '@/app/actions/compliance-actions';
import { useInstitution } from '@/components/providers/InstitutionContext';

export default function ComplianceExportersPage() {
  const { selectedInstitutionObj } = useInstitution();
  const [activeTab, setActiveTab] = useState<'CBSE_LOC' | 'UDISE' | 'CBSE_OASIS'>('CBSE_LOC');
  const [locRecords, setLocRecords] = useState<any[]>([]);
  const [udiseProfile, setUdiseProfile] = useState<any | null>(null);
  const [oasisProfile, setOasisProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const instCode = selectedInstitutionObj?.code;
    if (activeTab === 'CBSE_LOC') {
      const res = await generateCbseLocReportAction(instCode);
      if (res.success) setLocRecords(res.records);
    } else if (activeTab === 'UDISE') {
      const res = await generateUdisePlusProfileReportAction(instCode);
      if (res.success) setUdiseProfile(res.udiseData);
    } else if (activeTab === 'CBSE_OASIS') {
      const res = await generateCbseOasisSchoolProfileReportAction(instCode);
      if (res.success) setOasisProfile(res.oasisData);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [activeTab, selectedInstitutionObj?.code]);

  const downloadCsv = () => {
    if (activeTab === 'CBSE_LOC' && locRecords.length > 0) {
      const headers = ['Registration No', 'Student Full Name', 'Gender', 'DOB', 'Aadhaar (Masked)', 'Category', 'Class', 'Subjects'];
      const rows = locRecords.map(r => [
        r.registration_no,
        r.student_full_name,
        r.gender,
        r.dob,
        r.aadhaar_masked,
        r.category,
        r.registered_class,
        `"${r.registered_subject_codes.join('; ')}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `BOARD_LOC_EXAMINATION_DATASET_2026_27.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Vastu Module Header */}
      <VastuModuleBanner
        badgeText="STATUTORY & U-DISE+ REPOSITORIES"
        title="Statutory Board & Government Compliance Exporter"
        description="1-Click pre-formatted exports for Institutional OASIS, List of Candidates (LOC), and Ministry of Education U-DISE+ Data Repository."
      />

      {/* Selector & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('CBSE_LOC')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'CBSE_LOC'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            📋 Board LOC Export
          </button>
          <button
            onClick={() => setActiveTab('UDISE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'UDISE'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            🏛️ U-DISE+ Institutional Profile
          </button>
          <button
            onClick={() => setActiveTab('CBSE_OASIS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'CBSE_OASIS'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            🏫 Institutional OASIS Master Return
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'CBSE_LOC' && (
            <Button
              onClick={downloadCsv}
              disabled={locRecords.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Download LOC Formatted CSV
            </Button>
          )}
          <Button
            variant="outline"
            onClick={loadData}
            disabled={isLoading}
            className="text-xs font-semibold gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Tab 1: Board LOC Table */}
      {activeTab === 'CBSE_LOC' && (
        <Card className="p-0 overflow-hidden border-stone-200 shadow-xs">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800">
              Board Candidate Registration Records ({locRecords.length})
            </span>
            <span className="text-[11px] font-mono text-stone-500">
              Format: Board LOC Specification
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-600 uppercase text-[10px] font-bold border-b border-stone-200">
                  <th className="py-2.5 px-4">Reg No</th>
                  <th className="py-2.5 px-4">Student Name</th>
                  <th className="py-2.5 px-4">Gender</th>
                  <th className="py-2.5 px-4">DOB</th>
                  <th className="py-2.5 px-4">Class</th>
                  <th className="py-2.5 px-4">Registered Subjects</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-stone-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-stone-400" />
                      Formatting Board LOC dataset...
                    </td>
                  </tr>
                ) : locRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-stone-400">
                      No active student registration entries.
                    </td>
                  </tr>
                ) : (
                  locRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-amber-50/20">
                      <td className="py-2.5 px-4 font-mono font-bold text-stone-900">{r.registration_no}</td>
                      <td className="py-2.5 px-4 font-semibold text-stone-800">{r.student_full_name}</td>
                      <td className="py-2.5 px-4 text-stone-600">{r.gender}</td>
                      <td className="py-2.5 px-4 text-stone-600 font-mono text-[11px]">{r.dob}</td>
                      <td className="py-2.5 px-4 text-stone-800 font-bold">{r.registered_class}</td>
                      <td className="py-2.5 px-4 text-stone-500 text-[11px]">{r.registered_subject_codes.join(', ')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 2: U-DISE+ Profile */}
      {activeTab === 'UDISE' && udiseProfile && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5 border-stone-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-600" /> School Basic Parameters
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">School Name</span>
                <span className="font-bold text-stone-900">{udiseProfile.schoolName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">U-DISE National Code</span>
                <span className="font-mono font-bold text-amber-900">{udiseProfile.udiseSchoolCode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Academic Session</span>
                <span className="font-bold text-stone-900">{udiseProfile.academicSession}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">School Management</span>
                <span className="font-bold text-stone-900">{udiseProfile.managementType}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-stone-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" /> Demographics & Compliance
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Total Enrolled Students</span>
                <span className="font-mono font-bold text-stone-900">{udiseProfile.totalStudentsEnrolled}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Gender Ratio</span>
                <span className="font-bold text-stone-900">Boys: {udiseProfile.boysEnrolled} | Girls: {udiseProfile.girlsEnrolled}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Teaching Faculty on Roll</span>
                <span className="font-mono font-bold text-stone-900">{udiseProfile.totalTeachersOnRoll}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Pupil-Teacher Ratio (PTR)</span>
                <span className="font-mono font-bold text-emerald-800">{udiseProfile.teacherPupilRatio}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: CBSE OASIS Master Return */}
      {activeTab === 'CBSE_OASIS' && oasisProfile && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5 border-stone-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-600" /> Affiliated School Dossier
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">OASIS Affiliation Number</span>
                <span className="font-mono font-bold text-stone-900">{oasisProfile.affiliationNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">School Name</span>
                <span className="font-bold text-stone-900">{oasisProfile.schoolName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Principal</span>
                <span className="font-bold text-stone-900">{oasisProfile.principalName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Affiliation Status</span>
                <span className="font-bold text-emerald-800">{oasisProfile.affiliationStatus}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Campus Area (Sq. Mtr.)</span>
                <span className="font-mono font-bold text-stone-900">{oasisProfile.campusAreaSqMtr}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-stone-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Infrastructure & Teaching Norms
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Faculty Distribution</span>
                <span className="font-mono font-bold text-stone-900">
                  PGT: {oasisProfile.staffCountPGT} | TGT: {oasisProfile.staffCountTGT} | PRT: {oasisProfile.staffCountPRT}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Composite Science Lab</span>
                <span className="font-bold text-stone-900">{oasisProfile.compositeScienceLab}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Computer Labs & Terminals</span>
                <span className="font-bold text-stone-900">{oasisProfile.computerLabCount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Broadband Leased Line</span>
                <span className="font-mono font-bold text-stone-900">{oasisProfile.broadbandConnectivitySpeed}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Special Educator Appointed</span>
                <span className="font-bold text-emerald-800">{oasisProfile.specialEducatorAppointed}</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
