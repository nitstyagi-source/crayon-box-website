"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, ArrowLeft, Mail, Phone, MapPin, Calendar, 
  GraduationCap, Award, ShieldCheck, Briefcase, FileText, 
  Clock, Heart, BookOpen, Star, AlertCircle, Plus, Trash2, 
  Edit3, CheckCircle2, XCircle, Printer, Download, Eye, 
  Laptop, ChevronRight, DollarSign, Sparkles, Building2, 
  CheckSquare, Activity, UserCheck, ShieldAlert
} from "lucide-react";
import { 
  getStaffProfile360, 
  updateStaffFullDetails, 
  addStaffQualification, 
  deleteStaffQualification, 
  addStaffDocument, 
  deleteStaffDocument, 
  updateStaffDocumentVerification, 
  saveStaffLessonPlan, 
  updateLessonPlanStatus, 
  applyStaffLeave, 
  saveStaffAppraisal, 
  issueStaffAsset, 
  returnStaffAsset 
} from "@/app/actions/faculty-enterprise";
import { deleteFacultyMember } from "@/app/actions/faculty";
import FileUpload from "@/components/admin/FileUpload";

export default function FacultyProfile360Page() {
  const params = useParams();
  const router = useRouter();
  const staffId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "personal"
    | "professional"
    | "qualifications"
    | "documents"
    | "timetable"
    | "lesson_plans"
    | "my_students"
    | "attendance"
    | "leaves"
    | "payroll"
    | "appraisal"
    | "training"
    | "assets"
    | "exit"
  >("overview");

  // Sub-modal states
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [addQualModal, setAddQualModal] = useState(false);
  const [addDocModal, setAddDocModal] = useState(false);
  const [addLessonModal, setAddLessonModal] = useState(false);
  const [applyLeaveModal, setApplyLeaveModal] = useState(false);
  const [addAppraisalModal, setAddAppraisalModal] = useState(false);
  const [addAssetModal, setAddAssetModal] = useState(false);

  // Form states
  const [qualForm, setQualForm] = useState({
    qualification_type: "Graduation",
    degree_name: "",
    institution: "",
    board_university: "",
    passing_year: "2020",
    marks_grade_percentage: "",
    certificate_url: ""
  });

  const [docForm, setDocForm] = useState({
    document_type: "Aadhaar Card",
    document_number: "",
    issue_date: "",
    expiry_date: "",
    file_url: "",
    verification_status: "Verified",
    remarks: ""
  });

  const [lessonForm, setLessonForm] = useState({
    class_name: "Grade 5",
    section_name: "A",
    subject_name: "Science",
    chapter_name: "",
    topic_name: "",
    learning_objectives: "",
    homework: "",
    classwork: "",
    status: "Planned",
    target_date: new Date().toISOString().split("T")[0]
  });

  const [leaveForm, setLeaveForm] = useState({
    leave_type: "Casual Leave",
    from_date: new Date().toISOString().split("T")[0],
    to_date: new Date().toISOString().split("T")[0],
    days_count: 1,
    reason: ""
  });

  const [assetForm, setAssetForm] = useState({
    asset_type: "Laptop",
    asset_name_code: "",
    issue_date: new Date().toISOString().split("T")[0],
    condition_on_issue: "Brand New"
  });

  useEffect(() => {
    loadDossier();
  }, [staffId]);

  async function loadDossier() {
    setLoading(true);
    try {
      const res = await getStaffProfile360(staffId);
      if (res.success && res.data) {
        setProfile(res.data);
      } else {
        alert("Failed to load staff record: " + res.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-stone-500 font-bold animate-pulse">
        Loading 360° Employee Master Dossier...
      </div>
    );
  }

  if (!profile || !profile.staff) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-stone-600 font-bold">Faculty record not found.</p>
        <Link href="/admin/faculty" className="text-primary underline font-bold text-sm">
          Return to Faculty Directory
        </Link>
      </div>
    );
  }

  const { staff, addresses, emergencyContacts, qualifications, documents, leaveBalance, leaves, timetable, lessonPlans, studentMarks, appraisals, trainings, assets, exit, attendance } = profile;
  const currentAddress = addresses.find((a: any) => a.address_type === "Current") || {};
  const permanentAddress = addresses.find((a: any) => a.address_type === "Permanent") || currentAddress;
  const emergency = emergencyContacts[0] || {};

  // Handlers
  async function handleAddQualification(e: React.FormEvent) {
    e.preventDefault();
    const res = await addStaffQualification(staffId, qualForm);
    if (res.success) {
      setAddQualModal(false);
      loadDossier();
    } else {
      alert("Error adding qualification: " + res.error);
    }
  }

  async function handleDeleteQualification(id: string) {
    if (!confirm("Are you sure you want to remove this qualification record?")) return;
    const res = await deleteStaffQualification(id, staffId);
    if (res.success) loadDossier();
  }

  async function handleAddDocument(e: React.FormEvent) {
    e.preventDefault();
    if (!docForm.file_url) {
      alert("Please upload a document file.");
      return;
    }
    const res = await addStaffDocument(staffId, docForm);
    if (res.success) {
      setAddDocModal(false);
      loadDossier();
    } else {
      alert("Error adding document: " + res.error);
    }
  }

  async function handleDeleteDocument(id: string) {
    if (!confirm("Delete this document from the employee vault?")) return;
    const res = await deleteStaffDocument(id, staffId);
    if (res.success) loadDossier();
  }

  async function handleAddLessonPlan(e: React.FormEvent) {
    e.preventDefault();
    const res = await saveStaffLessonPlan(staffId, lessonForm);
    if (res.success) {
      setAddLessonModal(false);
      loadDossier();
    } else {
      alert("Error saving lesson plan: " + res.error);
    }
  }

  async function handleApplyLeave(e: React.FormEvent) {
    e.preventDefault();
    const res = await applyStaffLeave(staffId, leaveForm);
    if (res.success) {
      setApplyLeaveModal(false);
      loadDossier();
    } else {
      alert("Error applying leave: " + res.error);
    }
  }

  async function handleIssueAsset(e: React.FormEvent) {
    e.preventDefault();
    const res = await issueStaffAsset(staffId, assetForm);
    if (res.success) {
      setAddAssetModal(false);
      loadDossier();
    } else {
      alert("Error issuing asset: " + res.error);
    }
  }

  async function handleDeleteMember() {
    if (!staff) return;
    const name = `${staff.first_name} ${staff.last_name}`;
    if (!confirm(`Are you sure you want to permanently delete ${name} (${staff.employee_id || 'Employee'})?\n\nThis will remove all associated 360° master records (attendance, qualifications, timetable, documents). This action cannot be undone.`)) return;

    const res = await deleteFacultyMember(staffId);
    if (res.success) {
      alert(`Staff member ${name} deleted successfully.`);
      router.push('/admin/faculty');
    } else {
      alert("Failed to delete staff member: " + res.error);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between gap-4">
        <Link 
          href="/admin/faculty" 
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-stone-900 bg-white border border-stone-200 px-3.5 py-2 rounded-xl transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Faculty Command Hub
        </Link>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.print()}
            className="bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" /> Print Master Dossier
          </button>
          <button 
            onClick={handleDeleteMember}
            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Staff Member
          </button>
        </div>
      </div>

      {/* 360° Hero Header Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            <div className="relative shrink-0">
              {staff.photo_url ? (
                <img 
                  src={staff.photo_url} 
                  alt={staff.first_name} 
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-stone-100 shadow-md"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-blue-50 text-blue-800 font-black text-3xl flex items-center justify-center border-4 border-stone-100 shadow-md">
                  {staff.first_name[0]}{staff.last_name[0]}
                </div>
              )}
              {staff.is_leadership && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white p-1.5 rounded-full shadow-md" title="Leadership Council">
                  <Star className="w-4 h-4 fill-current" />
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                  {staff.first_name} {staff.middle_name || ''} {staff.last_name}
                </h1>
                <span className="text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-md">
                  {staff.employee_category || "Teaching"}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  staff.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {staff.status}
                </span>
              </div>

              <p className="text-sm font-bold text-blue-600">
                {staff.designation || staff.role} • <span className="text-stone-600">{staff.department}</span>
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 pt-1">
                <span className="font-mono font-bold bg-stone-100 px-2 py-0.5 rounded text-stone-700 border border-stone-200">
                  EMP ID: {staff.employee_id}
                </span>
                <span>Wing: <strong className="text-stone-800">{staff.wing}</strong></span>
                <span>Joining: <strong className="text-stone-800">{staff.joining_date || 'N/A'}</strong></span>
                {staff.is_class_teacher && staff.class_teacher_for && (
                  <span className="bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded-md">
                    ⭐ Class In-Charge: {staff.class_teacher_for}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-col items-end gap-2 w-full md:w-auto">
            {staff.email && (
              <a 
                href={`mailto:${staff.email}`}
                className="bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" /> {staff.email}
              </a>
            )}
            {staff.phone_number && (
              <a 
                href={`tel:${staff.phone_number}`}
                className="bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-green-600" /> {staff.phone_number}
              </a>
            )}
          </div>

        </div>

        {/* 15 Tabs Navigation */}
        <div className="flex gap-1.5 overflow-x-auto border-t border-stone-100 pt-4 mt-6 scrollbar-thin">
          {[
            { id: "overview", label: "Overview", icon: Activity },
            { id: "personal", label: "Personal & Address", icon: Heart },
            { id: "professional", label: "Professional", icon: Briefcase },
            { id: "qualifications", label: `Qualifications (${qualifications.length})`, icon: GraduationCap },
            { id: "documents", label: `Document Vault (${documents.length})`, icon: FileText },
            { id: "timetable", label: `Timetable (${timetable.length})`, icon: Clock },
            { id: "lesson_plans", label: `Diary & Plans (${lessonPlans.length})`, icon: BookOpen },
            { id: "my_students", label: "My Students & Marks", icon: Users },
            { id: "attendance", label: "Biometric Attendance", icon: CheckCircle2 },
            { id: "leaves", label: `Leaves (${leaves.length})`, icon: Calendar },
            { id: "payroll", label: "Salary & Payroll", icon: DollarSign },
            { id: "appraisal", label: `Appraisals (${appraisals.length})`, icon: Star },
            { id: "training", label: `Trainings (${trainings.length})`, icon: Sparkles },
            { id: "assets", label: `Assets (${assets.length})`, icon: Laptop },
            { id: "exit", label: "Exit Clearance", icon: AlertCircle }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isActive 
                    ? "bg-stone-900 text-white shadow-sm" 
                    : "text-stone-500 hover:text-stone-800 hover:bg-stone-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      
      {/* 1. OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Today's Timetable Snippet */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4 md:col-span-2">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" /> Today&apos;s Class Schedule
              </h3>
              <button onClick={() => setActiveTab("timetable")} className="text-xs font-bold text-blue-600 hover:underline">
                View Full Week →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {timetable.slice(0, 6).map((period: any) => (
                <div key={period.id} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-stone-400">
                    <span>Period {period.period_number}</span>
                    <span>{period.start_time}</span>
                  </div>
                  <p className="font-bold text-stone-900 text-sm truncate">{period.subject_name}</p>
                  <p className="text-xs font-medium text-stone-600">{period.class_name} ({period.section_name}) • {period.room_number}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Leave Balances Widget */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" /> Leave Balances
              </h3>
              <button onClick={() => setApplyLeaveModal(true)} className="text-xs font-bold text-blue-600 hover:underline">
                + Apply Leave
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
                <span className="font-bold text-blue-900">Casual Leave (CL)</span>
                <span className="font-black text-blue-700 text-sm">{leaveBalance.casual_leave_balance ?? 10} Days</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <span className="font-bold text-emerald-900">Medical Leave (ML)</span>
                <span className="font-black text-emerald-700 text-sm">{leaveBalance.medical_leave_balance ?? 8} Days</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-purple-50/60 border border-purple-100">
                <span className="font-bold text-purple-900">Earned Leave (EL)</span>
                <span className="font-black text-purple-700 text-sm">{leaveBalance.earned_leave_balance ?? 15} Days</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                <span className="font-bold text-amber-900">Emergency Leave</span>
                <span className="font-black text-amber-700 text-sm">{leaveBalance.emergency_leave_balance ?? 3} Days</span>
              </div>
            </div>
          </div>

          {/* Teacher Diary & Recent Lesson Plans */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4 md:col-span-3">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600" /> Active Lesson Plans & Diary
              </h3>
              <button onClick={() => setAddLessonModal(true)} className="bg-stone-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold">
                + Create Lesson Plan
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {lessonPlans.slice(0, 3).map((plan: any) => (
                <div key={plan.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-bold text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded">
                      {plan.class_name} • {plan.subject_name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      plan.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      plan.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {plan.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm">{plan.chapter_name}</h4>
                  <p className="text-xs text-stone-500 line-clamp-2">{plan.topic_name}</p>
                  <p className="text-[11px] text-stone-400">Target: {plan.target_date || 'Ongoing'}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 2. PERSONAL & ADDRESS TAB */}
      {activeTab === "personal" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-black text-stone-900 text-base flex items-center gap-2 border-b border-stone-100 pb-3">
              <Heart className="w-4 h-4 text-red-500" /> Personal Demographics
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div><span className="text-stone-400 font-bold block">Date of Birth</span><span className="font-bold text-stone-800">{staff.dob || 'Not specified'}</span></div>
              <div><span className="text-stone-400 font-bold block">Gender</span><span className="font-bold text-stone-800">{staff.gender || 'Female'}</span></div>
              <div><span className="text-stone-400 font-bold block">Blood Group</span><span className="font-bold text-stone-800">{staff.blood_group || 'O+'}</span></div>
              <div><span className="text-stone-400 font-bold block">Nationality</span><span className="font-bold text-stone-800">{staff.nationality || 'Indian'}</span></div>
              <div><span className="text-stone-400 font-bold block">Marital Status</span><span className="font-bold text-stone-800">{staff.marital_status || 'Married'}</span></div>
              <div><span className="text-stone-400 font-bold block">WhatsApp No.</span><span className="font-bold text-stone-800">{staff.whatsapp_no || staff.phone_number || 'N/A'}</span></div>
              <div><span className="text-stone-400 font-bold block">Personal Email</span><span className="font-bold text-stone-800">{staff.personal_email || staff.email}</span></div>
              <div><span className="text-stone-400 font-bold block">Official Email</span><span className="font-bold text-stone-800">{staff.official_email || staff.email}</span></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-black text-stone-900 text-base flex items-center gap-2 border-b border-stone-100 pb-3">
              <MapPin className="w-4 h-4 text-blue-500" /> Address Details
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
                <span className="font-bold text-blue-800 block mb-1">Current Residential Address</span>
                <p className="text-stone-700">{currentAddress.address_line || 'Flat 402, Royal Palms Residency, Sector 14'}</p>
                <p className="text-stone-500">{currentAddress.city || 'Delhi'}, {currentAddress.state || 'Delhi'} - {currentAddress.pincode || '110085'}</p>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
                <span className="font-bold text-stone-800 block mb-1">Permanent Home Address</span>
                <p className="text-stone-700">{permanentAddress.address_line || 'House No. 128, Civil Lines'}</p>
                <p className="text-stone-500">{permanentAddress.city || 'Delhi'}, {permanentAddress.state || 'Delhi'} - {permanentAddress.pincode || '110084'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4 md:col-span-2">
            <h3 className="font-black text-stone-900 text-base flex items-center gap-2 border-b border-stone-100 pb-3">
              <ShieldAlert className="w-4 h-4 text-amber-500" /> Emergency Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div><span className="text-stone-400 font-bold block">Contact Person</span><span className="font-bold text-stone-800">{emergency.name || 'Ramesh Sundaram'}</span></div>
              <div><span className="text-stone-400 font-bold block">Relationship</span><span className="font-bold text-stone-800">{emergency.relationship || 'Spouse'}</span></div>
              <div><span className="text-stone-400 font-bold block">Mobile Number</span><span className="font-mono font-bold text-stone-800">{emergency.mobile || '9811998877'}</span></div>
              <div><span className="text-stone-400 font-bold block">Emergency Address</span><span className="font-bold text-stone-800">{emergency.address || 'Same as Current Address'}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* 4. QUALIFICATIONS TABLE TAB */}
      {activeTab === "qualifications" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-black text-stone-900 text-lg">Academic Qualifications & Certifications</h3>
              <p className="text-xs text-stone-500">Verified academic background, professional degrees, CTET, and teaching credentials.</p>
            </div>
            <button 
              onClick={() => setAddQualModal(true)}
              className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Qualification
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-3.5">Level / Type</th>
                  <th className="p-3.5">Degree / Certification</th>
                  <th className="p-3.5">Institution</th>
                  <th className="p-3.5">Board / University</th>
                  <th className="p-3.5">Year</th>
                  <th className="p-3.5">Marks / Grade</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {qualifications.map((q: any) => (
                  <tr key={q.id} className="hover:bg-stone-50/60">
                    <td className="p-3.5 font-bold text-blue-700">{q.qualification_type}</td>
                    <td className="p-3.5 font-bold text-stone-900">{q.degree_name}</td>
                    <td className="p-3.5 text-stone-600">{q.institution || '—'}</td>
                    <td className="p-3.5 text-stone-600">{q.board_university || '—'}</td>
                    <td className="p-3.5 font-mono text-stone-800">{q.passing_year || '—'}</td>
                    <td className="p-3.5 font-bold text-emerald-700">{q.marks_grade_percentage || '—'}</td>
                    <td className="p-3.5 text-right">
                      <button onClick={() => handleDeleteQualification(q.id)} className="text-stone-400 hover:text-red-600 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. DOCUMENT VAULT TAB */}
      {activeTab === "documents" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-black text-stone-900 text-lg">Employee Document Vault</h3>
              <p className="text-xs text-stone-500">Official IDs, verification records, appointment letters, and police clearance.</p>
            </div>
            <button 
              onClick={() => setAddDocModal(true)}
              className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Upload Document
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc: any) => (
              <div key={doc.id} className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-black text-stone-900 text-sm">{doc.document_type}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      doc.verification_status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {doc.verification_status}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-stone-500 mt-1">Doc No: {doc.document_number || 'N/A'}</p>
                  <p className="text-[11px] text-stone-400">Verified by: {doc.verified_by || 'HR Admin'}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-200/60">
                  <a 
                    href={doc.file_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> View File
                  </a>
                  <button onClick={() => handleDeleteDocument(doc.id)} className="text-stone-400 hover:text-red-600 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TIMETABLE TAB */}
      {activeTab === "timetable" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-black text-stone-900 text-lg">Weekly Teaching Schedule</h3>
            <p className="text-xs text-stone-500">Periods 1 to 6 across academic days with room allocations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => (
              <div key={day} className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <h4 className="font-black text-stone-900 text-sm text-center border-b border-stone-200 pb-2">{day}</h4>
                <div className="space-y-2">
                  {timetable.filter((t: any) => t.day_of_week === day).map((period: any) => (
                    <div key={period.id} className="p-2.5 bg-white rounded-xl border border-stone-200 text-xs shadow-2xs space-y-0.5">
                      <div className="flex justify-between text-[10px] font-bold text-stone-400">
                        <span>P{period.period_number}</span>
                        <span>{period.start_time}</span>
                      </div>
                      <p className="font-bold text-stone-800 text-[11px] truncate">{period.subject_name}</p>
                      <p className="text-[10px] text-stone-500">{period.class_name} ({period.section_name}) • {period.room_number}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. LESSON PLANS TAB */}
      {activeTab === "lesson_plans" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-black text-stone-900 text-lg">Teacher Diary & Lesson Planning</h3>
              <p className="text-xs text-stone-500">Chapter objectives, teaching methods, homework, and completion status.</p>
            </div>
            <button 
              onClick={() => setAddLessonModal(true)}
              className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Lesson Plan
            </button>
          </div>

          <div className="space-y-4">
            {lessonPlans.map((plan: any) => (
              <div key={plan.id} className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
                  <div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md mr-2">
                      {plan.class_name} - {plan.section_name} • {plan.subject_name}
                    </span>
                    <strong className="text-stone-900 text-sm">{plan.chapter_name}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400">Target: {plan.target_date}</span>
                    <select
                      value={plan.status}
                      onChange={async (e) => {
                        await updateLessonPlanStatus(plan.id, staffId, e.target.value);
                        loadDossier();
                      }}
                      className="text-xs font-bold bg-white border border-stone-300 rounded-lg p-1"
                    >
                      <option value="Planned">Planned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-bold text-stone-500 block mb-0.5">Topic & Objectives</span>
                    <p className="text-stone-800">{plan.topic_name}</p>
                    <p className="text-stone-500 text-[11px] mt-0.5">{plan.learning_objectives}</p>
                  </div>
                  <div>
                    <span className="font-bold text-stone-500 block mb-0.5">Classwork & Homework</span>
                    <p className="text-stone-800">CW: {plan.classwork || 'Lab worksheet'}</p>
                    <p className="text-stone-600">HW: {plan.homework || 'Textbook exercise'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. BIOMETRIC ATTENDANCE TAB */}
      {activeTab === "attendance" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-black text-stone-900 text-lg">Biometric / RFID Attendance Logs</h3>
            <p className="text-xs text-stone-500">Live gate turnstile scans, in/out timestamps, and working hours.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">In Time</th>
                  <th className="p-3.5">Out Time</th>
                  <th className="p-3.5">Working Hours</th>
                  <th className="p-3.5">Late (Mins)</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Device Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {attendance.map((att: any) => (
                  <tr key={att.id} className="hover:bg-stone-50/60">
                    <td className="p-3.5 font-bold text-stone-900 font-mono">{att.date}</td>
                    <td className="p-3.5 font-mono text-emerald-700 font-bold">{att.in_time || '07:45 AM'}</td>
                    <td className="p-3.5 font-mono text-blue-700 font-bold">{att.out_time || '03:15 PM'}</td>
                    <td className="p-3.5 font-bold text-stone-800">{att.working_hours || '7.5'} hrs</td>
                    <td className="p-3.5 text-stone-500">{att.late_arrival_minutes || '0'} min</td>
                    <td className="p-3.5">
                      <span className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        {att.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-stone-400 font-mono text-[11px]">{att.biometric_device_id || 'BIO-GATE-01'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 11. SALARY & PAYROLL TAB */}
      {activeTab === "payroll" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-black text-stone-900 text-lg">Salary Structure & Payroll Ledger</h3>
            <p className="text-xs text-stone-500">Allowances, statutory deductions, bank transfer coordinates, and net compensation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <h4 className="font-black text-stone-900 text-sm">Earnings Breakdown</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span>Basic Salary</span><strong className="font-mono">₹{staff.basic_salary || '35,000'}</strong></div>
                <div className="flex justify-between"><span>House Rent Allowance (HRA)</span><strong className="font-mono">₹{staff.hra || '14,000'}</strong></div>
                <div className="flex justify-between"><span>Conveyance Allowance</span><strong className="font-mono">₹{staff.conveyance || '3,000'}</strong></div>
                <div className="flex justify-between"><span>Special Allowance</span><strong className="font-mono">₹{staff.special_allowance || '8,000'}</strong></div>
                <div className="flex justify-between border-t border-stone-200 pt-2 font-bold text-stone-900">
                  <span>Gross Salary</span>
                  <span className="font-mono text-sm">₹{staff.gross_salary || '60,000'}</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <h4 className="font-black text-stone-900 text-sm">Deductions & Net Pay</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span>Provident Fund (PF)</span><strong className="font-mono text-red-600">-₹{staff.pf_deduction || '1,800'}</strong></div>
                <div className="flex justify-between"><span>TDS / Income Tax</span><strong className="font-mono text-red-600">-₹{staff.tds_deduction || '1,500'}</strong></div>
                <div className="flex justify-between"><span>ESI</span><strong className="font-mono text-red-600">-₹{staff.esi_deduction || '0'}</strong></div>
                <div className="flex justify-between border-t border-stone-200 pt-2 font-bold text-emerald-800 bg-emerald-50 p-2 rounded-xl">
                  <span>Net Take-Home Salary</span>
                  <span className="font-mono text-base font-black">₹{staff.net_salary || '56,700'}</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3 md:col-span-2">
              <h4 className="font-black text-stone-900 text-sm">Bank Coordinates</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div><span className="text-stone-400 font-bold block font-sans">Bank Name</span><strong>{staff.bank_name || 'HDFC Bank'}</strong></div>
                <div><span className="text-stone-400 font-bold block font-sans">Account Number</span><strong>{staff.bank_account_no || '50100234891102'}</strong></div>
                <div><span className="text-stone-400 font-bold block font-sans">IFSC Code</span><strong>{staff.bank_ifsc || 'HDFC0001205'}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 12. APPRAISAL TAB */}
      {activeTab === "appraisal" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-black text-stone-900 text-lg">Performance Appraisal & Evaluation</h3>
              <p className="text-xs text-stone-500">12 criteria competency rating on 1-5 star scale.</p>
            </div>
          </div>

          <div className="space-y-4">
            {appraisals.map((appr: any) => (
              <div key={appr.id} className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                  <h4 className="font-black text-stone-900 text-base">Academic Session: {appr.appraisal_year}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-500">Score: {appr.average_score} / 5.0</span>
                    <span className="bg-amber-100 text-amber-900 font-black px-3 py-1 rounded-full text-xs">
                      ⭐ {appr.overall_rating}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-bold text-stone-500 block mb-1">Coordinator Remarks</span>
                    <p className="text-stone-800 bg-white p-3 rounded-xl border border-stone-200">{appr.coordinator_remarks || 'Outstanding dedication.'}</p>
                  </div>
                  <div>
                    <span className="font-bold text-stone-500 block mb-1">Principal Feedback & Next Goals</span>
                    <p className="text-stone-800 bg-white p-3 rounded-xl border border-stone-200">{appr.principal_remarks || 'Exemplary educator.'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 14. ASSETS TAB */}
      {activeTab === "assets" && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-black text-stone-900 text-lg">School Assets & Property Issued</h3>
              <p className="text-xs text-stone-500">Laptops, iPads, smart ID cards, and lab equipment.</p>
            </div>
            <button 
              onClick={() => setAddAssetModal(true)}
              className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Issue Asset
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {assets.map((asset: any) => (
              <div key={asset.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-blue-700 text-xs">{asset.asset_type}</span>
                  <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{asset.status}</span>
                </div>
                <h4 className="font-bold text-stone-900 text-sm">{asset.asset_name_code}</h4>
                <p className="text-[11px] text-stone-500">Issued: {asset.issue_date} • {asset.condition_on_issue}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add Qualification */}
      {addQualModal && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-lg font-black text-stone-900">Add Academic Qualification</h3>
            <form onSubmit={handleAddQualification} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-500 block mb-1">Qualification Type</label>
                <select 
                  value={qualForm.qualification_type}
                  onChange={e => setQualForm({...qualForm, qualification_type: e.target.value})}
                  className="w-full border border-stone-200 p-2.5 rounded-xl font-bold"
                >
                  <option value="10th">10th / Secondary</option>
                  <option value="12th">12th / Senior Secondary</option>
                  <option value="Graduation">Graduation (B.Sc, B.A, B.Com)</option>
                  <option value="Post-Graduation">Post-Graduation (M.Sc, M.A, M.Com)</option>
                  <option value="B.Ed.">B.Ed. (Bachelor of Education)</option>
                  <option value="M.Ed.">M.Ed. (Master of Education)</option>
                  <option value="CTET">CTET (Central Teacher Eligibility Test)</option>
                  <option value="TET">State TET</option>
                  <option value="Other Certifications">Other Certifications</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-500 block mb-1">Degree / Course Name *</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. M.Sc Physics"
                  value={qualForm.degree_name}
                  onChange={e => setQualForm({...qualForm, degree_name: e.target.value})}
                  className="w-full border border-stone-200 p-2.5 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-500 block mb-1">Institution</label>
                  <input 
                    type="text" 
                    placeholder="College / Institute"
                    value={qualForm.institution}
                    onChange={e => setQualForm({...qualForm, institution: e.target.value})}
                    className="w-full border border-stone-200 p-2.5 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-500 block mb-1">Board / University</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Delhi University"
                    value={qualForm.board_university}
                    onChange={e => setQualForm({...qualForm, board_university: e.target.value})}
                    className="w-full border border-stone-200 p-2.5 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-500 block mb-1">Passing Year</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 2018"
                    value={qualForm.passing_year}
                    onChange={e => setQualForm({...qualForm, passing_year: e.target.value})}
                    className="w-full border border-stone-200 p-2.5 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-500 block mb-1">Marks / Grade</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 88.5% or Distinction"
                    value={qualForm.marks_grade_percentage}
                    onChange={e => setQualForm({...qualForm, marks_grade_percentage: e.target.value})}
                    className="w-full border border-stone-200 p-2.5 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setAddQualModal(false)} className="px-4 py-2 text-stone-500 font-bold">Cancel</button>
                <button type="submit" className="bg-stone-900 text-white font-bold px-5 py-2 rounded-xl">Save Qualification</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Document */}
      {addDocModal && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-lg font-black text-stone-900">Upload to Document Vault</h3>
            <form onSubmit={handleAddDocument} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-500 block mb-1">Document Type</label>
                <select 
                  value={docForm.document_type}
                  onChange={e => setDocForm({...docForm, document_type: e.target.value})}
                  className="w-full border border-stone-200 p-2.5 rounded-xl font-bold"
                >
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Address Proof">Address Proof</option>
                  <option value="B.Ed. Certificate">B.Ed. Certificate</option>
                  <option value="CTET/TET Certificate">CTET/TET Certificate</option>
                  <option value="Educational Certificate">Educational Degree</option>
                  <option value="Experience Certificate">Experience Certificate</option>
                  <option value="Police Verification">Police Verification</option>
                  <option value="Medical Certificate">Medical Certificate</option>
                  <option value="Appointment Letter">Appointment Letter</option>
                  <option value="Joining Letter">Joining Letter</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-500 block mb-1">Document Number / ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. 1234-5678-9012"
                  value={docForm.document_number}
                  onChange={e => setDocForm({...docForm, document_number: e.target.value})}
                  className="w-full border border-stone-200 p-2.5 rounded-xl text-xs"
                />
              </div>

              <FileUpload 
                label="Document File (PDF / Image) *"
                value={docForm.file_url}
                onChange={url => setDocForm({...docForm, file_url: url})}
                folder="faculty_documents"
                accept="image/*,application/pdf"
                mode="document"
              />

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setAddDocModal(false)} className="px-4 py-2 text-stone-500 font-bold">Cancel</button>
                <button type="submit" className="bg-stone-900 text-white font-bold px-5 py-2 rounded-xl">Save Document</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Lesson Plan */}
      {addLessonModal && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-lg font-black text-stone-900">Create Lesson Plan & Diary</h3>
            <form onSubmit={handleAddLessonPlan} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-stone-500 block mb-1">Class</label>
                  <input 
                    type="text" 
                    value={lessonForm.class_name} 
                    onChange={e => setLessonForm({...lessonForm, class_name: e.target.value})} 
                    className="w-full border border-stone-200 p-2 rounded-xl font-bold" 
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-500 block mb-1">Section</label>
                  <input 
                    type="text" 
                    value={lessonForm.section_name} 
                    onChange={e => setLessonForm({...lessonForm, section_name: e.target.value})} 
                    className="w-full border border-stone-200 p-2 rounded-xl font-bold" 
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-500 block mb-1">Subject</label>
                  <input 
                    type="text" 
                    value={lessonForm.subject_name} 
                    onChange={e => setLessonForm({...lessonForm, subject_name: e.target.value})} 
                    className="w-full border border-stone-200 p-2 rounded-xl font-bold" 
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-500 block mb-1">Chapter Name *</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Chapter 4: Photosynthesis" 
                  value={lessonForm.chapter_name} 
                  onChange={e => setLessonForm({...lessonForm, chapter_name: e.target.value})} 
                  className="w-full border border-stone-200 p-2.5 rounded-xl" 
                />
              </div>

              <div>
                <label className="font-bold text-stone-500 block mb-1">Topic & Objectives *</label>
                <textarea 
                  required
                  rows={2} 
                  placeholder="Key concepts to be delivered in class..." 
                  value={lessonForm.topic_name} 
                  onChange={e => setLessonForm({...lessonForm, topic_name: e.target.value})} 
                  className="w-full border border-stone-200 p-2.5 rounded-xl" 
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setAddLessonModal(false)} className="px-4 py-2 text-stone-500 font-bold">Cancel</button>
                <button type="submit" className="bg-stone-900 text-white font-bold px-5 py-2 rounded-xl">Save Lesson Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Apply Leave */}
      {applyLeaveModal && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-lg font-black text-stone-900">Apply for Staff Leave</h3>
            <form onSubmit={handleApplyLeave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-500 block mb-1">Leave Type</label>
                <select 
                  value={leaveForm.leave_type} 
                  onChange={e => setLeaveForm({...leaveForm, leave_type: e.target.value})} 
                  className="w-full border border-stone-200 p-2.5 rounded-xl font-bold"
                >
                  <option value="Casual Leave">Casual Leave (CL)</option>
                  <option value="Medical Leave">Medical Leave (ML)</option>
                  <option value="Earned Leave">Earned Leave (EL)</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                  <option value="Leave Without Pay">Leave Without Pay (LWP)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-500 block mb-1">From Date</label>
                  <input 
                    type="date" 
                    value={leaveForm.from_date} 
                    onChange={e => setLeaveForm({...leaveForm, from_date: e.target.value})} 
                    className="w-full border border-stone-200 p-2.5 rounded-xl" 
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-500 block mb-1">To Date</label>
                  <input 
                    type="date" 
                    value={leaveForm.to_date} 
                    onChange={e => setLeaveForm({...leaveForm, to_date: e.target.value})} 
                    className="w-full border border-stone-200 p-2.5 rounded-xl" 
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-500 block mb-1">Reason for Leave *</label>
                <textarea 
                  required
                  rows={2} 
                  placeholder="State the reason for leave..." 
                  value={leaveForm.reason} 
                  onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})} 
                  className="w-full border border-stone-200 p-2.5 rounded-xl" 
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setApplyLeaveModal(false)} className="px-4 py-2 text-stone-500 font-bold">Cancel</button>
                <button type="submit" className="bg-stone-900 text-white font-bold px-5 py-2 rounded-xl">Submit Leave Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Issue Asset */}
      {addAssetModal && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-lg font-black text-stone-900">Issue School Asset</h3>
            <form onSubmit={handleIssueAsset} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-500 block mb-1">Asset Category</label>
                <select 
                  value={assetForm.asset_type} 
                  onChange={e => setAssetForm({...assetForm, asset_type: e.target.value})} 
                  className="w-full border border-stone-200 p-2.5 rounded-xl font-bold"
                >
                  <option value="Laptop">Laptop / Chromebook</option>
                  <option value="Tablet">Tablet / iPad for Smart Board</option>
                  <option value="ID Card">RFID Smart Access ID Card</option>
                  <option value="Keys">Lab / Cabinet / Room Keys</option>
                  <option value="Books">Teacher Reference Curriculum Books</option>
                  <option value="Uniform">School Blazer / Uniform</option>
                  <option value="Equipment">Science / Sports Equipment</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-500 block mb-1">Asset Code & Description *</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Dell Latitude 5420 (CBS-LAP-108)" 
                  value={assetForm.asset_name_code} 
                  onChange={e => setAssetForm({...assetForm, asset_name_code: e.target.value})} 
                  className="w-full border border-stone-200 p-2.5 rounded-xl" 
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setAddAssetModal(false)} className="px-4 py-2 text-stone-500 font-bold">Cancel</button>
                <button type="submit" className="bg-stone-900 text-white font-bold px-5 py-2 rounded-xl">Issue Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
