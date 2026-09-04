"use client";

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  AlertTriangle,
  FileText,
  DollarSign,
  Award,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  Building2,
  Calendar,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { VastuModuleBanner } from '@/components/common/VastuModuleBanner';
import {
  getAuditLogsAction,
  triggerOverdueFinesCalculationAction,
  AuditLogEntry
} from '@/app/actions/audit-actions';

export default function EnterpriseAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTriggeringFines, setIsTriggeringFines] = useState(false);
  const [fineSweepResult, setFineSweepResult] = useState<any | null>(null);

  const loadAuditLogs = async () => {
    setIsLoading(true);
    const res = await getAuditLogsAction({
      entityType: selectedEntity,
      severity: selectedSeverity,
      limit: 100
    });
    if (res.success && res.logs) {
      setLogs(res.logs);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadAuditLogs();
  }, [selectedEntity, selectedSeverity]);

  const handleRunFineSweep = async () => {
    setIsTriggeringFines(true);
    setFineSweepResult(null);
    const res = await triggerOverdueFinesCalculationAction();
    if (res.success) {
      setFineSweepResult(res.stats);
      await loadAuditLogs();
    }
    setIsTriggeringFines(false);
  };

  const filteredLogs = logs.filter(l => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.entity_id.toLowerCase().includes(q) ||
      l.entity_type.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.actor_name.toLowerCase().includes(q) ||
      l.actor_role.toLowerCase().includes(q)
    );
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL_FINANCE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <DollarSign className="w-3 h-3" /> Critical Finance
          </span>
        );
      case 'WARN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3" /> Warning
          </span>
        );
      case 'SECURITY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldAlert className="w-3 h-3" /> Security Event
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3 h-3" /> Informational
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Vastu Module Header */}
      <VastuModuleBanner
        badgeText="ISO 27001 & DPDP COMPLIANCE"
        title="Enterprise Audit & Governance Vault"
        description="Field-level temporal audit trail, DPDP compliance event logger, and automated financial guardrails."
      />

      {/* Action Header & Fine Recalculator */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            Immutable System Log & Financial Guardrail Controls
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Every sensitive state mutation (fee discounts, marks overrides, attendance waivers) is cryptographically recorded.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={handleRunFineSweep}
            disabled={isTriggeringFines}
            className="bg-amber-600 hover:bg-amber-700 text-white gap-2 text-xs font-bold shadow-xs cursor-pointer"
          >
            <Zap className={`w-3.5 h-3.5 ${isTriggeringFines ? 'animate-spin' : ''}`} />
            {isTriggeringFines ? 'Sweeping Arrears...' : 'Run Automated Fine Sweep'}
          </Button>

          <Button
            variant="outline"
            onClick={loadAuditLogs}
            disabled={isLoading}
            className="text-xs font-semibold gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Fine Sweep Banner if Executed */}
      {fineSweepResult && (
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center font-bold text-amber-800 shrink-0">
              ⚡
            </div>
            <div>
              <p className="font-bold">Automated Overdue Late Fee Sweep Complete</p>
              <p className="text-stone-600">
                Checked: <strong>{fineSweepResult.invoices_checked} invoices</strong> | Fines Newly Applied: <strong>{fineSweepResult.fines_applied_count}</strong> | Total Accumulated: <strong>₹{Number(fineSweepResult.total_fines_accumulated).toLocaleString('en-IN')}</strong>
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-amber-200/60 rounded text-[11px] font-bold text-amber-950">
            Recorded in Audit Vault
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-stone-50/80 p-3 rounded-xl border border-stone-200">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, actor, role, or action name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white rounded-lg border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="w-full py-1.5 px-3 text-xs bg-white rounded-lg border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium text-stone-700"
          >
            <option value="ALL">All Entity Domains</option>
            <option value="STUDENT">Student Dossiers</option>
            <option value="INVOICE">Fee Invoices & Slabs</option>
            <option value="TRANSACTION">Treasury Transactions</option>
            <option value="EXAM_MARK">Assessment & Grades</option>
            <option value="STAFF">HR & Faculty</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="w-full py-1.5 px-3 text-xs bg-white rounded-lg border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium text-stone-700"
          >
            <option value="ALL">All Severity Levels</option>
            <option value="CRITICAL_FINANCE">Critical Finance</option>
            <option value="WARN">Warnings & Overrides</option>
            <option value="SECURITY">Security & Access</option>
            <option value="INFO">Informational</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <Card className="overflow-hidden border-stone-200/80 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-100/70 text-stone-600 font-semibold border-b border-stone-200 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Mutation Payload</th>
                <th className="py-3 px-4 text-right">Client IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-stone-400" />
                    Querying secure audit ledger...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                    No audit records matching criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-amber-50/20 transition">
                    <td className="py-3 px-4 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-stone-900">{log.actor_name}</div>
                      <span className="text-[10px] font-mono text-stone-400 uppercase tracking-tight">
                        {log.actor_role}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded text-[10px] border border-stone-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-stone-800">{log.entity_type}</div>
                      <div className="text-[10px] font-mono text-stone-400 truncate max-w-[120px]" title={log.entity_id}>
                        {log.entity_id}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getSeverityBadge(log.severity)}
                    </td>
                    <td className="py-3 px-4 max-w-[280px]">
                      {log.new_value ? (
                        <pre className="text-[10px] font-mono bg-stone-50 text-stone-700 p-1.5 rounded border border-stone-200/60 overflow-hidden text-ellipsis whitespace-nowrap">
                          {typeof log.new_value === 'string' ? log.new_value : JSON.stringify(log.new_value)}
                        </pre>
                      ) : (
                        <span className="text-stone-400 italic text-[11px]">System action (no payload)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[11px] text-stone-400 whitespace-nowrap">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
