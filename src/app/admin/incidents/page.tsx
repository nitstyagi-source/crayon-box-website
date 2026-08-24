"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert, ShieldCheck, Lock, AlertTriangle, CheckCircle2,
  FileText, Download, Eye, EyeOff, UserCheck, Plus, RefreshCw,
  HeartPulse, UserX, AlertCircle, X, Search, Building2, PhoneCall,
  Printer, Send, Clock, MapPin, User, Calendar, Award, Sparkles,
  ChevronRight, MessageSquare, Check, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { DualFileUpload } from '@/components/ui/DualFileUpload';
import { useInstitution } from '@/components/providers/InstitutionContext';
import {
  getIncidentsDashboardAction,
  getEnrolledStudentsForIncidentLookupAction,
  logSchoolIncidentAction,
  addIncidentInvestigationNoteAction,
  updateIncidentStatusAction,
  resolveAndFinalizeIncidentAction,
  getIncidentFullDossierAction
} from '@/app/actions/incident-actions';
import IncidentOfficialReportModal from '@/components/incidents/IncidentOfficialReportModal';

export default function SafeguardingIncidentsPage() {
  const { currentInstitution, selectedInstitutionObj, isAllInstitutions } = useInstitution();

  const [activeTab, setActiveTab] = useState<'ALL' | 'DISCIPLINE' | 'MEDICAL_INFIRMARY' | 'POCSO_SAFEGUARDING'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [incidents, setIncidents] = useState<any[]>([]);
  const [counts, setCounts] = useState({
    totalIncidents: 0,
    disciplineCount: 0,
    medicalCount: 0,
    safeguardingCount: 0,
    pocsoCount: 0,
    openCases: 0,
    resolvedCases: 0,
    criticalCases: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Student Autocomplete State
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [studentSearchText, setStudentSearchText] = useState<string>('');
  const [selectedStudentObj, setSelectedStudentObj] = useState<any | null>(null);

  // View / Manage Dossier Modal State
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [newInvestigationNote, setNewInvestigationNote] = useState('');
  const [investigationAuthor, setInvestigationAuthor] = useState('Designated Safeguarding Lead');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Case Resolution Form State
  const [isResolving, setIsResolving] = useState(false);
  const [finalResolutionText, setFinalResolutionText] = useState('');
  const [actionPlanText, setActionPlanText] = useState('');
  const [parentUndertakingText, setParentUndertakingText] = useState('');
  const [closingOfficer, setClosingOfficer] = useState('Principal & Director');

  // Official Report Print Modal State
  const [reportModalIncident, setReportModalIncident] = useState<any | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Log Incident Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [newType, setNewType] = useState<'DISCIPLINE' | 'MEDICAL_INFIRMARY' | 'POCSO_SAFEGUARDING'>('DISCIPLINE');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
  const [newCategory, setNewCategory] = useState('Classroom Conduct & Discipline');
  const [newSeverity, setNewSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [newLocation, setNewLocation] = useState('Senior Academic Wing - Room 302');
  const [newDescription, setNewDescription] = useState('');
  const [newAction, setNewAction] = useState('');
  const [newWitnesses, setNewWitnesses] = useState('');
  const [newReportedBy, setNewReportedBy] = useState('Class Teacher');
  const [newReportedByRole, setNewReportedByRole] = useState('Faculty Lead');
  const [newParentChannel, setNewParentChannel] = useState('Phone Call');
  const [newParentResponse, setNewParentResponse] = useState('Parent informed and acknowledged initial notice.');
  const [newDisposition, setNewDisposition] = useState('Returned to Class');
  const [newAttachment, setNewAttachment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Incidents
  const fetchIncidents = async () => {
    setIsLoading(true);
    const res = await getIncidentsDashboardAction({
      incidentType: activeTab,
      severity: severityFilter,
      status: statusFilter,
      searchQuery
    });
    if (res.success) {
      setIncidents(res.incidents || []);
      setCounts(res.counts || {
        totalIncidents: 0,
        disciplineCount: 0,
        medicalCount: 0,
        safeguardingCount: 0,
        pocsoCount: 0,
        openCases: 0,
        resolvedCases: 0,
        criticalCases: 0
      });
    }
    setIsLoading(false);
  };

  // Load Enrolled Students for Autocomplete
  useEffect(() => {
    async function loadStudents() {
      const res = await getEnrolledStudentsForIncidentLookupAction();
      if (res.success && res.students) {
        setEnrolledStudents(res.students);
      }
    }
    loadStudents();
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [activeTab, severityFilter, statusFilter, searchQuery]);

  // Handle Log Incident Submit
  const handleLogIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim()) return;

    setIsSubmitting(true);
    const res = await logSchoolIncidentAction({
      incidentType: newType,
      studentId: selectedStudentObj?.id,
      studentAdmissionNoOrName: selectedStudentObj?.name || studentSearchText || 'Rohan Verma',
      category: newCategory,
      severity: newSeverity,
      location: newLocation,
      incidentDate: newDate,
      incidentTime: newTime,
      description: newDescription,
      immediateAction: newAction || 'First aid administered, student counseled, and parent informed.',
      witnesses: newWitnesses,
      reportedBy: newReportedBy,
      reportedByRole: newReportedByRole,
      parentInformed: true,
      parentNotificationChannel: newParentChannel,
      parentResponse: newParentResponse,
      studentDisposition: newDisposition,
      attachments: newAttachment ? [newAttachment] : []
    });
    setIsSubmitting(false);

    if (res.success) {
      setIsLogModalOpen(false);
      // Reset form
      setNewDescription('');
      setNewAction('');
      setNewWitnesses('');
      setSelectedStudentObj(null);
      setStudentSearchText('');
      fetchIncidents();
      
      // Auto open dossier of newly created incident
      if (res.incident) {
        handleOpenDossier(res.incident);
      }
    } else {
      alert("Error logging incident: " + res.error);
    }
  };

  // Open Case Dossier
  const handleOpenDossier = async (inc: any) => {
    setSelectedIncident(inc);
    setIsDossierOpen(true);
    setFinalResolutionText(inc.final_resolution || '');
    setActionPlanText(inc.action_plan || '');
    setParentUndertakingText(inc.parent_undertaking || '');

    // Refresh full details
    const fullRes = await getIncidentFullDossierAction(inc.id);
    if (fullRes.success && fullRes.dossier) {
      setSelectedIncident(fullRes.dossier);
    }
  };

  // Add Progress Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvestigationNote.trim() || !selectedIncident) return;

    setIsAddingNote(true);
    const res = await addIncidentInvestigationNoteAction({
      incidentId: selectedIncident.id,
      author: investigationAuthor,
      role: 'Designated Safeguarding Lead',
      note: newInvestigationNote,
      actionTaken: 'INVESTIGATION_NOTE'
    });
    setIsAddingNote(false);

    if (res.success) {
      setNewInvestigationNote('');
      setSelectedIncident((prev: any) => ({
        ...prev,
        investigation_notes: res.notes
      }));
      fetchIncidents();
    } else {
      alert("Error adding note: " + res.error);
    }
  };

  // Resolve and Close Case
  const handleResolveAndClose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalResolutionText.trim() || !selectedIncident) return;

    setIsResolving(true);
    const res = await resolveAndFinalizeIncidentAction({
      incidentId: selectedIncident.id,
      finalResolution: finalResolutionText,
      actionPlan: actionPlanText || "Periodic observation by Class Teacher and Counselor.",
      parentUndertaking: parentUndertakingText || "Parent attended conference and signed undertaking.",
      closedBy: closingOfficer,
      closedByRole: "Principal / Head of Institution"
    });
    setIsResolving(false);

    if (res.success) {
      setSelectedIncident(res.incident);
      fetchIncidents();
      alert("✓ Case successfully resolved and finalized!");
    } else {
      alert("Error resolving case: " + res.error);
    }
  };

  // Open Print Modal
  const handleOpenPrintReport = (inc: any) => {
    setReportModalIncident(inc);
    setIsReportModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* 🌟 HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-rose-500/20 text-rose-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-rose-500/30 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Child Protection &amp; Safety Vault
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-indigo-300 text-xs font-semibold">
              {isAllInstitutions ? 'All Institutions' : selectedInstitutionObj?.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-rose-400" />
            Child Protection, Safeguarding Vault &amp; Incident Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Confidential Designated Safeguarding Lead (DSL) dossier vault, disciplinary records, medical infirmary logs, and statutory final reports.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsLogModalOpen(true)}
            className="bg-rose-600 hover:bg-rose-500 text-white font-black shadow-lg shadow-rose-600/20"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            🚨 Log Incident / Concern
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchIncidents}
            isLoading={isLoading}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Vault
          </Button>
        </div>
      </div>

      {/* 🌟 STATS COUNTERS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Recorded Cases</span>
          <span className="text-3xl font-black text-slate-900 mt-1 block">{counts.totalIncidents}</span>
          <span className="text-[11px] text-slate-500 font-semibold">{counts.openCases} Open / Under Action</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Discipline &amp; Conduct</span>
          <span className="text-3xl font-black text-amber-600 mt-1 block">{counts.disciplineCount}</span>
          <span className="text-[11px] text-amber-700 font-bold">Behavioral Records</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Infirmary First-Aid</span>
          <span className="text-3xl font-black text-emerald-600 mt-1 block">{counts.medicalCount}</span>
          <span className="text-[11px] text-emerald-700 font-bold">Medical Logs</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">🔒 Confidential Safeguarding</span>
          <span className="text-3xl font-black text-rose-600 mt-1 block">{counts.safeguardingCount}</span>
          <span className="text-[11px] text-rose-700 font-bold">DSL Vault Restricted</span>
        </div>
      </div>

      {/* 🌟 SEARCH & CATEGORY FILTER BAR */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl flex-wrap">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All Cases ({counts.totalIncidents})
          </button>

          <button
            onClick={() => setActiveTab('DISCIPLINE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'DISCIPLINE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserX className="w-3.5 h-3.5 text-amber-500" />
            Discipline ({counts.disciplineCount})
          </button>

          <button
            onClick={() => setActiveTab('MEDICAL_INFIRMARY')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'MEDICAL_INFIRMARY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5 text-emerald-500" />
            Medical ({counts.medicalCount})
          </button>

          <button
            onClick={() => setActiveTab('POCSO_SAFEGUARDING')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'POCSO_SAFEGUARDING' ? 'bg-white text-rose-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-rose-600" />
            🔒 Safeguarding Vault ({counts.safeguardingCount})
          </button>
        </div>

        {/* Search & Severity Filters */}
        <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student, case ID, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">🔴 Critical</option>
            <option value="HIGH">🟠 High</option>
            <option value="MEDIUM">🟡 Medium</option>
            <option value="LOW">🟢 Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="UNDER_INVESTIGATION">⚠️ Under Investigation</option>
            <option value="RESOLVED">✓ Resolved &amp; Closed</option>
          </select>
        </div>

      </div>

      {/* 🌟 INCIDENTS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              School Safeguarding &amp; Incident Registry ({incidents.length})
            </h3>
            <p className="text-xs text-slate-400">
              Click any incident to open full case dossier, record investigation notes, resolve, and generate official statutory reports.
            </p>
          </div>
        </div>

        {incidents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <ShieldAlert className="w-12 h-12 mx-auto text-slate-300 mb-3 stroke-1" />
            <p className="font-bold text-slate-600 text-sm">No incidents found in this category.</p>
            <p className="mt-1">All safety logs are in good standing.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/60 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  <th className="py-3.5 px-4">Case Ref</th>
                  <th className="py-3.5 px-4">Student Particulars</th>
                  <th className="py-3.5 px-4">Category &amp; Classification</th>
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4">Campus Location</th>
                  <th className="py-3.5 px-4">Workflow Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50/80 transition group">
                    <td className="py-3.5 px-4">
                      <strong className="font-mono font-bold text-slate-900 block">{inc.incident_code}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">{inc.incident_date}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <strong className="text-slate-900 block font-bold">{inc.person_name}</strong>
                      <span className="text-[10px] font-mono text-indigo-600 font-bold">{inc.class_name} ({inc.admission_no})</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-800 font-bold block truncate max-w-xs">{inc.category}</span>
                      <span className={`text-[10px] font-black uppercase ${
                        inc.incident_type === 'POCSO_SAFEGUARDING' || inc.incident_type === 'SAFEGUARDING' ? 'text-rose-600' :
                        inc.incident_type === 'MEDICAL_INFIRMARY' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {inc.incident_type === 'POCSO_SAFEGUARDING' || inc.incident_type === 'SAFEGUARDING' ? '🔒 Safeguarding Vault' : inc.incident_type.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        inc.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                        inc.severity === 'HIGH' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {inc.severity}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 text-[11px] truncate max-w-[160px]">
                      {inc.location}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit ${
                        inc.status === 'RESOLVED' || inc.status === 'CLOSED'
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          inc.status === 'RESOLVED' || inc.status === 'CLOSED' ? 'bg-emerald-600' : 'bg-amber-600 animate-pulse'
                        }`} />
                        {inc.status?.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDossier(inc)}
                        className="text-[11px] py-1 px-3 hover:bg-slate-100 border-slate-300"
                        leftIcon={<FileText className="w-3.5 h-3.5 text-indigo-600" />}
                      >
                        Manage Dossier
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenPrintReport(inc)}
                        className="text-[11px] py-1 px-2.5 bg-slate-900 hover:bg-slate-800 text-white border-slate-900"
                        leftIcon={<Printer className="w-3.5 h-3.5 text-amber-300" />}
                        title="Print Official Final Report"
                      >
                        Report
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🌟 1. CASE DOSSIER & WORKFLOW MANAGEMENT MODAL */}
      {isDossierOpen && selectedIncident && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 font-sans space-y-6 max-h-[92vh] overflow-y-auto">
            
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md border ${
                    selectedIncident.incident_type === 'POCSO_SAFEGUARDING' || selectedIncident.incident_type === 'SAFEGUARDING'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}>
                    {selectedIncident.incident_type === 'POCSO_SAFEGUARDING' || selectedIncident.incident_type === 'SAFEGUARDING' ? 'Safeguarding Vault' : selectedIncident.incident_type?.replace('_', ' ')} Case File
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    selectedIncident.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedIncident.status?.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">{selectedIncident.incident_code}</h3>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleOpenPrintReport(selectedIncident)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                  leftIcon={<Printer className="w-3.5 h-3.5" />}
                >
                  Print Report (A4)
                </Button>

                <button onClick={() => setIsDossierOpen(false)} className="p-1 text-slate-400 hover:text-slate-900 font-bold">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Demographics Card */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Student Name</span>
                <strong className="text-slate-900 font-bold">{selectedIncident.person_name}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Admission &amp; Class</span>
                <span className="text-slate-700 font-mono font-semibold">{selectedIncident.class_name} ({selectedIncident.admission_no})</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Incident Date &amp; Time</span>
                <span className="text-slate-700 font-semibold">{selectedIncident.incident_date} &bull; {selectedIncident.incident_time}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Location</span>
                <span className="text-slate-700 font-semibold">{selectedIncident.location}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Severity Level</span>
                <span className="font-bold text-rose-600">{selectedIncident.severity}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Reported By</span>
                <span className="text-slate-700 font-semibold">{selectedIncident.reported_by}</span>
              </div>
            </div>

            {/* Incident Narrative & Immediate Action */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Factual Incident Narrative:</span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-xs leading-relaxed">
                  {selectedIncident.description}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Immediate Remedial Action:</span>
                <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 text-xs leading-relaxed font-medium">
                  {selectedIncident.immediate_action}
                </div>
              </div>
            </div>

            {/* 📝 INVESTIGATION TIMELINE & PROGRESS NOTES */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" /> Case Investigation Audit Log
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {selectedIncident.investigation_notes?.length || 0} entries
                </span>
              </div>

              {/* Notes List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Array.isArray(selectedIncident.investigation_notes) && selectedIncident.investigation_notes.length > 0 ? (
                  selectedIncident.investigation_notes.map((n: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-slate-900">{n.author}</strong>
                          <span className="text-slate-500">({n.role || 'Staff'})</span>
                        </div>
                        <span className="text-slate-400 font-mono">
                          {n.timestamp ? new Date(n.timestamp).toLocaleString('en-IN') : 'Logged'}
                        </span>
                      </div>
                      <p className="text-slate-800 text-[11px]">{n.note}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No progressive notes recorded yet.</p>
                )}
              </div>

              {/* Add Progress Note Form */}
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Record new investigation note / statement / conference update..."
                  value={newInvestigationNote}
                  onChange={(e) => setNewInvestigationNote(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
                <Button
                  size="sm"
                  type="submit"
                  isLoading={isAddingNote}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  Add Note
                </Button>
              </form>
            </div>

            {/* 🔒 RESOLVE & FINALIZE CASE FORM */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Final Case Resolution &amp; Statutory Closure
                </span>
                <span className="text-[10px] text-slate-400">Generates certified final report</span>
              </div>

              <form onSubmit={handleResolveAndClose} className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-300 block mb-1">
                    Final Case Resolution &amp; Disciplinary/Safeguarding Findings:
                  </label>
                  <textarea
                    rows={2}
                    value={finalResolutionText}
                    onChange={(e) => setFinalResolutionText(e.target.value)}
                    placeholder="e.g. Disciplinary committee meeting conducted. Parent undertaking received and behavior agreement signed."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-300 block mb-1">
                      Corrective Action Plan:
                    </label>
                    <input
                      type="text"
                      value={actionPlanText}
                      onChange={(e) => setActionPlanText(e.target.value)}
                      placeholder="e.g. 2 weekly counseling sessions & peer monitoring"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-300 block mb-1">
                      Parent Undertaking:
                    </label>
                    <input
                      type="text"
                      value={parentUndertakingText}
                      onChange={(e) => setParentUndertakingText(e.target.value)}
                      placeholder="e.g. Parent attended conference and signed undertaking."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Closing Officer:</span>
                    <input
                      type="text"
                      value={closingOfficer}
                      onChange={(e) => setClosingOfficer(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200 font-bold"
                    />
                  </div>

                  <Button
                    size="sm"
                    type="submit"
                    isLoading={isResolving}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md"
                  >
                    ✓ Seal &amp; Resolve Case
                  </Button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* 🌟 2. LOG NEW INCIDENT MODAL (REGISTRATION) */}
      {isLogModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 font-sans space-y-5 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="text-lg font-black text-slate-900">Register Incident / Safeguarding Concern</h3>
              </div>
              <button onClick={() => setIsLogModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogIncident} className="space-y-4 text-xs">
              
              {/* Type Selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Incident Classification</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setNewType('DISCIPLINE'); setNewCategory('Classroom Conduct & Discipline'); }}
                    className={`p-2.5 rounded-xl border font-bold text-[11px] transition ${
                      newType === 'DISCIPLINE' ? 'bg-amber-500 text-white border-amber-500 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Discipline
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewType('MEDICAL_INFIRMARY'); setNewCategory('Sports Injury / First-Aid'); }}
                    className={`p-2.5 rounded-xl border font-bold text-[11px] transition ${
                      newType === 'MEDICAL_INFIRMARY' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Medical Infirmary
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewType('POCSO_SAFEGUARDING'); setNewCategory('Confidential Child Protection Concern'); }}
                    className={`p-2.5 rounded-xl border font-bold text-[11px] transition ${
                      newType === 'POCSO_SAFEGUARDING' ? 'bg-rose-600 text-white border-rose-600 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    🔒 Safeguarding Vault
                  </button>
                </div>
              </div>

              {/* Student Autocomplete Selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Enrolled Student</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={selectedStudentObj?.id || ''}
                    onChange={(e) => {
                      const stu = enrolledStudents.find((s) => s.id === e.target.value);
                      setSelectedStudentObj(stu || null);
                      if (stu) setStudentSearchText(stu.name);
                    }}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="">-- Choose from Active Students ({enrolledStudents.length}) --</option>
                    {enrolledStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.admission_no} • {s.full_class})
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={studentSearchText}
                    onChange={(e) => setStudentSearchText(e.target.value)}
                    placeholder="Or type manual student name / Adm No"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

              {/* Date, Time & Category */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Incident Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Incident Time</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category / Tag</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                    placeholder="e.g. Sports Injury, Peer Conflict"
                    required
                  />
                </div>
              </div>

              {/* Location & Severity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Campus Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900"
                    placeholder="e.g. Science Lab 302, Basketball Court, School Bus"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Severity Index</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="LOW">Low (Minor First-Aid / Advisory)</option>
                    <option value="MEDIUM">Medium (Parent Notice / Disciplinary)</option>
                    <option value="HIGH">High (Urgent Case Escalation)</option>
                    <option value="CRITICAL">Critical (Statutory / Committee Escalation)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Factual Incident Narrative</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none"
                  placeholder="Provide precise factual description of circumstances, timeline, and actions observed..."
                  required
                />
              </div>

              {/* Immediate Action & Witnesses */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Immediate Remedial Action</label>
                  <input
                    type="text"
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                    placeholder="e.g. First aid applied, student counseled..."
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Witnesses / Staff Present</label>
                  <input
                    type="text"
                    value={newWitnesses}
                    onChange={(e) => setNewWitnesses(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    placeholder="e.g. Class Teacher, Lab Assistant"
                  />
                </div>
              </div>

              {/* Parent Notification & Student Disposition */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Parent Communication Channel</label>
                  <select
                    value={newParentChannel}
                    onChange={(e) => setNewParentChannel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="Phone Call">📞 Direct Phone Call</option>
                    <option value="In-Person Meeting">🏫 In-Person Campus Meeting</option>
                    <option value="SMS / WhatsApp">💬 SMS / WhatsApp Broadcast</option>
                    <option value="Formal Written Letter">✉️ Formal Written Notice</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Student Disposition</label>
                  <select
                    value={newDisposition}
                    onChange={(e) => setNewDisposition(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="Returned to Class">Returned to Class</option>
                    <option value="Infirmary Observation">Infirmary Observation</option>
                    <option value="Parent Pickup Handover">Parent Pickup Handover</option>
                    <option value="Hospital Medical Referral">Hospital Medical Referral</option>
                  </select>
                </div>
              </div>

              {/* Supporting Document / Photo / Medical Report */}
              <div>
                <DualFileUpload
                  label="Supporting Evidence / Medical Slip / Photo"
                  helperText="Upload case file (PDF/Image) or paste an external secure document link"
                  value={newAttachment}
                  onChange={(val) => setNewAttachment(val)}
                  accept="image/*,.pdf"
                  placeholder="https://example.com/incident_report.pdf or upload file"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button size="sm" variant="outline" type="button" onClick={() => setIsLogModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit" isLoading={isSubmitting} className="bg-rose-600 hover:bg-rose-500 text-white font-bold">
                  ✓ Register &amp; Open Case File
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 🌟 3. OFFICIAL STATUTORY INVESTIGATION REPORT MODAL (PRINT A4) */}
      {isReportModalOpen && reportModalIncident && (
        <IncidentOfficialReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          incident={reportModalIncident}
          institution={selectedInstitutionObj}
        />
      )}

    </div>
  );
}
