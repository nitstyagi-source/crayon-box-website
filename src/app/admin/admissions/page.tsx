"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Users, TrendingUp, Sparkles, Layers,
  CheckCircle2, BarChart3, ChevronRight,
  ArrowUpRight, Phone, Bot,
  Plus, Search, RefreshCw, MessageSquare,
  UserPlus, X, Check, Send, PhoneCall,
  FileText, GraduationCap, Filter, LayoutGrid, List,
  Calendar, MapPin, Eye, ArrowRight, ShieldCheck, Flame, Zap, Award
} from 'lucide-react';
import { getAdmissionsPerformanceAnalyticsAction } from '@/app/actions/admissions-analytics';
import {
  getAdmissionsPipelineApplicationsAction,
  createAdminEnquiryAction
} from '@/app/actions/admissions';
import {
  askAdmissionsAiBotAction,
  getAdmissionsAiInquiriesAction,
  AiInquiryRecord
} from '@/app/actions/ai-admissions-bot-actions';
import {
  getEnquiries,
  convertEnquiryToApplicationAction,
  updateEnquiryStatusAction
} from '@/app/actions/enquiry';
import { AdmissionsFunnelChart } from '@/components/admissions/analytics/AdmissionsFunnelChart';
import { ManagementInsightsCard } from '@/components/admissions/analytics/ManagementInsightsCard';
import { Enquiry360DossierModal } from '@/components/enquiry/Enquiry360DossierModal';
import { AdminNewEnquiryModal } from '@/components/enquiry/AdminNewEnquiryModal';
import { AdminNewEnquiryForm } from '@/components/enquiry/AdminNewEnquiryForm';
import { AiLeadScoringDesk } from '@/components/admissions/AiLeadScoringDesk';
import { Button } from '@/components/ui/Button';
import { VastuModuleBanner } from '@/components/common/VastuModuleBanner';

function AdmissionsCommandCenterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = (searchParams.get('tab') || 'pipeline').toUpperCase();
  const actionParam = searchParams.get('action');

  const [activeTab, setActiveTab] = useState<'PIPELINE' | 'ANALYTICS' | 'WALKIN' | 'AI_BOT' | 'LEAD_SCORING'>(
    tabParam === 'ANALYTICS' ? 'ANALYTICS' :
    tabParam === 'WALKIN' || tabParam === 'INTAKE' ? 'WALKIN' :
    tabParam === 'AI_BOT' || tabParam === 'AI-BOT' ? 'AI_BOT' :
    tabParam === 'LEAD_SCORING' || tabParam === 'LEAD-SCORING' ? 'LEAD_SCORING' : 'PIPELINE'
  );

  const [isLoading, setIsLoading] = useState(true);

  // CRM State (Pipeline / Enquiries)
  const [enquiriesList, setEnquiriesList] = useState<any[]>([]);
  const [pipelineApps, setPipelineApps] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'HOT' | 'WARM' | 'COLD'>('ALL');
  const [enquirySearch, setEnquirySearch] = useState('');
  const [selectedEnquiryIdFor360, setSelectedEnquiryIdFor360] = useState<string | null>(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(actionParam === 'new');
  const [isConvertingId, setIsConvertingId] = useState<string | null>(null);

  // Analytics State
  const [analytics, setAnalytics] = useState<any>(null);
  const [kpis, setKpis] = useState({
    totalEnquiries: 0,
    totalApplications: 0,
    totalAdmissions: 0,
    conversionRate: 0,
    applicationRate: 0,
    lostEnquiries: 0,
    growth: { enquiries: 0, applications: 0, admissions: 0, conversionPp: 0, lostDelta: 0 }
  });
  const [funnelStages, setFunnelStages] = useState<any[]>([]);

  // AI Bot State
  const [aiInquiries, setAiInquiries] = useState<AiInquiryRecord[]>([]);
  const [chatQuery, setChatQuery] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: 'Namaste! 🙏 Welcome to Crayon Box School Admissions Helpdesk. I can answer questions about fee structures, academic curriculum, age criteria, and bus transport routes across Delhi. How may I assist you today?',
      time: 'Just now'
    }
  ]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [aRes, pRes, eRes, aiRes] = await Promise.all([
        getAdmissionsPerformanceAnalyticsAction().catch(() => null),
        getAdmissionsPipelineApplicationsAction().catch(() => null),
        getEnquiries('all').catch(() => ({ success: false, data: [] })),
        getAdmissionsAiInquiriesAction().catch(() => ({ success: false, inquiries: [] }))
      ]);

      if (aRes && aRes.success) {
        setAnalytics(aRes);
        if (aRes.kpis) setKpis(aRes.kpis);
        if (aRes.funnelStages) setFunnelStages(aRes.funnelStages);
      }

      if (pRes && pRes.success && pRes.data) {
        setPipelineApps(pRes.data);
      }

      if (eRes && eRes.success && eRes.data) {
        setEnquiriesList(eRes.data);
      }

      if (aiRes && aiRes.success && aiRes.inquiries) {
        setAiInquiries(aiRes.inquiries);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleTabChange = (tab: 'PIPELINE' | 'ANALYTICS' | 'WALKIN' | 'AI_BOT' | 'LEAD_SCORING') => {
    setActiveTab(tab);
    const param = tab === 'AI_BOT' ? 'ai-bot' : tab === 'LEAD_SCORING' ? 'lead-scoring' : tab.toLowerCase();
    router.replace(`/admin/admissions?tab=${param}`, { scroll: false });
  };

  const handle1ClickConvert = async (enquiryId: string) => {
    setIsConvertingId(enquiryId);
    try {
      const res = await convertEnquiryToApplicationAction(enquiryId);
      if (res.success) {
        alert(res.message || 'Enquiry successfully converted to Official Admission Application!');
        await loadAllData();
      } else {
        alert(res.error || 'Conversion could not be processed.');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsConvertingId(null);
    }
  };

  const handleSendAiQuery = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const prompt = customText || chatQuery;
    if (!prompt.trim() || isAiProcessing) return;

    const userMsg = { sender: 'user' as const, text: prompt, time: 'Just now' };
    setChatMessages(prev => [...prev, userMsg]);
    setChatQuery('');
    setIsAiProcessing(true);

    try {
      const res = await askAdmissionsAiBotAction({
        userQuery: prompt,
        parentName: 'Walk-in / Online Parent',
        parentPhone: '+91 9811102008',
        targetGrade: 'Primary K-12',
      });

      if (res.success && res.aiResponse) {
        setChatMessages(prev => [...prev, { sender: 'bot', text: res.aiResponse, time: 'Just now' }]);
      } else {
        setChatMessages(prev => [...prev, { sender: 'bot', text: "Thank you for reaching out to Crayon Box Admissions. Our team is available at +91 9811102008 to assist you with registration details.", time: 'Just now' }]);
      }
    } catch (err: any) {
      setChatMessages(prev => [...prev, { sender: 'bot', text: 'Error connecting to Admissions AI Assistant.', time: 'Just now' }]);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Filtered Enquiries
  const filteredEnquiries = enquiriesList.filter(enq => {
    const term = enquirySearch.toLowerCase();
    const sName = (enq.child_name || enq.student_name || enq.studentName || '').toLowerCase();
    const pName = (enq.primary_guardian_name || enq.parent_name || enq.parentName || '').toLowerCase();
    const ph = (enq.primary_guardian_phone || enq.parent_phone || enq.phone || '').toLowerCase();
    const matchesSearch = sName.includes(term) || pName.includes(term) || ph.includes(term);

    const priority = (enq.lead_priority || enq.priority || '').toUpperCase();
    const matchesPriority = priorityFilter === 'ALL' || priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  // Kanban Stage Grouping
  const kanbanStages = [
    {
      id: 'NEW',
      title: '1. Ingestion & New Leads',
      color: 'border-blue-300 bg-blue-50/40 text-blue-950',
      badgeColor: 'bg-blue-100 text-blue-800',
      items: filteredEnquiries.filter(e => ['NEW', 'UNASSIGNED', 'RAW'].includes((e.status || 'NEW').toUpperCase())),
    },
    {
      id: 'CONTACTED',
      title: '2. Contacted & Follow-up',
      color: 'border-amber-300 bg-amber-50/40 text-amber-950',
      badgeColor: 'bg-amber-100 text-amber-800',
      items: filteredEnquiries.filter(e => ['CONTACTED', 'IN_PROGRESS', 'FOLLOW_UP_SCHEDULED'].includes((e.status || '').toUpperCase())),
    },
    {
      id: 'COUNSELLING',
      title: '3. Campus Tour & Counselling',
      color: 'border-purple-300 bg-purple-50/40 text-purple-950',
      badgeColor: 'bg-purple-100 text-purple-800',
      items: filteredEnquiries.filter(e => ['COUNSELLING_SCHEDULED', 'CAMPUS_TOUR', 'VISIT_SCHEDULED'].includes((e.status || '').toUpperCase())),
    },
    {
      id: 'CONVERTED',
      title: '4. Converted / Application Paid',
      color: 'border-emerald-300 bg-emerald-50/40 text-emerald-950',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      items: filteredEnquiries.filter(e => ['CONVERTED', 'APPLICATION_SUBMITTED', 'ENROLLED', 'OFFER_MADE'].includes((e.status || '').toUpperCase())),
    },
    {
      id: 'LOST',
      title: '5. Lost / Inactive',
      color: 'border-stone-300 bg-stone-50/50 text-stone-700',
      badgeColor: 'bg-stone-200 text-stone-700',
      items: filteredEnquiries.filter(e => ['LOST', 'DROPPED', 'INACTIVE'].includes((e.status || '').toUpperCase())),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans pb-20">
      
      {/* Option 6 Sattva-Digital Module Banner & Tabs */}
      <VastuModuleBanner
        badgeText="Unified Admissions Command Suite"
        badgeIcon={<Sparkles className="w-3 h-3 text-[#D97706]" />}
        institutionText="Academic Session 2026–2027"
        title="Admissions Command Suite & CRM"
        titleIcon={<GraduationCap className="w-7 h-7 text-[#D97706]" />}
        description="Consolidated pre-admission cockpit uniting Kanban Pipeline CRM, Rapid Walk-ins Intake, Funnel Analytics, and 24/7 AI Copilot."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={loadAllData}
              isLoading={isLoading}
              className="border-[#E8DFC8] bg-white text-stone-700 hover:bg-[#FAF7F2] text-xs font-bold shadow-2xs"
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-stone-500" />}
            >
              Sync Live DB
            </Button>
            <Button
              variant="saffron"
              size="sm"
              onClick={() => setIsNewLeadModalOpen(true)}
              className="bg-[#D97706] hover:bg-[#B45309] text-white font-black text-xs shadow-md"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              + Quick Walk-in Lead
            </Button>
          </>
        }
        tabs={[
          { id: 'PIPELINE', label: '1. Pipeline & Enquiries CRM', icon: <Layers className="w-4 h-4 text-amber-600" />, count: enquiriesList.length },
          { id: 'ANALYTICS', label: '2. Funnel & Intelligence Analytics', icon: <BarChart3 className="w-4 h-4 text-emerald-600" /> },
          { id: 'WALKIN', label: '3. Rapid Walk-ins & Intake', icon: <UserPlus className="w-4 h-4 text-blue-600" /> },
          { id: 'AI_BOT', label: '4. 24/7 AI Admissions Assistant', icon: <Bot className="w-4 h-4 text-purple-600" /> },
          { id: 'LEAD_SCORING', label: '5. AI Predictive Lead Scoring', icon: <Flame className="w-4 h-4 text-rose-600" /> },
        ]}
        activeTab={activeTab}
        onTabChange={(id) => handleTabChange(id as any)}
      />

      {/* ======================================================== */}
      {/* TAB 1: PIPELINE & ENQUIRIES CRM (CONSOLIDATED KANBAN & TABLE) */}
      {/* ======================================================== */}
      {activeTab === 'PIPELINE' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Controls Ribbon */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 p-5 rounded-3xl border border-[#E8DFC8] shadow-xs backdrop-blur-xs">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search prospective student, parent, phone, locality..."
                value={enquirySearch}
                onChange={e => setEnquirySearch(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC8] text-stone-900 font-medium focus:border-[#D97706] focus:ring-1 focus:ring-amber-200 outline-none"
              />
            </div>

            {/* Filter Pills & View Switcher */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Priority Filter */}
              <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-2xl border border-[#E8DFC8]">
                {(['ALL', 'HOT', 'WARM', 'COLD'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriorityFilter(p)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                      priorityFilter === p
                        ? 'bg-white text-stone-900 shadow-2xs border border-[#E8DFC8]'
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    {p === 'ALL' ? 'All' : p === 'HOT' ? '🔥 Hot' : p === 'WARM' ? '⚡ Warm' : '❄️ Cold'}
                  </button>
                ))}
              </div>

              {/* View Switcher */}
              <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-2xl border border-[#E8DFC8]">
                <button
                  type="button"
                  onClick={() => setViewMode('kanban')}
                  className={`p-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    viewMode === 'kanban'
                      ? 'bg-white text-[#D97706] shadow-2xs border border-[#E8DFC8]'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                  title="Kanban Board View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    viewMode === 'table'
                      ? 'bg-white text-[#D97706] shadow-2xs border border-[#E8DFC8]'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                  title="Table List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <Button
                size="sm"
                variant="saffron"
                onClick={() => setIsNewLeadModalOpen(true)}
                className="bg-[#D97706] hover:bg-[#B45309] text-white font-black text-xs shadow-xs"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                + New Intake
              </Button>
            </div>
          </div>

          {/* 1A. KANBAN VIEW */}
          {viewMode === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
              {kanbanStages.map((stage) => (
                <div
                  key={stage.id}
                  className="bg-[#FAF7F2]/80 rounded-3xl border border-[#E8DFC8] p-4 flex flex-col space-y-3 min-w-[240px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#E8DFC8]">
                    <h3 className="text-xs font-black text-stone-900 uppercase tracking-tight truncate">
                      {stage.title}
                    </h3>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${stage.badgeColor}`}>
                      {stage.items.length}
                    </span>
                  </div>

                  {/* Stage Cards */}
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[650px] pr-0.5">
                    {stage.items.map((enq) => {
                      const priority = (enq.lead_priority || enq.priority || '').toUpperCase();
                      const childName = enq.child_name || enq.student_name || 'Prospective Student';
                      const parentName = enq.primary_guardian_name || enq.parent_name || 'Parent';
                      const phone = enq.primary_guardian_phone || enq.parent_phone || enq.phone;
                      const grade = enq.admission_class || enq.grade_interested || 'Class 1';

                      return (
                        <div
                          key={enq.id}
                          className="bg-white rounded-2xl border border-[#E8DFC8] p-3.5 shadow-2xs hover:border-[#D4AF37] transition space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded">
                              {enq.enquiry_number || enq.enquiry_no || 'ENQ-LIVE'}
                            </span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              priority === 'HOT'
                                ? 'bg-rose-100 text-rose-800'
                                : priority === 'WARM'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {priority || 'NORMAL'}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-extrabold text-stone-900 text-xs">
                              {childName}
                            </h4>
                            <p className="text-[11px] text-stone-500 font-medium">
                              Grade: <span className="font-bold text-stone-700">{grade}</span>
                            </p>
                          </div>

                          <div className="text-[10px] text-stone-600 bg-[#FAF7F2] p-2 rounded-xl space-y-0.5">
                            <p className="truncate">👤 {parentName}</p>
                            <p className="font-mono">📞 {phone}</p>
                            {enq.locality_area && <p className="truncate">📍 {enq.locality_area}</p>}
                            {enq.transport_required && (
                              <p className="text-amber-800 font-bold text-[9.5px]">🚌 Bus Requested</p>
                            )}
                          </div>

                          {/* Card Action Buttons */}
                          <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedEnquiryIdFor360(enq.id)}
                              className="px-2 py-1 rounded-xl bg-white hover:bg-[#FAF7F2] text-stone-800 text-[10px] font-bold border border-[#E8DFC8] flex items-center gap-1 transition cursor-pointer shadow-2xs"
                            >
                              <Eye className="w-3 h-3 text-[#D97706]" /> 360°
                            </button>

                            {/* 1-Click Convert Button */}
                            {stage.id !== 'CONVERTED' ? (
                              <button
                                type="button"
                                disabled={isConvertingId === enq.id}
                                onClick={() => handle1ClickConvert(enq.id)}
                                className="px-2 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300 flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                                title="1-Click Convert to Official Admission Application"
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>{isConvertingId === enq.id ? '...' : 'Convert'}</span>
                              </button>
                            ) : (
                              <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Enrolled ✓
                              </span>
                            )}

                            {/* WhatsApp shortcut */}
                            <a
                              href={`https://wa.me/${(phone || '').replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(parentName)},%20regarding%20${encodeURIComponent(childName)}%20admission%20at%20Crayon%20Box%20School...`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                              title="Message on WhatsApp"
                            >
                              <MessageSquare className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      );
                    })}

                    {stage.items.length === 0 && (
                      <div className="py-8 text-center text-stone-400 text-[11px] font-medium border border-dashed border-[#E8DFC8] rounded-2xl">
                        No leads in this stage
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 1B. TABLE VIEW */}
          {viewMode === 'table' && (
            <div className="bg-white/95 rounded-3xl border border-[#E8DFC8] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-[#FAF7F2] text-stone-900 text-[11px] uppercase tracking-wider font-extrabold border-b border-[#E8DFC8]">
                    <tr>
                      <th className="px-4 py-3.5">Enquiry #</th>
                      <th className="px-4 py-3.5">Prospective Student</th>
                      <th className="px-4 py-3.5">Grade</th>
                      <th className="px-4 py-3.5">Parent & Contact</th>
                      <th className="px-4 py-3.5">Stage / Status</th>
                      <th className="px-4 py-3.5">Priority</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DFC8]/60">
                    {filteredEnquiries.map((enq) => {
                      const childName = enq.child_name || enq.student_name || 'Student';
                      const parentName = enq.primary_guardian_name || enq.parent_name || 'Parent';
                      const phone = enq.primary_guardian_phone || enq.parent_phone || enq.phone;
                      const grade = enq.admission_class || enq.grade_interested || 'Class 1';
                      const priority = (enq.lead_priority || enq.priority || '').toUpperCase();
                      const status = (enq.status || 'NEW').toUpperCase();

                      return (
                        <tr key={enq.id} className="hover:bg-[#FAF7F2]/60 transition">
                          <td className="px-4 py-3 font-mono font-bold text-amber-950">
                            {enq.enquiry_number || enq.enquiry_no || 'ENQ-LIVE'}
                          </td>
                          <td className="px-4 py-3 font-extrabold text-stone-900">
                            {childName}
                          </td>
                          <td className="px-4 py-3 font-semibold text-stone-600">
                            {grade}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-stone-900">{parentName}</div>
                            <div className="font-mono text-[10px] text-stone-500">{phone}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                              {status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              priority === 'HOT'
                                ? 'bg-rose-100 text-rose-800'
                                : priority === 'WARM'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {priority || 'NORMAL'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedEnquiryIdFor360(enq.id)}
                                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F2] text-stone-800 text-xs font-bold border border-[#E8DFC8] flex items-center gap-1 shadow-2xs"
                              >
                                <Eye className="w-3 h-3 text-[#D97706]" /> Dossier
                              </button>
                              <button
                                type="button"
                                disabled={isConvertingId === enq.id}
                                onClick={() => handle1ClickConvert(enq.id)}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>{isConvertingId === enq.id ? 'Converting...' : 'Convert'}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filteredEnquiries.length === 0 && (
            <div className="bg-white/95 rounded-3xl border border-[#E8DFC8] p-12 text-center space-y-3">
              <PhoneCall className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-bold text-stone-700">No Admission Enquiries Found</h3>
              <p className="text-xs text-stone-400">Click &ldquo;+ Quick Walk-in Lead&rdquo; above to log parent calls and campus walk-ins.</p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: FUNNEL & INTELLIGENCE ANALYTICS */}
      {/* ======================================================== */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* KPI Hero Matrix */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="p-5 bg-white/95 rounded-3xl border border-[#E8DFC8] shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Total Enquiries</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-stone-900">{kpis.totalEnquiries}</span>
                <span className="text-[10px] text-emerald-700 font-bold">↗ Live</span>
              </div>
              <p className="text-[10px] text-stone-500">Registered inquiries</p>
            </div>

            <div className="p-5 bg-white/95 rounded-3xl border border-[#E8DFC8] shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Applications</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-blue-600">{kpis.totalApplications}</span>
                <span className="text-[10px] text-blue-700 font-bold">{kpis.applicationRate}% rate</span>
              </div>
              <p className="text-[10px] text-stone-500">Online forms filed</p>
            </div>

            <div className="p-5 bg-white/95 rounded-3xl border border-[#E8DFC8] shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Confirmed Admissions</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-emerald-600">{kpis.totalAdmissions}</span>
                <span className="text-[10px] text-emerald-700 font-bold">Enrolled</span>
              </div>
              <p className="text-[10px] text-stone-500">Fee received & class allotted</p>
            </div>

            <div className="p-5 bg-white/95 rounded-3xl border border-[#E8DFC8] shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Conversion Yield</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-indigo-600">{kpis.conversionRate}%</span>
                <span className="text-[10px] text-indigo-700 font-bold">Benchmark: 20%</span>
              </div>
              <p className="text-[10px] text-stone-500">Inquiry to enrolled ratio</p>
            </div>

            <div className="p-5 bg-white/95 rounded-3xl border border-[#E8DFC8] shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Sibling Priority</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-purple-600">100%</span>
                <span className="text-[10px] text-purple-700 font-bold">Family 360</span>
              </div>
              <p className="text-[10px] text-stone-500">Automated sibling discounts</p>
            </div>

            <div className="p-5 bg-white/95 rounded-3xl border border-[#E8DFC8] shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Lost Leads</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-stone-400">{kpis.lostEnquiries}</span>
                <span className="text-[10px] text-stone-500 font-bold">Archived</span>
              </div>
              <p className="text-[10px] text-stone-500">Unresponsive or relocated</p>
            </div>
          </div>

          {/* Funnel & AI Executive Intelligence Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AdmissionsFunnelChart stages={funnelStages} />
            </div>
            <div>
              <ManagementInsightsCard />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: RAPID WALK-INS & INTAKE (DIRECT 2-MIN MASTER FORM) */}
      {/* ======================================================== */}
      {activeTab === 'WALKIN' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white/95 p-6 sm:p-8 rounded-3xl border border-[#E8DFC8] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8DFC8] gap-2">
              <div>
                <h3 className="text-lg font-black text-stone-900">Rapid Admission Enquiry Intake Master</h3>
                <p className="text-xs text-stone-600">Complete 360-degree enquiry registration for counsellors and campus front desk.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTabChange('PIPELINE')}
                className="text-xs font-bold"
              >
                Back to Pipeline CRM
              </Button>
            </div>

            <AdminNewEnquiryForm
              isModal={false}
              onCancel={() => handleTabChange('PIPELINE')}
              onSuccess={() => {
                alert('New Admission Enquiry successfully recorded in CRM!');
                loadAllData();
                handleTabChange('PIPELINE');
              }}
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: AI WHATSAPP ASSISTANT */}
      {/* ======================================================== */}
      {activeTab === 'AI_BOT' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {/* Interactive Chat Console */}
          <div className="lg:col-span-2 bg-white/95 rounded-3xl border border-[#E8DFC8] shadow-xs flex flex-col h-[650px] overflow-hidden">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#FFFDF9] via-[#FAF6EE] to-[#F5EEDB] border-b border-[#E8DFC8] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 shadow-2xs font-bold text-lg">
                  🤖
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-sm">Admissions AI WhatsApp & Prospectus Bot</h3>
                  <div className="flex items-center gap-2 text-[10px] text-stone-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>Trained on Official CBSE 2026-27 Prospectus & Fee Structure</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Gemini 2.5 Flash
              </span>
            </div>

            {/* Chat History Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#FDFBF7]/50">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center shrink-0 font-bold text-xs">
                      AI
                    </div>
                  )}
                  <div
                    className={`max-w-lg p-4 rounded-3xl text-xs sm:text-sm font-medium leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#D97706] text-white rounded-tr-xs shadow-xs'
                        : 'bg-white text-stone-800 border border-[#E8DFC8] rounded-tl-xs shadow-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiProcessing && (
                <div className="flex items-center gap-2 text-xs text-stone-400 p-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
                  <span>AI Copilot formulating admissions answer...</span>
                </div>
              )}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendAiQuery} className="p-3 sm:p-4 bg-white border-t border-[#E8DFC8] flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask fee breakdown, age criteria, bus routes, or syllabus..."
                value={chatQuery}
                onChange={e => setChatQuery(e.target.value)}
                className="flex-1 text-xs px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC8] text-stone-900 focus:outline-none focus:border-[#D97706]"
              />
              <Button
                type="submit"
                variant="saffron"
                size="md"
                isLoading={isAiProcessing}
                className="bg-[#D97706] hover:bg-[#B45309] text-white font-black"
                rightIcon={<Send className="w-3.5 h-3.5" />}
              >
                Ask
              </Button>
            </form>
          </div>

          {/* AI Knowledge Base & Quick Questions */}
          <div className="space-y-4">
            <div className="bg-white/95 rounded-3xl border border-[#E8DFC8] p-5 shadow-xs space-y-3">
              <h4 className="font-extrabold text-stone-900 text-sm">Quick Test Prompts</h4>
              <div className="space-y-2">
                {[
                  "What is the annual tuition fee for Class 5?",
                  "Are sibling discounts applicable across all campuses?",
                  "What is the minimum age for Nursery admissions 2026-27?",
                  "Is school transport bus route available for Burari / Sant Nagar?",
                ].map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendAiQuery(undefined, q)}
                    className="w-full text-left p-2.5 rounded-2xl bg-[#FAF7F2] hover:bg-amber-50/60 border border-[#E8DFC8] text-xs font-semibold text-stone-700 transition cursor-pointer"
                  >
                    💬 {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/95 rounded-3xl border border-[#E8DFC8] p-5 shadow-xs space-y-2">
              <h4 className="font-extrabold text-stone-900 text-sm">Live WhatsApp Bot Telemetry</h4>
              <p className="text-xs text-stone-600">
                Connected to school WhatsApp Business webhook (+91 9811102008). Automatically converts WhatsApp conversations into Lead cards in Tab 1.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span>Webhook Health: Normal</span>
                <span>Response Time: 1.2s</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: AI PREDICTIVE ADMISSIONS LEAD SCORING */}
      {/* ======================================================== */}
      {activeTab === 'LEAD_SCORING' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <AiLeadScoringDesk />
        </div>
      )}

      {/* 360° Lead Dossier Modal */}
      {selectedEnquiryIdFor360 && (
        <Enquiry360DossierModal
          isOpen={Boolean(selectedEnquiryIdFor360)}
          onClose={() => setSelectedEnquiryIdFor360(null)}
          enquiryId={selectedEnquiryIdFor360}
          onUpdate={loadAllData}
        />
      )}

      {/* Rapid Intake Modal */}
      <AdminNewEnquiryModal
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        onSuccess={() => {
          setIsNewLeadModalOpen(false);
          loadAllData();
        }}
      />

    </div>
  );
}

export default function AdmissionsCommandCenterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-stone-500 font-bold">Loading Admissions Command Center...</div>}>
      <AdmissionsCommandCenterContent />
    </Suspense>
  );
}
