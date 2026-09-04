"use client";

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Flame,
  Zap,
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  Phone,
  MessageSquare,
  Mail,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  X,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  getAdmissionsLeadScoresAction,
  dispatchLeadNurtureMessageAction,
  LeadScoreRecord
} from '@/app/actions/admissions-lead-scoring-actions';

export function AiLeadScoringDesk() {
  const [leads, setLeads] = useState<LeadScoreRecord[]>([]);
  const [stats, setStats] = useState({
    totalScored: 5,
    hotCount: 2,
    warmCount: 2,
    coldCount: 1,
    avgConversionRate: 71
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'HOT' | 'WARM' | 'COLD'>('ALL');

  // Nurture modal state
  const [activeLeadForNurture, setActiveLeadForNurture] = useState<LeadScoreRecord | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<'WHATSAPP' | 'SMS' | 'EMAIL'>('WHATSAPP');
  const [customMessage, setCustomMessage] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<string | null>(null);

  const fetchLeads = async () => {
    setIsLoading(true);
    const res = await getAdmissionsLeadScoresAction();
    if (res.success) {
      setLeads(res.leads);
      setStats(res.stats);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleOpenNurture = (lead: LeadScoreRecord) => {
    setActiveLeadForNurture(lead);
    setCustomMessage(lead.suggested_message);
    setDispatchResult(null);
  };

  const handleDispatch = async () => {
    if (!activeLeadForNurture) return;
    setIsDispatching(true);
    const res = await dispatchLeadNurtureMessageAction(
      activeLeadForNurture.id,
      selectedChannel,
      customMessage
    );
    if (res.success) {
      setDispatchResult(res.message);
    }
    setIsDispatching(false);
  };

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.parent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.grade_applying.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === 'ALL' || l.score_tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8DFC8]/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-serif font-bold text-stone-900">
              AI Predictive Admissions Lead Scoring &amp; Nurturing Assistant
            </h2>
          </div>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl">
            Machine learning algorithm analyzing parental engagement touchpoints, campus tours, prospectus downloads, and digital inquiry latency to score conversion probability from 0-100.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchLeads}
          className="border-[#E8DFC8] text-stone-700 hover:bg-stone-50 gap-1.5 text-xs self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Recalculate Scores
        </Button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-[#E8DFC8] rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Scored Enquiries</span>
            <div className="p-2 bg-stone-100 rounded-xl text-stone-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-stone-900">{stats.totalScored}</span>
            <span className="text-xs font-medium text-stone-500">In Active Pipeline</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Multi-channel attribution verified</p>
        </Card>

        <Card className="p-4 bg-rose-50/70 border-rose-200/60 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-900 uppercase tracking-wider">HOT Leads (&gt;80 Score)</span>
            <div className="p-2 bg-rose-500/20 rounded-xl text-rose-900">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-rose-900">{stats.hotCount}</span>
            <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">Immediate Call</span>
          </div>
          <p className="text-[11px] text-rose-800/80 mt-1">&gt;85% close probability within 7 days</p>
        </Card>

        <Card className="p-4 bg-amber-50/60 border-amber-200/60 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">WARM Leads (50-79)</span>
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-900">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-amber-900">{stats.warmCount}</span>
            <span className="text-xs font-medium text-amber-800">Drip Nurture</span>
          </div>
          <p className="text-[11px] text-amber-800/80 mt-1">Syllabus &amp; video tour sequence</p>
        </Card>

        <Card className="p-4 bg-emerald-50/70 border-emerald-200/60 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">Cohort Conversion Rate</span>
            <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-900">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-emerald-900">{stats.avgConversionRate}%</span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">Optimal</span>
          </div>
          <p className="text-[11px] text-emerald-700/80 mt-1">Benchmarked against premier ERPs</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search parent, student, or grade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E8DFC8] rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto pb-1">
          {(['ALL', 'HOT', 'WARM', 'COLD'] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                tierFilter === tier
                  ? 'bg-stone-900 text-amber-300 shadow-sm'
                  : 'bg-white border border-[#E8DFC8] text-stone-700 hover:bg-stone-50'
              }`}
            >
              {tier === 'ALL'
                ? 'All Leads'
                : tier === 'HOT'
                ? '🔥 HOT (80-100)'
                : tier === 'WARM'
                ? '⚡ WARM (50-79)'
                : '❄️ COLD (<50)'}
            </button>
          ))}
        </div>
      </div>

      {/* Scored Leads Matrix */}
      <div className="bg-white rounded-2xl border border-[#E8DFC8] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#E8DFC8] text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                <th className="py-3 px-4">Applicant &amp; Parent</th>
                <th className="py-3 px-4">Grade &amp; Channel</th>
                <th className="py-3 px-4">Conversion Likelihood</th>
                <th className="py-3 px-4">AI Predictive Attribution Drivers</th>
                <th className="py-3 px-4">Next Best Action</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DFC8]/60 text-xs">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-amber-500/[0.02] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-stone-900">{lead.parent_name}</div>
                    <div className="text-[11px] text-stone-500">Child: <span className="font-medium text-stone-700">{lead.student_name}</span></div>
                    <div className="text-[10px] text-stone-400 font-mono mt-0.5">{lead.parent_phone}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-stone-800">{lead.grade_applying}</div>
                    <div className="text-[11px] text-stone-500">{lead.lead_source}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-serif font-bold text-stone-900">{lead.conversion_score}</span>
                      <span className="text-[11px] text-stone-500">/ 100</span>
                    </div>
                    {/* Score Bar */}
                    <div className="w-24 bg-stone-200 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full ${
                          lead.score_tier === 'HOT'
                            ? 'bg-rose-500'
                            : lead.score_tier === 'WARM'
                            ? 'bg-amber-500'
                            : 'bg-stone-400'
                        }`}
                        style={{ width: `${lead.conversion_score}%` }}
                      />
                    </div>
                    <div className="mt-1">
                      {lead.score_tier === 'HOT' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md">
                          <Flame className="w-3 h-3" /> HOT LEAD
                        </span>
                      )}
                      {lead.score_tier === 'WARM' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                          <Zap className="w-3 h-3" /> WARM LEAD
                        </span>
                      )}
                      {lead.score_tier === 'COLD' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">
                          ❄️ COLD LEAD
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="space-y-1 max-w-xs">
                      {lead.key_drivers.map((kd, idx) => (
                        <div key={idx} className="text-[11px] text-stone-600 flex items-start gap-1">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{kd}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-[11px] text-stone-700 bg-stone-50 p-2 rounded-xl border border-[#E8DFC8]/60 max-w-xs">
                      {lead.ai_recommended_action}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      size="sm"
                      onClick={() => handleOpenNurture(lead)}
                      className={`text-xs px-3 py-1.5 rounded-xl shadow-xs gap-1.5 ${
                        lead.score_tier === 'HOT'
                          ? 'bg-rose-700 hover:bg-rose-800 text-white'
                          : 'bg-amber-700 hover:bg-amber-800 text-white'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Nurture
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nurturing & Outreach Modal */}
      {activeLeadForNurture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E8DFC8] w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#E8DFC8]">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-100 rounded-lg text-amber-900">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-serif font-bold text-stone-900">
                    AI Automated Outreach Assistant
                  </h3>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Parent: <span className="font-semibold text-stone-900">{activeLeadForNurture.parent_name}</span> ({activeLeadForNurture.parent_phone})
                </p>
              </div>
              <button
                onClick={() => setActiveLeadForNurture(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Channel Switcher */}
            <div>
              <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block mb-1.5">
                Outreach Delivery Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare },
                  { id: 'SMS', label: 'SMS Priority', icon: Send },
                  { id: 'EMAIL', label: 'Email Letter', icon: Mail }
                ].map((ch) => {
                  const Icon = ch.icon;
                  const isSelected = selectedChannel === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setSelectedChannel(ch.id as any)}
                      className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-600 text-amber-900 ring-1 ring-amber-500'
                          : 'border-[#E8DFC8] bg-white text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {ch.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Customized Message Draft */}
            <div>
              <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block mb-1.5">
                AI Customized Message Draft
              </label>
              <textarea
                rows={4}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full p-3 text-xs bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-800 leading-relaxed font-sans"
              />
            </div>

            {/* Dispatch Result Feedback */}
            {dispatchResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{dispatchResult}</span>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E8DFC8]/60">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveLeadForNurture(null)}
                className="border-[#E8DFC8] text-xs text-stone-700"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={isDispatching}
                onClick={handleDispatch}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {isDispatching ? 'Dispatching...' : 'Dispatch Now'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
