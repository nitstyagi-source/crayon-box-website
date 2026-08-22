"use client";

import React, { useState } from 'react';
import {
  Send, MessageSquare, Mail, Bell, Smartphone,
  CheckCircle2, Clock, Users, Download, Plus, Filter
} from 'lucide-react';
import { VANI_TRUST_INSTITUTIONS } from '@/lib/core/institution/trust-hierarchy';

export default function CommunicationCampaignsPage() {
  const [selectedInst, setSelectedInst] = useState<string>('ALL');

  const campaigns = [
    {
      id: 'CMP-2026-088',
      title: 'Quarter 2 Fee Demand & Sibling Concession Notice',
      channels: ['MSG91 SMS', 'WhatsApp', 'Parent App Push'],
      targetAudience: 'All Enrolled Parents (2,850 Recipients)',
      deliveredCount: 2842,
      deliveryRate: '99.7%',
      readCount: 2650,
      readRate: '93.2%',
      dateSent: '2026-08-20 09:30 AM',
      status: 'COMPLETED',
    },
    {
      id: 'CMP-2026-089',
      title: 'Emergency Delhi NCR Heavy Rain Closure Advisory',
      channels: ['High-Priority SMS', 'Push Notification'],
      targetAudience: 'CBS & CBPS Parents (1,570 Recipients)',
      deliveredCount: 1570,
      deliveryRate: '100.0%',
      readCount: 1540,
      readRate: '98.1%',
      dateSent: '2026-08-14 06:15 AM',
      status: 'COMPLETED',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              High-Speed Broadcast
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">MSG91 + WhatsApp + Push Hub</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Omnichannel Broadcasts & Circulars</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Multi-channel campaign transmitter with delivery confirmation, read receipts, and parent acknowledgement tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs">
            <Plus className="w-3.5 h-3.5" />
            Create New Broadcast
          </button>
        </div>
      </div>

      {/* Broadcast History Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
          <Send className="w-5 h-5 text-blue-600" /> Recent Broadcast Circulars & Delivery Telemetry
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-400 uppercase font-black tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3.5">Campaign ID & Title</th>
                <th className="p-3.5">Channels</th>
                <th className="p-3.5">Target Audience</th>
                <th className="p-3.5 text-right">Delivery Rate</th>
                <th className="p-3.5 text-right">Read Receipts</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {campaigns.map((cmp) => (
                <tr key={cmp.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-3.5">
                    <span className="font-black text-stone-900 block text-sm">{cmp.title}</span>
                    <span className="font-mono text-stone-400 text-[10px]">{cmp.id}</span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex flex-wrap gap-1">
                      {cmp.channels.map((ch, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">
                          {ch}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3.5 font-bold text-stone-800">{cmp.targetAudience}</td>
                  <td className="p-3.5 text-right font-black text-emerald-600">{cmp.deliveryRate}</td>
                  <td className="p-3.5 text-right font-black text-indigo-600">{cmp.readRate}</td>
                  <td className="p-3.5 text-stone-500 font-semibold">{cmp.dateSent}</td>
                  <td className="p-3.5 text-right">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-black rounded-lg text-[10px] uppercase">
                      {cmp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
