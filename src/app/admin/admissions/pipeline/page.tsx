"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { 
  Search, Filter, MoreHorizontal, Bus, Users, Loader2, 
  Phone, Mail, Calendar, FileText, CheckCircle2, AlertCircle, 
  Clock, X, ChevronRight, UserCheck, Eye, ExternalLink, 
  Sparkles, RefreshCw, UserPlus, ShieldCheck, ArrowRight, 
  Check, MessageSquare, Download, Layers, Receipt, Printer, QrCode, CreditCard,
  Plus, Trash2, Sliders, Edit3
} from "lucide-react";
import Link from "next/link";
import { 
  getAdmissionsPipelineApplicationsAction, 
  updateAdmissionsApplicationStatusAction, 
  scheduleApplicantInterviewAction,
  updateApplicantDocumentVerificationAction,
  approveApplicationAndProvisionParent,
  generateAdmissionFeeReceiptAction
} from "@/app/actions/admissions";

type Applicant = {
  id: string;
  token: string;
  studentFirstName: string;
  studentLastName: string;
  fullName: string;
  dateOfBirth: string;
  age: string;
  gradeApplied: string;
  previousSchool: string;
  transportRequired: boolean;
  status: string;
  createdAt: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  documentUrl: string | null;
  documents: any[];
  interviewSchedule: any;
  submissionChannel: string;
  rawKits: any;
};

type Columns = {
  [key: string]: {
    name: string;
    description: string;
    color: string;
    items: Applicant[];
  };
};

const defaultColumns: Columns = {
  submitted: { 
    name: "1. Applications Submitted", 
    description: "Newly submitted online applications awaiting initial review",
    color: "bg-blue-500",
    items: [] 
  },
  verification: { 
    name: "2. Document Verification", 
    description: "Birth certificates & Aadhaar verification in progress",
    color: "bg-amber-500",
    items: [] 
  },
  interview: { 
    name: "3. Assessment & Interview", 
    description: "Parent interaction & candidate readiness scheduled",
    color: "bg-purple-500",
    items: [] 
  },
  approved: { 
    name: "4. Approved & Admitted", 
    description: "Seat allocated, admission fee invoice issued & portal activated",
    color: "bg-emerald-500",
    items: [] 
  }
};

