"use client";

import React, { useState, useEffect } from 'react';
import {
  Landmark,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Download,
  Building2,
  IndianRupee,
  Sparkles,
  QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  getVirtualAccountsListAction,
  getBankWebhookAuditLogsAction,
  simulateInboundBankTransferAction,
  StudentVirtualAccount,
  BankWebhookLog
} from '@/app/actions/van-reconciliation-actions';

export function BankReconciliationDesk() {
  const [accounts, setAccounts] = useState<StudentVirtualAccount[]>([]);
  const [logs, setLogs] = useState<BankWebhookLog[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [simulationSuccess, setSimulationSuccess] = useState<string | null>(null);

  // Simulation Form State
  const [simVan, setSimVan] = useState('');
  const [simAmount, setSimAmount] = useState('14500');
  const [simRemitter, setSimRemitter] = useState('RAJESH SHARMA HDFC A/C');
  const [showSimModal, setShowSimModal] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const [accRes, logRes] = await Promise.all([
      getVirtualAccountsListAction({ search }),
      getBankWebhookAuditLogsAction(15)
    ]);
    if (accRes.success && accRes.accounts) {
      setAccounts(accRes.accounts);
      if (accRes.accounts.length > 0 && !simVan) {
        setSimVan(accRes.accounts[0].van_account_number);
      }
    }
    if (logRes.success && logRes.logs) {
      setLogs(logRes.logs);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimulationSuccess(null);
    try {
      const res = await simulateInboundBankTransferAction({
        van_account_number: simVan,
        amount: Number(simAmount),
        remitter_name: simRemitter,
        provider: 'ICICI_ECOLLECT'
      });

      if (res.success) {
        setSimulationSuccess(`UTR ${res.transaction_ref} reconciled successfully! Auto-posted ₹${Number(simAmount).toLocaleString('en-IN')}.`);
        setShowSimModal(false);
        await loadData();
      } else {
        alert(`Simulation error: ${res.error}`);
      }
    } catch (e: any) {
      alert(`Simulation failed: ${e.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const totalReconciledToday = logs.reduce((acc, curr) => acc + (curr.amount_received || 0), 0);

  return (
    <div className="space-y-6">
      {/* Simulation Banner / Fast Action Bar */}
      <div className="bg-gradient-to-r from-[#FAF7F2] to-[#F5EFE6] border border-[#E8DFC8] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D97706] shadow-sm">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900">
                ICICI & HDFC Bank e-Collect (VAN) Hub
              </h3>
              <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live Webhook Active
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              Parents transfer fees via NEFT/RTGS/IMPS to student-specific Virtual Account Numbers with instant auto-ledger reconciliation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="border-[#E8DFC8] bg-white text-stone-700 hover:bg-stone-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setShowSimModal(true)}
            className="bg-[#D97706] hover:bg-[#B45309] text-white font-semibold shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-100" />
            Simulate Inbound Bank Wire
          </Button>
        </div>
      </div>

      {simulationSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{simulationSuccess}</span>
          </div>
          <button
            onClick={() => setSimulationSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-[#E8DFC8] bg-[#FAF7F2] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Auto-Reconciled Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-900 mt-2">
            ₹{totalReconciledToday.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 mt-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Zero-Touch Auto Match</span>
          </div>
        </Card>

        <Card className="p-4 border-[#E8DFC8] bg-[#FAF7F2] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Assigned Virtual Accounts
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#D97706] border border-amber-200 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-900 mt-2">
            {accounts.length} Students
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-stone-600 mt-1">
            <span>IFSC: ICIC0000104 (e-Collect)</span>
          </div>
        </Card>

        <Card className="p-4 border-[#E8DFC8] bg-[#FAF7F2] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Settlement Gateway
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-bold text-stone-900 mt-2">
            ICICI e-Collect API
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-blue-700 mt-1 font-medium">
            <span>HMAC-SHA256 Encrypted</span>
          </div>
        </Card>

        <Card className="p-4 border-[#E8DFC8] bg-[#FAF7F2] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Pending Ledger Exceptions
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-900 mt-2">
            0 Mismatches
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-1">
            <span>Clean settlement journal</span>
          </div>
        </Card>
      </div>

      {/* Main Grid: Student VAN Directory & Recent Inbound Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student Virtual Accounts List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <span>Student Virtual Account Directory</span>
                <span className="text-xs font-normal text-stone-500">
                  ({accounts.length} enrolled)
                </span>
              </h4>
              <p className="text-xs text-stone-500">
                Unique ICICI/HDFC account numbers allocated to every student
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <Input
                placeholder="Search student or VAN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs border-[#E8DFC8] bg-white h-8"
              />
            </div>
          </div>

          <div className="border border-[#E8DFC8] rounded-xl bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto max-h-[520px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAF7F2] text-stone-600 font-semibold border-b border-[#E8DFC8] sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3">Student & Class</th>
                    <th className="py-2.5 px-3">Virtual Account (VAN)</th>
                    <th className="py-2.5 px-3">UPI VPA</th>
                    <th className="py-2.5 px-3 text-right">Fee Due</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DFC8]">
                  {accounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-amber-50/40 transition">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-stone-900">{acc.student_name}</div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                          <span>{acc.grade_section}</span>
                          <span>•</span>
                          <span>Adm: {acc.admission_no}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-stone-800">
                        <div className="flex items-center gap-1.5">
                          <span>{acc.van_account_number}</span>
                          <button
                            onClick={() => handleCopy(acc.van_account_number, `van-${acc.id}`)}
                            title="Copy Account Number"
                            className="p-1 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-800"
                          >
                            {copiedField === `van-${acc.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="text-[10px] text-stone-400">IFSC: {acc.ifsc_code}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-stone-700">
                        <div className="flex items-center gap-1">
                          <span>{acc.upi_vpa}</span>
                          <button
                            onClick={() => handleCopy(acc.upi_vpa, `vpa-${acc.id}`)}
                            title="Copy UPI VPA"
                            className="p-1 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-800"
                          >
                            {copiedField === `vpa-${acc.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold">
                        {acc.outstanding_balance > 0 ? (
                          <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[11px]">
                            ₹{acc.outstanding_balance.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px]">
                            Settled
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSimVan(acc.van_account_number);
                            setSimAmount(acc.outstanding_balance > 0 ? acc.outstanding_balance.toString() : '12000');
                            setShowSimModal(true);
                          }}
                          className="text-[11px] h-7 px-2 border-[#E8DFC8] bg-white hover:bg-stone-50 text-stone-700"
                        >
                          Simulate Wire
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Inbound Webhook Audit Log Stream (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <span>Inbound Wire Auto-Post Stream</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </h4>
              <p className="text-xs text-stone-500">
                Real-time bank webhook receipts credited directly to fee ledger
              </p>
            </div>
          </div>

          <div className="border border-[#E8DFC8] rounded-xl bg-white p-3 divide-y divide-[#E8DFC8] shadow-sm max-h-[520px] overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="py-3 first:pt-1 last:pb-1">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mt-0.5 shrink-0">
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-stone-900 text-xs flex items-center gap-1.5">
                        <span>+₹{log.amount_received.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] font-normal px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                          {log.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-600 font-mono mt-0.5">
                        VAN: {log.van_account_number}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {log.student_name || 'Mapped Student Account'}
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        Remitter: {log.remitter_name} • Ref: {log.transaction_ref}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-stone-400 shrink-0 font-medium">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Simulate Inbound Bank Wire */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-[#E8DFC8] rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#D97706]" />
                <h3 className="font-bold text-stone-900 text-base">
                  Simulate Inbound Bank Transfer (VAN)
                </h3>
              </div>
              <button
                onClick={() => setShowSimModal(false)}
                className="text-stone-400 hover:text-stone-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Trigger a realistic ICICI/HDFC e-Collect webhook payload to test auto-matching and fee ledger posting without live banking credentials.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Target Student Virtual Account (VAN)
                </label>
                <Input
                  value={simVan}
                  onChange={(e) => setSimVan(e.target.value)}
                  placeholder="e.g. CBS2026001"
                  className="font-mono text-xs border-[#E8DFC8]"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Transfer Amount (₹)
                </label>
                <Input
                  type="number"
                  value={simAmount}
                  onChange={(e) => setSimAmount(e.target.value)}
                  placeholder="14500"
                  className="text-xs border-[#E8DFC8]"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Remitter Name & Bank
                </label>
                <Input
                  value={simRemitter}
                  onChange={(e) => setSimRemitter(e.target.value)}
                  placeholder="PARENT NAME HDFC A/C"
                  className="text-xs border-[#E8DFC8]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DFC8]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSimModal(false)}
                className="border-[#E8DFC8] text-stone-700"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleRunSimulation}
                disabled={isSimulating || !simVan || !simAmount}
                className="bg-[#D97706] hover:bg-[#B45309] text-white font-semibold"
              >
                {isSimulating ? 'Processing Wire...' : 'Simulate Immediate Settlement'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
