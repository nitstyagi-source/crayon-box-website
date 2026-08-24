"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Send, MessageSquare, Mail, Bell, Smartphone,
  CheckCircle2, Clock, Users, Download, Plus, Filter,
  RefreshCw, Radio, Sparkles, X, Check, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { DualFileUpload } from '@/components/ui/DualFileUpload';
import { useInstitution } from '@/components/providers/InstitutionContext';
import {
  getBroadcastCampaignsAction,
  dispatchBroadcastCampaignAction
} from '@/app/actions/communication-actions';

export default function CommunicationCampaignsPage() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [counts, setCounts] = useState({
    totalCampaigns: 0,
    totalRecipients: 0,
    totalDelivered: 0,
    avgOpenRate: 95
  });
  const [isLoading, setIsLoading] = useState(true);

  // New Broadcast Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campTitle, setCampTitle] = useState('');
  const [campChannel, setCampChannel] = useState<'OMNICHANNEL' | 'SMS' | 'WHATSAPP' | 'EMAIL'>('OMNICHANNEL');
  const [campAudience, setCampAudience] = useState('ALL_PARENTS');
  const [campBody, setCampBody] = useState('');
  const [campAttachment, setCampAttachment] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    const res = await getBroadcastCampaignsAction();
    if (res.success) {
      setCampaigns(res.campaigns || []);
      setCounts(res.counts || { totalCampaigns: 0, totalRecipients: 0, totalDelivered: 0, avgOpenRate: 95 });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Handle Dispatch Campaign
  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campTitle.trim() || !campBody.trim()) return;

    setIsDispatching(true);
    const res = await dispatchBroadcastCampaignAction({
      title: campTitle,
      channel: campChannel,
      targetAudience: campAudience,
      messageBody: campBody
    });
    setIsDispatching(false);

    if (res.success) {
      setIsModalOpen(false);
      setDispatchSuccessMsg(res.message || 'Broadcast dispatched successfully!');
      setCampTitle('');
      setCampBody('');
      fetchCampaigns();
    } else {
      alert("Error dispatching: " + res.error);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-blue-500/30 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-blue-400" />
              High-Speed Omnichannel Dispatcher
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-indigo-300 text-xs font-semibold">
              {isAllInstitutions ? 'All Institutions' : selectedInstitutionObj?.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Send className="w-8 h-8 text-blue-400" />
            Omnichannel Broadcasts & Circulars
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            High-speed SMS (MSG91), WhatsApp Business API, and rich email circular broadcasts to parents and faculty.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-600/20"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            📢 Create Broadcast
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchCampaigns}
            isLoading={isLoading}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* 🌟 TELEMATICS COUNTERS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Campaigns</span>
          <span className="text-3xl font-black text-slate-900 mt-1 block">{counts.totalCampaigns}</span>
          <span className="text-[11px] text-slate-500 font-semibold">Broadcasts Dispatched</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Messages Sent</span>
          <span className="text-3xl font-black text-indigo-600 mt-1 block">{counts.totalRecipients.toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-indigo-700 font-bold">Parent & Staff Contacts</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Delivered Success</span>
          <span className="text-3xl font-black text-emerald-600 mt-1 block">{counts.totalDelivered.toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-emerald-700 font-bold">99.8% Gateway Handshake</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Average Open Rate</span>
          <span className="text-3xl font-black text-amber-600 mt-1 block">{counts.avgOpenRate}%</span>
          <span className="text-[11px] text-amber-700 font-bold">High Parent Engagement</span>
        </div>
      </div>

      {/* Notice Message */}
      {dispatchSuccessMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{dispatchSuccessMsg}</span>
          </div>
          <button onClick={() => setDispatchSuccessMsg(null)} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* 🌟 CAMPAIGNS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Recent Communication Dispatches ({campaigns.length})
            </h3>
            <p className="text-xs text-slate-400">
              Audit log of all SMS, WhatsApp, and email circular dispatches with live delivery rates.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="py-3 px-4">Campaign Title & Code</th>
                <th className="py-3 px-4">Delivery Channel</th>
                <th className="py-3 px-4">Target Audience</th>
                <th className="py-3 px-4">Message Snippet</th>
                <th className="py-3 px-4">Recipients</th>
                <th className="py-3 px-4">Open Rate</th>
                <th className="py-3 px-4">Date Sent</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4">
                    <strong className="text-slate-900 block font-bold">{camp.title}</strong>
                    <span className="text-[10px] font-mono text-indigo-600 font-bold">{camp.campaign_code}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase flex items-center gap-1 w-fit ${
                      camp.channel === 'WHATSAPP' ? 'bg-emerald-100 text-emerald-800' :
                      camp.channel === 'EMAIL' ? 'bg-indigo-100 text-indigo-800' :
                      camp.channel === 'SMS' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {camp.channel === 'WHATSAPP' && <Smartphone className="w-3 h-3" />}
                      {camp.channel === 'EMAIL' && <Mail className="w-3 h-3" />}
                      {camp.channel === 'SMS' && <MessageSquare className="w-3 h-3" />}
                      {camp.channel === 'OMNICHANNEL' && <Radio className="w-3 h-3" />}
                      {camp.channel}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {camp.target_audience.replace(/_/g, ' ')}
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                    {camp.message_body}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {camp.delivered_count} / {camp.recipient_count}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-black text-emerald-700">
                    {camp.openRate}%
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 font-medium">
                    {camp.created_at}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                      ✓ {camp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🌟 CREATE BROADCAST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 font-sans space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-black text-slate-900">Create Omnichannel Broadcast</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatch} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Broadcast Title / Subject</label>
                <input
                  type="text"
                  value={campTitle}
                  onChange={(e) => setCampTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  placeholder="e.g. Annual Day Rehearsal Schedule & Costume Advisory"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Delivery Channel</label>
                  <select
                    value={campChannel}
                    onChange={(e) => setCampChannel(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="OMNICHANNEL">Omnichannel (SMS + WhatsApp + Email)</option>
                    <option value="WHATSAPP">WhatsApp Official API</option>
                    <option value="SMS">High-Priority SMS (MSG91)</option>
                    <option value="EMAIL">Rich Email Circular</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Audience</label>
                  <select
                    value={campAudience}
                    onChange={(e) => setCampAudience(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="ALL_PARENTS">All Enrolled Parents (220)</option>
                    <option value="CLASS_1_TO_10">Class 1 to 10 Parents</option>
                    <option value="CLASS_10">Class 10 Board Students</option>
                    <option value="BUS_COMMUTERS">School Bus Commuters</option>
                    <option value="FACULTY">Faculty & Staff (64)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Message Body</label>
                <textarea
                  value={campBody}
                  onChange={(e) => setCampBody(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none"
                  placeholder="Type the message content that will be dispatched to parents..."
                  required
                />
              </div>

              {/* PDF Circular / Flyer Attachment */}
              <div>
                <DualFileUpload
                  label="Official Circular PDF / Event Flyer"
                  helperText="Upload PDF circular or flyer image, or paste an external file link"
                  value={campAttachment}
                  onChange={(val) => setCampAttachment(val)}
                  accept="image/*,.pdf"
                  placeholder="https://example.com/circular.pdf or upload document"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit" isLoading={isDispatching} className="bg-blue-600 hover:bg-blue-500 text-white">
                  🚀 Send Broadcast
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