export default function AdmissionsPipeline() {
  const [columns, setColumns] = useState<Columns>(defaultColumns);
  const [rawApplicants, setRawApplicants] = useState<Applicant[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  
  // Selected Applicant 360° Drawer State
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Interview Scheduler State
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("10:00");
  const [interviewerName, setInterviewerName] = useState("Dr. Ananya Sharma (Principal)");
  const [interviewNotes, setInterviewNotes] = useState("");

  // Custom Fee Receipt Generator State
  const [showReceiptBuilder, setShowReceiptBuilder] = useState(false);
  const [customReceiptNo, setCustomReceiptNo] = useState("");
  const [customReceiptDate, setCustomReceiptDate] = useState(new Date().toISOString().split('T')[0]);
  const [feeHeads, setFeeHeads] = useState<Array<{ name: string; amount: number }>>([
    { name: 'Admission & Registration Fee', amount: 10000 },
    { name: 'Tuition Fee (Term 1)', amount: 12000 },
    { name: 'Annual Development Charges', amount: 3000 }
  ]);
  const [concessionAmount, setConcessionAmount] = useState(0);
  const [concessionReason, setConcessionReason] = useState("None");
  const [lateFeeAmount, setLateFeeAmount] = useState(0);
  const [feePaidAmount, setFeePaidAmount] = useState(25000);
  const [feePaymentMode, setFeePaymentMode] = useState("UPI");
  const [feeTxnRef, setFeeTxnRef] = useState("");
  const [feeBankName, setFeeBankName] = useState("HDFC Bank");
  const [feeChequeNo, setFeeChequeNo] = useState("");
  const [feeChequeDate, setFeeChequeDate] = useState("");
  const [feeRemarks, setFeeRemarks] = useState("Admission fee installment received in full");
  const [feeCollectedBy, setFeeCollectedBy] = useState("Accounts Desk (Admissions)");
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<any>(null);

  // Dynamic calculations for custom receipt
  const grossTotal = feeHeads.reduce((acc, h) => acc + (Number(h.amount) || 0), 0);
  const netPayable = Math.max(0, grossTotal + Number(lateFeeAmount || 0) - Number(concessionAmount || 0));
  const remainingBalance = Math.max(0, netPayable - Number(feePaidAmount || 0));

  const addFeeHead = () => {
    setFeeHeads([...feeHeads, { name: 'Miscellaneous / Kit Fee', amount: 1000 }]);
  };

  const removeFeeHead = (index: number) => {
    setFeeHeads(feeHeads.filter((_, i) => i !== index));
  };

  const updateFeeHead = (index: number, field: 'name' | 'amount', value: any) => {
    const updated = [...feeHeads];
    updated[index] = { ...updated[index], [field]: value };
    setFeeHeads(updated);
  };

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const handleGenerateFeeReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplicant) return;
    setIsGeneratingReceipt(true);
    try {
      const res = await generateAdmissionFeeReceiptAction({
        applicationId: selectedApplicant.id,
        admissionNo: selectedApplicant.token.replace('APP-', 'ADM-'),
        studentName: selectedApplicant.fullName,
        className: selectedApplicant.gradeApplied,
        parentName: selectedApplicant.parentName,
        parentMobile: selectedApplicant.parentPhone,
        customReceiptNo: customReceiptNo.trim() || undefined,
        customReceiptDate: customReceiptDate,
        feeHeads,
        concessionAmount: Number(concessionAmount),
        concessionReason: concessionReason !== 'None' ? concessionReason : undefined,
        lateFeeAmount: Number(lateFeeAmount),
        totalAmountDue: grossTotal,
        amountPaid: Number(feePaidAmount),
        paymentMode: feePaymentMode,
        transactionRef: feeTxnRef || (feePaymentMode === 'UPI' ? `UPI-${Date.now().toString().slice(-6)}` : undefined),
        bankName: feeBankName,
        chequeNo: feeChequeNo || undefined,
        chequeDate: feeChequeDate || undefined,
        collectedBy: feeCollectedBy,
        remarks: feeRemarks
      });

      if (res.success && res.receipt) {
        setGeneratedReceipt(res.receipt);
        showToast(`Custom Official Receipt ${res.receipt.receipt_no} generated successfully!`);
      } else {
        showToast(res.error || 'Failed to generate fee receipt');
      }
    } catch (err: any) {
      showToast(err.message || 'Error generating fee receipt');
    } finally {
      setIsGeneratingReceipt(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    const res = await getAdmissionsPipelineApplicationsAction();
    if (res.success && res.data) {
      setRawApplicants(res.data);
      distributeToColumns(res.data, searchQuery, selectedGrade);
    }
    setLoading(false);
  };

  const distributeToColumns = (applicants: Applicant[], query: string, grade: string) => {
    const filtered = applicants.filter(app => {
      const matchesSearch = 
        app.fullName.toLowerCase().includes(query.toLowerCase()) ||
        app.token.toLowerCase().includes(query.toLowerCase()) ||
        app.parentName.toLowerCase().includes(query.toLowerCase()) ||
        app.parentPhone.includes(query);
      
      const matchesGrade = grade === "all" || app.gradeApplied.toLowerCase() === grade.toLowerCase();
      return matchesSearch && matchesGrade;
    });

    const newCols: Columns = {
      submitted: { ...defaultColumns.submitted, items: [] },
      verification: { ...defaultColumns.verification, items: [] },
      interview: { ...defaultColumns.interview, items: [] },
      approved: { ...defaultColumns.approved, items: [] }
    };

    filtered.forEach(app => {
      const statusStr = app.status.toLowerCase();
      if (statusStr.includes("verif")) {
        newCols.verification.items.push(app);
      } else if (statusStr.includes("interview")) {
        newCols.interview.items.push(app);
      } else if (statusStr.includes("approv") || statusStr.includes("admit")) {
        newCols.approved.items.push(app);
      } else {
        newCols.submitted.items.push(app);
      }
    });

    setColumns(newCols);
  };

  useEffect(() => {
    if (rawApplicants.length > 0) {
      distributeToColumns(rawApplicants, searchQuery, selectedGrade);
    }
  }, [searchQuery, selectedGrade, rawApplicants]);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      
      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceColumn, items: sourceItems },
        [destination.droppableId]: { ...destColumn, items: destItems }
      });

      // Target database status
      let newDbStatus = "SUBMITTED";
      if (destination.droppableId === "verification") newDbStatus = "VERIFICATION";
      if (destination.droppableId === "interview") newDbStatus = "INTERVIEW";
      if (destination.droppableId === "approved") newDbStatus = "APPROVED";

      if (newDbStatus === "APPROVED") {
        await approveApplicationAndProvisionParent(
          removed.id, 
          removed.parentEmail || `parent_${removed.token.toLowerCase()}@example.com`,
          removed.parentName.split(" ")[0] || "Parent",
          removed.parentName.split(" ").slice(1).join(" ") || "Guardian"
        );
        showToast(`Candidate ${removed.fullName} has been approved and parent portal provisioned!`);
      } else {
        await updateAdmissionsApplicationStatusAction(removed.id, newDbStatus);
        showToast(`Candidate ${removed.fullName} moved to ${destColumn.name}`);
      }

      fetchApplications();
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      
      setColumns({
        ...columns,
        [source.droppableId]: { ...column, items: copiedItems }
      });
    }
  };

  const handleStageChange = async (newStatus: string) => {
    if (!selectedApplicant) return;
    setIsUpdatingStatus(true);

    if (newStatus === "APPROVED") {
      await approveApplicationAndProvisionParent(
        selectedApplicant.id,
        selectedApplicant.parentEmail,
        selectedApplicant.parentName.split(" ")[0] || "Parent",
        selectedApplicant.parentName.split(" ").slice(1).join(" ") || "Guardian"
      );
      showToast(`Candidate ${selectedApplicant.fullName} Approved & Parent Portal Provisioned!`);
    } else {
      await updateAdmissionsApplicationStatusAction(selectedApplicant.id, newStatus);
      showToast(`Status updated to ${newStatus}`);
    }

    setIsUpdatingStatus(false);
    setSelectedApplicant({ ...selectedApplicant, status: newStatus });
    fetchApplications();
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplicant) return;
    setIsUpdatingStatus(true);

    const res = await scheduleApplicantInterviewAction(selectedApplicant.id, {
      interviewDate,
      interviewTime,
      interviewerName,
      notes: interviewNotes
    });

    if (res.success) {
      showToast("Interview scheduled successfully!");
      setSelectedApplicant({
        ...selectedApplicant,
        status: "INTERVIEW",
        interviewSchedule: {
          date: interviewDate,
          time: interviewTime,
          interviewer: interviewerName,
          notes: interviewNotes
        }
      });
      fetchApplications();
    }
    setIsUpdatingStatus(false);
  };

  const handleDocumentVerify = async (status: 'VERIFIED' | 'PENDING' | 'REJECTED') => {
    if (!selectedApplicant) return;
    setIsUpdatingStatus(true);
    const res = await updateApplicantDocumentVerificationAction(selectedApplicant.id, status);
    if (res.success) {
      showToast(`Document marked as ${status}`);
      fetchApplications();
    }
    setIsUpdatingStatus(false);
  };

  if (!isMounted || loading) {
    return (
      <div className="p-16 text-center text-stone-500 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600"/>
        <p className="font-bold text-sm text-stone-700">Loading Live Admissions CRM Pipeline...</p>
      </div>
    );
  }

  const allGrades = Array.from(new Set(rawApplicants.map(a => a.gradeApplied))).filter(Boolean);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] space-y-4 font-sans max-w-full">
      
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-20 right-8 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-stone-700 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{feedbackToast}</span>
        </div>
      )}

      {/* Top Header & Metrics Bar */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-50 text-blue-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 border border-blue-200">
              <Layers className="w-3 h-3 text-blue-600" /> Enquiries & Leads Pipeline
            </span>
            <span className="text-stone-300 text-xs">•</span>
            <span className="text-stone-500 text-xs font-bold">{rawApplicants.length} Total Enquiries</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Enquiries & Leads Intake Pipeline
          </h1>
          <p className="text-xs text-stone-500 font-medium">
            Drag candidate cards across stages or click any card to inspect full parent, student, and document details.
          </p>
        </div>

        {/* Controls & Quick Links */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search student, token, phone..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white w-52 sm:w-64"
            />
          </div>

          {/* Grade Filter */}
          <select
            value={selectedGrade}
            onChange={e => setSelectedGrade(e.target.value)}
            className="bg-stone-50 border border-stone-200 py-2 px-3 rounded-xl text-xs font-bold text-stone-700 focus:outline-none"
          >
            <option value="all">All Grades</option>
            {allGrades.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          {/* Refresh */}
          <button 
            onClick={fetchApplications}
            className="p-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-stone-600 hover:text-stone-900 transition"
            title="Refresh Database"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Link to CRM Table */}
          <Link 
            href="/admin/admissions/crm" 
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" /> Table View
          </Link>

          {/* New Public Application */}
          <Link 
            href="/admissions/apply" 
            target="_blank"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" /> + New Application
          </Link>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 h-full items-start min-w-[1100px]">
            {Object.entries(columns).map(([columnId, column], index) => {
              return (
                <div key={columnId} className="flex flex-col bg-stone-100/70 rounded-3xl w-80 h-full max-h-full shrink-0 border border-stone-200/80 shadow-xs overflow-hidden">
                  
                  {/* Column Header */}
                  <div className="p-4 border-b border-stone-200/70 bg-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${column.color}`}></span>
                      <div>
                        <h2 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                          {column.name}
                        </h2>
                      </div>
                    </div>
                    <span className="bg-stone-100 text-stone-800 text-xs font-mono font-black px-2 py-0.5 rounded-full border border-stone-200">
                      {column.items.length}
                    </span>
                  </div>

                  {/* Droppable Area */}
                  <Droppable droppableId={columnId} key={columnId}>
                    {(provided, snapshot) => {
                      return (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`flex-1 p-3 overflow-y-auto space-y-3 transition-colors ${
                            snapshot.isDraggingOver ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          {column.items.length === 0 ? (
                            <div className="py-12 px-4 text-center border-2 border-dashed border-stone-200 rounded-2xl text-stone-400 text-xs">
                              <p className="font-bold">No Candidates in this Stage</p>
                              <p className="text-[10px] text-stone-400 mt-1">Drag candidate cards here</p>
                            </div>
                          ) : (
                            column.items.map((item, index) => {
                              return (
                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                  {(provided, snapshot) => {
                                    return (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        onClick={() => setSelectedApplicant(item)}
                                        className={`bg-white p-4 rounded-2xl shadow-xs border transition-all cursor-pointer hover:shadow-md hover:border-blue-300 group ${
                                          snapshot.isDragging 
                                            ? 'border-blue-500 shadow-xl scale-105 ring-2 ring-blue-400/20' 
                                            : 'border-stone-200'
                                        }`}
                                        style={{ ...provided.draggableProps.style }}
                                      >
                                        {/* Card Top: Token & Grade Badge */}
                                        <div className="flex justify-between items-center mb-2">
                                          <span className="text-[10px] font-mono font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200">
                                            {item.token}
                                          </span>
                                          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100">
                                            {item.gradeApplied}
                                          </span>
                                        </div>

                                        {/* Candidate Full Name */}
                                        <h3 className="font-black text-stone-900 text-sm group-hover:text-blue-600 transition-colors">
                                          {item.fullName}
                                        </h3>

                                        {/* Candidate Age & DOB */}
                                        <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5 mb-2.5">
                                          <Calendar className="w-3 h-3 text-stone-400" />
                                          <span>DOB: {item.dateOfBirth} ({item.age})</span>
                                        </div>

                                        {/* Parent Contact Dossier Chip */}
                                        <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-xs space-y-1 mb-2.5">
                                          <div className="flex items-center justify-between font-bold text-stone-800 text-[11px]">
                                            <span className="truncate">👤 {item.parentName}</span>
                                          </div>
                                          <div className="flex items-center gap-2 text-[10px] text-stone-500 font-mono">
                                            <span>📞 {item.parentPhone}</span>
                                          </div>
                                        </div>

                                        {/* Badges & Meta Chips */}
                                        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-stone-100">
                                          {item.documentUrl ? (
                                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                                              <FileText className="w-3 h-3 text-emerald-600" /> Doc Attached
                                            </span>
                                          ) : (
                                            <span className="text-[10px] font-bold bg-stone-100 text-stone-500 px-2 py-0.5 rounded-md">
                                              Doc Pending
                                            </span>
                                          )}

                                          {item.transportRequired && (
                                            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100 flex items-center gap-1">
                                              <Bus className="w-3 h-3 text-indigo-600" /> Bus Required
                                            </span>
                                          )}

                                          <span className="text-[10px] font-medium text-stone-400 ml-auto">
                                            {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  }}
                                </Draggable>
                              );
                            })
                          )}
                          {provided.placeholder}
                        </div>
                      );
                    }}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* APPLICANT 360° INSPECTION & DECISION DRAWER / MODAL */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl border border-stone-200 my-8 space-y-6">
            
            {/* Drawer Header */}
            <div className="flex justify-between items-start border-b border-stone-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-900 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                    {selectedApplicant.token}
                  </span>
                  <span className="text-stone-400 text-xs">•</span>
                  <span className="text-stone-500 text-xs font-bold">Applied for {selectedApplicant.gradeApplied}</span>
                  <span className="text-stone-400 text-xs">•</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                    selectedApplicant.status.includes('APPROV') 
                      ? 'bg-green-100 text-green-800' 
                      : selectedApplicant.status.includes('INTERVIEW')
                      ? 'bg-purple-100 text-purple-800'
                      : selectedApplicant.status.includes('VERIF')
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    Stage: {selectedApplicant.status}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-stone-900">
                  {selectedApplicant.fullName}
                </h3>
                <p className="text-xs text-stone-500">
                  Application submitted on {new Date(selectedApplicant.createdAt).toLocaleDateString(undefined, { dateStyle: 'full' })}
                </p>
              </div>
              <button 
                onClick={() => setSelectedApplicant(null)} 
                className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate & Parent Coordinate Dossier */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Student Dossier */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5">
                <h4 className="font-black text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" /> Student Profile Details
                </h4>
                <div className="space-y-1.5 text-stone-700">
                  <div className="flex justify-between border-b border-stone-200/60 pb-1">
                    <span className="text-stone-500">Full Name:</span>
                    <strong className="text-stone-900">{selectedApplicant.fullName}</strong>
                  </div>
                  <div className="flex justify-between border-b border-stone-200/60 pb-1">
                    <span className="text-stone-500">Date of Birth:</span>
                    <strong>{selectedApplicant.dateOfBirth}</strong>
                  </div>
                  <div className="flex justify-between border-b border-stone-200/60 pb-1">
                    <span className="text-stone-500">Calculated Age:</span>
                    <strong className="text-blue-700">{selectedApplicant.age}</strong>
                  </div>
                  <div className="flex justify-between border-b border-stone-200/60 pb-1">
                    <span className="text-stone-500">Grade Applied:</span>
                    <strong className="font-bold text-stone-900">{selectedApplicant.gradeApplied}</strong>
                  </div>
                  <div className="flex justify-between border-b border-stone-200/60 pb-1">
                    <span className="text-stone-500">School Transport:</span>
                    <strong>{selectedApplicant.transportRequired ? 'Zone 1 Bus Required' : 'Self Commute'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Previous School:</span>
                    <span className="text-stone-600">{selectedApplicant.previousSchool}</span>
                  </div>
                </div>
              </div>

              {/* Parent & Guardian Dossier */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5">
                <h4 className="font-black text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" /> Parent / Guardian Contacts
                </h4>
                <div className="space-y-2 text-stone-700">
                  <div className="flex justify-between border-b border-stone-200/60 pb-1">
                    <span className="text-stone-500">Parent / Guardian:</span>
                    <strong className="text-stone-900">{selectedApplicant.parentName}</strong>
                  </div>
                  <div className="flex items-center justify-between border-b border-stone-200/60 pb-1">
                    <span className="text-stone-500">Mobile Phone:</span>
                    <div className="flex items-center gap-2">
                      <strong className="font-mono">{selectedApplicant.parentPhone}</strong>
                      <a 
                        href={`tel:${selectedApplicant.parentPhone}`}
                        className="p-1 bg-emerald-100 text-emerald-800 rounded-md hover:bg-emerald-200 text-[10px] font-bold flex items-center gap-0.5"
                      >
                        <Phone className="w-2.5 h-2.5" /> Call
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b border-stone-200/60 pb-1">
                    <span className="text-stone-500">Email Address:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] truncate max-w-[150px]">{selectedApplicant.parentEmail}</span>
                      <a 
                        href={`mailto:${selectedApplicant.parentEmail}`}
                        className="p-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 text-[10px] font-bold flex items-center gap-0.5"
                      >
                        <Mail className="w-2.5 h-2.5" /> Mail
                      </a>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Intake Channel:</span>
                    <span className="text-stone-600">{selectedApplicant.submissionChannel}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Vault Section */}
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <h4 className="font-black text-blue-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Uploaded Document Vault (Birth Certificate / Aadhaar)
                </h4>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleDocumentVerify('VERIFIED')}
                    disabled={isUpdatingStatus}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold shadow-xs transition"
                  >
                    ✓ Mark Verified
                  </button>
                  <button 
                    onClick={() => handleDocumentVerify('REJECTED')}
                    disabled={isUpdatingStatus}
                    className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-[10px] font-bold transition"
                  >
                    Request Re-upload
                  </button>
                </div>
              </div>

              {selectedApplicant.documentUrl ? (
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                      PDF
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 text-xs">Birth Certificate / Identification Scan</p>
                      <p className="text-[10px] text-stone-400 font-mono">Document attached to application</p>
                    </div>
                  </div>
                  <a 
                    href={selectedApplicant.documentUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-lg text-xs flex items-center gap-1 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View Document
                  </a>
                </div>
              ) : (
                <p className="text-stone-500 text-[11px] italic">
                  No documents were uploaded online. The applicant can provide physical documents during the in-person campus verification visit.
                </p>
              )}
            </div>

            {/* Assessment & Interview Scheduling Box */}
            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3 text-xs">
              <h4 className="font-black text-purple-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-600" /> Schedule Assessment / Parent Interview
              </h4>

              {selectedApplicant.interviewSchedule ? (
                <div className="p-3 bg-white rounded-xl border border-purple-200 space-y-1">
                  <div className="flex items-center justify-between font-bold text-purple-900">
                    <span>Scheduled for: {selectedApplicant.interviewSchedule.date} at {selectedApplicant.interviewSchedule.time}</span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Confirmed</span>
                  </div>
                  <p className="text-stone-600 text-[11px]">Interviewer: {selectedApplicant.interviewSchedule.interviewer}</p>
                  {selectedApplicant.interviewSchedule.notes && (
                    <p className="text-stone-500 text-[11px] italic">Notes: {selectedApplicant.interviewSchedule.notes}</p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleScheduleInterview} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-stone-600 block mb-1">Interview Date *</label>
                      <input 
                        required
                        type="date"
                        value={interviewDate}
                        onChange={e => setInterviewDate(e.target.value)}
                        className="w-full bg-white border border-stone-200 p-2 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-stone-600 block mb-1">Time Slot *</label>
                      <input 
                        required
                        type="time"
                        value={interviewTime}
                        onChange={e => setInterviewTime(e.target.value)}
                        className="w-full bg-white border border-stone-200 p-2 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-stone-600 block mb-1">Interviewer / Counsellor</label>
                      <input 
                        type="text"
                        value={interviewerName}
                        onChange={e => setInterviewerName(e.target.value)}
                        className="w-full bg-white border border-stone-200 p-2 rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <input 
                      type="text"
                      placeholder="Candidate readiness observations or room assignment..."
                      value={interviewNotes}
                      onChange={e => setInterviewNotes(e.target.value)}
                      className="w-full bg-white border border-stone-200 p-2 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-xs transition"
                  >
                    Confirm Interview & Move to Assessment Stage
                  </button>
                </form>
              )}
            </div>

            {/* Fee Receipt Generation Center (Active Upon Admission Approval) */}
            {selectedApplicant.status === 'APPROVED' && (
              <div className="p-5 bg-emerald-50/80 rounded-2xl border-2 border-emerald-300 shadow-xs space-y-4 text-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-emerald-950 text-sm uppercase tracking-wider flex items-center gap-1.5">
                        Admission Fee Receipt Generation: <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">ACTIVE</span>
                      </h4>
                      <p className="text-emerald-800/80 text-[11px]">
                        Admission confirmed. Collect admission & term fees and issue instant GST/tax compliant receipt.
                      </p>
                    </div>
                  </div>
                  <Link 
                    href="/admin/finance/receipts" 
                    target="_blank"
                    className="text-emerald-700 hover:text-emerald-900 font-bold text-[11px] underline flex items-center gap-1"
                  >
                    Finance Receipts Hub <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {generatedReceipt ? (
                  <div className="p-4 bg-white rounded-xl border-2 border-emerald-500 shadow-sm space-y-3">
                    <div className="flex justify-between items-start border-b border-emerald-100 pb-2">
                      <div>
                        <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Official Fee Receipt</span>
                        <h5 className="text-base font-black text-stone-900 font-mono">{generatedReceipt.receipt_no}</h5>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 font-black px-2.5 py-1 rounded-full text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PAID
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-stone-700 text-xs">
                      <div>
                        <span className="text-stone-400 block text-[10px]">Student Name</span>
                        <strong className="text-stone-900">{selectedApplicant.fullName}</strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px]">Admission No</span>
                        <strong className="font-mono text-stone-900">{selectedApplicant.token.replace('APP-', 'ADM-')}</strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px]">Amount Paid</span>
                        <strong className="text-emerald-700 text-sm font-black">₹{Number(generatedReceipt.net_amount_paid || feePaidAmount).toLocaleString('en-IN')}</strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px]">Payment Mode</span>
                        <strong className="text-stone-900">{generatedReceipt.payment_mode || feePaymentMode}</strong>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-stone-100">
                      <button 
                        type="button"
                        onClick={() => window.print()}
                        className="flex-1 py-2 bg-stone-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print Official Receipt
                      </button>
                      <button 
                        type="button"
                        onClick={() => setGeneratedReceipt(null)}
                        className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition"
                      >
                        Collect Another
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleGenerateFeeReceipt} className="space-y-4 bg-white p-5 rounded-2xl border border-emerald-200">
                    <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                      <div className="flex items-center gap-1.5 font-bold text-stone-800 text-xs">
                        <Sliders className="w-4 h-4 text-emerald-600" />
                        <span>Custom Fee Receipt Configuration</span>
                      </div>
                      <span className="text-[10px] text-stone-500 font-mono">
                        Candidate: {selectedApplicant.fullName} ({selectedApplicant.token.replace('APP-', 'ADM-')})
                      </span>
                    </div>

                    {/* Receipt Number & Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Receipt Number (Optional / Custom)</label>
                        <input 
                          type="text"
                          placeholder="Auto-generated if blank (e.g. CBS-REC-2026-01)"
                          value={customReceiptNo}
                          onChange={e => setCustomReceiptNo(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 p-2 rounded-xl text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Receipt Date *</label>
                        <input 
                          required
                          type="date"
                          value={customReceiptDate}
                          onChange={e => setCustomReceiptDate(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 p-2 rounded-xl text-xs font-medium"
                        />
                      </div>
                    </div>

                    {/* Custom Fee Heads Table */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="font-bold text-stone-800 text-xs">Fee Heads & Itemized Breakdown</label>
                        <button
                          type="button"
                          onClick={addFeeHead}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Fee Head
                        </button>
                      </div>

                      <div className="space-y-2 bg-stone-50/70 p-3 rounded-xl border border-stone-200/80">
                        {feeHeads.map((head, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input 
                              type="text"
                              required
                              value={head.name}
                              onChange={e => updateFeeHead(idx, 'name', e.target.value)}
                              placeholder="Fee head name (e.g. Tuition Fee)"
                              className="flex-1 bg-white border border-stone-200 p-2 rounded-lg text-xs font-medium"
                            />
                            <div className="relative w-32">
                              <span className="absolute left-2.5 top-2 text-stone-400 font-bold text-xs">₹</span>
                              <input 
                                type="number"
                                required
                                min="0"
                                value={head.amount}
                                onChange={e => updateFeeHead(idx, 'amount', Number(e.target.value))}
                                className="w-full pl-6 pr-2 py-2 bg-white border border-stone-200 rounded-lg text-xs font-bold text-stone-900"
                              />
                            </div>
                            {feeHeads.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeFeeHead(idx)}
                                className="p-2 text-stone-400 hover:text-red-600 transition"
                                title="Remove Fee Head"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Concessions, Late Fees & Net Total Calculation */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Concession / Discount (₹)</label>
                        <input 
                          type="number"
                          min="0"
                          value={concessionAmount}
                          onChange={e => setConcessionAmount(Number(e.target.value))}
                          className="w-full bg-stone-50 border border-stone-200 p-2 rounded-xl text-xs font-bold text-emerald-700"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Discount Reason / Category</label>
                        <select
                          value={concessionReason}
                          onChange={e => setConcessionReason(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 p-2 rounded-xl text-xs font-medium"
                        >
                          <option value="None">None / Standard Rate</option>
                          <option value="Sibling Concession (10%)">Sibling Concession (10%)</option>
                          <option value="Staff Ward Concession">Staff Ward Concession</option>
                          <option value="Merit Scholarship">Merit Scholarship</option>
                          <option value="Early Bird Discount">Early Bird Discount</option>
                          <option value="Discretionary Waiver">Discretionary Waiver</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Late Fee / Fine (₹)</label>
                        <input 
                          type="number"
                          min="0"
                          value={lateFeeAmount}
                          onChange={e => setLateFeeAmount(Number(e.target.value))}
                          className="w-full bg-stone-50 border border-stone-200 p-2 rounded-xl text-xs font-bold"
                        />
                      </div>
                    </div>

                    {/* Summary Calculation Ribbon */}
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-xs font-bold">
                      <span className="text-stone-600">Gross Total: <span className="text-stone-900 font-mono">₹{grossTotal.toLocaleString('en-IN')}</span></span>
                      {concessionAmount > 0 && <span className="text-emerald-700">Concession: -₹{Number(concessionAmount).toLocaleString('en-IN')}</span>}
                      <span className="text-emerald-950 font-black text-sm">Net Payable: ₹{netPayable.toLocaleString('en-IN')}</span>
                    </div>

                    {/* Payment Mode & Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Amount Collecting (₹) *</label>
                        <input 
                          required
                          type="number"
                          min="1"
                          value={feePaidAmount}
                          onChange={e => setFeePaidAmount(Number(e.target.value))}
                          className="w-full bg-stone-50 border border-stone-200 p-2 rounded-xl text-xs font-black text-emerald-800"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Payment Mode *</label>
                        <select
                          value={feePaymentMode}
                          onChange={e => setFeePaymentMode(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 p-2 rounded-xl text-xs font-bold text-stone-900"
                        >
                          <option value="UPI">UPI / QR Code Scan</option>
                          <option value="Cash">Cash (Counter POS)</option>
                          <option value="Card">Credit / Debit Card (POS)</option>
                          <option value="Net Banking">Net Banking / NEFT / RTGS</option>
                          <option value="Cheque">Bank Cheque</option>
                          <option value="Demand Draft">Demand Draft (DD)</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Transaction Ref / Txn ID</label>
                        <input 
                          type="text"
                          placeholder="e.g. UPI-99881122"
                          value={feeTxnRef}
                          onChange={e => setFeeTxnRef(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 p-2 rounded-xl text-xs font-medium font-mono"
                        />
                      </div>
                    </div>

                    {/* Cheque / Bank Specifics if selected */}
                    {(feePaymentMode === 'Cheque' || feePaymentMode === 'Demand Draft') && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                        <div>
                          <label className="font-bold text-stone-700 block mb-1">Cheque / DD Number *</label>
                          <input 
                            required
                            type="text"
                            placeholder="e.g. 004812"
                            value={feeChequeNo}
                            onChange={e => setFeeChequeNo(e.target.value)}
                            className="w-full bg-white border border-stone-200 p-2 rounded-lg text-xs font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-stone-700 block mb-1">Bank Name *</label>
                          <input 
                            required
                            type="text"
                            placeholder="e.g. HDFC Bank"
                            value={feeBankName}
                            onChange={e => setFeeBankName(e.target.value)}
                            className="w-full bg-white border border-stone-200 p-2 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-stone-700 block mb-1">Cheque Date</label>
                          <input 
                            type="date"
                            value={feeChequeDate}
                            onChange={e => setFeeChequeDate(e.target.value)}
                            className="w-full bg-white border border-stone-200 p-2 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* Remarks & Cashier Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Remarks / Receipt Note</label>
                        <input 
                          type="text"
                          value={feeRemarks}
                          onChange={e => setFeeRemarks(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 p-2 rounded-xl text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Collected By (Cashier / Desk)</label>
                        <input 
                          type="text"
                          value={feeCollectedBy}
                          onChange={e => setFeeCollectedBy(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 p-2 rounded-xl text-xs font-medium"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={isGeneratingReceipt}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                      <Receipt className="w-4 h-4" />
                      {isGeneratingReceipt ? "Generating Custom Receipt..." : "🧾 Generate Custom Official Fee Receipt"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Fast Stage Transition Bar */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
              <span className="font-bold text-stone-700 block">Fast-Track Pipeline Stage Transition</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleStageChange('SUBMITTED')}
                  disabled={isUpdatingStatus}
                  className={`px-3 py-1.5 rounded-xl font-bold transition text-xs ${
                    selectedApplicant.status === 'SUBMITTED' 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  1. Submitted
                </button>
                <button
                  type="button"
                  onClick={() => handleStageChange('VERIFICATION')}
                  disabled={isUpdatingStatus}
                  className={`px-3 py-1.5 rounded-xl font-bold transition text-xs ${
                    selectedApplicant.status === 'VERIFICATION' 
                      ? 'bg-amber-600 text-white shadow-xs' 
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  2. Document Verification
                </button>
                <button
                  type="button"
                  onClick={() => handleStageChange('INTERVIEW')}
                  disabled={isUpdatingStatus}
                  className={`px-3 py-1.5 rounded-xl font-bold transition text-xs ${
                    selectedApplicant.status === 'INTERVIEW' 
                      ? 'bg-purple-600 text-white shadow-xs' 
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  3. Assessment / Interview
                </button>
                <button
                  type="button"
                  onClick={() => handleStageChange('APPROVED')}
                  disabled={isUpdatingStatus}
                  className={`px-3 py-1.5 rounded-xl font-bold transition text-xs ${
                    selectedApplicant.status === 'APPROVED' 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'bg-white border border-stone-200 text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  4. ✅ Approve & Allocate Seat
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-stone-100 text-xs">
              <button 
                type="button"
                onClick={() => setSelectedApplicant(null)}
                className="px-4 py-2 text-stone-500 font-bold hover:bg-stone-100 rounded-xl"
              >
                Close Drawer
              </button>

              {selectedApplicant.status !== 'APPROVED' && (
                <button
                  type="button"
                  onClick={() => handleStageChange('APPROVED')}
                  disabled={isUpdatingStatus}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition"
                >
                  <UserCheck className="w-4 h-4" /> Approve & Issue Admission Offer
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
