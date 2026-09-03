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
  FileText, GraduationCap
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
import { getEnquiries } from '@/app/actions/enquiry';
import { AdmissionsFunnelChart } from '@/components/admissions/analytics/AdmissionsFunnelChart';
import { ManagementInsightsCard } from '@/components/admissions/analytics/ManagementInsightsCard';
import { Enquiry360DossierModal } from '@/components/enquiry/Enquiry360DossierModal';
import { AdminNewEnquiryModal } from '@/components/enquiry/AdminNewEnquiryModal';
import { Button } from '@/components/ui/Button';
import { VastuModuleBanner } from '@/components/common/VastuModuleBanner';

function AdmissionsCommandCenterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = (searchParams.get('tab') || 'analytics').toUpperCase();

  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'PIPELINE' | 'ENQUIRIES' | 'AI_BOT'>(
    initialTab === 'PIPELINE' ? 'PIPELINE' :
    initialTab === 'ENQUIRIES' || initialTab === 'CRM' ? 'ENQUIRIES' :
    initialTab === 'AI_BOT' || initialTab === 'AI-BOT' ? 'AI_BOT' : 'ANALYTICS'
  );

  const [isLoading, setIsLoading] = useState(true);

  // Tab 1 Analytics State
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

  // Tab 2 Pipeline State
  const [pipelineApps, setPipelineApps] = useState<any[]>([]);
  const [pipelineFilter, setPipelineFilter] = useState('ALL');

  // Tab 3 Enquiries & Walk-ins State
  const [enquiriesList, setEnquiriesList] = useState<any[]>([]);
  const [enquirySearch, setEnquirySearch] = useState('');
  const [selectedEnquiryIdFor360, setSelectedEnquiryIdFor360] = useState<string | null>(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadForm, setLeadForm] = useState({
    student_name: '',
    parent_name: '',
    phone: '',
    email: '',
    grade_applying: 'Grade 1',
    previous_school: '',
    source: 'Walk-in',
    notes: '',
  });

  // Tab 4 AI Bot State
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
        getAdmissionsPerformanceAnalyticsAction(),
        getAdmissionsPipelineApplicationsAction(),
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

  const handleTabChange = (tab: 'ANALYTICS' | 'PIPELINE' | 'ENQUIRIES' | 'AI_BOT') => {
    setActiveTab(tab);
    const param = tab === 'AI_BOT' ? 'ai-bot' : tab.toLowerCase();
    router.replace(`/admin/admissions?tab=${param}`, { scroll: false });
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.student_name || !leadForm.phone) {
      alert('Please provide student name and parent phone number.');
      return;
    }
    setIsSubmittingLead(true);
    try {
      const parts = leadForm.student_name.trim().split(' ');
      const studentFirstName = parts[0] || 'Student';
      const studentLastName = parts.slice(1).join(' ') || '';

      const res = await createAdminEnquiryAction({
        studentFirstName,
        studentLastName,
        parentName: leadForm.parent_name || 'Parent',
        parentPhone: leadForm.phone,
        parentEmail: leadForm.email || 'admissions@crayonboxschool.com',
        gradeApplied: leadForm.grade_applying,
        previousSchool: leadForm.previous_school,
        notes: leadForm.notes,
      });
      if (res.success) {
        alert('Walk-in enquiry logged successfully!');
        setIsNewLeadModalOpen(false);
        setLeadForm({
          student_name: '',
          parent_name: '',
          phone: '',
          email: '',
          grade_applying: 'Grade 1',
          previous_school: '',
          source: 'Walk-in',
          notes: '',
        });
        await loadAllData();
      } else {
        alert(res.error || 'Failed to create lead');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSubmittingLead(false);
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans pb-20">
      
      {/* Option 6 Sattva-Digital Module Banner & Tabs */}
      <VastuModuleBanner
        badgeText="Unified Admissions Command Suite"
        badgeIcon={<Sparkles className="w-3 h-3" />}
        institutionText="Academic Session 2026–2027"
        title="Admissions, Enquiries & Enrollment Hub"
        description="Unified intake cockpit consolidating Funnel Analytics, Kanban Pipeline, Walk-ins CRM, and 24/7 AI Bot."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={loadAllData}
              isLoading={isLoading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Sync Live DB
            </Button>
            <Button
              variant="saffron"
              size="sm"
              onClick={() => setIsNewLeadModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              + Quick Walk-in Lead
            </Button>
          </>
        }
        tabs={[
          { id: 'ANALYTICS', label: '1. Funnel & Intelligence Analytics', icon: <BarChart3 className="w-4 h-4 text-blue-400" /> },
          { id: 'PIPELINE', label: '2. Kanban Pipeline & Stage Review', icon: <Layers className="w-4 h-4 text-indigo-400" />, count: pipelineApps.length },
          { id: 'ENQUIRIES', label: '3. Walk-ins & Enquiries CRM', icon: <PhoneCall className="w-4 h-4 text-emerald-400" />, count: enquiriesList.length },
          { id: 'AI_BOT', label: '4. AI WhatsApp Assistant', icon: <Bot className="w-4 h-4 text-purple-400" /> },
        ]}
        activeTab={activeTab}
        onTabChange={(id) => handleTabChange(id as any)}
      />

      {/* ======================================================== */}
      {/* TAB 1: FUNNEL & INTELLIGENCE ANALYTICS */}
      {/* ======================================================== */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* KPI Hero Matrix */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Enquiries</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{kpis.totalEnquiries}</span>
                <span className="text-[11px] font-black text-emerald-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> Live
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block">Registered inquiries</span>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Applications</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-blue-600 font-mono">{kpis.totalApplications}</span>
                <span className="text-[11px] font-bold text-slate-500">{kpis.applicationRate}% rate</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Online forms filed</span>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Confirmed Admissions</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">{kpis.totalAdmissions}</span>
                <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Enrolled</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Fee received &amp; class allotted</span>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Conversion Yield</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-indigo-600 font-mono">{kpis.conversionRate}%</span>
                <span className="text-[11px] font-bold text-indigo-600">Benchmark: 20%</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Inquiry to enrolled ratio</span>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Sibling Priority</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-purple-600 font-mono">100%</span>
                <span className="text-[11px] font-bold text-purple-600">Family 360</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Automated sibling discounts</span>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Lost Leads</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-slate-400 font-mono">{kpis.lostEnquiries}</span>
                <span className="text-[11px] font-bold text-slate-400">Archived</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Unresponsive or relocated</span>
            </div>
          </div>

          {/* Funnel Stack & Management Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AdmissionsFunnelChart stages={funnelStages} />
            </div>
            <div>
              <ManagementInsightsCard
                insights={analytics?.managementInsights || {
                  topPerformer: 'Nursery & KG',
                  criticalBottleneck: 'Document Verification',
                  topLeadSource: 'Walk-in & Google Maps',
                  forecastedYield: '88% of target capacity'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: KANBAN PIPELINE & STAGE REVIEW */}
      {/* ======================================================== */}
      {activeTab === 'PIPELINE' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Pipeline Header Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Admissions Review Pipeline</h3>
              <p className="text-xs text-slate-500">Track and advance applicants from initial submission to final classroom enrollment</p>
            </div>
            <div className="flex items-center gap-2">
              {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'OFFER_MADE', 'ENROLLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setPipelineFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    pipelineFilter === st
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Pipeline Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pipelineApps
              .filter(app => pipelineFilter === 'ALL' || (app.status || 'SUBMITTED').toUpperCase().includes(pipelineFilter))
              .map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        {app.token || `APP-${app.id.slice(0, 6)}`}
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        app.status?.includes('ENROLL') || app.status?.includes('ADMIT')
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : app.status?.includes('OFFER')
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {app.status || 'SUBMITTED'}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-base">
                      {app.studentFirstName} {app.studentLastName || ''}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Applied Grade: <span className="font-bold text-slate-700">{app.gradeApplied}</span> • Age: {app.age || '4 yrs'}
                    </p>

                    <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Parent:</span>
                        <span className="font-bold text-slate-800">{app.parentName || `${app.parentFirstName || ''} ${app.parentLastName || ''}`}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Phone:</span>
                        <span className="font-mono text-slate-800">{app.parentPhone}</span>
                      </div>
                      {app.transportRequired && (
                        <div className="flex items-center gap-1 text-[11px] text-amber-700 font-bold mt-1">
                          <span>🚌 Bus Transport Requested</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={`https://wa.me/${app.parentPhone?.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(app.parentName || 'Parent')},%20regarding%20${encodeURIComponent(app.studentFirstName)}%20admission%20at%20Crayon%20Box%20School...`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" /> WhatsApp
                    </a>

                    <Link
                      href={`/admin/admissions/${app.id}/verify`}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0B1B30] hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                    >
                      <span>Review Details</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
          </div>

          {pipelineApps.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
              <Layers className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700">No Applications in Current Pipeline Filter</h3>
              <p className="text-xs text-slate-400">Click &ldquo;+ Quick Walk-in Lead&rdquo; above to register new applicants.</p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: WALK-INS & ENQUIRIES CRM */}
      {/* ======================================================== */}
      {activeTab === 'ENQUIRIES' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search walk-in parent name, phone, student..."
                value={enquirySearch}
                onChange={e => setEnquirySearch(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/admissions/applications"
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <FileText className="w-3.5 h-3.5 text-blue-950" />
                <span>Master Applications Ledger</span>
              </Link>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setIsNewLeadModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                + Rapid 2-Min Lead Entry
              </Button>
            </div>
          </div>

          {/* Enquiries Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enquiriesList
              .filter(enq => {
                const term = enquirySearch.toLowerCase();
                const sName = (enq.student_name || enq.studentName || '').toLowerCase();
                const pName = (enq.parent_name || enq.parentName || '').toLowerCase();
                const ph = (enq.phone || enq.parentPhone || '').toLowerCase();
                return sName.includes(term) || pName.includes(term) || ph.includes(term);
              })
              .map(enq => (
                <div
                  key={enq.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {enq.enquiry_no || enq.enquiryNo || 'ENQ-2026-LIVE'}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        enq.priority === 'HIGH' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {enq.priority || 'NORMAL'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{enq.student_name || enq.studentName || 'Prospective Student'}</h4>
                      <p className="text-xs text-slate-500 font-medium">Grade: {enq.grade_interested || enq.grade || 'Nursery'} • Parent: {enq.parent_name || enq.parentName}</p>
                    </div>

                    <div className="text-xs text-slate-600 space-y-0.5">
                      <p>📞 {enq.phone || enq.parentPhone}</p>
                      {enq.locality && <p>📍 {enq.locality}</p>}
                      {enq.transport_required && <p className="text-blue-600 font-semibold">🚌 School Transport Requested</p>}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedEnquiryIdFor360(enq.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-amber-300" /> Dossier
                      </button>
                      <Link
                        href={`/admissions/apply?enquiry_no=${enq.enquiry_no || enq.id}`}
                        target="_blank"
                        className="px-2.5 py-1.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                        title="Pre-fill and open Master Admission Application"
                      >
                        <GraduationCap className="w-3 h-3 text-amber-400" /> Apply
                      </Link>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${enq.phone || enq.parentPhone}`}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition"
                      >
                        <Phone className="w-3 h-3 text-slate-500" /> Call
                      </a>
                      <a
                        href={`https://wa.me/${(enq.phone || enq.parentPhone || '').replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(enq.parent_name || 'Parent')},%20greetings%20from%20Crayon%20Box%20School%20Admissions%20Office.`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-600" /> WA
                      </a>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {enquiriesList.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
              <PhoneCall className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700">No Walk-in Enquiries Logged Yet</h3>
              <p className="text-xs text-slate-400">Click &ldquo;+ Rapid 2-Min Lead Entry&rdquo; above to record parent inquiries.</p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: AI WHATSAPP ASSISTANT */}
      {/* ======================================================== */}
      {activeTab === 'AI_BOT' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Interactive Bot Chat Simulator */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">VANI • 24/7 AI Admissions Receptionist Simulator</h3>
                    <p className="text-xs text-slate-500">Zero-hardcoding live DB responses, Q&amp;A manager, and evaluations</p>
                  </div>
                </div>

                <Link
                  href="/admin/admissions/ai-bot"
                  className="px-4 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Open Full VANI Control Centre</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-300" />
                </Link>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Agent
                </span>
              </div>

              {/* Chat Message Window */}
              <div className="space-y-3 min-h-[300px] max-h-[400px] overflow-y-auto p-4 rounded-2xl bg-slate-50 border border-slate-100">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#0B1B30] text-white rounded-br-none shadow-xs font-medium'
                          : 'bg-white text-slate-800 rounded-bl-none border border-slate-200/80 shadow-2xs font-normal'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
                  </div>
                ))}
                {isAiProcessing && (
                  <div className="flex items-center gap-2 text-xs text-purple-600 font-bold p-2 bg-purple-50 rounded-xl w-fit">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> AI Admissions Agent is typing...
                  </div>
                )}
              </div>

              {/* Prompt Suggestions */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  'What is the fee for Nursery?',
                  'Age criteria for Class 1?',
                  'Burari bus transport available?',
                  'Required admission documents?'
                ].map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendAiQuery(undefined, p)}
                    className="text-[11px] font-medium px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-100 whitespace-nowrap transition cursor-pointer"
                  >
                    💡 {p}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendAiQuery} className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Ask any admissions question to test bot knowledge..."
                  value={chatQuery}
                  onChange={e => setChatQuery(e.target.value)}
                  className="flex-1 text-xs px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-purple-600"
                />
                <button
                  type="submit"
                  disabled={isAiProcessing || !chatQuery.trim()}
                  className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>

            {/* Inbound Parent WhatsApp Inquiries */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <h3 className="font-extrabold text-slate-900 text-sm">Recent Inbound Bot Logs</h3>
                  <span className="text-[10px] font-bold text-slate-400">{aiInquiries.length} Inquiries</span>
                </div>

                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {aiInquiries.map((inq, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>{inq.parent_name || 'WhatsApp Parent'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{inq.target_grade}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">Q: &ldquo;{inq.user_query}&rdquo;</p>
                      <p className="text-[10px] text-slate-400">Answered by AI • {inq.created_at ? new Date(inq.created_at).toLocaleDateString('en-GB') : 'Today'}</p>
                    </div>
                  ))}

                  {aiInquiries.length === 0 && (
                    <div className="text-center py-8 text-slate-400 space-y-2">
                      <Bot className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="text-xs">No WhatsApp conversations recorded today.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" /> WhatsApp Cloud Webhook Active
                </div>
                <p className="text-[11px] text-purple-700 leading-relaxed">
                  Incoming parent WhatsApp messages to +91 9811102008 are automatically handled by this agent with zero latency.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 360° NEW ADMISSION ENQUIRY INTAKE MODAL */}
      {/* ======================================================== */}
      <AdminNewEnquiryModal
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        onSuccess={() => {
          setIsNewLeadModalOpen(false);
          loadAllData();
        }}
      />

      {/* 360° Lead Dossier Modal */}
      {selectedEnquiryIdFor360 && (
        <Enquiry360DossierModal
          isOpen={Boolean(selectedEnquiryIdFor360)}
          onClose={() => setSelectedEnquiryIdFor360(null)}
          enquiryId={selectedEnquiryIdFor360}
          onUpdate={loadAllData}
        />
      )}

    </div>
  );
}

export default function AdmissionsCommandCenterPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center text-slate-400 font-medium">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
        Loading Unified Admissions Command Suite...
      </div>
    }>
      <AdmissionsCommandCenterContent />
    </Suspense>
  );
}
