"use client";

import React, { useState } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, FileText, Database, Layers } from 'lucide-react';
import { importLegacyAdmissionsAction } from '@/app/actions/admissions-analytics';

interface LegacyImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const LegacyImportModal: React.FC<LegacyImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [session, setSession] = useState('2024-2025');
  const [csvText, setCsvText] = useState(
`Academic Session,Student Name,Grade,Parent Name,Parent Phone,Status,Source,Lost Reason
2024-2025,Aarav Malhotra,Class 1,Vikram Malhotra,+91 98110 11223,ENROLLED,Website,
2024-2025,Ananya Sen,Nursery,Debashish Sen,+91 98220 33445,ENROLLED,Referral,
2024-2025,Kabir Joshi,Class 2,Rohit Joshi,+91 98330 55667,LOST,Google Ads,Fee Objection
2024-2025,Saanvi Rastogi,UKG,Amit Rastogi,+91 98440 77889,ENROLLED,Walk-in,`
  );
  const [isImporting, setIsImporting] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const lines = csvText.trim().split('\n');
      const rows = lines.slice(1).map(line => {
        const parts = line.split(',').map(p => p.trim());
        return {
          academicSession: parts[0] || session,
          studentName: parts[1],
          grade: parts[2],
          parentName: parts[3],
          parentPhone: parts[4],
          status: parts[5] || 'ENROLLED',
          source: parts[6] || 'Legacy Import',
          lostReason: parts[7] || undefined
        };
      }).filter(r => r.studentName && r.grade);

      const res = await importLegacyAdmissionsAction(rows);
      if (res.success) {
        setResultMessage(res.message || 'Successfully imported historical records.');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        alert(res.error || 'Failed to import legacy records.');
      }
    } catch (e: any) {
      alert('Error parsing CSV format: ' + e.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">Legacy Admissions Data Importer</h3>
              <p className="text-xs text-stone-500">
                Import historical admissions records tagged as LEGACY for Year-on-Year analysis.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-700 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-start gap-3">
            <Layers className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
            <div className="text-purple-900 leading-relaxed">
              <strong>Data Integrity Guarantee:</strong> Historical imports are tagged with <code>data_source = 'LEGACY_IMPORT'</code>. They empower Year-on-Year comparisons without polluting your live active operational records.
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Target Academic Session</label>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-stone-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
            >
              <option value="2025-2026">2025–2026 (Previous Year)</option>
              <option value="2024-2025">2024–2025</option>
              <option value="2023-2024">2023–2024</option>
              <option value="2022-2023">2022–2023</option>
              <option value="2021-2022">2021–2022</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Paste CSV / Excel Data</label>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full text-xs font-mono p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
            />
          </div>

          {resultMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{resultMessage}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isImporting}
              onClick={handleImport}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isImporting ? 'Validating & Importing...' : 'Validate & Import Legacy Records'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
