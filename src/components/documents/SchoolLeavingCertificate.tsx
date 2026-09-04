"use client";

import React, { useState, useRef } from 'react';
import { Printer, ShieldCheck, GraduationCap, Edit3, Check, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { updateIssuedTCAction } from '@/app/actions/student-v2-actions';

export interface TCProps {
  tcData: {
    id?: string;
    tc_number: string;
    ref_number?: string;
    school_name: string;
    school_id_number: string;
    udise_code: string;
    student_name: string;
    father_name: string;
    mother_name: string;
    dob: string;
    admission_no: string;
    admission_date: string;
    class_admitted: string;
    class_last_attended: string;
    section_last_attended: string;
    pen_no: string;
    withdrawal_date: string;
    issue_date: string;
    dues_paid: boolean;
    last_session_attended: string;
    total_attendance: number;
    student_attendance: number;
    annual_result: string;
    reason_for_leaving?: string;
  };
  onUpdate?: (updated: any) => void;
}

export function SchoolLeavingCertificate({ tcData, onUpdate }: TCProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState(tcData);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState(tcData);

  const handlePrint = () => {
    window.print();
  };

  const handleOpenEdit = () => {
    setEditForm(data);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    if (data.id) {
      const res = await updateIssuedTCAction(data.id, editForm);
      if (res.success) {
        setData(res.data);
        if (onUpdate) onUpdate(res.data);
        setIsEditModalOpen(false);
      } else {
        alert(`Error updating TC: ${res.error}`);
      }
    } else {
      setData(editForm);
      setIsEditModalOpen(false);
    }
    setIsSaving(false);
  };

  const toInputDate = (d: any): string => {
    if (!d) return '';
    if (d instanceof Date) {
      return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
    }
    if (typeof d === 'string') {
      return d.split('T')[0];
    }
    try {
      const parsed = new Date(d);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    } catch {}
    return '';
  };

  const formatDate = (dStr: any) => {
    if (!dStr) return 'N/A';
    try {
      const d = dStr instanceof Date ? dStr : new Date(dStr);
      if (isNaN(d.getTime())) return String(dStr);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return String(dStr);
    }
  };

  const schoolInitials = data.school_name
    ? data.school_name
        .split(' ')
        .map(w => w[0])
        .join('')
        .slice(0, 4)
        .toUpperCase()
    : 'CBS';

  return (
    <div className="space-y-4 font-sans max-w-4xl mx-auto">
      
      {/* Print CSS to isolate ONLY the certificate and fit perfectly on 1 Single A4 Sheet */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          html, body {
            background: #ffffff !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden !important;
          }
          #official-slc-certificate,
          #official-slc-certificate * {
            visibility: visible !important;
          }
          #official-slc-certificate {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 12px !important;
            border: 2px solid #0f172a !important;
            border-radius: 8px !important;
            box-shadow: none !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Action Bar (Hidden in Print) */}
      <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl print:hidden shadow-md">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Official School Leaving Certificate (TC / SLC) • Directorate of Education Format
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleOpenEdit} leftIcon={<Edit3 className="w-4 h-4" />}>
            Edit TC Details
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
            Print / Save as PDF (1 Page A4)
          </Button>
        </div>
      </div>

      {/* Official Certificate Paper Container */}
      <div
        id="official-slc-certificate"
        ref={certificateRef}
        className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-300 shadow-xl print:border-2 print:border-slate-900 print:rounded-lg print:p-4 text-slate-900 relative"
      >
        
        {/* Top Header Block */}
        <div className="text-center space-y-1.5 border-b-2 border-slate-900 pb-3">
          <div className="flex items-center justify-center gap-3">
            {/* School Crest / Emblem */}
            <div className="w-12 h-12 rounded-full border-2 border-slate-900 flex items-center justify-center font-black text-xs bg-slate-100 text-slate-900">
              <GraduationCap className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-wider uppercase">
                {data.school_name || 'EDUCATIONAL INSTITUTION'}
              </h1>
              <div className="bg-slate-900 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-0.5 rounded-sm inline-block mt-0.5">
                MANAGED BY VANI EDUCATIONAL TRUST
              </div>
            </div>
          </div>

          <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-slate-700 pt-0.5">
            RECOGNISE BY DIRECTORATE OF EDUCATION
          </p>

          <div className="flex items-center justify-between text-xs font-bold text-slate-700 pt-2 border-t border-slate-200 mt-2">
            <span>REF NO.: <strong className="font-mono text-slate-900">{data.ref_number || `REF/${schoolInitials}/SLC/2026/0042`}</strong></span>
            <span>TC NO.: <strong className="font-mono text-indigo-700">{data.tc_number}</strong></span>
            <span>DATE: <strong className="font-mono text-slate-900">{formatDate(data.issue_date)}</strong></span>
          </div>
        </div>

        {/* Certificate Title */}
        <div className="text-center my-4 print:my-3">
          <h2 className="text-lg sm:text-xl font-black uppercase tracking-widest underline decoration-2 underline-offset-4">
            SCHOOL LEAVING CERTIFICATE
          </h2>
        </div>

        {/* 17 Official Numbered Clauses matching Directorate of Education Format */}
        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-[13px] leading-tight">
          
          <div className="flex items-baseline">
            <span className="font-bold w-7 shrink-0">1.</span>
            <span className="font-medium text-slate-700 w-72 shrink-0">Name of School & I.D:</span>
            <span className="font-bold text-slate-900 uppercase">{data.school_name} ({data.school_id_number || '1253481'})</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-7 shrink-0">2.</span>
            <span className="font-medium text-slate-700 w-72 shrink-0">UDISE Code of School:</span>
            <span className="font-mono font-bold text-slate-900">{data.udise_code || '07124100151'}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-7 shrink-0">3.</span>
            <span className="font-medium text-slate-700 w-72 shrink-0">Name of Student:</span>
            <span className="font-extrabold text-slate-900 uppercase text-sm">{data.student_name}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-7 shrink-0">4.</span>
            <span className="font-medium text-slate-700 w-72 shrink-0">Father Name:</span>
            <span className="font-bold text-slate-900 uppercase">{data.father_name}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-7 shrink-0">5.</span>
            <span className="font-medium text-slate-700 w-72 shrink-0">Mother Name:</span>
            <span className="font-bold text-slate-900 uppercase">{data.mother_name}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-7 shrink-0">6.</span>
            <span className="font-medium text-slate-700 w-72 shrink-0">Date Of Birth:</span>
            <span className="font-bold text-slate-900">{formatDate(data.dob)}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-7 shrink-0">7.</span>
            <span className="font-medium text-slate-700 w-72 shrink-0">Admission No. & Date:</span>
            <span className="font-bold text-slate-900">{data.admission_no} (Admitted: {formatDate(data.admission_date)})</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-7 shrink-0">8.</span>
            <span className="font-medium text-slate-700 w-72 shrink-0">Class in which admitted:</span>
            <span className="font-bold text-slate-900">{data.class_admitted || 'Pre-Nursery'}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-7 shrink-0">9.</span>
            <span className="font-medium text-slate-700 w-72 shrink-0">Class & Section last attended:</span>
            <span className="font-bold text-slate-900">{data.class_last_attended} (Section {data.section_last_attended || 'A'})</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-7 shrink-0">10.</span>
            <span className="font-medium text-slate-700 w-72 shrink-0">Permanent Education Number (PEN):</span>
            <span className="font-mono font-bold text-slate-900">{data.pen_no || 'PEN-2026-08891'}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-7 shrink-0">11.</span>
            <span className="font-medium text-slate-700 w-72 shrink-0">Date of withdrawal of admission:</span>
            <span className="font-bold text-slate-900">{formatDate(data.withdrawal_date)}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-7 shrink-0">12.</span>
            <span className="font-medium text-slate-700 w-72 shrink-0">Date of SLC issue:</span>
            <span className="font-bold text-slate-900">{formatDate(data.issue_date)}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-7 shrink-0">13.</span>
            <span className="font-medium text-slate-700 w-72 shrink-0">Whether he/she has paid all dues of the school:</span>
            <span className="font-black text-emerald-700">{data.dues_paid ? 'YES (All Cleared)' : 'NO'}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-7 shrink-0">14.</span>
            <span className="font-medium text-slate-700 w-72 shrink-0">Last attended academic session and class:</span>
            <span className="font-bold text-slate-900">{data.last_session_attended} — {data.class_last_attended}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-7 shrink-0">15.</span>
            <span className="font-medium text-slate-700 w-72 shrink-0">Total Attendance during session:</span>
            <span className="font-bold text-slate-900">{data.total_attendance || 220} Days</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-7 shrink-0">16.</span>
            <span className="font-medium text-slate-700 w-72 shrink-0">Student Attendance during session:</span>
            <span className="font-bold text-slate-900">{data.student_attendance || 204} Days</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-7 shrink-0">17.</span>
            <span className="font-medium text-slate-700 w-72 shrink-0">Result:</span>
            <span className="font-black text-slate-900 uppercase">{data.annual_result || 'PROMOTED TO HIGHER CLASS'}</span>
          </div>

        </div>

        {/* Official Signatures Block */}
        <div className="grid grid-cols-3 gap-4 pt-10 sm:pt-14 mt-6 text-center text-xs font-bold text-slate-800 border-t border-slate-200 print:pt-8 print:mt-4">
          <div>
            <div className="h-8 border-b border-dashed border-slate-400 mb-1" />
            <span>Checked By</span>
          </div>
          <div>
            <div className="h-8 border-b border-dashed border-slate-400 mb-1" />
            <span>Admission In-Charge</span>
          </div>
          <div>
            <div className="h-8 border-b border-dashed border-slate-400 mb-1" />
            <span className="font-black text-sm">Principal</span>
          </div>
        </div>

        {/* Official Footer */}
        <div className="mt-6 pt-2 border-t-2 border-slate-900 flex items-center justify-between text-[10px] text-slate-600 font-medium print:mt-3">
          <div>
            <span>Tel. +91 9811102008</span> • <span>info@crayonboxschool.com</span> • <span>www.crayonboxschool.com</span>
          </div>
          <div>
            <span>Kh. No. 6/20, D-Block, Shastri Park Ext. Burari, Delhi-110084</span>
          </div>
        </div>

      </div>

      {/* 🌟 EDIT TC MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-lg">Edit School Leaving Certificate (TC)</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ref Number</label>
                <input
                  type="text"
                  value={editForm.ref_number || ''}
                  onChange={e => setEditForm({ ...editForm, ref_number: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">TC Number</label>
                <input
                  type="text"
                  value={editForm.tc_number || ''}
                  disabled
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 font-mono font-bold text-slate-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Student Full Name</label>
                <input
                  type="text"
                  value={editForm.student_name || ''}
                  onChange={e => setEditForm({ ...editForm, student_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Admission Number</label>
                <input
                  type="text"
                  value={editForm.admission_no || ''}
                  onChange={e => setEditForm({ ...editForm, admission_no: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Father Name</label>
                <input
                  type="text"
                  value={editForm.father_name || ''}
                  onChange={e => setEditForm({ ...editForm, father_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mother Name</label>
                <input
                  type="text"
                  value={editForm.mother_name || ''}
                  onChange={e => setEditForm({ ...editForm, mother_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={toInputDate(editForm.dob)}
                  onChange={e => setEditForm({ ...editForm, dob: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">PEN Number</label>
                <input
                  type="text"
                  value={editForm.pen_no || ''}
                  onChange={e => setEditForm({ ...editForm, pen_no: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Class Last Attended</label>
                <input
                  type="text"
                  value={editForm.class_last_attended || ''}
                  onChange={e => setEditForm({ ...editForm, class_last_attended: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Section</label>
                <input
                  type="text"
                  value={editForm.section_last_attended || ''}
                  onChange={e => setEditForm({ ...editForm, section_last_attended: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Annual Result / Status</label>
                <input
                  type="text"
                  value={editForm.annual_result || ''}
                  onChange={e => setEditForm({ ...editForm, annual_result: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">All Dues Paid?</label>
                <select
                  value={editForm.dues_paid ? 'YES' : 'NO'}
                  onChange={e => setEditForm({ ...editForm, dues_paid: e.target.value === 'YES' })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                >
                  <option value="YES">YES (All Dues Cleared)</option>
                  <option value="NO">NO (Dues Pending)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Attendance Days</label>
                <input
                  type="number"
                  value={editForm.total_attendance || 220}
                  onChange={e => setEditForm({ ...editForm, total_attendance: parseInt(e.target.value) || 220 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Student Attendance Days</label>
                <input
                  type="number"
                  value={editForm.student_attendance || 204}
                  onChange={e => setEditForm({ ...editForm, student_attendance: parseInt(e.target.value) || 204 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
              <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveEdit}
                isLoading={isSaving}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Changes to TC
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
