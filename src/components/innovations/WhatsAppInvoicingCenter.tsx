"use client";

import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, CheckCircle2, CreditCard, Sparkles, ExternalLink, RefreshCw } from 'lucide-react';
import {
  dispatchQuarterlyWhatsAppInvoicesAction,
  getWhatsAppInvoicingLogsAction
} from '@/app/actions/whatsapp-upi-actions';

export const WhatsAppInvoicingCenter: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDispatching, setIsDispatching] = useState(false);
  const [quarterName, setQuarterName] = useState('Q2 2026-27');
  const [dispatchNotice, setDispatchNotice] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const res = await getWhatsAppInvoicingLogsAction();
      if (res.success) setLogs(res.logs);
    } finally {
      setIsLoading(false);
    }
  }

  const handleRunDispatch = async () => {
    setIsDispatching(true);
    setDispatchNotice(null);
    try {
      const res = await dispatchQuarterlyWhatsAppInvoicesAction(quarterName);
      if (res.success) {
        setDispatchNotice(`✓ Dispatched ${res.dispatchedCount} personalized WhatsApp UPI fee invoices for ${quarterName}!`);
        await loadData();
      } else {
        alert(res.error || 'Failed to dispatch invoices');
      }
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* HUD Ribbon */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
            <MessageCircle className="w-4 h-4" />
            <span>Automated NPCI UPI Intent &amp; WhatsApp Gateway</span>
          </div>
          <h2 className="text-xl font-bold text-stone-900">Quarterly WhatsApp UPI Invoicing Center</h2>
          <p className="text-xs text-stone-500 mt-0.5">Automated delivery of 1-click Razorpay/UPI deep links to registered parent WhatsApp numbers on the 1st of every quarter.</p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">Total Messages Sent</span>
            <strong className="text-emerald-950 font-bold text-sm">{logs.length} Notices</strong>
          </div>
        </div>
      </div>

      {dispatchNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{dispatchNotice}</span>
        </div>
      )}

      {/* Grid: Dispatch Trigger & Live Outbox Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Dispatch Trigger */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-sm font-bold text-stone-900">Quarterly Invoicing Trigger</h3>
            <p className="text-[11px] text-stone-400">Automated UPI payment link generation</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-stone-500 font-bold mb-1">Billing Cycle</label>
              <select
                value={quarterName}
                onChange={(e) => setQuarterName(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-800"
              >
                <option value="Q1 2026-27">Q1 2026-27 (Apr - Jun)</option>
                <option value="Q2 2026-27">Q2 2026-27 (Jul - Sep)</option>
                <option value="Q3 2026-27">Q3 2026-27 (Oct - Dec)</option>
                <option value="Q4 2026-27">Q4 2026-27 (Jan - Mar)</option>
              </select>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl space-y-2 border border-stone-200/60">
              <span className="text-[10px] font-black uppercase text-stone-400 block">UPI Paylink Architecture</span>
              <p className="text-[11px] text-stone-600 font-mono leading-relaxed">
                upi://pay?pa=fees.crayonbox@icici&amp;pn=CrayonBox&amp;am=24500
              </p>
              <span className="text-[10px] text-emerald-600 font-bold block">✓ Supports GPay, PhonePe, Paytm, BHIM</span>
            </div>

            <button
              onClick={handleRunDispatch}
              disabled={isDispatching}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isDispatching ? 'Transmitting WhatsApp Messages...' : `Dispatch ${quarterName} Invoices`}</span>
            </button>
          </div>
        </div>

        {/* Right 2 Cols: Outbox Ledger */}
        <div className="lg:col-span-2 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-sm font-bold text-stone-900">WhatsApp Outbox Audit Trail</h3>
            <span className="text-[11px] text-stone-400">NPCI Intent Logs</span>
          </div>

          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="p-3.5 bg-stone-50 border border-stone-200/80 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <strong className="text-stone-900 font-bold">{log.recipientName}</strong>
                    <span className="text-stone-500">({log.recipientPhone})</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {log.status}
                  </span>
                </div>

                <div className="p-2.5 bg-white border border-stone-200 rounded-lg text-stone-700 text-[11px] whitespace-pre-line font-sans">
                  {log.messageText}
                </div>

                <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono">
                  <span>Student: {log.studentName} ({log.admissionNo})</span>
                  <span>{new Date(log.sentAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}

            {logs.length === 0 && !isLoading && (
              <div className="p-12 text-center text-xs text-stone-400 border border-dashed border-stone-200 rounded-xl">
                No invoices dispatched yet. Trigger your first quarterly run above.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
