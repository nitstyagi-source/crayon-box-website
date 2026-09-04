"use client";

import React, { useState, useEffect } from "react";
import {
  Send, MessageSquare, Mail, Bell, Smartphone,
  CheckCircle2, Clock, Users, Download, Plus, Filter,
  RefreshCw, Radio, Sparkles, X, Check, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useInstitution } from "@/components/providers/InstitutionContext";
import {
  getBroadcastCampaignsAction,
  dispatchBroadcastCampaignAction
} from "@/app/actions/communication-actions";

export function CampaignsBroadcastDesk() {
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
  const [campTitle, setCampTitle] = useState("");
  const [campChannel, setCampChannel] = useState<"OMNICHANNEL" | "SMS" | "WHATSAPP" | "EMAIL">("OMNICHANNEL");
  const [campAudience, setCampAudience] = useState("ALL_PARENTS");
  const [campBody, setCampBody] = useState("");
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
      setDispatchSuccessMsg(res.message || "Broadcast dispatched successfully!");
      setCampTitle("");
      setCampBody("");
      fetchCampaigns();
    } else {
      alert("Error dispatching: " + res.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Telematics Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs">
          <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">Total Campaigns</span>
          <span className="text-3xl font-black text-stone-900 mt-1 block">{counts.totalCampaigns}</span>
          <span className="text-[11px] text-stone-500 font-semibold">Broadcasts Dispatched</span>
        </div>

        <div className="p-4 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs">
          <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">Messages Sent</span>
          <span className="text-3xl font-black text-[#92400E] mt-1 block">{counts.totalRecipients.toLocaleString("en-IN")}</span>
          <span className="text-[11px] text-[#D97706] font-bold">Parent & Staff Contacts</span>
        </div>

        <div className="p-4 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs">
          <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">Delivered Success</span>
          <span className="text-3xl font-black text-emerald-700 mt-1 block">{counts.totalDelivered.toLocaleString("en-IN")}</span>
          <span className="text-[11px] text-emerald-600 font-bold">99.8% Gateway Handshake</span>
        </div>

        <div className="p-4 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs">
          <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">Average Open Rate</span>
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

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DFC8]">
        <div>
          <h3 className="font-extrabold text-stone-900 text-sm">
            Recent Communication Dispatches ({campaigns.length})
          </h3>
          <p className="text-xs text-stone-500">
            Audit log of SMS, WhatsApp, and email circular dispatches with delivery metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#B45309] hover:to-[#92400E] text-white font-bold shadow-xs text-xs"
          >
            <Plus className="w-4 h-4 mr-1" /> Create Broadcast
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchCampaigns}
            isLoading={isLoading}
            className="bg-white text-stone-700 border-[#E8DFC8] hover:bg-[#F3EDE2] text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white/70 text-[10px] font-bold uppercase tracking-wider text-stone-600 border-b border-[#E8DFC8]">
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
            <tbody className="divide-y divide-stone-200">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-white/50 transition">
                  <td className="py-3.5 px-4">
                    <strong className="text-stone-900 block font-bold">{camp.title}</strong>
                    <span className="text-[10px] font-mono text-[#92400E] font-bold">{camp.campaign_code}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase flex items-center gap-1 w-fit ${
                      camp.channel === "WHATSAPP" ? "bg-emerald-100 text-emerald-800" :
                      camp.channel === "EMAIL" ? "bg-indigo-100 text-indigo-800" :
                      camp.channel === "SMS" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      {camp.channel === "WHATSAPP" && <Smartphone className="w-3 h-3" />}
                      {camp.channel === "EMAIL" && <Mail className="w-3 h-3" />}
                      {camp.channel === "SMS" && <MessageSquare className="w-3 h-3" />}
                      {camp.channel === "OMNICHANNEL" && <Radio className="w-3 h-3" />}
                      {camp.channel}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-stone-700">
                    {camp.target_audience.replace(/_/g, " ")}
                  </td>

                  <td className="py-3.5 px-4 text-stone-600 max-w-xs truncate">
                    {camp.message_body}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                    {camp.delivered_count} / {camp.recipient_count}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-black text-emerald-700">
                    {camp.openRate}%
                  </td>

                  <td className="py-3.5 px-4 text-stone-500 font-medium">
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

      {/* CREATE BROADCAST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E8DFC8] text-stone-900 font-sans space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[#D97706]" />
                <h3 className="text-lg font-black text-stone-900">Create Omnichannel Broadcast</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatch} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Broadcast Title / Subject</label>
                <input
                  type="text"
                  value={campTitle}
                  onChange={(e) => setCampTitle(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl px-3 py-2 font-bold text-stone-900 focus:outline-none focus:border-[#D97706]"
                  placeholder="e.g. Annual Sports Day Rehearsal Schedule"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Delivery Channel</label>
                  <select
                    value={campChannel}
                    onChange={(e) => setCampChannel(e.target.value as any)}
                    className="w-full bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl px-3 py-2 font-bold text-stone-900 focus:outline-none focus:border-[#D97706]"
                  >
                    <option value="OMNICHANNEL">Omnichannel (SMS + WhatsApp + Email)</option>
                    <option value="WHATSAPP">WhatsApp Official API</option>
                    <option value="SMS">High-Priority SMS (MSG91)</option>
                    <option value="EMAIL">Rich Email Circular</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Target Audience</label>
                  <select
                    value={campAudience}
                    onChange={(e) => setCampAudience(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl px-3 py-2 font-bold text-stone-900 focus:outline-none focus:border-[#D97706]"
                  >
                    <option value="ALL_PARENTS">All Enrolled Parents (220)</option>
                    <option value="CLASS_1_TO_10">Class 1 to 10 Parents</option>
                    <option value="CLASS_10">Class 10 Board Students</option>
                    <option value="TEACHING_STAFF">All Teaching Faculty</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Message Body</label>
                <textarea
                  value={campBody}
                  onChange={(e) => setCampBody(e.target.value)}
                  rows={4}
                  className="w-full bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl px-3 py-2 font-medium text-stone-900 focus:outline-none focus:border-[#D97706] leading-relaxed"
                  placeholder="Draft your circular broadcast message..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E8DFC8]">
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-white border-[#E8DFC8] text-stone-700"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  disabled={isDispatching}
                  className="bg-gradient-to-r from-[#D97706] to-[#B45309] text-white font-bold"
                >
                  {isDispatching ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" /> : <Send className="w-3.5 h-3.5 mr-1" />}
                  Dispatch Now
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
