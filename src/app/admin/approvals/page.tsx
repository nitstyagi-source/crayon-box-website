"use client";

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
  ArrowRight,
  AlertCircle,
  FileText,
  CreditCard,
  User,
  Sparkles,
  RefreshCw,
  Eye,
  Check,
  X,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { useInstitution } from '@/components/providers/InstitutionContext';
import { getApprovalRequestsAction, processApprovalDecisionAction } from '@/app/actions/approval-engine-actions';

export default function ExecutiveApprovalsPage() {
  const { currentInstitution } = useInstitution();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTypeTab, setActiveTypeTab] = useState('ALL');
  const [activeStatus, setActiveStatus] = useState('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [reviewerComments, setReviewerComments] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchApprovals = async () => {
    setLoading(true);
    const res = await getApprovalRequestsAction({
      institutionCode: currentInstitution,
      status: activeStatus,
      requestType: activeTypeTab,
    });
    if (res.success && res.data) {
      setRequests(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApprovals();
  }, [currentInstitution, activeTypeTab, activeStatus]);

  const handleDecision = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!selectedRequest) return;
    setIsProcessing(true);
    const res = await processApprovalDecisionAction({
      requestId: selectedRequest.id,
      decision,
      reviewerName: 'Managing Trustee (Dr. N. Tyagi)',
      comments: reviewerComments,
    });

    setIsProcessing(false);
    if (res.success) {
      setToastMsg(`Request successfully ${decision === 'APPROVED' ? 'Approved & Committed' : 'Rejected'}!`);
      setSelectedRequest(null);
      setReviewerComments('');
      fetchApprovals();
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  const filteredRequests = requests.filter(r =>
    searchQuery === '' ||
    r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.entity_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.requested_by_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-700 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Executive Approvals Desk</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Maker-Checker Governance & Dual-Authorization for Fee Waivers, Refunds & Sensitive Record Alterations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchApprovals}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pending Review</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</div>
          <span className="text-[10px] text-amber-700 font-semibold">Requires Trustee / Principal Action</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Approved Today</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">14</div>
          <span className="text-[10px] text-emerald-700 font-semibold">Committed to Master Ledgers</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Flagged / Rejected</span>
          <div className="text-2xl font-black text-rose-600 mt-1">2</div>
          <span className="text-[10px] text-rose-700 font-semibold">Returned to Requesting Maker</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">SLA Turnaround</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">1.4 hrs</div>
          <span className="text-[10px] text-indigo-700 font-semibold">99.2% on-time resolution</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setActiveStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeStatus === st ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search request title, student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-indigo-600"
            />
          </div>
        </div>

        {/* Type Category Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {[
            { id: 'ALL', label: 'All Requests' },
            { id: 'FEE_CONCESSION', label: 'Fee Concessions' },
            { id: 'FEE_REFUND', label: 'Refunds' },
            { id: 'STUDENT_PROFILE_CHANGE', label: 'Profile Corrections' },
            { id: 'TC_ISSUANCE', label: 'TC Issuance' },
            { id: 'SALARY_MODIFICATION', label: 'Payroll Overrides' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTypeTab(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTypeTab === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
            Loading pending approvals...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            No requests matching current filters. All records clear!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 sm:p-5 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60 mt-0.5">
                    {req.request_type.includes('FEE') ? (
                      <CreditCard className="w-5 h-5" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition">
                        {req.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        req.priority === 'URGENT'
                          ? 'bg-rose-100 text-rose-700'
                          : req.priority === 'HIGH'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {req.priority}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
                      {req.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2">
                      <span>Target: <strong className="text-slate-700">{req.entity_name}</strong></span>
                      <span>•</span>
                      <span>Requested by: <strong className="text-slate-700">{req.requested_by_name}</strong> ({req.requested_by_role})</span>
                      <span>•</span>
                      <span>Date: <strong className="text-slate-600">{new Date(req.created_at).toLocaleDateString('en-GB')}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(req)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    Review & Decide
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-[#0A2558] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
                <div>
                  <h2 className="text-base font-black text-white">{selectedRequest.title}</h2>
                  <span className="text-xs text-slate-300">Target: {selectedRequest.entity_name}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Request Details</div>
                <p className="text-slate-700 leading-relaxed">{selectedRequest.description}</p>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-500">
                  <span>Initiated by: <strong>{selectedRequest.requested_by_name}</strong></span>
                  <span>Campus: <strong>{selectedRequest.institution_code}</strong></span>
                </div>
              </div>

              {/* Diff Visualization if available */}
              {selectedRequest.diff_payload && (
                <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 text-xs">
                  <div className="font-bold text-amber-900 uppercase tracking-wider text-[10px] mb-2">
                    Proposed Financial / Demographic Diff
                  </div>
                  <pre className="bg-white p-3 rounded-xl border border-amber-200 text-slate-900 font-mono text-[11px] overflow-x-auto">
                    {JSON.stringify(selectedRequest.diff_payload, null, 2)}
                  </pre>
                </div>
              )}

              {/* Reviewer Comments */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Executive Reviewer Remarks (Mandatory for Audit Trail)
                </label>
                <textarea
                  rows={3}
                  value={reviewerComments}
                  onChange={(e) => setReviewerComments(e.target.value)}
                  placeholder="Enter approval rationale or rejection grounds..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-indigo-600"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-bold transition"
              >
                Cancel
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleDecision('REJECTED')}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject Request
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleDecision('APPROVED')}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isProcessing ? 'Processing...' : 'Approve & Commit'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
