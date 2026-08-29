"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UserPlus, Search, Filter, Phone, Mail, Calendar,
  TrendingUp, CheckCircle2, Clock, AlertCircle, Sparkles,
  Download, ArrowRight, ExternalLink, ChevronRight, UserCheck, 
  RefreshCw, Plus, FileText, Layers, X, Users, Bus, Receipt, Printer, QrCode,
  Trash2, Sliders, Edit3
} from 'lucide-react';
import { 
  getAdmissionsPipelineApplicationsAction, 
  updateAdmissionsApplicationStatusAction,
  scheduleApplicantInterviewAction,
  updateApplicantDocumentVerificationAction,
  approveApplicationAndProvisionParent,
  generateAdmissionFeeReceiptAction,
  createAdminEnquiryAction
} from "@/app/actions/admissions";
import { DataTable } from '@/components/ui/DataTable';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';

export default function AdmissionsCrmPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Interview Scheduler State
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("10:00");
  const [interviewerName, setInterviewerName] = useState("Dr. Ananya Sharma (Principal)");
  const [interviewNotes, setInterviewNotes] = useState("");

  // In-Console Direct Enquiry Modal State
  const [isNewEnquiryOpen, setIsNewEnquiryOpen] = useState(false);
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const [newEnquiryForm, setNewEnquiryForm] = useState({
    studentFirstName: '',
    studentLastName: '',
    gradeApplied: 'Class 1',
    dateOfBirth: '2020-04-15',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    previousSchool: '',
    transportRequired: false,
    notes: ''
  });

  const handleCreateDirectEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnquiryForm.studentFirstName || !newEnquiryForm.parentName || !newEnquiryForm.parentPhone) {
      alert("Please fill in Student Name, Parent Name, and Contact Phone.");
      return;
    }
    setIsSubmittingEnquiry(true);
    const res = await createAdminEnquiryAction(newEnquiryForm);
    setIsSubmittingEnquiry(false);
    if (res.success) {
      setFeedbackToast(res.message || "Enquiry created successfully!");
      setIsNewEnquiryOpen(false);
      setNewEnquiryForm({
        studentFirstName: '',
        studentLastName: '',
        gradeApplied: 'Class 1',
        dateOfBirth: '2020-04-15',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        previousSchool: '',
        transportRequired: false,
        notes: ''
      });
      fetchApplications();
    } else {
      alert("Failed to create enquiry: " + res.error);
    }
  };

  // Custom Fee Receipt Generator State
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

  const fetchApplications = async () => {
    setIsLoading(true);
    const res = await getAdmissionsPipelineApplicationsAction();
    if (res.success && res.data) {
      setApplications(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

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

  const columns = [
    {
      key: 'student_name',
      header: 'Applicant & Token #',
      render: (row: any) => (
        <div className="cursor-pointer" onClick={() => setSelectedApplicant(row)}>
          <span className="font-bold text-stone-900 block hover:text-blue-600 transition">
            {row.fullName}
          </span>
          <span className="text-stone-400 font-mono text-[10px] bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200 inline-block mt-0.5">
            {row.token}
          </span>
        </div>
      ),
    },
    {
      key: 'dob_age',
      header: 'DOB & Age',
      render: (row: any) => (
        <div className="text-xs text-stone-700">
          <span className="block font-medium">{row.dateOfBirth}</span>
          <span className="text-[10px] text-blue-700 font-bold">{row.age}</span>
        </div>
      ),
    },
    {
      key: 'parent_contact',
      header: 'Parent / Guardian Contact',
      render: (row: any) => (
        <div>
          <span className="font-bold text-stone-800 block text-xs">{row.parentName}</span>
          <div className="flex items-center gap-2 text-[11px] text-stone-500 font-mono mt-0.5">
            <span>📞 {row.parentPhone}</span>
            <span className="text-stone-300">•</span>
            <span className="truncate max-w-[140px]">{row.parentEmail}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'grade_applied',
      header: 'Applied Grade',
      render: (row: any) => (
        <span className="font-bold text-stone-800 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg text-xs">
          {row.gradeApplied}
        </span>
      ),
    },
    {
      key: 'documents',
      header: 'Documents',
      render: (row: any) => (
        row.documentUrl ? (
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Attached
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-500 text-[10px] font-bold">
            Pending
          </span>
        )
      ),
    },
    {
      key: 'status',
      header: 'Pipeline Stage',
      align: 'right' as const,
      render: (row: any) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
          row.status.includes('APPROV')
            ? 'bg-green-50 text-green-800 border-green-200'
            : row.status.includes('INTERVIEW')
            ? 'bg-purple-50 text-purple-800 border-purple-200'
            : row.status.includes('VERIF')
            ? 'bg-amber-50 text-amber-800 border-amber-200'
            : 'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (row: any) => (
        <button
          onClick={() => setSelectedApplicant(row)}
          className="px-3 py-1 bg-stone-100 hover:bg-blue-50 hover:text-blue-700 text-stone-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
        >
          Inspect <ChevronRight className="w-3.5 h-3.5" />
        </button>
      ),
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-20 right-8 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-stone-700 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{feedbackToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Admissions Table (`admissions_applications`)
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-slate-500 text-xs font-semibold">{applications.length} Active Leads</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Enquiries &amp; Leads CRM Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Full applicant profiles, parent coordinates, document verification, and assessment pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/admissions/pipeline">
            <Button variant="outline" size="sm" leftIcon={<Layers className="w-3.5 h-3.5" />}>
              Kanban Board
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={fetchApplications} isLoading={isLoading} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh Live DB
          </Button>
          <Button 
            variant="secondary" 
            size="md" 
            onClick={() => setIsNewEnquiryOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            + Record New Lead (In ERP)
          </Button>
        </div>
      </div>

      {/* Live Application Pipeline Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label="Total Applications"
          value={isLoading ? '...' : applications.length.toString()}
          subtext="Total candidate pool"
          icon={<UserPlus className="w-4 h-4" />}
          iconBgColor="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Document Verification"
          value={isLoading ? '...' : applications.filter(a => a.status.includes('VERIF')).length.toString()}
          subtext="Docs undergoing review"
          icon={<FileText className="w-4 h-4" />}
          iconBgColor="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Interviews Scheduled"
          value={isLoading ? '...' : applications.filter(a => a.status.includes('INTERVIEW')).length.toString()}
          subtext="Ready for assessment"
          icon={<Calendar className="w-4 h-4" />}
          iconBgColor="bg-purple-50 text-purple-600"
        />
        <StatCard
          label="Approved & Admitted"
          value={isLoading ? '...' : applications.filter(a => a.status.includes('APPROV')).length.toString()}
          subtext="Seat allocated & confirmed"
          icon={<CheckCircle2 className="w-4 h-4" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Candidate Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <DataTable
          columns={columns}
          data={applications}
          searchPlaceholder="Search candidate by name, token, grade, parent phone..."
          searchKey="fullName"
          emptyTitle="No Admissions Applications Found"
          emptyDescription="Submit an application through /admissions/apply to see it live here."
        />
      </div>

      {/* APPLICANT 360° INSPECTION DRAWER */}
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
                  <UserCheck className="w-4 h-4" /> Approve &amp; Issue Admission Offer
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 🌟 DIRECT IN-CONSOLE LEAD / ENQUIRY MODAL (NO EXTERNAL REDIRECT) */}
      {isNewEnquiryOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-stone-900">Record Direct Enquiry / Lead</h3>
                  <p className="text-xs text-stone-500">Add an applicant into the ERP without leaving the administrative console.</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsNewEnquiryOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDirectEnquiry} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Student First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav"
                    value={newEnquiryForm.studentFirstName}
                    onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, studentFirstName: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Student Last Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sharma"
                    value={newEnquiryForm.studentLastName}
                    onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, studentLastName: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Grade / Class Applying *</label>
                  <select
                    value={newEnquiryForm.gradeApplied}
                    onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, gradeApplied: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                  >
                    <option value="Nursery">Nursery</option>
                    <option value="LKG">LKG</option>
                    <option value="UKG">UKG</option>
                    <option value="Class 1">Class 1</option>
                    <option value="Class 2">Class 2</option>
                    <option value="Class 3">Class 3</option>
                    <option value="Class 4">Class 4</option>
                    <option value="Class 5">Class 5</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newEnquiryForm.dateOfBirth}
                    onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, dateOfBirth: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Parent / Guardian Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mr. Rajesh Sharma"
                    value={newEnquiryForm.parentName}
                    onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, parentName: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Parent Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98110 55442"
                    value={newEnquiryForm.parentPhone}
                    onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, parentPhone: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Parent Email</label>
                <input
                  type="email"
                  placeholder="e.g. parent@example.com"
                  value={newEnquiryForm.parentEmail}
                  onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, parentEmail: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="transportReq"
                  checked={newEnquiryForm.transportRequired}
                  onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, transportRequired: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded-sm border-stone-300"
                />
                <label htmlFor="transportReq" className="text-xs font-bold text-stone-700">
                  Requires School Bus Transport Service
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Administrative Remarks / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Walk-in lead notes, sibling details, or scholarship inquiry..."
                  value={newEnquiryForm.notes}
                  onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, notes: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsNewEnquiryOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEnquiry}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  {isSubmittingEnquiry ? 'Saving to Database...' : '✓ Create & Save Lead in ERP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
